import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { championshipViewerParamsSchema, championshipViewerQuerySchema } from "../Schemas/params.schema.js"

export default class ChampionshipViewController {
  async Overview(req, res) {
    try {
      const params = championshipViewerParamsSchema.parse(req.params)
      const { champ_id } = params
      const user_id = req.userId

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
          userId: user_id
        }
      })

      if (!championship) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado ou não pertence a você."
        })
      }

      const goalsCount = await prisma.goal.count({
        where: {
          match: {
            championshipId: championship.id
          }
        }
      })

      const matchCount = await prisma.match.count({
        where: {
          championshipId: championship.id
        }
      })

      const topScorer = await prisma.championshipPlayer.findFirst({
        where: {
          championshipId: champ_id,
          goals: { gt: 0 }
        },
        orderBy: {
          goals: 'desc'
        },
        include: {
          player: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      const leader = await prisma.championshipTeam.findFirst({
        where: {
          championshipId: champ_id
        },
        orderBy: {
          points: 'desc'
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              emblemUrl: true
            }
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: {
          stats: {
            totalGoals: goalsCount,
            totalMatches: matchCount
          },
          topScorer: topScorer ? {
            name: topScorer.player.name,
            goals: topScorer.goals
          } : null,
          leader: leader ? {
            name: leader.team.name,
            points: leader.points
          } : null
        }
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

      console.error('Erro ao buscar dados:', error)
      return res.status(500).json({ status: "error", message: "Erro interno do servidor." })
    }
  }

  async Standings(req, res) {
    try {
      const params = championshipViewerParamsSchema.parse(req.params)
      const { champ_id } = params
      const user_id = req.userId

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({ status: "error", message: "Usuário não encontrado." })
      }

      const championship = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user_id
        }
      })

      if (!championship) {
        return res.status(404).json({ status: "error", message: "Campeonato não encontrado ou não pertence a você." })
      }

      const standings = await prisma.championshipTeam.findMany({
        where: {
          championshipId: championship.id
        },
        orderBy: [
          { points: 'desc' },
          { wins: 'desc' },
          { goalsFor: 'desc' }
        ],
        include: {
          team: {
            select: {
              id: true,
              name: true,
              emblemUrl: true
            }
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: { standings }
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
        })
      }

      console.error('Erro ao buscar dados:', error)
      return res.status(500).json({ status: "error", message: "Erro interno do servidor." })
    }
  }

  async Matches(req, res) {
    try {
      const params = championshipViewerParamsSchema.parse(req.params)
      const { champ_id } = params
      const user_id = req.userId

      const query = championshipViewerQuerySchema.parse(req.query)
      const { status } = query

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({ status: "error", message: "Usuário não encontrado." })
      }

      const championship = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user_id
        }
      })

      if (!championship) {
        return res.status(404).json({ status: "error", message: "Campeonato não encontrado ou não pertence a você." })
      }

      let where = {
        championshipId: championship.id
      }

      if (status) {
        where.status = status.toUpperCase()
      }

      const matches = await prisma.match.findMany({
        where,
        orderBy: [
          { matchDate: 'asc' }
        ],
        select: {
          id: true,
          matchDate: true,
          homeScore: true,
          awayScore: true,
          status: true,
          awayTeam: {
            select: { id: true, name: true, emblemUrl: true }
          },
          homeTeam: {
            select: { id: true, name: true, emblemUrl: true }
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: { matches }
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
        })
      }

      console.error('Erro ao buscar dados:', error)
      return res.status(500).json({ status: "error", message: "Erro interno do servidor." })
    }
  }

  async Teams(req, res) {
    try {
      const params = championshipViewerParamsSchema.parse(req.params)
      const { champ_id } = params
      const user_id = req.userId

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({ status: "error", message: "Usuário não encontrado." })
      }

      const championship = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user_id
        }
      })

      if (!championship) {
        return res.status(404).json({ status: "error", message: "Campeonato não encontrado ou não pertence a você." })
      }

      const teams = await prisma.championshipTeam.findMany({
        where: {
          championshipId: champ_id
        },
        select: {
          id: true,
          championshipId: true,
          team: {
            select: {
              id: true,
              name: true,
              emblemUrl: true,
              _count: {
                select: { players: true }
              }
            }
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: { teams }
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
        })
      }

      console.error('Erro ao buscar dados:', error)
      return res.status(500).json({ status: "error", message: "Erro interno do servidor." })
    }
  }

  async TopScorers(req, res) {
    try {
      const params = championshipViewerParamsSchema.parse(req.params)
      const { champ_id } = params
      const user_id = req.userId

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({ status: "error", message: "Usuário não encontrado." })
      }

      const championship = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user_id
        }
      })

      if (!championship) {
        return res.status(404).json({ status: "error", message: "Campeonato não encontrado ou não pertence a você." })
      }

      const topscorers = await prisma.championshipPlayer.findMany({
        where: {
          championshipId: championship.id,
          goals: { gt: 0 }
        },
        orderBy: {
          goals: "desc"
        },
        select: {
          goals: true,
          player: {
            select: {
              name: true,
              team: {
                select: {
                  id: true,
                  name: true,
                  emblemUrl: true
                }
              }
            },
          }
        },
      })

      return res.status(200).json({
        status: "success",
        data: { topscorers }
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
        })
      }

      console.error('Erro ao buscar dados:', error)
      return res.status(500).json({ status: "error", message: "Erro interno do servidor." })
    }
  }
}