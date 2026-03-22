# **Championship Management API** ⚽

> API REST completa para gerenciamento de campeonatos de futebol e futsal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## **📋 Sobre o Projeto**

API robusta para controle completo de campeonatos esportivos, permitindo gerenciar times, jogadores, partidas, eventos de jogo (gols e cartões) e visualizar estatísticas em tempo real.

### **✨ Principais Funcionalidades**

- ✅ **Gerenciamento de Campeonatos** - CRUD completo com filtros e estatísticas
- ✅ **Times e Jogadores** - Cadastro com posições, números de camisa e transferências
- ✅ **Controle de Partidas** - Criar, editar, finalizar e cancelar jogos
- ✅ **Eventos ao Vivo** - Registrar gols (incluindo assistências e contra) e cartões
- ✅ **Cálculo Automático** - Pontuação, saldo de gols e classificação
- ✅ **Estatísticas Completas** - Artilharia, aproveitamento, histórico de confrontos
- ✅ **Dashboard** - Visão geral de todos os dados do usuário

---

## **🚀 Tecnologias**

- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[Express](https://expressjs.com/)** - Framework web minimalista
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Prisma](https://www.prisma.io/)** - ORM moderno para Node.js
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first

---

## **📦 Pré-requisitos**

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm ou yarn

---

## **⚙️ Instalação**

### **1. Clone o repositório**
```bash
git clone https://github.com/emanuel-henrique/Championship-Management.git
cd Championship-Management
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/championship_db"
```

### **4. Execute as migrations**
```bash
npx prisma migrate dev
```

### **5. Inicie o servidor**
```bash
npm start
```

O servidor estará rodando em `http://localhost:3333` 🚀

---

## **📚 Documentação da API**

### **Base URL**
```
http://localhost:3333
```

---

### **📂 Endpoints**

#### **👥 User**
```http
POST   /users/:user_id              # Criar usuário
PUT    /users/:user_id              # Atualizar usuário
DELETE /users/:user_id              # Deletar usuário
```

#### **📊 Dashboard**
```http
GET    /dashboard/:user_id          # Informações gerais (campeonatos, times, jogadores, partidas)
```

#### **🏆 Championship**
```http
GET    /championships/:user_id                    # Listar campeonatos
POST   /championships/:user_id                    # Criar campeonato
PUT    /championships/:user_id/:champ_id          # Atualizar campeonato
DELETE /championships/:champ_id/:user_id          # Deletar campeonato

# Visualizações
GET    /championships/:user_id/:champ_id                  # Overview (estatísticas gerais)
GET    /championships/:user_id/:champ_id/standings        # Classificação
GET    /championships/:user_id/:champ_id/matches          # Lista de partidas
GET    /championships/:user_id/:champ_id/teams            # Times do campeonato
GET    /championships/:user_id/:champ_id/topscorers       # Artilharia

# Gerenciar Times
POST   /championships/:champ_id/:user_id/teams           # Adicionar time ao campeonato
DELETE /championships/:champ_id/teams/:team_id           # Remover time do campeonato
```

#### **🏟️ Team**
```http
GET    /teams/:user_id              # Listar times
POST   /teams/:user_id              # Criar time
PUT    /teams/:team_id/:user_id     # Atualizar time
DELETE /teams/:team_id/:user_id     # Deletar time

# Gerenciar Jogadores
POST   /teams/:team_id/:user_id/players                  # Adicionar jogador ao time
DELETE /teams/:team_id/:user_id/players/:player_id       # Remover jogador do time
```

#### **👤 Player**
```http
GET    /players/:user_id                    # Listar jogadores
POST   /players/:user_id                    # Criar jogador
PUT    /players/:player_id/:user_id         # Atualizar jogador
DELETE /players/:player_id/:user_id         # Deletar jogador
```

#### **⚽ Match**
```http
GET    /championships/:champ_id/:user_id/matches/:match_id          # Detalhes da partida
POST   /championships/:champ_id/:user_id/matches                    # Criar partida
PUT    /championships/:champ_id/:user_id/matches/:match_id          # Atualizar partida
DELETE /championships/:champ_id/:user_id/matches/:match_id          # Deletar partida
POST   /championships/:champ_id/:user_id/matches/:match_id/finish   # Finalizar partida
```

#### **🎯 Goals**
```http
POST   /championships/:champ_id/:user_id/matches/:match_id/details/goals           # Adicionar gol
DELETE /championships/:champ_id/:user_id/matches/:match_id/details/goals/:goal_id  # Remover gol
```

#### **🟨 Cards**
```http
POST   /championships/:champ_id/:user_id/matches/:match_id/details/cards           # Adicionar cartão
DELETE /championships/:champ_id/:user_id/matches/:match_id/details/cards/:card_id  # Remover cartão
```

---

### **📝 Exemplos de Requisições**

#### **Criar Campeonato**
```http
POST /championships/user_id
Content-Type: application/json

{
  "name": "Copa Sul-Americana 2025",
  "description": "Campeonato regional de futsal",
  "modality": "FUTSAL",
  "maxTeams": 16,
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-30T00:00:00Z"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "championship": {
      "id": 5,
      "name": "Copa Sul-Americana 2025",
      "description": "Campeonato regional de futsal",
      "modality": "FUTSAL",
      "maxTeams": 16,
      "userId": 1,
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-08-30T00:00:00.000Z",
      "createdAt": "2025-03-22T20:00:00.000Z"
    }
  }
}
```

---

#### **Registrar Gol**
```http
POST /championships/champ_id/user_id/matches/match_id/details/goals
Content-Type: application/json

{
  "player_id": 23,
  "team_id": 7,
  "minute": 34,
  "isOwnGoal": false,
  "assist_player_id": 15
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "goal": {
      "id": 42,
      "matchId": 10,
      "playerId": 23,
      "teamId": 7,
      "assistPlayerId": 15,
      "minute": 34,
      "isOwnGoal": false
    },
    "match": {
      "id": 10,
      "homeScore": 2,
      "awayScore": 1,
      "status": "IN_PROGRESS"
    }
  }
}
```

---

#### **Ver Classificação**
```http
GET /championships/user_id/champ_id/standings
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "team": {
        "id": 7,
        "name": "Flamengo FC",
        "emblemUrl": "https://example.com/flamengo.png"
      },
      "points": 18,
      "wins": 6,
      "draws": 0,
      "losses": 0,
      "goalsFor": 24,
      "goalsAgainst": 5
    },
    {
      "id": 2,
      "team": {
        "id": 3,
        "name": "Palmeiras",
        "emblemUrl": "https://example.com/palmeiras.png"
      },
      "points": 15,
      "wins": 5,
      "draws": 0,
      "losses": 1,
      "goalsFor": 18,
      "goalsAgainst": 7
    }
  ]
}
```

---

#### **Dashboard**
```http
GET /dashboard/user_id
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "championships": 3,
    "teams": 12,
    "players": 156,
    "matches": 48
  }
}
```

---

## **🎯 Regras de Negócio**

### **Sistema de Pontuação**
- Vitória: **3 pontos**
- Empate: **1 ponto**
- Derrota: **0 pontos**

### **Eventos de Jogo**
- ⚽ **Gol Contra**: Inverte o placar automaticamente (incrementa gols do adversário)
- 🟨 **Cartões**: 2º amarelo = vermelho automático
- 🎯 **Assistências**: Vinculadas aos gols, incrementam estatísticas do jogador

### **Validações**
- ✅ Não pode adicionar gol/cartão em partida cancelada ou finalizada
- ✅ Jogador deve pertencer ao time que está jogando
- ✅ Time deve estar participando do campeonato
- ✅ Usuário só pode modificar seus próprios dados

---

## **🗂️ Estrutura do Projeto**

```
Championship-Management/
├── prisma/
│   ├── migrations/         # Migrations do banco
│   └── schema.prisma       # Schema do Prisma
├── src/
│   ├── Controllers/        # Lógica de negócio
│   ├── Routes/            # Definição de rotas
│   ├── Schemas/           # Validações Zod
│   ├── lib/               # Configurações (Prisma, etc)
│   └── server.js          # Entry point
├── .env                   # Variáveis de ambiente
├── package.json
└── README.md
```

---

## **🛠️ Scripts Disponíveis**

```bash
npm start          # Inicia o servidor
npx prisma migrate dev    # Executa migrations
npx prisma studio         # Abre Prisma Studio (GUI do banco)
```

---

## **🔐 Variáveis de Ambiente**

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/db` |

---

## **🚧 Roadmap**

- [ ] Autenticação JWT
- [ ] Upload de emblemas de times
- [ ] Sistema de notificações
- [ ] Exportação de relatórios (PDF)
- [ ] API de estatísticas avançadas
- [ ] WebSockets para eventos em tempo real
- [ ] Integração com frontend React

---

## **🤝 Contribuindo**

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## **📄 Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## **👤 Autor**

**Emanuel Henrique**

- GitHub: [@emanuel-henrique](https://github.com/emanuel-henrique)

---

## **⭐ Mostre seu apoio**

Se este projeto foi útil pra você, dê uma ⭐️!

---

**Feito com ❤️ e ☕**
