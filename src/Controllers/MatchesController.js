import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { createMatchSchema, updateMatchSchema } from "../Schemas/match.schema.js"
import { baseMatchParamsSchema, matchParamsSchema } from "../Schemas/params.schema.js"

export default class MatchesController {
  async Create(req, res) {
    try {
      const body = createMatchSchema.parse(req.body)
      const { homeTeamId, awayTeamId, status, matchDate, finishedAt } = body

      const params = baseMatchParamsSchema.parse(req.params)
      const { champ_id } = params
      const user_id = req.userId

      const user = await prisma.user.findUnique({
        where: {
          id: user_id
        }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const champToAddMatch = await prisma.championship.findUnique({
        where: {
          id: champ_id
        }
      })

      if (!champToAddMatch) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      if (homeTeamId === awayTeamId) {
        return res.status(400).json({
          status: "error",
          message: "A partida deve ocorrer com dois times diferentes."
        })
      }

      const areTeamsFromTheSameChampionship = await prisma.championshipTeam.findMany({
        where: {
          championshipId: champ_id,
          teamId: {
            in: [homeTeamId, awayTeamId]
          }
        }
      })

      if (areTeamsFromTheSameChampionship.length < 2) {
        return res.status(400).json({
          status: "error",
          message: "Os times não estão no mesmo campeonato."
        })
      }

      const match = await prisma.match.create({
        data: {
          championshipId: champ_id,
          homeTeamId,
          awayTeamId,
          status,
          matchDate,
          finishedAt
        }
      })

      return res.status(201).json(match)
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

      console.error('Erro ao criar partida:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Update(req, res) {
    try {
      const body = updateMatchSchema.parse(req.body)
      const { homeTeamId, awayTeamId, status, matchDate, finishedAt } = body

      const params = matchParamsSchema.parse(req.params)
      const { champ_id, match_id } = params
      const user_id = req.userId

      const user = await prisma.user.findUnique({
        where: {
          id: user_id
        }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const champToUpdateMatch = await prisma.championship.findUnique({
        where: {
          id: champ_id
        }
      })

      if (!champToUpdateMatch) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const matchToUpdate = await prisma.match.findUnique({
        where: {
          id: match_id
        }
      })

      if (!matchToUpdate) {
        return res.status(404).json({
          status: "error",
          message: "Partida não encontrada."
        })
      }

      if (matchToUpdate.championshipId !== champ_id) {
        return res.status(400).json({
          status: "error",
          message: "Esta partida não pertence a este campeonato."
        })
      }

      if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
        return res.status(400).json({
          status: "error",
          message: "A partida deve ocorrer com dois times diferentes."
        })
      }

      if (homeTeamId && awayTeamId) {
        const areTeamsFromTheSameChampionship = await prisma.championshipTeam.findMany({
          where: {
            championshipId: champ_id,
            teamId: {
              in: [homeTeamId, awayTeamId]
            }
          }
        })

        if (areTeamsFromTheSameChampionship.length < 2) {
          return res.status(400).json({
            status: "error",
            message: "Os times não estão no mesmo campeonato."
          })
        }
      }

      const updatedMatch = await prisma.match.update({
        where: {
          id: match_id,
          championshipId: champ_id
        },
        data: {
          homeTeamId: homeTeamId ?? matchToUpdate.homeTeamId,
          awayTeamId: awayTeamId ?? matchToUpdate.awayTeamId,
          status: status ?? matchToUpdate.status,
          matchDate: matchDate ? new Date(matchDate) : matchToUpdate.matchDate,
          finishedAt: finishedAt ? new Date(finishedAt) : matchToUpdate.finishedAt
        }
      })

      return res.status(200).json(updatedMatch)
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

      console.error('Erro ao atualizar partida:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Delete(req, res) {
    try {
      const params = matchParamsSchema.parse(req.params)
      const { champ_id, match_id } = params
      const user_id = req.userId

      const user = await prisma.user.findUnique({
        where: {
          id: user_id
        }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const champToDeleteMatch = await prisma.championship.findUnique({
        where: {
          id: champ_id,
          userId: user_id
        }
      })

      if (!champToDeleteMatch) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const matchToDelete = await prisma.match.findUnique({
        where: {
          id: match_id
        }
      })

      if (!matchToDelete) {
        return res.status(404).json({
          status: "error",
          message: "Partida não encontrada."
        })
      }

      if (matchToDelete.championshipId !== champ_id) {
        return res.status(400).json({
          status: "error",
          message: "Esta partida não pertence a este campeonato."
        })
      }

      const deleteMatch = await prisma.match.delete({
        where: {
          id: matchToDelete.id
        }
      })

      return res.status(200).json(deleteMatch)
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

      console.error('Erro ao deletar partida:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}