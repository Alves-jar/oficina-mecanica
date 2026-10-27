const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const togglePassword = document.getElementById("toggle-password");
const loginButton = document.getElementById("login-button");
const message = document.getElementById("message");
const forgotPassword = document.getElementById("forgot-password");

document.getElementById("year").textContent =
  new Date().getFullYear();

// Mostrar ou ocultar senha
togglePassword.addEventListener("click", () => {
  const showing = senhaInput.type === "text";

  senhaInput.type = showing ? "password" : "text";

  togglePassword.setAttribute(
    "aria-label",
    showing ? "Mostrar senha" : "Ocultar senha"
  );

  togglePassword.setAttribute(
    "aria-pressed",
    String(!showing)
  );
});

// Exibir mensagens
function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message on ${type}`;
}

// Limpar mensagem ao editar
[emailInput, senhaInput].forEach((input) => {
  input.addEventListener("input", () => {
    message.textContent = "";
    message.className = "message";
  });
});

// Submissão do formulário
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value;

  if (!email || !senha) {
    showMessage("Preencha o e-mail e a senha.");
    return;
  }

  if (!emailInput.validity.valid) {
    showMessage("Informe um endereço de e-mail válido.");
    emailInput.focus();
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Validando...";

  try {
    /*
      Integre aqui sua API de autenticação.

      Exemplo:
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      if (!response.ok) {
        throw new Error("E-mail ou senha inválidos.");
      }

      const data = await response.json();
      window.location.href = "/painel";
    */

    // Demonstração: ainda não autentica usuários.
    showMessage(
      "Interface validada. Conecte o formulário à API de login.",
      "success"
    );
  } catch (error) {
    showMessage(
      error.message || "Não foi possível realizar o login."
    );
  } finally {
    loginButton.disabled = false;
    loginButton.innerHTML = 'Entrar <span aria-hidden="true">→</span>';
  }
});

// Recuperação de senha
forgotPassword.addEventListener("click", (event) => {
  event.preventDefault();

  showMessage(
    "Conecte este link ao fluxo de recuperação de senha."
  );
});