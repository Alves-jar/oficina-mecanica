# Sistema de Oficina — versão localStorage (sem servidor Node)

Os dados agora ficam no **localStorage do navegador**. O `server.js` foi comentado e não é mais necessário
(`npm install` / `npm start` não são mais usados).

## Como abrir

Abra a pasta do projeto com o **Live Server** (ou qualquer servidor estático) e acesse `login/login.html`.
Evite abrir os HTML direto do disco: alguns navegadores não compartilham o localStorage entre arquivos `file://`.

## Login de teste

- Admin: `marcos@oficina.local` / `admin123` (qualquer valor no campo nome)
- Cliente: `igoralvex01@gmail.com` / `senha123`, ou cadastre-se em `cliente/cadastro-cliente.html`

## Onde ficam os dados

| Arquivo | Função |
| --- | --- |
| `compartilhado/dados-iniciais.js` | Dados de partida (antes eram os `dados/*.json`) |
| `compartilhado/banco.js` | Lê/grava no localStorage (`oficina.db.<entidade>`), login e cadastro de cliente |
| `compartilhado/util.js` | Mesmas funções de antes (`carregaOrdens`, `criarOrdem`, `atualizarOrdem`, `carregaEntidade`), agora usando o `banco.js` |

Chaves usadas: `oficina.db.adm`, `.clientes`, `.carros`, `.mecanicos`, `.pecas`, `.servicos` e `oficina.usuario` (sessão).
Cada tela precisa carregar `dados-iniciais.js`, `banco.js` e `util.js` nessa ordem.

## Voltar aos dados iniciais

No console do navegador (F12): `dbResetar()` e recarregue a página.

## Observações

- Os dados ficam só neste navegador/computador; limpar os dados do site apaga tudo.
- A pasta `dados/*.json` e o `server.js` ficam apenas como referência.
