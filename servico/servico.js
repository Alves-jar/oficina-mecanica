/* Tela de detalhe: lê dados/servicos.json e exibe a ordem do parâmetro ?id= */
atualizaUsuarioBarra();
var os = null;
var id = parseInt(new URLSearchParams(location.search).get("id"), 10) || 1048;
function erro(msg) {
  $("app").innerHTML =
    '<a class="back" href="../painel-oficina.html">← Voltar ao painel</a><div class="err">' +
    msg +
    "</div>";
}
function horas(h) {
  return h.toLocaleString("pt-BR") + " h";
}

carregaOrdens("../dados/servicos.json")
  .then(function (lista) {
    os = lista.filter(function (o) {
      return o.id === id;
    })[0];
    if (!os) return erro("Ordem #" + id + " não encontrada.");
    document.title = "Ordem #" + os.id + " · Oficina Central";
    desenha();
  })
  .catch(function (e) {
    console.error(e);
    erro(msgErro(e));
  });

function totais() {
  var s = 0,
    p = 0;
  os.servicos.forEach(function (x) {
    s += x.valor;
  });
  os.pecas.forEach(function (x) {
    p += x.qtd * x.valorUnit;
  });
  return {
    s: s,
    p: p,
    desc: os.orcamento.desconto,
    total: s + p - os.orcamento.desconto,
  };
}
function badgeOrcamento() {
  if (os.status === "recebido")
    return '<span class="badge t1">Estimativa preliminar</span>';
  if (os.status === "orcamento")
    return '<span class="badge t2">Aguardando aprovação</span>';
  var q = os.orcamento.aprovadoEm;
  return (
    '<span class="badge t4">Aprovado' + (q ? " em " + dt(q) : "") + "</span>"
  );
}
function orcamento() {
  var t = totais(),
    h = '<tr class="sec"><td colspan="4">Serviços (mão de obra)</td></tr>';
  os.servicos.forEach(function (s) {
    h +=
      '<tr><td colspan="2">' +
      esc(s.descricao) +
      '</td><td class="r muted">' +
      horas(s.horas) +
      '</td><td class="r">' +
      brl(s.valor) +
      "</td></tr>";
  });
  h += '<tr class="sec"><td colspan="4">Peças</td></tr>';
  if (!os.pecas.length)
    h +=
      '<tr><td colspan="4" class="muted">Nenhuma peça neste serviço</td></tr>';
  os.pecas.forEach(function (p) {
    h +=
      "<tr><td>" +
      esc(p.codigo) +
      "</td><td>" +
      esc(p.nome) +
      '<span class="for">' +
      esc(p.fornecedor) +
      '</span></td><td class="r">' +
      p.qtd +
      " × " +
      brl(p.valorUnit) +
      '</td><td class="r">' +
      brl(p.qtd * p.valorUnit) +
      "</td></tr>";
  });
  h +=
    '<tr class="sub"><td colspan="3">Subtotal serviços</td><td class="r">' +
    brl(t.s) +
    "</td></tr>" +
    '<tr class="sub"><td colspan="3">Subtotal peças</td><td class="r">' +
    brl(t.p) +
    "</td></tr>";
  if (t.desc)
    h +=
      '<tr class="sub"><td colspan="3">Desconto</td><td class="r neg">− ' +
      brl(t.desc) +
      "</td></tr>";
  return (
    h +
    '<tr class="total"><td colspan="3">Total</td><td class="r">' +
    brl(t.total) +
    "</td></tr>"
  );
}
function linha() {
  return os.historico
    .slice()
    .reverse()
    .map(function (e) {
      return (
        '<li class="t' +
        NUM[e.para] +
        '"><b>' +
        (e.de ? ST[e.de] + " → " : "") +
        ST[e.para] +
        "</b>" +
        (e.obs ? esc(e.obs) + "<br>" : "") +
        "<small>" +
        dt(e.data) +
        " · " +
        esc(e.usuario) +
        "</small></li>"
      );
    })
    .join("");
}
function desenha() {
  var c = os.cliente,
    v = os.veiculo,
    o = os.orcamento,
    pg = os.pagamento;
  var opts = Object.keys(ST)
    .map(function (k) {
      return (
        '<option value="' +
        k +
        '"' +
        (k === os.status ? " selected" : "") +
        ">" +
        ST[k] +
        "</option>"
      );
    })
    .join("");
  $("app").innerHTML =
    '<a class="back" href="../painel-oficina.html">← Voltar ao painel</a>' +
    '<div class="head"><div><h1>Ordem #' +
    os.id +
    '<span class="plate">' +
    esc(v.placa) +
    "</span>" +
    (os.prioridade === "urgente" ? '<span class="urg">Urgente</span>' : "") +
    "</h1>" +
    '<div class="muted">' +
    esc(v.modelo) +
    " · aberta em " +
    dt(os.criadoEm) +
    " · previsão de entrega " +
    d(os.previsaoEntrega) +
    " · mecânico: " +
    esc(os.mecanico) +
    "</div></div>" +
    '<div class="status t' +
    NUM[os.status] +
    '"><label for="st">Status da ordem</label><select id="st">' +
    opts +
    "</select></div></div>" +
    '<div class="notice" id="notice" role="status"></div>' +
    '<div class="grid"><div class="col">' +
    '<div class="two"><section class="card"><h2>Cliente</h2><div class="body"><dl><dt>Nome</dt><dd>' +
    esc(c.nome) +
    "</dd><dt>CPF</dt><dd>" +
    esc(c.cpf) +
    "</dd><dt>Telefone</dt><dd>" +
    esc(c.telefone) +
    "</dd><dt>E-mail</dt><dd>" +
    esc(c.email) +
    "</dd><dt>Endereço</dt><dd>" +
    esc(c.endereco) +
    "</dd><dt>Aviso por</dt><dd>" +
    esc(c.aviso) +
    "</dd></dl></div></section>" +
    '<section class="card"><h2>Veículo</h2><div class="body"><dl><dt>Modelo</dt><dd>' +
    esc(v.modelo) +
    "</dd><dt>Ano</dt><dd>" +
    v.ano +
    "</dd><dt>Cor</dt><dd>" +
    esc(v.cor) +
    "</dd><dt>Combustível</dt><dd>" +
    esc(v.combustivel) +
    "</dd><dt>Quilometragem</dt><dd>" +
    v.km.toLocaleString("pt-BR") +
    " km</dd><dt>Próxima revisão</dt><dd>" +
    v.proximaRevisao.km.toLocaleString("pt-BR") +
    " km ou " +
    d(v.proximaRevisao.data) +
    "</dd></dl></div></section></div>" +
    '<section class="card"><h2>Problema e diagnóstico</h2><div class="body"><dl><dt>Relatado</dt><dd>' +
    esc(os.problema) +
    "</dd><dt>Diagnóstico</dt><dd>" +
    esc(os.diagnostico) +
    "</dd>" +
    (os.observacoes
      ? "<dt>Observações</dt><dd>" + esc(os.observacoes) + "</dd>"
      : "") +
    "</dl></div></section>" +
    '<section class="card"><h2><span>Orçamento</span>' +
    badgeOrcamento() +
    '</h2><div class="scroll"><table><thead><tr><th>Código</th><th>Descrição</th><th class="r">Qtd × unitário</th><th class="r">Valor</th></tr></thead><tbody>' +
    orcamento() +
    "</tbody></table></div>" +
    '<div class="body"><dl><dt>Forma de pagamento</dt><dd>' +
    esc(pg.forma) +
    "</dd><dt>Pagamento</dt><dd>" +
    ({ pago: "Pago", parcial: "Sinal pago", pendente: "Pendente" }[pg.status] ||
      pg.status) +
    "</dd><dt>Validade do orçamento</dt><dd>" +
    d(o.validade) +
    "</dd><dt>Garantia</dt><dd>" +
    esc(os.garantia) +
    "</dd></dl></div></section>" +
    '</div><section class="card"><h2>Registro de mudanças</h2><ul class="tl">' +
    linha() +
    "</ul></section></div>";
  $("st").addEventListener("change", muda);
}
function enviaEmailClienteSeNecessario(ordem) {
  if (!ordem || !ordem.cliente || !ordem.cliente.email) return false;
  var canal = String(ordem.cliente.aviso || "")
    .trim()
    .toLowerCase();
  if (canal !== "e-mail" && canal !== "email") return false;
  var assunto = "Seu veículo está pronto - Oficina Central";
  var mensagem =
    "Olá " +
    ordem.cliente.nome +
    "!\n\nSeu veículo " +
    ordem.veiculo.placa +
    " já está pronto em nossa oficina.\n\nStatus: " +
    ST[ordem.status] +
    "\n\nAgradecemos pela confiança.\n\nAtenciosamente,\nOficina Central";
  var link =
    "mailto:" +
    encodeURIComponent(ordem.cliente.email) +
    "?subject=" +
    encodeURIComponent(assunto) +
    "&body=" +
    encodeURIComponent(mensagem);
  try {
    window.location.href = link;
    return true;
  } catch (e) {
    return false;
  }
}
function muda(e) {
  var novo = e.target.value,
    antes = os.status;
  if (novo === antes) return;
  var agora = new Date().toISOString(),
    obs = "Status alterado manualmente";
  if (NUM[novo] >= 3 && !os.orcamento.aprovadoEm)
    os.orcamento.aprovadoEm = agora;
  if (novo === "pronto") {
    obs =
      "Serviço concluído. Cliente avisado automaticamente por " +
      os.cliente.aviso;
    os.clienteAvisado = { em: agora, canal: os.cliente.aviso };
    enviaEmailClienteSeNecessario(os);
  }
  os.status = novo;
  os.historico.push({
    data: agora,
    de: antes,
    para: novo,
    usuario: usuarioAtual().nome || "Administrador",
    obs: obs,
  });
  atualizaOrdemLocal(os);
  desenha();
  if (novo === "pronto") {
    var n = $("notice");
    n.textContent =
      "Cliente avisado por " + os.cliente.aviso + " (" + os.cliente.nome + ").";
    n.className = "notice on";
  }
  $("st").focus();
}
