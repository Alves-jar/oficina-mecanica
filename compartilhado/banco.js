/* Camada de dados em localStorage.
   Substitui o servidor Node (server.js) e a leitura dos arquivos dados/*.json.
   Precisa de compartilhado/dados-iniciais.js carregado antes. */

var BANCO_PREFIXO = "oficina.db.";
var _bancoMemoria = {}; // cópia em memória: só é usada se o localStorage estiver bloqueado

function dbClonar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

/* Salva a lista inteira de uma entidade (adm, clientes, carros, mecanicos, pecas, servicos) */
function dbSalvar(entidade, lista) {
  _bancoMemoria[entidade] = dbClonar(lista);
  try {
    localStorage.setItem(BANCO_PREFIXO + entidade, JSON.stringify(lista));
  } catch (e) {
    console.warn("localStorage indisponível; dados mantidos só em memória.", e);
  }
  return lista;
}

/* Lê a lista de uma entidade. Na primeira vez, grava os dados iniciais. */
function dbLer(entidade) {
  var raw = null;
  try {
    raw = localStorage.getItem(BANCO_PREFIXO + entidade);
  } catch (e) {}

  if (raw !== null) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Dados corrompidos em " + entidade + "; restaurando os iniciais.");
    }
  } else if (_bancoMemoria[entidade]) {
    return dbClonar(_bancoMemoria[entidade]);
  }

  var inicial = dbClonar(
    (typeof DADOS_INICIAIS !== "undefined" && DADOS_INICIAIS[entidade]) || [],
  );
  dbSalvar(entidade, inicial);
  return inicial;
}

/* Próximo id = maior id da lista + 1 (igual ao gerarId do server.js) */
function dbProximoId(lista) {
  return (
    lista.reduce(function (max, item) {
      return Math.max(max, item.id || 0);
    }, 0) + 1
  );
}

/* Apaga os dados do sistema e volta aos iniciais (não apaga o usuário logado) */
function dbResetar() {
  _bancoMemoria = {};
  try {
    for (var i = localStorage.length - 1; i >= 0; i--) {
      var k = localStorage.key(i);
      if (k && k.indexOf(BANCO_PREFIXO) === 0) localStorage.removeItem(k);
    }
  } catch (e) {}
}

/* Login (antes: POST /api/login). Lança Error se as credenciais não baterem. */
function dbLogin(email, senha, tipo) {
  if (tipo === "cliente") {
    var cliente = dbLer("clientes").find(function (c) {
      return c.email === email && c.senha === senha;
    });
    if (!cliente) throw new Error("Credenciais inválidas");
    return { nome: cliente.nome, email: cliente.email, tipo: "cliente", id: cliente.id };
  }

  var admin = dbLer("adm").find(function (a) {
    return a.email === email && a.senha === senha;
  });
  if (!admin) throw new Error("Credenciais inválidas");
  return { nome: admin.nome, email: admin.email, tipo: "admin", cargo: admin.cargo };
}

/* Cadastro de cliente (antes: POST /api/clientes). Lança Error se o e-mail já existir. */
function dbCadastrarCliente(dados) {
  var clientes = dbLer("clientes");
  if (
    clientes.some(function (c) {
      return c.email === dados.email;
    })
  ) {
    throw new Error("Email já cadastrado");
  }
  var novo = Object.assign({ id: dbProximoId(clientes) }, dados, {
    criadoEm: new Date().toISOString(),
  });
  clientes.push(novo);
  dbSalvar("clientes", clientes);
  return novo;
}
