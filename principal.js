/* Tela principal: lê dados/servicos.json e dados/estoque.json */

var PASSO = 20;

var TODAS = [];
var ESTOQUE = [];

var visao = 'todas';
var filtro = '';
var termo = '';
var limite = PASSO;

var TITULOS = {
  ativas: 'Ordens ativas',
  entregues: 'Ordens entregues',
  todas: 'Todas as ordens'
};


/* Retorna as ordens ativas */
function ativas() {
  return TODAS.filter(function(o) {
    return !o.entregue;
  });
}


/* Toast */
function toast(t) {
  var e = $('toast');

  e.textContent = t;
  e.className = 'on';

  clearTimeout(toast.t);

  toast.t = setTimeout(function() {
    e.className = '';
  }, 2200);
}


/* Desenha os estágios */
function desenhaEtapas() {

  var a = ativas();

  $('stages').innerHTML = Object.keys(ST).map(function(k) {

    var n = a.filter(function(o) {
      return o.status === k;
    }).length;

    return `
      <button
        class="stage t${NUM[k]}"
        data-s="${k}"
        aria-pressed="${filtro === k}">

        <span class="n">${n}</span>
        <span class="l">${ST[k]}</span>

      </button>
    `;

  }).join('');
}


/* Aplica todos os filtros */
function filtrada() {

  return TODAS.filter(function(o) {

    /* Aba */
    if (visao === 'ativas' && o.entregue) {
      return false;
    }

    if (visao === 'entregues' && !o.entregue) {
      return false;
    }

    /* Status (etapas só existem para ordens ativas) */
    if (filtro) {
      if (o.entregue || o.status !== filtro) {
        return false;
      }
    }

    /* Pesquisa */
    if (termo) {

      var t = (
        (o.veiculo && o.veiculo.placa ? o.veiculo.placa : '') + ' ' +
        (o.veiculo && o.veiculo.modelo ? o.veiculo.modelo : '') + ' ' +
        (o.cliente && o.cliente.nome ? o.cliente.nome : '') + ' ' +
        o.id
      ).toLowerCase();

      if (t.indexOf(termo) === -1) {
        return false;
      }
    }

    return true;
  });
}


/* Desenha a lista */
function desenhaLista() {

  var l = filtrada();

  /* O limite nunca passa da quantidade de resultados */
  var quantidadeExibida = Math.min(limite, l.length);

  var resultados = l.slice(0, quantidadeExibida);


  $('rows').innerHTML = resultados.map(function(o) {

    var rot = o.entregue
      ? 'Entregue'
      : ST[o.status];

    return `
      <tr tabindex="0" data-id="${o.id}">

        <td class="num">
          #${o.id}
        </td>

        <td>
          <span class="plate">
            ${esc(o.veiculo.placa)}
          </span>
        </td>

        <td>
          ${esc(o.veiculo.modelo)}
        </td>

        <td>
          ${esc(o.cliente.nome)}
        </td>

        <td>
          <span class="tag t${NUM[o.status]}">
            ${rot}
          </span>
        </td>

      </tr>
    `;

  }).join('');


  /* Estado vazio */
  $('empty').hidden = l.length !== 0;

  $('empty').textContent =
    'Nenhuma ordem encontrada.';


  /* Título */
  $('ltitle').textContent =
    TITULOS[visao] +
    (filtro ? ' · ' + ST[filtro] : '');


  /* Quantidade TOTAL encontrada pelo filtro */
  $('lcount').textContent =
    l.length +
    (l.length === 1 ? ' ordem' : ' ordens');


  /* Quantos ainda faltam */
  var restantes = l.length - quantidadeExibida;


  /* Só mostra o botão se houver mais resultados */
  if (restantes > 0) {

    $('mais').hidden = false;

    $('mais').textContent =
      'Mostrar mais (' +
      restantes +
      ' restantes)';

  } else {

    $('mais').hidden = true;

  }


  /* Atualiza as abas */
  Array.prototype.forEach.call(
    $('tabs').children,
    function(b) {

      b.setAttribute(
        'aria-pressed',
        b.dataset.v === visao
      );

    }
  );
}


