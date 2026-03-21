import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { createCardSchema } from "../Schemas/cards.schema.js"
import { baseCardParamsSchema, deleteCardParamsSchema } from "../Schemas/params.schema.js"

export default class CardsController {
  async Create(req, res) {
    try {
      const body = createCardSchema.parse(req.body)
      const { player_id, type, minute } = body

      const params = baseCardParamsSchema.parse(req.params)
      const { champ_id, user_id, match_id } = params

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const champToAddMatchCard = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user.id
        }
      })

      if (!champToAddMatchCard) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const matchToAddCard = await prisma.match.findUnique({
        where: { id: match_id }
      })

      if (!matchToAddCard) {
        return res.status(404).json({
          status: "error",
          message: "Partida não encontrada."
        })
      }

      if (matchToAddCard.championshipId !== champ_id) {
        return res.status(400).json({
          status: "error",
          message: "Esta partida não pertence a este campeonato."
        })
      }

      if (matchToAddCard.status === 'CANCELED') {
        return res.status(400).json({
          status: "error",
          message: "Não é possível adicionar cartão em partida cancelada."
        })
      }

      const playerToAddCard = await prisma.player.findUnique({
        where: { id: player_id }
      })

      if (!playerToAddCard) {
        return res.status(404).json({
          status: "error",
          message: "Jogador não encontrado."
        })
      }

      const teamToAddPlayerCard = await prisma.team.findUnique({
        where: { id: playerToAddCard.teamId }
      })

      if (!teamToAddPlayerCard) {
        return res.status(404).json({
          status: "error",
          message: "Time não encontrado."
        })
      }

      if (
        teamToAddPlayerCard.id !== matchToAddCard.homeTeamId &&
        teamToAddPlayerCard.id !== matchToAddCard.awayTeamId
      ) {
        return res.status(400).json({
          status: "error",
          message: "Este time não está jogando nesta partida."
        })
      }

      const championshipPlayer = await prisma.championshipPlayer.findUnique({
        where: {
          championshipId_playerId: {
            championshipId: champ_id,
            playerId: player_id
          }
        }
      })

      if (!championshipPlayer) {
        return res.status(400).json({
          status: "error",
          message: "Este jogador não está registrado neste campeonato."
        })
      }

      const hasARedCard = await prisma.card.findFirst({
        where: {
          matchId: matchToAddCard.id,
          playerId: playerToAddCard.id,
          teamId: teamToAddPlayerCard.id,
          type: "RED"
        }
      })

      if (hasARedCard) {
        return res.status(400).json({
          status: "error",
          message: "Esse jogador já foi expulso."
        })
      }

      let isSecondYellow = false

      if (type === "YELLOW") {
        const hasAYellowCard = await prisma.card.findFirst({
          where: {
            matchId: matchToAddCard.id,
            playerId: playerToAddCard.id,
            teamId: teamToAddPlayerCard.id,
            type: "YELLOW"
          }
        })

        if (hasAYellowCard) {
          isSecondYellow = true
        }
      }

      const transactionOperations = []

      transactionOperations.push(
        prisma.card.create({
          data: {
            matchId: matchToAddCard.id,
            playerId: playerToAddCard.id,
            teamId: teamToAddPlayerCard.id,
            type: type,
            minute: minute
          }
        })
      )

      if (isSecondYellow) {
        transactionOperations.push(
          prisma.card.create({
            data: {
              matchId: matchToAddCard.id,
              playerId: playerToAddCard.id,
              teamId: teamToAddPlayerCard.id,
              type: "RED",
              minute: minute
            }
          })
        )
      }

      const updateStatsData = {}

      if (type === "YELLOW") {
        updateStatsData.yellowCards = { increment: 1 }
        if (isSecondYellow) {
          updateStatsData.redCards = { increment: 1 }
        }
      } else if (type === "RED") {
        updateStatsData.redCards = { increment: 1 }
      }

      transactionOperations.push(
        prisma.championshipPlayer.update({
          where: {
            championshipId_playerId: {
              championshipId: champ_id,
              playerId: playerToAddCard.id
            }
          },
          data: updateStatsData
        })
      )

      const results = await prisma.$transaction(transactionOperations)
      const createdCard = results[0]

      return res.status(201).json({
        status: "success",
        message: isSecondYellow ? "Segundo amarelo registrado. Jogador expulso." : "Cartão registrado com sucesso.",
        Card: createdCard,
        Player: playerToAddCard
      })
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      console.error('Erro ao adicionar cartão:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Delete(req, res) {
    try {
      const params = deleteCardParamsSchema.parse(req.params)
      const { champ_id, user_id, match_id, card_id } = params

      // 1. Validações de existência e pertencimento
      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const championship = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user.id
        }
      })

      if (!championship) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const match = await prisma.match.findUnique({
        where: { id: match_id }
      })

      if (!match) {
        return res.status(404).json({
          status: "error",
          message: "Partida não encontrada."
        })
      }

      if (match.championshipId !== champ_id) {
        return res.status(400).json({
          status: "error",
          message: "Esta partida não pertence a este campeonato."
        })
      }

      if (match.status === 'CANCELED') {
        return res.status(400).json({
          status: "error",
          message: "Não é possível remover cartão em partida cancelada."
        })
      }

      const card = await prisma.card.findUnique({
        where: { id: card_id }
      })

      if (!card) {
        return res.status(404).json({
          status: "error",
          message: "Cartão não encontrado."
        })
      }

      if (card.matchId !== match.id) {
        return res.status(400).json({
          status: "error",
          message: "Este cartão não pertence a esta partida."
        })
      }

      const player = await prisma.player.findUnique({
        where: { id: card.playerId }
      })

      if (!player) {
        return res.status(404).json({
          status: "error",
          message: "Jogador não encontrado."
        })
      }

      const team = await prisma.team.findUnique({
        where: { id: player.teamId }
      })

      if (!team) {
        return res.status(404).json({
          status: "error",
          message: "Time não encontrado."
        })
      }

      if (team.id !== match.homeTeamId && team.id !== match.awayTeamId) {
        return res.status(400).json({
          status: "error",
          message: "Este time não está jogando nesta partida."
        })
      }

      const championshipPlayer = await prisma.championshipPlayer.findUnique({
        where: {
          championshipId_playerId: {
            championshipId: championship.id,
            playerId: player.id
          }
        }
      })

      if (!championshipPlayer) {
        return res.status(400).json({
          status: "error",
          message: "Jogador não registrado neste campeonato."
        })
      }

      // 2. Preparando a Transação (Exclusão Independente)
      const transactionOperations = []

      // Adiciona a exclusão APENAS do cartão solicitado
      transactionOperations.push(
        prisma.card.delete({
          where: { id: card.id }
        })
      )

      // Calcula os novos valores garantindo que nunca fiquem negativos
      const newYellowCount = card.type === "YELLOW"
        ? Math.max(0, championshipPlayer.yellowCards - 1)
        : championshipPlayer.yellowCards

      const newRedCount = card.type === "RED"
        ? Math.max(0, championshipPlayer.redCards - 1)
        : championshipPlayer.redCards

      // Adiciona a atualização das estatísticas
      transactionOperations.push(
        prisma.championshipPlayer.update({
          where: {
            championshipId_playerId: {
              championshipId: championship.id,
              playerId: player.id
            }
          },
          data: {
            yellowCards: newYellowCount,
            redCards: newRedCount
          }
        })
      )

      // 3. Executa as operações no banco de dados de forma segura
      await prisma.$transaction(transactionOperations)

      return res.status(200).json({
        status: "success",
        message: "Cartão removido com sucesso."
      })
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      console.error('Erro ao deletar cartão:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}