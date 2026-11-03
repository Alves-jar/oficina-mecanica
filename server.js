const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Diretório de dados
const DADOS_DIR = path.join(__dirname, 'dados');

// Helper para ler JSON
async function lerJson(arquivo) {
  const caminho = path.join(DADOS_DIR, arquivo);
  const conteudo = await fs.readFile(caminho, 'utf-8');
  return JSON.parse(conteudo);
}

// Helper para escrever JSON
async function escreverJson(arquivo, dados) {
  const caminho = path.join(DADOS_DIR, arquivo);
  await fs.writeFile(caminho, JSON.stringify(dados, null, 2), 'utf-8');
}

// Helper para gerar novo ID
function gerarId(dados) {
  const maxId = dados.reduce((max, item) => Math.max(max, item.id || 0), 0);
  return maxId + 1;
}

// === ENDPOINTS PARA ORDENS ===

// Listar ordens
app.get('/api/ordens', async (req, res) => {
  try {
    const ordens = await lerJson('servicos.json');
    res.json(ordens);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao carregar ordens' });
  }
});

// Criar nova ordem
app.post('/api/ordens', async (req, res) => {
  try {
    const ordens = await lerJson('servicos.json');
    const novaOrdem = {
      ...req.body,
      id: gerarId(ordens),
      criadoEm: new Date().toISOString()
    };
    ordens.push(novaOrdem);
    await escreverJson('servicos.json', ordens);
    res.json(novaOrdem);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar ordem' });
  }
});

// Atualizar ordem
app.put('/api/ordens/:id', async (req, res) => {
  try {
    const ordens = await lerJson('servicos.json');
    const id = parseInt(req.params.id);
    const index = ordens.findIndex(o => o.id === id);
    
    if (index === -1) {
      return res.status(404).json({ erro: 'Ordem não encontrada' });
    }
    
    ordens[index] = { ...ordens[index], ...req.body };
    await escreverJson('servicos.json', ordens);
    res.json(ordens[index]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar ordem' });
  }
});

// === ENDPOINTS PARA CLIENTES ===

// Listar clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await lerJson('clientes.json');
    res.json(clientes);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao carregar clientes' });
  }
});

// Cadastrar cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const clientes = await lerJson('clientes.json');
    
    // Verificar se email já existe
    const emailExiste = clientes.some(c => c.email === req.body.email);
    if (emailExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    
    const novoCliente = {
      id: gerarId(clientes),
      ...req.body,
      criadoEm: new Date().toISOString()
    };
    clientes.push(novoCliente);
    await escreverJson('clientes.json', clientes);
    res.json(novoCliente);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar cliente' });
  }
});

// === ENDPOINTS PARA LOGIN ===

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha, tipo } = req.body;
    
    if (tipo === 'cliente') {
      const clientes = await lerJson('clientes.json');
      const cliente = clientes.find(c => c.email === email && c.senha === senha);
      
      if (!cliente) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }
      
      res.json({
        nome: cliente.nome,
        email: cliente.email,
        tipo: 'cliente',
        id: cliente.id
      });
    } else {
      // Admin
      const adm = await lerJson('adm.json');
      const admin = adm.find(a => a.email === email && a.senha === senha);
      
      if (!admin) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }
      
      res.json({
        nome: admin.nome,
        email: admin.email,
        tipo: 'admin',
        cargo: admin.cargo
      });
    }
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// === ENDPOINTS PARA LEITURA DE DADOS ===

app.get('/api/dados/:arquivo', async (req, res) => {
  try {
    const arquivo = req.params.arquivo + '.json';
    const dados = await lerJson(arquivo);
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao carregar dados' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
