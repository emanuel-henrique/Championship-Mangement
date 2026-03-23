# **Championship Management API** ⚽

> API REST completa para gerenciamento de campeonatos de futebol e futsal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## 📋 Sobre o Projeto
API robusta para controle completo de campeonatos esportivos, permitindo gerenciar times, jogadores, partidas, eventos de jogo (gols e cartões) e visualizar estatísticas em tempo real. Segurança em primeiro lugar com rotas protegidas por JWT.

---

## ✨ Principais Funcionalidades

- 🔒 **Segurança & Autenticação** — Sistema de login com JWT e proteção contra IDOR (Insecure Direct Object Reference).
- ✅ **Gerenciamento de Campeonatos** — CRUD completo com filtros e estatísticas.
- ✅ **Times e Jogadores** — Cadastro com posições, números de camisa e transferências.
- ✅ **Controle de Partidas** — Criar, editar, finalizar e cancelar jogos.
- ✅ **Eventos ao Vivo** — Registrar gols (incluindo assistências e contra) e cartões.
- ✅ **Cálculo Automático** — Pontuação, saldo de gols e classificação.
- ✅ **Estatísticas Completas** — Artilharia, aproveitamento, histórico de confrontos.
- ✅ **Dashboard** — Visão geral de todos os dados do usuário logado.

---

## 🚀 Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| **Node.js** | Runtime JavaScript |
| **Express** | Framework web minimalista |
| **PostgreSQL** | Banco de dados relacional |
| **Prisma** | ORM moderno para Node.js |
| **Zod** | Validação de schemas TypeScript-first |
| **JWT & Bcrypt** | Criptografia de senhas e autenticação por tokens |

---

## 📦 Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm ou yarn

---

## ⚙️ Instalação

**1. Clone o repositório**
```bash
git clone https://github.com/emanuel-henrique/Championship-Management.git
cd Championship-Management
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/championship_db"
JWT_SECRET="sua_chave_secreta_super_segura_aqui"
```

**4. Execute as migrations**
```bash
npx prisma migrate dev
```

**5. Inicie o servidor**
```bash
npm start
```

O servidor estará rodando em `http://localhost:3333` 🚀

---

## 📚 Documentação da API

**Base URL**
```
http://localhost:3333
```

> ⚠️ **Atenção:** Com exceção das rotas de Criar Usuário e Login, todas as rotas exigem o envio do token JWT no header da requisição:
> `Authorization: Bearer <seu_token>`

---

## 📂 Endpoints

### 🔐 Autenticação (Públicas)

```http
POST   /users          # Criar conta de usuário
POST   /auth/login     # Fazer login e gerar Token JWT
```

### 👥 Usuário (Protegidas)

```http
PUT    /users/:id      # Atualizar perfil do usuário logado
```

### 📊 Dashboard

```http
GET    /dashboard      # Informações gerais (campeonatos, times, jogadores, partidas)
```

### 🏆 Championship

```http
GET    /championships                        # Listar campeonatos do usuário logado
POST   /championships                        # Criar campeonato
PUT    /championships/:champ_id              # Atualizar campeonato
DELETE /championships/:champ_id              # Deletar campeonato

# Visualizações
GET    /championships/:champ_id                     # Overview (estatísticas gerais)
GET    /championships/:champ_id/standings           # Classificação
GET    /championships/:champ_id/matches             # Lista de partidas
GET    /championships/:champ_id/teams               # Times do campeonato
GET    /championships/:champ_id/topscorers          # Artilharia

# Gerenciar Times
POST   /championships/:champ_id/teams               # Adicionar time ao campeonato
DELETE /championships/:champ_id/teams/:team_id      # Remover time do campeonato
```

### 🏟️ Team

```http
GET    /teams                                    # Listar times do usuário logado
POST   /teams                                    # Criar time
PUT    /teams/:team_id                           # Atualizar time
DELETE /teams/:team_id                           # Deletar time

# Gerenciar Jogadores
POST   /teams/:team_id/players                   # Adicionar jogador ao time
DELETE /teams/:team_id/players/:player_id        # Remover jogador do time
```

