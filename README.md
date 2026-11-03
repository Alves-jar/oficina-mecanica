# Sistema de Oficina - Backend Node.js

Este sistema agora usa um backend Node.js/Express para salvar dados nos arquivos JSON em vez de localStorage.

## Instalação

1. **Instale as dependências do Node.js:**
   ```bash
   npm install
   ```

2. **Inicie o servidor backend:**
   ```bash
   npm start
   ```
   O servidor rodará em `http://localhost:3000`

## Como Usar

### Acesso ao Sistema

1. **Abra o painel principal:**
   - Acesse `http://localhost:3000/painel-oficina.html` no navegador
   - Ou use um servidor de desenvolvimento (Live Server) para abrir `painel-oficina.html`

2. **Login:**
   - **Admin:** Use as credenciais do arquivo `dados/adm.json`
   - **Cliente:** Cadastre-se em `cliente/cadastro-cliente.html` ou use credenciais de `dados/clientes.json`

### Funcionalidades

- **Criar ordens:** Os dados são salvos em `dados/servicos.json`
- **Atualizar status:** As mudanças são salvas no servidor
- **Cadastrar clientes:** Novos clientes são salvos em `dados/clientes.json`
- **Login:** Autenticação via API do backend

### Endpoints da API

- `GET /api/ordens` - Listar todas as ordens
- `POST /api/ordens` - Criar nova ordem
- `PUT /api/ordens/:id` - Atualizar ordem
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Cadastrar cliente
- `POST /api/login` - Fazer login
- `GET /api/dados/:arquivo` - Ler qualquer arquivo JSON da pasta dados/

## Arquivos JSON

Todos os dados são persistidos na pasta `dados/`:
- `servicos.json` - Ordens de serviço
- `clientes.json` - Clientes cadastrados
- `adm.json` - Administradores
- `estoque.json` - Estoque de peças
- `mecanicos.json` - Mecânicos
- `pecas.json` - Peças
- `carros.json` - Carros

## Notas Importantes

- O servidor deve estar rodando antes de usar o sistema
- O frontend usa `http://localhost:3000/api` como base da API
- O localStorage ainda é usado apenas para manter a sessão do usuário logado
- Todos os dados de negócio são salvos nos arquivos JSON

## Troubleshooting

**Erro ao conectar com a API:**
- Verifique se o servidor está rodando (`npm start`)
- Verifique se a porta 3000 está disponível

**Erro ao salvar dados:**
- Verifique se a pasta `dados/` existe e tem permissão de escrita
- Verifique se os arquivos JSON têm formato válido
