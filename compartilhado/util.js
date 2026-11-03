/* Funções e constantes compartilhadas */
var ST = {
  recebido: "Recebido",
  orcamento: "Em orçamento",
  execucao: "Em execução",
  pronto: "Pronto",
};
var NUM = { recebido: 1, orcamento: 2, execucao: 3, pronto: 4 };
var DATASET = {
  adm: "dados/adm.json",
  servicos: "dados/servicos.json",
  pecas: "dados/pecas.json",
  clientes: "dados/clientes.json",
  carros: "dados/carros.json",
  estoque: "dados/estoque.json",
  mecanicos: "dados/mecanicos.json",
};
function $(i) {
  return document.getElementById(i);
}
function usuarioAtual() {
  try {
    var raw = localStorage.getItem("oficina.usuario");
    if (raw) {
      var u = JSON.parse(raw);
      if (u && (u.nome || u.email)) return u;
    }
  } catch (e) {}
  return { nome: "Administrador", cargo: "administrador", tipo: "admin" };
}

function salvarUsuario(u) {
  try {
    localStorage.setItem("oficina.usuario", JSON.stringify(u));
  } catch (e) {}
}

function logout() {
  localStorage.removeItem("oficina.usuario");
}
function usuarioLabel() {
  var u = usuarioAtual();
  if (String(u.tipo || "").toLowerCase() === "cliente") {
    return (u.nome || "Cliente") + " (cliente)";
  }
  return (
    (u.nome || "Administrador") + " (" + (u.cargo || "administrador") + ")"
  );
}
function atualizaUsuarioBarra() {
  var listas = document.querySelectorAll(".user");
  Array.prototype.forEach.call(listas, function (el) {
    el.textContent = usuarioLabel();
  });
}
function usuarioEhCliente() {
  return String(usuarioAtual().tipo || "").toLowerCase() === "cliente";
}
function usuarioEhAdmin() {
  return !usuarioEhCliente();
}
function esc(t) {
  return String(t).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
function brl(v) {
  return v == null
    ? "—"
    : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function dt(s) {
  return new Date(s).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
function d(s) {
  return new Date(s + "T12:00:00").toLocaleDateString("pt-BR");
}
function caminhoDados(rel) {
  var p = window.location.pathname || "";
  return /\/nova-ordem\//.test(p) || /\/servico\//.test(p) ? "../" + rel : rel;
}
function carregaJson(url) {
  return fetch(url).then(function (r) {
    if (!r.ok)
      throw new Error(
        "Arquivo não encontrado: <b>" + r.url + "</b> (erro " + r.status + ")",
      );
    return r.json();
  });
}
function carregaEntidade(chave, fallback) {
  var fonte = DATASET[chave] || fallback;
  if (!fonte) {
    return Promise.reject(new Error("Entidade não cadastrada: " + chave));
  }
  var url = caminhoDados(fonte);
  return carregaJson(url).catch(function (e) {
    if (!fallback) {
      return Promise.reject(e);
    }
    return carregaJson(caminhoDados(fallback));
  });
}
function msgErro(e) {
  return (
    "Não foi possível carregar os dados. " +
    (e && e.message ? e.message + ". " : "") +
    "Confira se a pasta <b>dados/</b> está ao lado de <b>painel-oficina.html</b> e se o servidor (Live Server) foi aberto na pasta do projeto. Se abriu o HTML direto do disco, use um servidor local."
  );
}

/* ---- API para ordens (salva no servidor, não em localStorage) ---- */
var API_BASE = "http://localhost:3000/api";

function carregaOrdens(url) {
  return fetch(API_BASE + "/ordens")
    .then(function (r) {
      if (!r.ok) throw new Error("Erro ao carregar ordens");
      return r.json();
    })
    .catch(function (e) {
      console.error(e);
      return carregaJson(caminhoDados(url || DATASET.servicos));
    });
}

function criarOrdem(ordem) {
  return fetch(API_BASE + "/ordens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ordem),
  }).then(function (r) {
    if (!r.ok) throw new Error("Erro ao criar ordem");
    return r.json();
  });
}

function atualizarOrdem(ordem) {
  return fetch(API_BASE + "/ordens/" + ordem.id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ordem),
  }).then(function (r) {
    if (!r.ok) throw new Error("Erro ao atualizar ordem");
    return r.json();
  });
}
