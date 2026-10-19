/* Tela de nova ordem: lê dados/servicos.json e dados/estoque.json
   e grava a ordem criada em localStorage (ver util.js) */

var USUARIO = 'Marcos';

var TODAS = [];      /* ordens existentes (json + criadas no sistema) */
var ESTOQUE = [];
var CLIENTES = {};   /* nome (minúsculo) -> ordem mais recente do cliente */
var VEICULOS = {};   /* placa -> ordem mais recente do veículo */

var veiculoAuto = false;  /* true quando os dados do veículo foram preenchidos pela placa */

var servicos = [{ descricao: '', horas: '', valor: '' }];
var pecas = [];

var CAMPOS = ['nome', 'cpf', 'tel', 'email', 'aviso', 'placa', 'modelo', 'ano', 'comb', 'km',
              'problema', 'mec', 'prev', 'desc', 'pgto', 'validade'];


/* ---------- utilidades ---------- */

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function dataISO(dt) {
  return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
}

function somaDias(n) {
  var x = new Date();
  x.setDate(x.getDate() + n);
  return dataISO(x);
}

/* mesmo formato das ordens existentes: 2026-10-05T17:45:00 (horário local) */
function agoraISO() {
  var x = new Date();
  return dataISO(x) + 'T' + pad(x.getHours()) + ':' + pad(x.getMinutes()) + ':' + pad(x.getSeconds());
}

function num(v) {
  var n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function arredonda(v) { return Math.round(v * 100) / 100; }

function soDigitos(v) { return String(v).replace(/\D/g, ''); }

function mascaraCpf(v) {
  var d = soDigitos(v).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function mascaraTel(v) {
  var d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? '(' + d : '';
  if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
}

/* ABC1D23 -> ABC-1D23 */
function mascaraPlaca(v) {
  var p = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return p.length > 3 ? p.slice(0, 3) + '-' + p.slice(3) : p;
}

function placaValida(p) {
  return /^[A-Z]{3}-[0-9][A-Z0-9][0-9]{2}$/.test(p);
}

function emailValido(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function aviso(el, texto, alerta) {
  el.hidden = !texto;
  el.className = 'hint s6' + (alerta ? ' warn' : '');
  el.innerHTML = texto || '';
}


/* ---------- carregamento ---------- */

Promise.all([
  carregaOrdens('../dados/servicos.json'),
  carregaJson('../dados/estoque.json')
])
.then(function (r) {

  TODAS = r[0].sort(function (a, b) { return b.id - a.id; });
  ESTOQUE = r[1].slice().sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });

  prepara();

})
.catch(function (e) {

  console.error(e);

  var b = $('banner');
  b.hidden = false;
  b.innerHTML = msgErro(e);
  $('sub').textContent = 'Não foi possível carregar os dados.';
  $('salvar').disabled = true;

});


function prepara() {

  var mecanicos = {}, modelos = {}, descricoes = {};

  /* TODAS está em ordem decrescente de id: a primeira ocorrência é a mais recente */
  TODAS.forEach(function (o) {

    var k = o.cliente.nome.toLowerCase();
    if (!CLIENTES[k]) CLIENTES[k] = o;

    if (!VEICULOS[o.veiculo.placa]) VEICULOS[o.veiculo.placa] = o;

    mecanicos[o.mecanico] = 1;
    modelos[o.veiculo.modelo] = 1;
    o.servicos.forEach(function (s) { descricoes[s.descricao] = 1; });
  });

  function opcoes(obj) {
    return Object.keys(obj).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); })
      .map(function (v) { return '<option value="' + esc(v) + '">'; }).join('');
  }

  $('dl-clientes').innerHTML = Object.keys(CLIENTES).sort().map(function (k) {
    return '<option value="' + esc(CLIENTES[k].cliente.nome) + '">';
  }).join('');
  $('dl-placas').innerHTML = opcoes(VEICULOS);
  $('dl-modelos').innerHTML = opcoes(modelos);
  $('dl-servicos').innerHTML = opcoes(descricoes);

  $('mec').innerHTML = '<option value="">Selecione</option>' +
    Object.keys(mecanicos).sort().map(function (m) {
      return '<option>' + esc(m) + '</option>';
    }).join('');

  $('pc-sel').innerHTML = '<option value="">Escolha uma peça…</option>' +
    ESTOQUE.map(function (p) {
      return '<option value="' + esc(p.codigo) + '">' + esc(p.nome) + ' · ' + brl(p.precoVenda) +
             ' · ' + p.qtd + ' em estoque</option>';
    }).join('');

  /* datas padrão */
  $('prev').min = $('validade').min = somaDias(0);
  $('prev').value = somaDias(3);
  $('validade').value = somaDias(7);
  $('ano').max = new Date().getFullYear() + 1;

  var proxima = Math.max.apply(null, TODAS.map(function (o) { return o.id; })) + 1;
  $('sub').textContent = 'A ordem será criada com o número #' + proxima + ' e status "Recebido".';

  desenhaServicos();
  desenhaPecas();
  atualizaTotais();
}


