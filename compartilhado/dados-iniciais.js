/* Dados iniciais do sistema (antes ficavam em dados/*.json e eram servidos pelo server.js).
   Na primeira abertura, banco.js copia estes dados para o localStorage.
   Para voltar a este estado, rode dbResetar() no console do navegador. */
var DADOS_INICIAIS = {
  adm: [
    {
      "id": 1,
      "nome": "Marcos",
      "cargo": "Administrador",
      "login": "marcos",
      "email": "marcos@oficina.local",
      "senha": "admin123",
      "status": "ativo",
      "permissoes": [
        "dashboard",
        "ordens",
        "estoque",
        "clientes",
        "carros"
      ]
    },
    {
      "id": 2,
      "nome": "Renato Lima",
      "cargo": "Mecânico",
      "login": "renato",
      "email": "renato@oficina.local",
      "senha": "admin123",
      "status": "ativo",
      "permissoes": [
        "ordens",
        "diagnostico"
      ]
    },
    {
      "id": 3,
      "nome": "Igor Alves",
      "cargo": "Administrador",
      "login": "alves",
      "email": "alves@oficina.local",
      "senha": "admin123",
      "status": "ativo",
      "permissoes": [
        "dashboard",
        "ordens",
        "estoque",
        "clientes",
        "carros"
      ]
    }
  ],
  clientes: [
    {
      "id": 1,
      "nome": "Igor Alves Julio",
      "email": "igoralvex01@gmail.com",
      "senha": "senha123",
      "telefone": "(11) 99303-7321",
      "aviso": "E-mail",
      "ativo": true,
      "criadoEm": "2026-11-03T20:18:23.120Z"
    }
  ],
  carros: [],
  mecanicos: [
    {
      "id": 1,
      "nome": "Marcos",
      "cargo": "Administrador",
      "setor": "Gestão"
    },
    {
      "id": 2,
      "nome": "Renato Lima",
      "cargo": "Mecânico",
      "setor": "Manutenção"
    },
    {
      "id": 3,
      "nome": "Carlos Pereira",
      "cargo": "Mecânico",
      "setor": "Manutenção"
    },
    {
      "id": 4,
      "nome": "Diego Santos",
      "cargo": "Mecânico",
      "setor": "Manutenção"
    },
    {
      "id": 5,
      "nome": "Wagner Silva",
      "cargo": "Mecânico",
      "setor": "Manutenção"
    },
    {
      "id": 6,
      "nome": "Edson",
      "cargo": "Assistente",
      "setor": "Operação"
    },
    {
      "id": 7,
      "nome": "Juliana",
      "cargo": "Assistente",
      "setor": "Operação"
    }
  ],
  pecas: [
    {
      "codigo": "AD-ORG5",
      "nome": "Aditivo para radiador 1 L",
      "qtd": 13,
      "minimo": 18,
      "precoCusto": 23,
      "precoVenda": 32,
      "fornecedor": "Cofap Atacado",
      "localizacao": "A2",
      "compatibilidade": [
        "Universal"
      ]
    },
    {
      "codigo": "AL-90A",
      "nome": "Alternador remanufaturado",
      "qtd": 20,
      "minimo": 16,
      "precoCusto": 375,
      "precoVenda": 680,
      "fornecedor": "Cofap Atacado",
      "localizacao": "D4",
      "compatibilidade": [
        "Honda Civic",
        "Jeep Renegade",
        "Nissan Kicks",
        "Toyota Corolla",
        "VW Gol 1.6",
        "VW Polo"
      ]
    },
    {
      "codigo": "AM-7712",
      "nome": "Amortecedor dianteiro (par)",
      "qtd": 16,
      "minimo": 24,
      "precoCusto": 353,
      "precoVenda": 640,
      "fornecedor": "Importadora Sul",
      "localizacao": "A6",
      "compatibilidade": [
        "Fiat Argo 1.3",
        "Hyundai HB20",
        "VW Polo"
      ]
    },
    {
      "codigo": "BD-4410",
      "nome": "Bomba d'água",
      "qtd": 32,
      "minimo": 20,
      "precoCusto": 120,
      "precoVenda": 210,
      "fornecedor": "Peças & Cia",
      "localizacao": "D3",
      "compatibilidade": [
        "Fiat Argo 1.3",
        "Honda Fit",
        "Jeep Renegade",
        "Nissan Kicks",
        "Renault Kwid"
      ]
    },
    {
      "codigo": "PN-175R14",
      "nome": "Pneu 175/70 R14",
      "qtd": 18,
      "minimo": 10,
      "precoCusto": 280,
      "precoVenda": 341,
      "fornecedor": "Importadora Sul",
      "localizacao": "F2",
      "compatibilidade": [
        "Chevrolet Tracker",
        "Fiat Mobi",
        "Honda Civic"
      ]
    }
  ],
  servicos: [
    {
      "entregue": false,
      "status": "recebido",
      "prioridade": "urgente",
      "previsaoEntrega": "2026-11-24",
      "entregueEm": null,
      "mecanico": "Renato Lima",
      "cliente": {
        "nome": "nome",
        "cpf": "937.167.190-48",
        "telefone": "(11) 11111-1111",
        "email": "teste@email.com",
        "aviso": "E-mail"
      },
      "veiculo": {
        "placa": "AVC-1212",
        "modelo": "modelo",
        "ano": 2009,
        "cor": "azul",
        "km": 1210,
        "combustivel": "Gasolina",
        "proximaRevisao": {
          "km": 11210,
          "data": "2027-05-03"
        }
      },
      "problema": "problema",
      "diagnostico": "diag",
      "observacoes": "obs",
      "servicos": [
        {
          "descricao": "desc",
          "horas": 12,
          "valor": 1212
        }
      ],
      "pecas": [
        {
          "codigo": "AD-ORG5",
          "nome": "Aditivo para radiador 1 L",
          "qtd": 1,
          "valorUnit": 32,
          "fornecedor": "Cofap Atacado"
        }
      ],
      "orcamento": {
        "tipo": "estimativa",
        "subtotalServicos": 1212,
        "subtotalPecas": 32,
        "desconto": 1212,
        "total": 32,
        "validade": "2026-11-25",
        "aprovado": false,
        "aprovadoEm": null
      },
      "pagamento": {
        "forma": "Dinheiro",
        "status": "pendente"
      },
      "garantia": "90 dias",
      "historico": [
        {
          "data": "2026-11-03T17:17:59",
          "de": null,
          "para": "recebido",
          "usuario": "Igor Alves",
          "obs": "Ordem criada"
        }
      ],
      "clienteAvisado": null,
      "id": 1,
      "criadoEm": "2026-11-03T20:17:59.183Z"
    },
    {
      "entregue": false,
      "status": "recebido",
      "prioridade": "normal",
      "previsaoEntrega": "2026-11-06",
      "entregueEm": null,
      "mecanico": "Carlos Pereira",
      "cliente": {
        "nome": "Jimmy Hedrix",
        "cpf": "710.962.110-33",
        "telefone": "(91) 81941-1970",
        "email": "hedrix@email.com",
        "aviso": "WhatsApp"
      },
      "veiculo": {
        "placa": "JHX-1942",
        "modelo": "Stratocaster",
        "ano": 1992,
        "cor": "Preto",
        "km": 20000,
        "combustivel": "Híbrido",
        "proximaRevisao": {
          "km": 30000,
          "data": "2027-05-03"
        }
      },
      "problema": "prob",
      "diagnostico": "diag",
      "observacoes": "obs",
      "servicos": [
        {
          "descricao": "desc",
          "horas": 21,
          "valor": 21212
        },
        {
          "descricao": "desc2",
          "horas": 32,
          "valor": 2323
        }
      ],
      "pecas": [],
      "orcamento": {
        "tipo": "estimativa",
        "subtotalServicos": 23535,
        "subtotalPecas": 0,
        "desconto": 0,
        "total": 23535,
        "validade": "2026-11-10",
        "aprovado": false,
        "aprovadoEm": null
      },
      "pagamento": {
        "forma": "Dinheiro",
        "status": "pendente"
      },
      "garantia": "90 dias",
      "historico": [
        {
          "data": "2026-11-03T17:31:11",
          "de": null,
          "para": "recebido",
          "usuario": "Igor Alves",
          "obs": "Ordem criada"
        }
      ],
      "clienteAvisado": null,
      "id": 2,
      "criadoEm": "2026-11-03T20:31:11.246Z"
    }
  ]
};
