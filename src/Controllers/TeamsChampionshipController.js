import { prisma } from "../lib/prisma.js"

export default class TeamsChampionshipController {
  async Create(req, res) {
    const { name } = req.body
    const { champ_id, user_id } = req.params

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

    if (!name?.trim()) {
      return res.status(404).json({
        status: "error",
        message: "Selecione o time."
      })
    }

    const teamToAdd = await prisma.team.findFirst({
      where: {
        userId: +user_id,
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
        id: +champ_id
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
      return res.status(404).json({
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
        }))
      })
    }

    const addedTeam = await prisma.championshipTeam.create({
      data: {
        championshipId: championshipToAddTeam.id,
        teamId: teamToAdd.id
      }
    })

    return res.status(201).json(addedTeam)
  }

  async Delete(req, res) {
    const { champ_id, team_id } = req.params

    try {
      const teamToRemove = await prisma.championshipTeam.delete({
        where: {
          id: +team_id,
          championshipId: +champ_id
        }
      })

      const playerChampionshipToRemove = await prisma.championshipPlayer.deleteMany({
        where: {
          championshipId: +champ_id,
          player: {
            is: {
              teamId: teamToRemove.teamId
            }
          }
        }
      })

      return res.status(200).json({ teamToRemove, playerChampionshipToRemove })
    } catch (error) {
      return res.status(404).json({
        status: "error",
        message: "Time não encontrado."
      })
    }
  }
}