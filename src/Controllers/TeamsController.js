import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { basePlayerParamsSchema, updateTeamParamsSchema } from "../Schemas/params.schema.js"
import { createTeamSchema, updateTeamSchema } from "../Schemas/teams.schema.js"

export default class TeamsController {
  async Create(req, res) {
    try {
      const body = createTeamSchema.parse(req.body)
      const { name, emblemUrl } = body

      const params = basePlayerParamsSchema.parse(req.params)
      const { user_id } = params

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const nameIsAlreadyInUse = await prisma.team.findFirst({
        where: {
          userId: user_id,
          name,
        }
      })

      if (nameIsAlreadyInUse) {
        return res.status(400).json({
          status: "error",
          message: "Você já criou um time com este nome."
        })
      }

      const team = await prisma.team.create({
        data: {
          name,
          emblemUrl,
          userId: user_id
        }
      })

      return res.status(201).json(team)
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
      console.error('Erro ao criar time:', error)
      return res.status(500).json({ status: "error", message: "Erro interno do servidor." })
    }
  }

  async Update(req, res) {
    try {
      const body = updateTeamSchema.parse(req.body)
      const { name, emblemUrl } = body

      const params = updateTeamParamsSchema.parse(req.params)
      const { team_id, user_id } = params

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const teamToUpdate = await prisma.team.findUnique({
        where: {
          id: team_id,
          userId: user_id
        }
      })

      if (!teamToUpdate) {
        return res.status(404).json({
          status: "error",
          message: "Time não encontrado."
        })
      }

      if (name) {
        const nameIsAlreadyInUse = await prisma.team.findFirst({
          where: {
            userId: user_id,
            name,
            id: { not: team_id }
          }
        })

        if (nameIsAlreadyInUse) {
          return res.status(400).json({
            status: "error",
            message: "Você já possui outro time com este nome."
          })
        }
      }

      const updatedTeam = await prisma.team.update({
        where: {
          id: teamToUpdate.id
        },
        data: {
          name,
          emblemUrl
        }
      })

      return res.status(200).json(updatedTeam)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
        })
      }
      console.error('Erro ao atualizar time:', error)
      return res.status(500).json({ status: "error", message: "Erro interno do servidor." })
    }
  }

  async Delete(req, res) {
    try {
      const params = updateTeamParamsSchema.parse(req.params)
      const { team_id, user_id } = params

      const teamToDelete = await prisma.team.delete({
        where: {
          id: team_id,
          userId: user_id
        }
      })

      return res.status(200).json(teamToDelete)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
        })
      }
      return res.status(404).json({
        status: "error",
        message: "Time não encontrado ou erro ao deletar."
      })
    }
  }

  async Index(req, res) {
    try {
      const params = basePlayerParamsSchema.parse(req.params)
      const { user_id } = params

      const { search } = req.query

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

      const where = {
        userId: user_id
      }

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive'
        }
      }

      const teams = await prisma.team.findMany({
        where,
        include: {
          _count: {
            select: { players: true }
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: {
          teams
        }
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
        })
      }
      console.error('Erro ao buscar times:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno ao buscar times."
      })
    }
  }
}