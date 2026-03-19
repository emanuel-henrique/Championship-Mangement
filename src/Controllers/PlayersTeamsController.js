import { prisma } from "../lib/prisma.js"

export default class PlayersTeamsController {
  async Create(req, res) {

    const { team_id, user_id, player_id } = req.params

    const playerToAdd = await prisma.player.findUnique({
      where: {
        id: +player_id,
        userId: +user_id
      }
    })

    if (!playerToAdd) {
      return res.status(404).json({
        status: "error",
        message: "Player não encontrado."
      })
    }

    const teamToAddTeam = await prisma.team.findUnique({
      where: {
        id: +team_id
      }
    })

    if (!teamToAddTeam) {
      return res.status(404).json({
        status: "error",
        message: "Time não encontrado."
      })
    }

    const isInThatTeam = await prisma.player.findFirst({
      where: {
        id: playerToAdd.id,
        teamId: teamToAddTeam.id
      }
    })

    if (isInThatTeam) {
      return res.status(404).json({
        status: "error",
        message: "O player selecionado já está nesse time."
      })
    }

    const theTeamHasInAChamphionship = await prisma.championshipTeam.findUnique({
      where: {
        id: teamToAddTeam.id
      }
    })

    if (theTeamHasInAChamphionship) {
      const createPlayerChampionship = await prisma.championshipPlayer.create({
        data: {
          championshipId: theTeamHasInAChamphionship.championshipId,
          playerId: playerToAdd.id
        }
      })
    }

    const addedPlayer = await prisma.player.update({
      where: {
        id: playerToAdd.id
      },
      data: {
        teamId: teamToAddTeam.id
      }
    })

    return res.status(201).json(addedPlayer)
  }
}