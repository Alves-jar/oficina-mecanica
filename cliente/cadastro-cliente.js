const form = document.getElementById('cadastro-form');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const telefoneInput = document.getElementById('telefone');
const togglePassword = document.getElementById('toggle-password');
const message = document.getElementById('message');
const cadastrarButton = document.getElementById('cadastrar-button');

const STORAGE_KEY = 'oficina.usuario';
const API_BASE = 'http://localhost:3000/api';

function normaliza(valor) {
  return String(valor || '').trim().toLowerCase();
}

function mostrarMensagem(texto, tipo = 'error') {
  message.textContent = texto;
  message.className = 'message on ' + tipo;
}

function limparMensagem() {
  message.textContent = '';
  message.className = 'message';
}


function salvarUsuario(usuario) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    nome: usuario.nome,
    email: usuario.email,
    tipo: 'cliente',
    cargo: 'cliente',
    id: usuario.id || null
  }));
}

function validarFormulario(nome, email, senha) {
  if (!nome || !email || !senha) {
    return 'Preencha nome, e-mail e senha para continuar.';
  }

  if (!emailInput.validity.valid) {
    return 'Informe um e-mail válido.';
  }

  if (senha.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }

  return '';
}

togglePassword.addEventListener('click', function () {
  const exibindo = senhaInput.type === 'text';
  senhaInput.type = exibindo ? 'password' : 'text';
  togglePassword.setAttribute('aria-label', exibindo ? 'Mostrar senha' : 'Ocultar senha');
  togglePassword.setAttribute('aria-pressed', String(!exibindo));
});

[nomeInput, emailInput, senhaInput, telefoneInput].forEach(function (input) {
  input.addEventListener('input', limparMensagem);
});

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value;
  const telefone = telefoneInput.value.trim();

  const erro = validarFormulario(nome, email, senha);
  if (erro) {
    mostrarMensagem(erro, 'error');
    return;
  }

  cadastrarButton.disabled = true;
  cadastrarButton.textContent = 'Cadastrando...';

  try {
    const resposta = await fetch(API_BASE + '/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome,
        email: email,
        senha: senha,
        telefone: telefone,
        aviso: 'E-mail',
        ativo: true
      })
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.erro || 'Erro ao cadastrar');
    }

    const cliente = await resposta.json();
    salvarUsuario(cliente);

    mostrarMensagem('Cadastro realizado com sucesso! Você já está logado.', 'success');

    setTimeout(function () {
      window.location.href = 'cliente-portal.html';
    }, 1500);
  } catch (erro) {
    mostrarMensagem(erro.message || 'Erro ao cadastrar cliente.', 'error');
    cadastrarButton.disabled = false;
    cadastrarButton.textContent = 'Cadastrar';
  }
});
