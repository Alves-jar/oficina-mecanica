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
// const API_BASE = "http://localhost:3000/api"; // REMOVIDO: não usa mais o servidor Node (dados no localStorage via banco.js)

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
    // --- REMOVIDO (chamava o servidor Node) ---
    // const resposta = await fetch(API_BASE + "/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ nome, email, senha, tipo })
    // });
    //
    // if (!resposta.ok) {
    //   const erro = await resposta.json();
    //   throw new Error(erro.erro || "Erro ao fazer login");
    // }
    //
    // const usuario = await resposta.json();

    // Agora: confere e-mail/senha nos dados do localStorage (banco.js). Lança Error se inválido.
    const usuario = dbLogin(email, senha, tipo);
    salvarUsuario(usuario, usuario.tipo);

    showMessage("Acesso autorizado. Redirecionando...", "success");
    setTimeout(function () {
      if (usuario.tipo === "cliente") {
        window.location.href = "../cliente/cliente-portal.html";
      } else {
        window.location.href = "../painel-oficina.html";
      }
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