/* ---------- cliente e veículo (máscaras e preenchimento automático) ---------- */

$('cpf').addEventListener('input', function (e) { e.target.value = mascaraCpf(e.target.value); });
$('tel').addEventListener('input', function (e) { e.target.value = mascaraTel(e.target.value); });

function preencheCliente(c) {
  $('cpf').value = mascaraCpf(c.cpf);
  $('tel').value = mascaraTel(c.telefone);
  $('email').value = c.email === 'Não informado' ? '' : c.email;
  $('aviso').value = c.aviso;
  $('endereco').value = c.endereco === 'Não informado' ? '' : c.endereco;
}

/* escolheu um cliente já cadastrado na lista */
$('nome').addEventListener('change', function (e) {

  var o = CLIENTES[e.target.value.trim().toLowerCase()];

  if (!o) {
    aviso($('h-cliente'), '');
    return;
  }

  preencheCliente(o.cliente);
  limpaErro('nome'); limpaErro('cpf'); limpaErro('tel'); limpaErro('email'); limpaErro('aviso');

  aviso($('h-cliente'),
    'Dados preenchidos a partir da ordem #' + o.id + '. Confira se continuam atuais.');
});

$('placa').addEventListener('input', function (e) {

  e.target.value = mascaraPlaca(e.target.value);

  var placa = e.target.value;
  var anterior = VEICULOS[placa];
  var h = $('h-veiculo');

  if (!anterior) {

    /* se os dados vieram de um veículo antigo e a placa mudou, limpa o que foi preenchido */
    if (veiculoAuto) {
      $('modelo').value = $('ano').value = $('cor').value = $('comb').value = '';
      veiculoAuto = false;
    }

    aviso(h, '');
    return;
  }

  veiculoAuto = true;

  var v = anterior.veiculo;

  $('modelo').value = v.modelo;
  $('ano').value = v.ano;
  $('cor').value = v.cor;
  $('comb').value = v.combustivel;
  limpaErro('placa'); limpaErro('modelo'); limpaErro('ano'); limpaErro('comb');

  /* cliente: só preenche se o nome ainda estiver em branco */
  if (!$('nome').value.trim()) {
    $('nome').value = anterior.cliente.nome;
    preencheCliente(anterior.cliente);
  }

  var ativa = TODAS.filter(function (o) {
    return o.veiculo.placa === placa && !o.entregue;
  })[0];

  if (ativa) {
    aviso(h, 'Atenção: este veículo já tem a ordem ativa <a href="../servico/servico.html?id=' +
             ativa.id + '">#' + ativa.id + '</a>. Atualize a quilometragem se for uma nova entrada.', true);
  } else {
    aviso(h, 'Veículo já atendido (última ordem #' + anterior.id + '). Atualize a quilometragem.');
  }
});


/* ---------- serviços ---------- */

