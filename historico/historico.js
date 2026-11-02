var visitas = [];
atualizaUsuarioBarra();

function formataData(value) {
  if (!value) return '—';
  return new Date(value + (value.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR');
}

function montaLista(item) {
  var servicos = (item.servicos || []).map(function (s) {
    return '<li>' + esc(s.descricao || 'Serviço') + ' · ' + brl(s.valor || 0) + '</li>';
  }).join('') || '<li>Nenhum serviço registrado.</li>';

  var pecas = (item.pecas || []).map(function (p) {
    return '<li>' + esc(p.nome || p.codigo || 'Peça') + ' · ' + p.qtd + ' × ' + brl(p.valorUnit || 0) + '</li>';
  }).join('') || '<li>Nenhuma peça registrada.</li>';

  return `
    <article class="visita">
      <header class="visita-header">
        <div class="visita-meta">
          <h2>Ordem #${item.id}</h2>
          <span class="plate">${esc(item.placa)}</span>
          <span class="tag t${NUM[item.status] || 1}">${esc(ST[item.status] || 'Histórico')}</span>
        </div>
        <small class="muted">${formataData(item.data)}</small>
      </header>
      <div class="visita-body">
        <div class="details">
          <div class="detail">
            <span class="label">Cliente</span>
            <strong>${esc(item.cliente)}</strong>
          </div>
          <div class="detail">
            <span class="label">Veículo</span>
            <strong>${esc(item.modelo)}</strong>
          </div>
          <div class="detail">
            <span class="label">Quilometragem</span>
            <strong>${item.km ? item.km.toLocaleString('pt-BR') + ' km' : '—'}</strong>
          </div>
          <div class="detail">
            <span class="label">Próxima revisão</span>
            <strong>${item.proximaRevisao ? item.proximaRevisao.km.toLocaleString('pt-BR') + ' km' : '—'}</strong>
          </div>
        </div>

        <div class="subsection">
          <h3>Serviços</h3>
          <ul class="list-inline">${servicos}</ul>
        </div>

        <div class="subsection">
          <h3>Peças</h3>
          <ul class="list-inline">${pecas}</ul>
        </div>
      </div>
    </article>
  `;
}

function renderizar(lista) {
  var cont = $('lista');
  cont.innerHTML = lista.map(montaLista).join('');

  $('empty').hidden = lista.length !== 0;

  var total = lista.length;
  $('stats').innerHTML = [
    '<span class="chip">Registros: ' + total + '</span>',
    '<span class="chip">Última visita: ' + (lista[0] ? formataData(lista[0].data) : '—') + '</span>'
  ].join('');
}

function filtrar(valor) {
  var termo = String(valor || '').trim().toLowerCase();
  if (!termo) return visitas;

  return visitas.filter(function (item) {
    var texto = [
      item.placa,
      item.modelo,
      item.cliente,
      item.status
    ].join(' ').toLowerCase();

    return texto.indexOf(termo) !== -1;
  });
}

function carregar() {
  carregaOrdens('../dados/servicos.json')
    .then(function (lista) {
      visitas = lista
        .filter(function (ordem) {
          return ordem && ordem.veiculo && ordem.cliente;
        })
        .map(function (ordem) {
          return {
            id: ordem.id,
            status: ordem.status,
            data: ordem.entregueEm || ordem.criadoEm,
            placa: ordem.veiculo.placa,
            modelo: ordem.veiculo.modelo,
            cliente: ordem.cliente.nome,
            km: ordem.veiculo.km,
            proximaRevisao: ordem.veiculo.proximaRevisao,
            servicos: ordem.servicos || [],
            pecas: ordem.pecas || []
          };
        })
        .sort(function (a, b) {
          return new Date(b.data || 0) - new Date(a.data || 0);
        });

      renderizar(visitas);
    })
    .catch(function (erro) {
      console.error(erro);
      $('lista').innerHTML = '';
      $('empty').hidden = false;
      $('empty').textContent = 'Não foi possível carregar o histórico.';
    });
}

$('busca').addEventListener('input', function (event) {
  renderizar(filtrar(event.target.value));
});

carregar();
