function normalizaTexto(valor) {
  return String(valor || '').trim().toLowerCase();
}

function normalizaPlaca(valor) {
  return normalizaTexto(valor).replace(/[^a-z0-9]/g, '');
}

function filtrarOrdensClientePorPlaca(ordens, emailCliente, placa, nomeCliente) {
  const placaBusca = normalizaPlaca(placa);

  return (ordens || []).filter(function (ordem) {
    if (!ordem || !ordem.veiculo || !ordem.veiculo.placa) return false;

    const mesmaPlaca = normalizaPlaca(ordem.veiculo.placa) === placaBusca;
    return mesmaPlaca;
  });
}

if (typeof module !== 'undefined') {
  module.exports = { filtrarOrdensClientePorPlaca };
}

document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'oficina.usuario';
  const message = document.getElementById('message');
  const form = document.getElementById('cliente-form');
  const placaInput = document.getElementById('placa');
  const resultado = document.getElementById('resultado');
  const listaServicos = document.getElementById('lista-servicos');
  const usuarioNome = document.getElementById('usuario-nome');
  const logoutBtn = document.getElementById('logout-btn');
  var ordensCache = [];

  function mostrarMensagem(texto, tipo) {
    message.textContent = texto || '';
    message.className = 'message' + (tipo ? ' ' + tipo : '');
  }

  function usuarioLogado() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const usuario = JSON.parse(raw);
      return usuario && usuario.tipo === 'cliente' ? usuario : null;
    } catch (e) {
      return null;
    }
  }

  function sair() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '../login/login.html';
  }

  function buscarOrdens() {
    const API_BASE = 'http://localhost:3000/api';
    return fetch(API_BASE + '/ordens')
      .then(function (resposta) {
        if (!resposta.ok) throw new Error('Erro ao carregar ordens');
        return resposta.json();
      })
      .catch(function (erro) {
        console.error(erro);
        throw new Error('Não foi possível carregar os serviços.');
      });
  }

  function formatarStatus(status) {
    const mapa = {
      recebido: 'Recebido',
      orcamento: 'Em orçamento',
      execucao: 'Em execução',
      pronto: 'Pronto'
    };
    return mapa[status] || status;
  }

  function renderizarOrdens(ordens) {
    ordensCache = ordens;
    listaServicos.innerHTML = '';

    if (!ordens.length) {
      resultado.hidden = false;
      listaServicos.innerHTML = '<div class="item-servico"><h3>Nenhum serviço encontrado</h3><p>Verifique a placa digitada e tente novamente.</p></div>';
      return;
    }

    resultado.hidden = false;
    ordens.forEach(function (ordem) {
      const item = document.createElement('article');
      item.className = 'item-servico';
      item.style.cursor = 'pointer';

      item.innerHTML = '<h3>Ordem #' + (ordem.id || '-') + '</h3>' +
        '<div class="meta"><span>Veículo: ' + (ordem.veiculo && ordem.veiculo.modelo ? ordem.veiculo.modelo : '—') + '</span><span>Placa: ' + (ordem.veiculo && ordem.veiculo.placa ? ordem.veiculo.placa : '—') + '</span></div>' +
        '<span class="tag">' + formatarStatus(ordem.status) + '</span>' +
        '<div class="meta" style="margin-top: 12px;"> <span>Data: ' + (ordem.criadoEm ? new Date(ordem.criadoEm).toLocaleDateString('pt-BR') : '—') + '</span> </div>' +
        '<p style="margin-top: 8px; color: #666; font-size: 0.9em;">Clique para ver detalhes</p>';

      item.addEventListener('click', function () {
        mostrarDetalhesOrdem(ordem);
      });

      listaServicos.appendChild(item);
    });
  }

  function mostrarDetalhesOrdem(ordem) {
    const c = ordem.cliente || {};
    const v = ordem.veiculo || {};
    const o = ordem.orcamento || {};
    const pg = ordem.pagamento || {};

    function brl(valor) {
      return valor == null ? '—' : valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function dt(s) {
      return new Date(s).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    }

    function d(s) {
      return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');
    }

    function esc(t) {
      return String(t).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    const servicosHtml = (ordem.servicos || []).map(function (s) {
      return '<tr><td colspan="2">' + esc(s.descricao) + '</td><td class="r">' + (s.horas || 0) + ' h</td><td class="r">' + brl(s.valor) + '</td></tr>';
    }).join('');

    const pecasHtml = (ordem.pecas || []).map(function (p) {
      return '<tr><td>' + esc(p.codigo) + '</td><td>' + esc(p.nome) + '</td><td class="r">' + p.qtd + ' × ' + brl(p.valorUnit) + '</td><td class="r">' + brl(p.qtd * p.valorUnit) + '</td></tr>';
    }).join('');

    const subtotalServicos = (ordem.servicos || []).reduce((sum, s) => sum + (s.valor || 0), 0);
    const subtotalPecas = (ordem.pecas || []).reduce((sum, p) => sum + (p.qtd * p.valorUnit), 0);
    const total = subtotalServicos + subtotalPecas - (o.desconto || 0);

    const detalhesHtml = '\
      <div class="detalhes-ordem">\
        <button class="voltar-btn" type="button">← Voltar</button>\
        <h2>Ordem #' + (ordem.id || '-') + '</h2>\
        \
        <div class="detalhes-grid">\
          <div class="detalhes-col">\
            <section class="detalhes-card">\
              <h3>Cliente</h3>\
              <dl>\
                <dt>Nome</dt><dd>' + esc(c.nome || '—') + '</dd>\
                <dt>CPF</dt><dd>' + esc(c.cpf || '—') + '</dd>\
                <dt>Telefone</dt><dd>' + esc(c.telefone || '—') + '</dd>\
                <dt>E-mail</dt><dd>' + esc(c.email || '—') + '</dd>\
              </dl>\
            </section>\
\
            <section class="detalhes-card">\
              <h3>Veículo</h3>\
              <dl>\
                <dt>Modelo</dt><dd>' + esc(v.modelo || '—') + '</dd>\
                <dt>Ano</dt><dd>' + (v.ano || '—') + '</dd>\
                <dt>Cor</dt><dd>' + esc(v.cor || '—') + '</dd>\
                <dt>Combustível</dt><dd>' + esc(v.combustivel || '—') + '</dd>\
                <dt>Quilometragem</dt><dd>' + (v.km || 0).toLocaleString('pt-BR') + ' km</dd>\
              </dl>\
            </section>\
\
            <section class="detalhes-card">\
              <h3>Problema e diagnóstico</h3>\
              <dl>\
                <dt>Relatado</dt><dd>' + esc(ordem.problema || '—') + '</dd>\
                <dt>Diagnóstico</dt><dd>' + esc(ordem.diagnostico || '—') + '</dd>\
                ' + (ordem.observacoes ? '<dt>Observações</dt><dd>' + esc(ordem.observacoes) + '</dd>' : '') + '\
              </dl>\
            </section>\
          </div>\
\
          <section class="detalhes-card">\
            <h3>Orçamento</h3>\
            <div class="tabela-wrapper">\
              <table>\
                <thead><tr><th colspan="2">Serviços</th><th class="r">Horas</th><th class="r">Valor</th></tr></thead>\
                <tbody>' + servicosHtml + '</tbody>\
              </table>\
            </div>\
            <div class="tabela-wrapper">\
              <table>\
                <thead><tr><th>Código</th><th>Peça</th><th class="r">Qtd × unitário</th><th class="r">Valor</th></tr></thead>\
                <tbody>' + pecasHtml + '</tbody>\
              </table>\
            </div>\
            <dl class="totais">\
              <dt>Subtotal serviços</dt><dd>' + brl(subtotalServicos) + '</dd>\
              <dt>Subtotal peças</dt><dd>' + brl(subtotalPecas) + '</dd>\
              ' + (o.desconto ? '<dt>Desconto</dt><dd class="neg">− ' + brl(o.desconto) + '</dd>' : '') + '\
              <dt class="total">Total</dt><dd class="total">' + brl(total) + '</dd>\
            </dl>\
            <dl>\
              <dt>Forma de pagamento</dt><dd>' + esc(pg.forma || '—') + '</dd>\
              <dt>Status do pagamento</dt><dd>' + (pg.status === 'pago' ? 'Pago' : pg.status === 'parcial' ? 'Sinal pago' : 'Pendente') + '</dd>\
              <dt>Validade do orçamento</dt><dd>' + (o.validade ? d(o.validade) : '—') + '</dd>\
              <dt>Garantia</dt><dd>' + esc(ordem.garantia || '—') + '</dd>\
            </dl>\
          </section>\
        </div>\
\
        <section class="detalhes-card">\
          <h3>Status</h3>\
          <p><strong>Status atual:</strong> <span class="tag">' + formatarStatus(ordem.status) + '</span></p>\
          <p><strong>Previsão de entrega:</strong> ' + (ordem.previsaoEntrega ? d(ordem.previsaoEntrega) : '—') + '</p>\
          <p><strong>Mecânico:</strong> ' + esc(ordem.mecanico || '—') + '</p>\
          <p><strong>Criado em:</strong> ' + (ordem.criadoEm ? dt(ordem.criadoEm) : '—') + '</p>\
        </section>\
      </div>\
    ';

    listaServicos.innerHTML = detalhesHtml;
    document.querySelector('.voltar-btn').addEventListener('click', function () {
      renderizarOrdens(ordensCache);
    });
  }

  const usuario = usuarioLogado();
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }

  usuarioNome.textContent = usuario.nome;
  logoutBtn.addEventListener('click', sair);

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const placa = placaInput.value.trim();
    if (!placa) {
      mostrarMensagem('Informe a placa do veículo.', 'error');
      return;
    }

    mostrarMensagem('Buscando serviços...', 'success');

    try {
      const ordens = await buscarOrdens();
      const filtradas = filtrarOrdensClientePorPlaca(ordens, usuario.email, placa, usuario.nome);
      renderizarOrdens(filtradas);
      mostrarMensagem('', '');
    } catch (erro) {
      mostrarMensagem(erro.message || 'Não foi possível buscar os serviços.', 'error');
    }
  });
});
