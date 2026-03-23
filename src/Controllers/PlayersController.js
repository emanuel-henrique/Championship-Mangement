import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { basePlayerParamsSchema, playerParamsSchema } from "../Schemas/params.schema.js"
import { playerSchema, playerSchemaQuery } from "../Schemas/player.schema.js"

export default class PlayersController {
  async Create(req, res) {
    try {
      const body = playerSchema.parse(req.body)
      const { name, birthDate, jerseyNumber, position } = body

      const params = basePlayerParamsSchema.parse(req.params)
      const { user_id } = params

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

      const player = await prisma.player.create({
        data: {
          userId: user_id,
          name,
          birthDate,
          jerseyNumber,
          position,
        }
      })

      return res.status(201).json(player)
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

      console.error('Erro ao criar jogador:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Update(req, res) {
    try {
      const body = playerSchema.parse(req.body)
      const { name, birthDate, jerseyNumber, position } = body

      const params = playerParamsSchema.parse(req.params)
      const { player_id, user_id } = params

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

      const playerToUpdate = await prisma.player.findUnique({
        where: {
          id: player_id,
          userId: user_id
        }
      })

      if (!playerToUpdate) {
        return res.status(404).json({
          status: "error",
          message: "Player não encontrado."
        })
      }

      const updatedPlayer = await prisma.player.update({
        where: {
          id: playerToUpdate.id
        },
        data: {
          name,
          birthDate,
          jerseyNumber,
          position
        }
      })

      return res.status(200).json(updatedPlayer)
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

      console.error('Erro ao atualizar jogador:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Delete(req, res) {
    try {
      const params = playerParamsSchema.parse(req.params)
      const { player_id, user_id } = params

      const playerToDelete = await prisma.player.delete({
        where: {
          userId: user_id,
          id: player_id
        }
      })

      return res.status(200).json(playerToDelete)
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
        message: "Player não encontrado ou erro ao deletar."
      })
    }
  }

  async Index(req, res) {
    try {
      const query = playerSchemaQuery.parse(req.query)
      const { search, team, position } = query

      const params = basePlayerParamsSchema.parse(req.params)
      const { user_id } = params

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

      if (position) {
        where.position = position.toUpperCase()
      }

      if (team) {
        where.team = {
          name: {
            contains: team,
            mode: 'insensitive'
          }
        }
      }

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive'
        }
      }

      const players = await prisma.player.findMany({
        where,
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
          players,
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

      console.error('Erro ao buscar jogadores:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}