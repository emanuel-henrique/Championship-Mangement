import { z } from "zod"
import { prisma } from "../lib/prisma.js"

export default class DashboardControllers {
  async getDashboardData(req, res) {
    try {
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

      const championshipsCount = await prisma.championship.count({
        where: {
          userId: user_id
        }
      })

      const teamsCount = await prisma.team.count({
        where: {
          userId: user_id
        }
      })

      const playersCount = await prisma.player.count({
        where: {
          userId: user_id
        }
      })

      const matchesCount = await prisma.match.count({
        where: {
          championship: {
            userId: user_id
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: {
          championships: championshipsCount,
          teams: teamsCount,
          players: playersCount,
          matches: matchesCount
        }
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

      console.error('Erro ao buscar dados do dashboard:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}