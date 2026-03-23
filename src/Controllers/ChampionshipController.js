import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { championshipQuerySchema, createChampionshipSchema, updateChampionshipSchema } from "../Schemas/championship.schema.js"
import { championshipParamsSchema } from "../Schemas/params.schema.js"

export default class Championship {
  async Create(req, res) {
    try {
      const body = createChampionshipSchema.parse(req.body)
      const { name } = body

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

      const nameAlreadyInUse = await prisma.championship.findFirst({
        where: {
          userId: user_id,
          name,
        }
      })

      if (nameAlreadyInUse) {
        return res.status(400).json({
          status: "error",
          message: "Você já possui um campeonato com este nome."
        })
      }

      const championship = await prisma.championship.create({
        data: {
          ...body,
          userId: user_id
        }
      })

      return res.status(201).send(championship)
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

      console.error('Erro ao criar campeonato:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Delete(req, res) {
    try {
      const params = championshipParamsSchema.parse(req.params)
      const { champ_id } = params
      const user_id = req.userId

      const championship = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user_id
        }
      })

      if (!championship) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      await prisma.championship.delete({
        where: { id: champ_id }
      })

      return res.status(204).send()
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

      console.error('Erro ao deletar campeonato:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Update(req, res) {
    try {
      const body = updateChampionshipSchema.parse(req.body)

      const params = championshipParamsSchema.parse(req.params)
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

      const champToUpdate = await prisma.championship.findFirst({
        where: {
          id: champ_id,
          userId: user_id
        }
      })

      if (!champToUpdate) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const updatedChampionship = await prisma.championship.update({
        where: { id: champ_id },
        data: body
      })

      return res.status(200).json(updatedChampionship)
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

      console.error('Erro ao atualizar campeonato:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Index(req, res) {
    try {
      const user_id = req.userId
      const { modality, search } = championshipQuerySchema.parse(req.query)

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const where = {
        userId: user_id,
        ...(modality && { modality }),
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        })
      }

      const championships = await prisma.championship.findMany({
        where,
        include: {
          _count: {
            select: { teams: true }
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: {
          championships
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

      console.error('Erro ao procurar campeonato:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}