function desenhaServicos() {

  $('srv-rows').innerHTML = servicos.map(function (s, i) {

    return '<div class="linha" data-i="' + i + '">' +
      '<input data-k="descricao" list="dl-servicos" placeholder="Descrição do serviço" ' +
        'aria-label="Descrição do serviço ' + (i + 1) + '" value="' + esc(s.descricao) + '">' +
      '<input data-k="horas" type="number" min="0" step="0.5" inputmode="decimal" placeholder="0" ' +
        'aria-label="Horas do serviço ' + (i + 1) + '" value="' + esc(s.horas) + '">' +
      '<input data-k="valor" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0,00" ' +
        'aria-label="Valor do serviço ' + (i + 1) + '" value="' + esc(s.valor) + '">' +
      '<button type="button" class="rm" data-rm="' + i + '" aria-label="Remover serviço ' + (i + 1) + '">×</button>' +
    '</div>';

  }).join('');
}

$('srv-rows').addEventListener('input', function (e) {

  var l = e.target.closest('.linha');
  if (!l || !e.target.dataset.k) return;

  servicos[l.dataset.i][e.target.dataset.k] = e.target.value;

  $('e-srv').textContent = '';
  atualizaTotais();
});

$('srv-rows').addEventListener('click', function (e) {

  var b = e.target.closest('[data-rm]');
  if (!b) return;

  servicos.splice(parseInt(b.dataset.rm, 10), 1);

  if (!servicos.length) servicos.push({ descricao: '', horas: '', valor: '' });

  desenhaServicos();
  atualizaTotais();
});

$('srv-add').onclick = function () {

  servicos.push({ descricao: '', horas: '', valor: '' });
  desenhaServicos();

  var linhas = $('srv-rows').querySelectorAll('.linha');
  linhas[linhas.length - 1].querySelector('input').focus();
};


/* ---------- peças ---------- */

function noEstoque(codigo) {
  return ESTOQUE.filter(function (p) { return p.codigo === codigo; })[0];
}

function desenhaPecas() {

  $('pc-tab').hidden = !pecas.length;
  $('pc-vazio').hidden = pecas.length > 0;

  $('pc-rows').innerHTML = pecas.map(function (p, i) {

    var est = noEstoque(p.codigo);
    var falta = est && p.qtd > est.qtd
      ? '<span class="est">Só ' + est.qtd + ' em estoque</span>'
      : '';

    return '<tr>' +
      '<td>' + esc(p.codigo) + '</td>' +
      '<td>' + esc(p.nome) + falta + '</td>' +
      '<td class="r"><input type="number" min="1" step="1" inputmode="numeric" value="' + p.qtd + '" ' +
        'data-pq="' + i + '" aria-label="Quantidade de ' + esc(p.nome) + '"></td>' +
      '<td class="r">' + brl(p.valorUnit) + '</td>' +
      '<td class="r">' + brl(arredonda(p.qtd * p.valorUnit)) + '</td>' +
      '<td class="r"><button type="button" class="rm" data-pr="' + i + '" ' +
        'aria-label="Remover ' + esc(p.nome) + '">×</button></td>' +
    '</tr>';

  }).join('');
}

$('pc-add').onclick = function () {

  var p = noEstoque($('pc-sel').value);
  var q = Math.max(1, parseInt($('pc-qtd').value, 10) || 1);

  if (!p) {
    $('e-pec').textContent = 'Escolha uma peça da lista para adicionar.';
    $('pc-sel').focus();
    return;
  }

  $('e-pec').textContent = '';

  var ja = pecas.filter(function (x) { return x.codigo === p.codigo; })[0];

  if (ja) {
    ja.qtd += q;
  } else {
    pecas.push({ codigo: p.codigo, nome: p.nome, qtd: q, valorUnit: p.precoVenda, fornecedor: p.fornecedor });
  }

  $('pc-sel').value = '';
  $('pc-qtd').value = 1;

  desenhaPecas();
  atualizaTotais();
};

$('pc-rows').addEventListener('input', function (e) {

  if (e.target.dataset.pq === undefined) return;

  /* atualiza só o total enquanto digita; a tabela é redesenhada no "change" */
  pecas[e.target.dataset.pq].qtd = Math.max(1, parseInt(e.target.value, 10) || 1);
  atualizaTotais();
});

$('pc-rows').addEventListener('change', function (e) {

  if (e.target.dataset.pq === undefined) return;

  desenhaPecas();
  atualizaTotais();
});

