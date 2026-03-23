import z from "zod"
import { prisma } from "../lib/prisma.js"
import { createTeamParamsSchema, deleteTeamParamsSchema } from "../Schemas/params.schema.js"

export default class TeamsChampionshipController {
  async Create(req, res) {
    try {
      const schema = z.object({
        name: z.string({
          required_error: "O nome do time é obrigatório."
        }).trim()
          .min(1, "Please fill in all required fields.")
      })

      const body = schema.parse(req.body)
      const { name } = body

      const params = createTeamParamsSchema.parse(req.params)
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

      const teamToAdd = await prisma.team.findFirst({
        where: {
          userId: user_id,
          name
        }
      })

      if (!teamToAdd) {
        return res.status(404).json({
          status: "error",
          message: "Time não encontrado."
        })
      }

      const championshipToAddTeam = await prisma.championship.findUnique({
        where: {
          id: champ_id
        }
      })

      if (!championshipToAddTeam) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const isInThatChampionship = await prisma.championshipTeam.findFirst({
        where: {
          championshipId: championshipToAddTeam.id,
          teamId: teamToAdd.id
        }
      })

      if (isInThatChampionship) {
        return res.status(400).json({
          status: "error",
          message: "O time selecionado já está nesse campeonato."
        })
      }

      const players = await prisma.player.findMany({
        where: {
          teamId: teamToAdd.id
        }
      })

      if (players.length > 0) {
        await prisma.championshipPlayer.createMany({
          data: players.map(player => ({
            championshipId: championshipToAddTeam.id,
            playerId: player.id
          })),
          skipDuplicates: true
        })
      }

      const addedTeam = await prisma.championshipTeam.create({
        data: {
          championshipId: championshipToAddTeam.id,
          teamId: teamToAdd.id
        }
      })

      return res.status(201).json(addedTeam)

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

      console.error('Erro ao adicionar time ao campeonato:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Delete(req, res) {
    try {
      const params = deleteTeamParamsSchema.parse(req.params)
      const { champ_id, team_id } = params

      const teamToRemove = await prisma.championshipTeam.delete({
        where: {
          id: team_id,
          championshipId: champ_id,
        }
      })

      const playerChampionshipToRemove = await prisma.championshipPlayer.deleteMany({
        where: {
          championshipId: champ_id,
          player: {
            teamId: teamToRemove.teamId
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: { teamToRemove, playerChampionshipToRemove }
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

      return res.status(404).json({
        status: "error",
        message: "Time não encontrado ou já removido."
      })
    }
  }
}