/* Busca de peças — dados e orçamento em localStorage (sem servidor Node).
   Depende de compartilhado/dados-iniciais.js, banco.js e util.js (usa $ e atualizaUsuarioBarra). */

const state = { pecas: [], selecionadas: new Map() };

// const $ = (id) => document.getElementById(id); // REMOVIDO: já existe em compartilhado/util.js
const moeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// --- REMOVIDO (dependia de servidor para o fetch de pecas.json) ---
// async function carregarPecas() {
//   try {
//     const resposta = await fetch('./pecas.json');
//     if (!resposta.ok) throw new Error('Não foi possível carregar pecas.json');
//     state.pecas = await resposta.json();
//     renderizarPecas();
//   } catch (erro) {
//     $('lista-pecas').innerHTML = '<p class="empty card">Erro ao carregar o catálogo. Confira se pecas.json está na mesma pasta e abra o projeto por um servidor local.</p>';
//     $('resultado-count').textContent = 'Catálogo indisponível';
//     console.error(erro);
//   }
// }

// Agora: lê as peças do localStorage (entidade "pecas", via banco.js)
function carregarPecas() {
  try {
    state.pecas = dbLer('pecas');
    renderizarPecas();
  } catch (erro) {
    $('lista-pecas').innerHTML = '<p class="empty card">Erro ao carregar o catálogo do armazenamento local do navegador.</p>';
    $('resultado-count').textContent = 'Catálogo indisponível';
    console.error(erro);
  }
}

function estoqueStatus(peca) {
  if (peca.qtd <= 0) return { texto: 'Sem estoque', classe: 'out' };
  if (peca.qtd < peca.minimo) return { texto: 'Estoque baixo', classe: 'low' };
  return { texto: `${peca.qtd} em estoque`, classe: '' };
}

function renderizarPecas() {
  const termo = normalizar($('busca').value.trim());
  const apenasDisponiveis = $('somente-disponiveis').checked;
  const filtradas = state.pecas.filter((peca) => {
    const campos = [peca.nome, peca.codigo, ...(peca.compatibilidade || [])].map(normalizar);
    const corresponde = !termo || campos.some((campo) => campo.includes(termo));
    return corresponde && (!apenasDisponiveis || peca.qtd > 0);
  });

  $('resultado-count').textContent = `${filtradas.length} ${filtradas.length === 1 ? 'peça encontrada' : 'peças encontradas'}`;
  $('sem-resultados').hidden = filtradas.length > 0;
  $('lista-pecas').innerHTML = filtradas.map((peca) => {
    const status = estoqueStatus(peca);
    return `
      <article class="part-card">
        <div class="part-top">
          <span class="part-code">${escapar(peca.codigo)}</span>
          <span class="stock-pill ${status.classe}">${status.texto}</span>
        </div>
        <h3>${escapar(peca.nome)}</h3>
        <div class="part-details">
          <div><span class="detail-label">Fornecedor</span><span class="detail-value">${escapar(peca.fornecedor)}</span></div>
          <div><span class="detail-label">Localização</span><span class="detail-value">${escapar(peca.localizacao)}</span></div>
        </div>
        <div class="part-price">${moeda(peca.precoVenda)}</div>
        <div class="compat">
          <span class="detail-label">Compatibilidade</span>
          <div class="compat-list">${(peca.compatibilidade || []).map(escapar).join(' · ')}</div>
        </div>
        <div class="part-actions">
          <input class="qty-input" type="number" min="1" max="${peca.qtd}" value="1" aria-label="Quantidade de ${escapar(peca.nome)}" ${peca.qtd <= 0 ? 'disabled' : ''}>
          <button class="add-btn" type="button" data-add="${escapar(peca.codigo)}" ${peca.qtd <= 0 ? 'disabled' : ''}>Adicionar</button>
        </div>
      </article>`;
  }).join('');

  $('lista-pecas').querySelectorAll('[data-add]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const card = botao.closest('.part-card');
      const quantidade = Number(card.querySelector('.qty-input').value);
      adicionarPeca(botao.dataset.add, quantidade);
    });
  });
}