$('pc-rows').addEventListener('click', function (e) {

  var b = e.target.closest('[data-pr]');
  if (!b) return;

  pecas.splice(parseInt(b.dataset.pr, 10), 1);

  desenhaPecas();
  atualizaTotais();
});


/* ---------- totais ---------- */

function totais() {

  var s = 0, p = 0;

  servicos.forEach(function (x) { s += num(x.valor); });
  pecas.forEach(function (x) { p += x.qtd * x.valorUnit; });

  s = arredonda(s);
  p = arredonda(p);

  var d = arredonda(num($('desc').value));

  return { s: s, p: p, d: d, total: arredonda(s + p - d) };
}

function atualizaTotais() {

  var t = totais();

  $('t-srv').textContent = brl(t.s);
  $('t-pec').textContent = brl(t.p);
  $('t-desc').textContent = t.d ? '− ' + brl(t.d) : '—';
  $('t-total').textContent = brl(t.total);
}

$('desc').addEventListener('input', function () {
  limpaErro('desc');
  atualizaTotais();
});


/* ---------- validação ---------- */

function limpaErro(id) {

  var e = $('e-' + id);
  var c = $(id);

  if (e) e.textContent = '';
  if (c) c.removeAttribute('aria-invalid');
}

/* limpa o erro de um campo assim que a pessoa mexe nele */
CAMPOS.forEach(function (id) {

  var c = $(id);
  var ev = c.tagName === 'SELECT' ? 'change' : 'input';

  c.addEventListener(ev, function () { limpaErro(id); });
});

function valida() {

  var erros = [];

  function erro(id, msg) { erros.push([id, msg]); }

  var nome = $('nome').value.trim();
  var cpf = soDigitos($('cpf').value);
  var tel = soDigitos($('tel').value);
  var email = $('email').value.trim();
  var placa = $('placa').value.trim().toUpperCase();
  var ano = parseInt($('ano').value, 10);
  var km = $('km').value;
  var hoje = somaDias(0);

  if (nome.length < 3) erro('nome', 'Informe o nome do cliente.');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) erro('cpf', 'Informe um CPF com 11 dígitos.');

  if (tel.length < 10) erro('tel', 'Informe o telefone com DDD.');

  if (email && !emailValido(email)) erro('email', 'E-mail inválido.');

  if (!$('aviso').value) {
    erro('aviso', 'Escolha como avisar o cliente.');
  } else if ($('aviso').value === 'E-mail' && !email) {
    erro('email', 'Informe o e-mail, pois o aviso será por e-mail.');
  }

  if (!placaValida(placa)) erro('placa', 'Placa inválida. Use o formato ABC-1D23.');

  if (!$('modelo').value.trim()) erro('modelo', 'Informe o modelo do veículo.');

  if (!ano || ano < 1950 || ano > new Date().getFullYear() + 1) erro('ano', 'Ano inválido.');

  if (!$('comb').value) erro('comb', 'Escolha o combustível.');

  if (km === '' || num(km) < 0) erro('km', 'Informe a quilometragem atual.');

  if (!$('problema').value.trim()) erro('problema', 'Descreva o problema relatado.');

  if (!$('mec').value) erro('mec', 'Escolha o mecânico responsável.');

  if (!$('prev').value) {
    erro('prev', 'Informe a previsão de entrega.');
  } else if ($('prev').value < hoje) {
    erro('prev', 'A previsão não pode ser no passado.');
  }

  /* serviços: ignora linhas totalmente vazias */
  servicos.forEach(function (s) {
    var temAlgo = s.descricao.trim() || s.horas !== '' || s.valor !== '';
    if (temAlgo && (!s.descricao.trim() || s.valor === '' || num(s.valor) < 0)) {
      if (!erros.some(function (x) { return x[0] === 'srv'; })) {
        erro('srv', 'Preencha a descrição e o valor de cada serviço (ou remova a linha).');
      }
    }
  });

  var t = totais();

  if (t.d < 0 || t.d > t.s + t.p) erro('desc', 'O desconto não pode ser maior que o total.');

  if (!$('pgto').value) erro('pgto', 'Escolha a forma de pagamento.');

  if (!$('validade').value) {
    erro('validade', 'Informe a validade do orçamento.');
  } else if ($('validade').value < hoje) {
    erro('validade', 'A validade não pode ser no passado.');
  }

  return erros;
}