### 👤 Player

```http
GET    /players                  # Listar jogadores do usuário logado
POST   /players                  # Criar jogador
PUT    /players/:player_id       # Atualizar jogador
DELETE /players/:player_id       # Deletar jogador
```

### ⚽ Match

```http
GET    /championships/:champ_id/matches/:match_id           # Detalhes da partida
POST   /championships/:champ_id/matches                     # Criar partida
PUT    /championships/:champ_id/matches/:match_id           # Atualizar partida
DELETE /championships/:champ_id/matches/:match_id           # Deletar partida
POST   /championships/:champ_id/matches/:match_id/finish    # Finalizar partida
```

### 🎯 Goals

```http
POST   /championships/:champ_id/matches/:match_id/details/goals              # Adicionar gol
DELETE /championships/:champ_id/matches/:match_id/details/goals/:goal_id     # Remover gol
```

### 🟨 Cards

```http
POST   /championships/:champ_id/matches/:match_id/details/cards              # Adicionar cartão
DELETE /championships/:champ_id/matches/:match_id/details/cards/:card_id     # Remover cartão
```

---

## 📝 Exemplos de Requisições

### Fazer Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@teste.com",
  "password": "senha_segura_123"
}
```

### Criar Campeonato (Requer Token)

```http
POST /championships
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...

{
  "name": "Copa Sul-Americana 2025",
  "description": "Campeonato regional de futsal",
  "modality": "FUTSAL",
  "maxTeams": 16,
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-30T00:00:00Z"
}
```

**Response `201`:**
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

### Ver Classificação (Requer Token)

```http
GET /championships/:champ_id/standings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
```

**Response `200`:**
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
    }
  ]
}
```

---

## 🎯 Regras de Negócio

### Sistema de Pontuação

| Resultado | Pontos |
|-----------|--------|
| Vitória | 3 |
| Empate | 1 |
| Derrota | 0 |

### Eventos de Jogo

- ⚽ **Gol Contra** — Inverte o placar automaticamente (incrementa gols do adversário).
- 🟨 **Cartões** — 2º amarelo = vermelho automático.
- 🎯 **Assistências** — Vinculadas aos gols, incrementam estatísticas do jogador.

### Validações

- ✅ Requer autenticação (JWT) para todas as rotas restritas.
- ✅ Não pode adicionar gol/cartão em partida cancelada ou finalizada.
- ✅ Jogador deve pertencer ao time que está jogando.
- ✅ Time deve estar participando do campeonato.
- ✅ Proteção contra IDOR: Usuário só pode acessar e modificar seus próprios dados.

---

## 🗂️ Estrutura do Projeto

```
Championship-Management/
├── prisma/
│   ├── migrations/         # Migrations do banco
│   └── schema.prisma       # Schema do Prisma
├── src/
│   ├── Controllers/        # Lógica de negócio
│   ├── Middlewares/        # Interceptadores (ex: Autenticação JWT)
│   ├── Routes/             # Definição de rotas separadas por domínio
│   ├── Schemas/            # Validações Zod
│   ├── lib/                # Configurações (Prisma, etc)
│   └── server.js           # Entry point
├── .env                    # Variáveis de ambiente
├── package.json
└── README.md
```

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT | `sua_chave_secreta_aqui` |

---

## 🚧 Roadmap

- [x] Autenticação JWT e proteção de rotas
- [ ] Upload de emblemas de times
- [ ] Sistema de notificações
- [ ] Exportação de relatórios (PDF)
- [ ] API de estatísticas avançadas
- [ ] WebSockets para eventos em tempo real
- [ ] Integração com frontend React

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Emanuel Henrique**

- GitHub: [@emanuel-henrique](https://github.com/emanuel-henrique)

---

> ⭐ Se este projeto foi útil pra você, dê uma estrela!
>
> Feito com ❤️ e ☕