function escapar(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function adicionarPeca(codigo, quantidade) {
  const peca = state.pecas.find((item) => item.codigo === codigo);
  if (!peca || !Number.isInteger(quantidade) || quantidade < 1) return avisar('Informe uma quantidade válida.');
  const atual = state.selecionadas.get(codigo)?.quantidade || 0;
  if (atual + quantidade > peca.qtd) return avisar(`Estoque disponível: ${peca.qtd} unidade(s).`);
  state.selecionadas.set(codigo, { peca, quantidade: atual + quantidade });
  renderizarOrcamento();
  avisar('Peça adicionada ao orçamento.');
}

function renderizarOrcamento() {
  const itens = [...state.selecionadas.values()];
  const totalUnidades = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const total = itens.reduce((soma, item) => soma + item.peca.precoVenda * item.quantidade, 0);
  $('quote-count').textContent = totalUnidades;
  $('quote-total').textContent = moeda(total);
  $('finalizar-orcamento').disabled = itens.length === 0;
  $('itens-orcamento').innerHTML = itens.length ? itens.map(({ peca, quantidade }) => `
    <div class="quote-item">
      <div class="quote-item-head">
        <span class="quote-item-name">${escapar(peca.nome)}</span>
        <strong>${moeda(peca.precoVenda * quantidade)}</strong>
      </div>
      <div class="quote-item-sub">${escapar(peca.codigo)} · ${moeda(peca.precoVenda)} / un.</div>
      <div class="quote-item-controls">
        <label class="detail-label" for="q-${escapar(peca.codigo)}">Qtd.</label>
        <input id="q-${escapar(peca.codigo)}" type="number" min="1" max="${peca.qtd}" value="${quantidade}" data-quantity="${escapar(peca.codigo)}">
        <button class="remove-btn" type="button" data-remove="${escapar(peca.codigo)}">Remover</button>
      </div>
    </div>`).join('') : '<p class="quote-empty">Adicione peças ao orçamento para começar.</p>';

  $('itens-orcamento').querySelectorAll('[data-quantity]').forEach((campo) => {
    campo.addEventListener('change', () => {
      const codigo = campo.dataset.quantity;
      const item = state.selecionadas.get(codigo);
      const novaQtd = Number(campo.value);
      if (!Number.isInteger(novaQtd) || novaQtd < 1 || novaQtd > item.peca.qtd) {
        campo.value = item.quantidade;
        return avisar(`Quantidade deve ficar entre 1 e ${item.peca.qtd}.`);
      }
      item.quantidade = novaQtd;
      renderizarOrcamento();
    });
  });
  $('itens-orcamento').querySelectorAll('[data-remove]').forEach((botao) => {
    botao.addEventListener('click', () => {
      state.selecionadas.delete(botao.dataset.remove);
      renderizarOrcamento();
    });
  });
}

function avisar(mensagem) {
  $('toast').textContent = mensagem;
  $('toast').classList.add('show');
  clearTimeout(avisar.timer);
  avisar.timer = setTimeout(() => $('toast').classList.remove('show'), 2400);
}

$('busca').addEventListener('input', renderizarPecas);
$('somente-disponiveis').addEventListener('change', renderizarPecas);
$('limpar').addEventListener('click', () => {
  $('busca').value = '';
  $('somente-disponiveis').checked = false;
  renderizarPecas();
  $('busca').focus();
});

$('finalizar-orcamento').addEventListener('click', () => {
  const ref = $('ordem-ref').value.trim();
  if (!ref) {
    $('ordem-ref').focus();
    return avisar('Informe o número da ordem de serviço.');
  }

  // Pega o último número digitado: "1", "#1" e "OS-2026-001" viram o id 1
  const numeros = ref.match(/\d+/g);
  const ordemId = numeros ? parseInt(numeros[numeros.length - 1], 10) : NaN;
  if (!Number.isInteger(ordemId)) {
    $('ordem-ref').focus();
    return avisar('Informe o número da ordem (ex.: 1).');
  }

  // --- Antes: só preparava o resumo e avisava que faltava integrar ---
  // const resumo = [...state.selecionadas.values()]
  //   .map(({ peca, quantidade }) => `${peca.codigo} - ${peca.nome} (${quantidade}x)`)
  //   .join(' | ');
  // avisar(`Orçamento preparado para ${ordem}. Integração com a ordem ainda precisa ser conectada.`);
  // console.info({ ordem, itens: [...state.selecionadas.values()], resumo });

  // Agora: grava as peças na ordem, no localStorage (entidade "servicos")
  const ordens = dbLer('servicos');
  const ordem = ordens.find((o) => o.id === ordemId);
  if (!ordem) return avisar(`Ordem #${ordemId} não encontrada.`);
  if (ordem.entregue) return avisar(`A ordem #${ordemId} já foi entregue.`);

  ordem.pecas = ordem.pecas || [];
  state.selecionadas.forEach(({ peca, quantidade }) => {
    const existente = ordem.pecas.find((p) => p.codigo === peca.codigo);
    if (existente) {
      existente.qtd += quantidade;
    } else {
      ordem.pecas.push({
        codigo: peca.codigo,
        nome: peca.nome,
        qtd: quantidade,
        valorUnit: peca.precoVenda,
        fornecedor: peca.fornecedor
      });
    }
  });

  // Recalcula o orçamento da ordem (mesma conta de servico.js: serviços + peças - desconto)
  const arredonda = (n) => Math.round(n * 100) / 100;
  const orc = (ordem.orcamento = ordem.orcamento || {});
  const subServicos = (ordem.servicos || []).reduce((s, x) => s + x.valor, 0);
  const subPecas = ordem.pecas.reduce((s, x) => s + x.qtd * x.valorUnit, 0);
  orc.subtotalServicos = arredonda(subServicos);
  orc.subtotalPecas = arredonda(subPecas);
  orc.total = arredonda(subServicos + subPecas - (orc.desconto || 0));

  dbSalvar('servicos', ordens);
  state.selecionadas.clear();
  renderizarOrcamento();
  avisar(`Peças adicionadas à ordem #${ordemId}.`);
});

atualizaUsuarioBarra();
carregarPecas();
