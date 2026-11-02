# Estrutura de dados

Este diretório foi preparado para receber uma persistência real em banco de dados, mantendo as entidades separadas por arquivo JSON enquanto a aplicação ainda funciona em modo estático.

## Entidades

- `adm.json`: usuários e administradores da oficina
- `clientes.json`: cadastro de clientes
- `carros.json`: veículos vinculados aos clientes
- `pecas.json`: estoque de peças e materiais
- `servicos.json`: ordens de serviço e histórico de execução

## Observação

A aplicação atual continua usando `estoque.json` como fallback para compatibilidade, mas a fonte principal foi migrada para `pecas.json`.

## Próxima etapa para banco

Quando o backend estiver ativo, cada arquivo pode virar uma tabela:

- `adm` -> usuários/admin
- `clientes` -> clientes
- `carros` -> veículos
- `pecas` -> peças/estoque
- `servicos` -> ordens de serviço

Os relacionamentos devem seguir:

- cliente -> N carros
- cliente -> N ordens de serviço
- ordem -> N serviços
- ordem -> N peças

