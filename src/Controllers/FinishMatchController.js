import { z } from "zod" // <-- Import adicionado para o catch funcionar
import { prisma } from "../lib/prisma.js"
import { finishParamsSchema } from "../Schemas/params.schema.js"

export default class FinishMatchController {
  async Finish(req, res) {
    try {
      const params = finishParamsSchema.parse(req.params)
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

      const champToFinishMatchCard = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user.id
        }
      })

      if (!champToFinishMatchCard) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const matchToFinish = await prisma.match.findUnique({
        where: { id: match_id }
      })

      if (!matchToFinish) {
        return res.status(404).json({
          status: "error",
          message: "Partida não encontrada."
        })
      }

      if (matchToFinish.championshipId !== champ_id) {
        return res.status(400).json({
          status: "error",
          message: "Esta partida não pertence a este campeonato."
        })
      }

      if (matchToFinish.status === 'FINISHED') {
        return res.status(400).json({
          status: "error",
          message: "Esta partida já foi finalizada."
        })
      }

      if (matchToFinish.status === 'CANCELED') {
        return res.status(400).json({
          status: "error",
          message: "Não é possível finalizar partida cancelada."
        })
      }

      const updatedMatch = await prisma.match.update({
        where: {
          id: matchToFinish.id
        },
        data: {
          status: "FINISHED",
          finishedAt: new Date()
        }
      })

      const { homeScore, awayScore, homeTeamId, awayTeamId } = matchToFinish

      async function setResults(team_id, { winner, loser, draw = false }) {
        let data = {}

        if (winner) {
          data = {
            wins: { increment: 1 },
            points: { increment: 3 }
          }
        } else if (loser) {
          data = {
            losses: { increment: 1 },
          }
        } else if (draw) {
          data = {
            draws: { increment: 1 },
            points: { increment: 1 }
          }
        }

        await prisma.championshipTeam.update({
          where:
          {
            championshipId_teamId: {
              championshipId: champToFinishMatchCard.id,
              teamId: team_id
            }
          },
          data: {
            ...data
          }
        })
      }

      if (homeScore > awayScore) {
        await setResults(homeTeamId, {
          winner: true,
          loser: false,
        })

        await setResults(awayTeamId, {
          winner: false,
          loser: true,
        })

      } else if (homeScore < awayScore) {
        await setResults(homeTeamId, {
          winner: false,
          loser: true,
        })

        await setResults(awayTeamId, {
          winner: true,
          loser: false,
        })
      }
      else {
        await setResults(homeTeamId, {
          draw: true
        })

        await setResults(awayTeamId, {
          draw: true
        })
      }

      return res.status(200).json({
        status: "success",
        message: "Partida finalizada com sucesso.",
        data: updatedMatch
      })

    } catch (error) {
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

      console.error('Erro ao finalizar partida:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}