/* ---------- criação da ordem ---------- */

$('form').addEventListener('submit', function (e) {

  e.preventDefault();

  /* limpa erros anteriores */
  CAMPOS.concat(['srv', 'pec']).forEach(limpaErro);
  $('banner').hidden = true;

  var erros = valida();

  if (erros.length) {

    erros.forEach(function (x) {
      $('e-' + x[0]).textContent = x[1];
      var c = $(x[0]);
      if (c) c.setAttribute('aria-invalid', 'true');
    });

    var primeiro = $(erros[0][0]) || $('srv-rows').querySelector('input');
    primeiro.focus();
    primeiro.scrollIntoView({ block: 'center', behavior: 'smooth' });

    return;
  }

  var os = montaOrdem();

  var locais = ordensLocais();
  locais.push(os);

  if (!salvaOrdensLocais(locais)) {

    var b = $('banner');
    b.hidden = false;
    b.textContent = 'Não foi possível salvar a ordem. O armazenamento do navegador está indisponível ou cheio.';
    b.scrollIntoView({ block: 'center' });
    return;
  }

  $('salvar').disabled = true;
  $('salvar').textContent = 'Ordem criada…';

  location.href = '../servico/servico.html?id=' + os.id;
});

function montaOrdem() {

  var t = totais();
  var agora = agoraISO();
  var km = Math.round(num($('km').value));

  /* próxima revisão: +10.000 km ou 6 meses */
  var rev = new Date();
  rev.setMonth(rev.getMonth() + 6);

  /* pega o maior id entre as ordens carregadas e as já salvas, para não repetir número */
  var maior = Math.max.apply(null,
    TODAS.map(function (o) { return o.id; }).concat(ordensLocais().map(function (o) { return o.id; })));

  var lista = servicos
    .filter(function (s) { return s.descricao.trim(); })
    .map(function (s) {
      return { descricao: s.descricao.trim(), horas: num(s.horas), valor: arredonda(num(s.valor)) };
    });

  return {
    id: maior + 1,
    entregue: false,
    status: 'recebido',
    prioridade: $('prio').value,
    criadoEm: agora,
    previsaoEntrega: $('prev').value,
    entregueEm: null,
    mecanico: $('mec').value,

    cliente: {
      nome: $('nome').value.trim(),
      cpf: $('cpf').value,
      telefone: $('tel').value,
      email: $('email').value.trim() || 'Não informado',
      aviso: $('aviso').value,
      endereco: $('endereco').value.trim() || 'Não informado'
    },

    veiculo: {
      placa: $('placa').value.trim().toUpperCase(),
      modelo: $('modelo').value.trim(),
      ano: parseInt($('ano').value, 10),
      cor: $('cor').value.trim() || 'Não informada',
      km: km,
      combustivel: $('comb').value,
      proximaRevisao: { km: km + 10000, data: dataISO(rev) }
    },

    problema: $('problema').value.trim(),
    diagnostico: $('diag').value.trim() || 'Aguardando diagnóstico.',
    observacoes: $('obs').value.trim(),

    servicos: lista,
    pecas: pecas.map(function (p) {
      return { codigo: p.codigo, nome: p.nome, qtd: p.qtd, valorUnit: p.valorUnit, fornecedor: p.fornecedor };
    }),

    orcamento: {
      tipo: 'estimativa',
      subtotalServicos: t.s,
      subtotalPecas: t.p,
      desconto: t.d,
      total: t.total,
      validade: $('validade').value,
      aprovado: false,
      aprovadoEm: null
    },

    pagamento: { forma: $('pgto').value, status: 'pendente' },
    garantia: $('garantia').value,

    historico: [{ data: agora, de: null, para: 'recebido', usuario: USUARIO, obs: 'Ordem criada' }],
    clienteAvisado: null
  };
}