function normalizaTexto(valor) {
  return String(valor || '').trim().toLowerCase();
}

function normalizaPlaca(valor) {
  return normalizaTexto(valor).replace(/[^a-z0-9]/g, '');
}

function filtrarOrdensClientePorPlaca(ordens, emailCliente, placa, nomeCliente) {
  const placaBusca = normalizaPlaca(placa);
  const nomeNormalizado = normalizaTexto(nomeCliente);
  const emailNormalizado = normalizaTexto(emailCliente);

  return (ordens || []).filter(function (ordem) {
    if (!ordem || !ordem.veiculo || !ordem.veiculo.placa) return false;

    const mesmaPlaca = normalizaPlaca(ordem.veiculo.placa) === placaBusca;
    if (!mesmaPlaca) return false;

    const cliente = ordem.cliente || {};
    const mesmoEmail = normalizaTexto(cliente.email) === emailNormalizado;
    const mesmoNome = normalizaTexto(cliente.nome) === nomeNormalizado;

    if (!emailNormalizado && !nomeNormalizado) return true;
    return mesmoEmail || mesmoNome;
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
    const caminhos = [
      '../dados/servicos.json',
      'dados/servicos.json',
      'cliente/../dados/servicos.json'
    ];

    return (async function () {
      for (const caminho of caminhos) {
        try {
          const resposta = await fetch(caminho);
          if (!resposta.ok) continue;
          return await resposta.json();
        } catch (erro) {
          continue;
        }
      }
      throw new Error('Não foi possível carregar os serviços.');
    })();
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
      const servicos = (ordem.servicos || []).map(function (s) {
        return '<li>' + (s.descricao || 'Serviço') + ' · ' + (s.valor ? 'R$ ' + Number(s.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '—') + '</li>';
      }).join('');

      item.innerHTML = '<h3>Ordem #' + (ordem.id || '-') + '</h3>' +
        '<div class="meta"><span>Veículo: ' + (ordem.veiculo && ordem.veiculo.modelo ? ordem.veiculo.modelo : '—') + '</span><span>Placa: ' + (ordem.veiculo && ordem.veiculo.placa ? ordem.veiculo.placa : '—') + '</span></div>' +
        '<span class="tag">' + formatarStatus(ordem.status) + '</span>' +
        '<div class="meta" style="margin-top: 12px;"> <span>Data: ' + (ordem.criadoEm ? new Date(ordem.criadoEm).toLocaleDateString('pt-BR') : '—') + '</span> </div>' +
        '<ul>' + servicos + '</ul>';

      listaServicos.appendChild(item);
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
      if (filtradas.length) {
        mostrarMensagem('Serviços encontrados com sucesso.', 'success');
      } else {
        mostrarMensagem('Nenhum serviço foi encontrado para essa placa.', 'error');
      }
    } catch (erro) {
      mostrarMensagem(erro.message || 'Não foi possível buscar os serviços.', 'error');
    }
  });
});
