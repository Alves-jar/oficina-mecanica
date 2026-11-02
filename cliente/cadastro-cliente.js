const form = document.getElementById('cadastro-form');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const telefoneInput = document.getElementById('telefone');
const togglePassword = document.getElementById('toggle-password');
const message = document.getElementById('message');
const cadastrarButton = document.getElementById('cadastrar-button');

const STORAGE_KEY = 'oficina.usuario';
const CLIENTES_LOCAIS_KEY = 'oficina.clientes.locais';

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

function lerClientesLocais() {
  try {
    const clientes = JSON.parse(localStorage.getItem(CLIENTES_LOCAIS_KEY) || '[]');
    return Array.isArray(clientes) ? clientes : [];
  } catch (error) {
    return [];
  }
}

function salvarClientesLocais(clientes) {
  localStorage.setItem(CLIENTES_LOCAIS_KEY, JSON.stringify(clientes));
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

form.addEventListener('submit', function (event) {
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

  const clientes = lerClientesLocais();
  const jaExiste = clientes.some(function (cliente) {
    return normaliza(cliente.email) === normaliza(email);
  });

  if (jaExiste) {
    mostrarMensagem('Esse e-mail já está cadastrado. Tente fazer login.', 'error');
    return;
  }

  const novoCliente = {
    id: Date.now(),
    nome: nome,
    email: email,
    senha: senha,
    telefone: telefone,
    aviso: 'E-mail',
    endereco: '',
    ativo: true
  };

  clientes.push(novoCliente);
  salvarClientesLocais(clientes);
  salvarUsuario(novoCliente);

  cadastrarButton.disabled = true;
  cadastrarButton.textContent = 'Cadastrando...';
  mostrarMensagem('Cadastro realizado com sucesso. Entrando...', 'success');

  setTimeout(function () {
    window.location.href = 'cliente-portal.html';
  }, 400);
});
