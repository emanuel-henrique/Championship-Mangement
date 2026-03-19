import { prisma } from "../lib/prisma.js"

export default class TeamsController {
  async Create(req, res) {
    const { name, emblemUrl } = req.body
    const { user_id } = req.params

    const userId = Number(user_id)

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuário não encontrado."
      })
    }

    if (!name?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Preencha o nome do time."
      })
    }

    const rawName = name

    const formattedName = rawName
      .trim()
      .replace(/\s+/g, " ")

    const nameIsAlreadyInUse = await prisma.team.findFirst({
      where: {
        userId,
        name: formattedName
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
        name: formattedName,
        emblemUrl: emblemUrl?.trim() ?? "",
        userId
      }
    })

    return res.status(201).json(team)
  }

  async Update(req, res) {
    const { name } = req.body
    const { team_id, user_id } = req.params

    const user = await prisma.user.findUnique({
      where: {
        id: +user_id
      }
    })

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuário não encontrado."
      })
    }

    const teamToUpdate = await prisma.team.findUnique({
      where: {
        id: +team_id,
        userId: +user_id
      }
    })

    if (!teamToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Time não encontrado."
      })
    }

    if (!name?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Preencha todos os campos."
      })
    }

    const rawName = name

    const formattedName = rawName
      .trim()
      .replace(/\s+/g, " ")

    const nameIsAlreadyInUse = await prisma.team.findFirst({
      where: {
        userId: +user_id,
        name: formattedName
      }
    })

    if (nameIsAlreadyInUse) {
      return res.status(400).json({
        status: "error",
        message: "Você já possui um time com este nome."
      })
    }

    const updatedTeam = await prisma.team.update({
      where: {
        id: teamToUpdate.id
      },
      data: {
        name,
      }
    })

    return res.status(200).json(updatedTeam)
  }

  async Delete(req, res) {
    const { team_id } = req.params

    try {
      const teamToDelete = await prisma.team.delete({
        where: {
          id: +team_id
        }
      })

      return res.status(200).json(teamToDelete)
    } catch (error) {
      return res.status(404).json({
        status: "error",
        message: "Time não encontrado."
      })
    }
  }

  async Index(req, res) {
    const { user_id } = req.params
    const { search } = req.query

    const user = await prisma.user.findUnique({
      where: {
        id: +user_id
      }
    })

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuário não encontrado."
      })
    }

    const where = {
      userId: +user_id
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    try {
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
      return res.status(500).json({
        status: "error",
        message: "Erro ao buscar times."
      })
    }
  }
}
