import { prisma } from "../lib/prisma.js"

export default class PlayersController {
  async Create(req, res) {
    const { name, birthDate, jerseyNumber, position } = req.body
    const { user_id } = req.params

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

    if (!name?.trim() || !jerseyNumber) {
      return res.status(400).json({
        status: "error",
        message: "Preencha todos os campos obrigatórios."
      })
    }

    let formatedDate = new Date()

    if (birthDate) {
      formatedDate = new Date(birthDate)
    }

    const player = await prisma.player.create({
      data: {
        userId: +user_id,
        name,
        birthDate: formatedDate,
        jerseyNumber,
        position: position.toUpperCase() ?? "ALA"
      }
    })

    return res.status(201).json(player)
  }

  async Update(req, res) {
    const { name, birthDate, jerseyNumber, position } = req.body
    const { player_id, user_id } = req.params

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

    const playerToUpdate = await prisma.team.findUnique({
      where: {
        id: +player_id,
        userId: +user_id
      }
    })

    if (!playerToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Player não encontrado."
      })
    }

    if (!name?.trim() || !jerseyNumber) {
      return res.status(400).json({
        status: "error",
        message: "Preencha todos os campos obrigatórios."
      })
    }

    let formatedDate = new Date()

    if (birthDate) {
      formatedDate = new Date(birthDate)
    }

    const updatedPlayer = await prisma.player.update({
      where: {
        id: playerToUpdate.id
      },
      data: {
        name,
        birthDate: formatedDate,
        jerseyNumber,
        position: position.toUpperCase() ?? "ALA"
      }
    })

    return res.status(200).json(updatedPlayer)
  }

  async Delete(req, res) {
    const { player_id, user_id } = req.params

    try {
      const playerToDelete = await prisma.player.delete({
        where: {
          userId: +user_id,
          id: +player_id
        }
      })

      return res.status(200).json(playerToDelete)
    } catch (error) {
      return res.status(404).json({
        status: "error",
        message: "Player não encontrado."
      })
    }
  }

  async Index(req, res) {
    const { user_id } = req.params
    const { search, team, position } = req.query

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

    try {
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
      return res.status(500).json({
        status: "error",
        message: "Erro ao buscar jogadores."
      })
    }
  }
}