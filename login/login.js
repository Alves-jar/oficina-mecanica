const form = document.getElementById("login-form");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const tipoAcessoInput = document.getElementById("tipo-acesso");
const togglePassword = document.getElementById("toggle-password");
const loginButton = document.getElementById("login-button");
const message = document.getElementById("message");
const forgotPassword = document.getElementById("forgot-password");

const STORAGE_KEY = "oficina.usuario";
const CLIENTES_LOCAIS_KEY = "oficina.clientes.locais";

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message on ${type}`;
}

function limparMensagem() {
  message.textContent = "";
  message.className = "message";
}

function normaliza(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function lerClientesLocais() {
  try {
    const clientes = JSON.parse(localStorage.getItem(CLIENTES_LOCAIS_KEY) || "[]");
    return Array.isArray(clientes) ? clientes : [];
  } catch (error) {
    return [];
  }
}

function salvarClientesLocais(clientes) {
  localStorage.setItem(CLIENTES_LOCAIS_KEY, JSON.stringify(clientes));
}

function salvarUsuario(usuario, tipo) {
  const payload = {
    nome: usuario.nome,
    email: usuario.email,
    tipo: tipo,
    cargo: tipo === "admin" ? usuario.cargo || "administrador" : "cliente",
    id: usuario.id || null,
  };

  if (document.getElementById("remember").checked) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

async function buscarAdmins() {
  const resposta = await fetch("../dados/adm.json");
  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os usuários autorizados.");
  }
  return resposta.json();
}

async function buscarClientes() {
  const resposta = await fetch("../dados/clientes.json");
  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os clientes cadastrados.");
  }

  const clientesBase = await resposta.json();
  const clientesLocais = lerClientesLocais();
  const mapa = new Map();

  [...clientesBase, ...clientesLocais].forEach(function (cliente) {
    if (!cliente || !cliente.email) return;
    mapa.set(normaliza(cliente.email), cliente);
  });

  return Array.from(mapa.values());
}

const remember = document.getElementById("remember");
const usuarioSalvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
if (usuarioSalvo) {
  nomeInput.value = usuarioSalvo.nome || "";
  emailInput.value = usuarioSalvo.email || "";
  tipoAcessoInput.value = usuarioSalvo.tipo === "cliente" ? "cliente" : "admin";
  remember.checked = true;
}

togglePassword.addEventListener("click", () => {
  const exibindo = senhaInput.type === "text";
  senhaInput.type = exibindo ? "password" : "text";
  togglePassword.setAttribute(
    "aria-label",
    exibindo ? "Mostrar senha" : "Ocultar senha",
  );
  togglePassword.setAttribute("aria-pressed", String(!exibindo));
});

[nomeInput, emailInput, senhaInput, tipoAcessoInput].forEach((input) => {
  input.addEventListener("input", limparMensagem);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value;
  const tipo = tipoAcessoInput.value;

  if (!nome || !email || !senha) {
    showMessage("Preencha nome, e-mail e senha para continuar.");
    return;
  }

  if (!emailInput.validity.valid) {
    showMessage("Informe um e-mail válido.");
    emailInput.focus();
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Validando...";

  try {
    if (tipo === "cliente") {
      const clientes = await buscarClientes();
      const cliente = clientes.find(function (item) {
        return (
          item.ativo !== false &&
          normaliza(item.nome) === normaliza(nome) &&
          normaliza(item.email) === normaliza(email) &&
          String(item.senha) === String(senha)
        );
      });

      if (!cliente) {
        throw new Error("Cliente não encontrado ou senha inválida.");
      }

      salvarUsuario(cliente, "cliente");
      showMessage("Acesso do cliente autorizado. Redirecionando...", "success");
      setTimeout(function () {
        window.location.href = "../cliente/cliente-portal.html";
      }, 350);
      return;
    }

    const admins = await buscarAdmins();
    const usuario = admins.find(function (item) {
      return (
        item.status === "ativo" &&
        normaliza(item.nome) === normaliza(nome) &&
        normaliza(item.email) === normaliza(email) &&
        String(item.senha) === String(senha)
      );
    });

    if (!usuario) {
      throw new Error("Nome, e-mail ou senha inválidos.");
    }

    salvarUsuario(usuario, "admin");
    showMessage("Acesso autorizado. Redirecionando...", "success");
    setTimeout(function () {
      window.location.href = "../painel-oficina.html";
    }, 350);
  } catch (error) {
    showMessage(error.message || "Não foi possível realizar o login.");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Entrar";
  }
});

forgotPassword.addEventListener("click", (event) => {
  event.preventDefault();
  showMessage("Entre em contato com a oficina para redefinir sua senha.");
});