/* Estoque */
function desenhaAlertas() {

  var baixo = ESTOQUE.filter(function(e) {
    return e.qtd < e.minimo;
  });

  $('alerts').innerHTML = baixo
    .map(function(e) {

      return `
        <div class="alert">

          <span class="qty">
            ${e.qtd}
          </span>

          <b>
            ${esc(e.nome)}
          </b>

          <span>
            Mínimo: ${e.minimo} unidades
          </span>

        </div>
      `;

    })
    .join('') ||
    '<div class="empty">Estoque em dia.</div>';

  $('acount').textContent =
    baixo.length +
    (baixo.length === 1 ? ' item' : ' itens');
}


/* Carrega os dados */
atualizaUsuarioBarra();

Promise.all([
  carregaOrdens(DATASET.servicos),
  carregaEntidade('pecas', DATASET.estoque)
])

.then(function(r) {

  TODAS = r[0].sort(function(a, b) {
    return b.id - a.id;
  });

  ESTOQUE = r[1];

  $('sub').textContent =
    ativas().length +
    ' ordens ativas · ' +
    TODAS.length +
    ' no histórico da oficina';

  desenhaEtapas();
  desenhaLista();
  desenhaAlertas();

})

.catch(function(e) {

  console.error(e);

  $('empty').hidden = false;

  $('empty').innerHTML =
    msgErro(e);

});


/* Filtro por etapa */
$('stages').addEventListener(
  'click',
  function(e) {

    var b = e.target.closest('.stage');

    if (!b) {
      return;
    }

    /* Liga/desliga o filtro */
    if (filtro === b.dataset.s) {
      filtro = '';
    } else {
      filtro = b.dataset.s;
    }

    /* Reinicia a paginação */
    limite = PASSO;

    /* Se estava em entregues e clicou em uma etapa, volta para ativas */
    if (filtro && visao === 'entregues') {
      visao = 'ativas';
    }

    desenhaEtapas();
    desenhaLista();
  }
);


/* Abas Ativas / Entregues / Todas */
$('tabs').addEventListener(
  'click',
  function(e) {

    var b = e.target.closest('button');

    if (!b) {
      return;
    }

    visao = b.dataset.v;

    /* Etapas só existem para ordens ativas */
    if (visao === 'entregues' && filtro) {
      filtro = '';
      desenhaEtapas();
    }

    /* Reinicia a paginação */
    limite = PASSO;

    desenhaLista();
  }
);


/* Campo de busca */
$('busca').addEventListener(
  'input',
  function(e) {

    termo =
      e.target.value
        .trim()
        .toLowerCase();

    /* Reinicia a paginação */
    limite = PASSO;

    desenhaLista();
  }
);


/* Mostrar mais */
$('mais').onclick = function() {

  limite += PASSO;

  desenhaLista();
};


/* Abre o serviço */
function abre(e) {

  var r =
    e.target.closest('tr[data-id]');

  if (!r) {
    return;
  }

  if (
    e.type === 'keydown' &&
    e.key !== 'Enter'
  ) {
    return;
  }

  location.href =
    'servico/servico.html?id=' +
    r.dataset.id;
}


/* Eventos da tabela */
$('rows').addEventListener(
  'click',
  abre
);

$('rows').addEventListener(
  'keydown',
  abre
);


/* Nova ordem */
$('nova').onclick = function() {

  location.href = 'nova-ordem/nova-ordem.html';

};


/* Peças */
$('pecas').onclick = function(e) {

  e.preventDefault();

  toast(
    'Abrindo a busca de peças'
  );

};


/* Logout */
$('logout-btn').onclick = function() {
  logout();
  location.href = 'login/login.html';
};