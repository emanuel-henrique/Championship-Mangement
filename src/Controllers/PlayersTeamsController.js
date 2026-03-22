import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { playerTeamsParams } from "../Schemas/playerTeam.schema.js"

export default class PlayersTeamsController {
  async Create(req, res) {
    try {
      const params = playerTeamsParams.parse(req.params)
      const { team_id, user_id, player_id } = params

      const playerToAdd = await prisma.player.findUnique({
        where: {
          id: player_id,
          userId: user_id
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
          id: team_id
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
        return res.status(400).json({
          status: "error",
          message: "O player selecionado já está nesse time."
        })
      }

      const theTeamHasInAChamphionship = await prisma.championshipTeam.findFirst({
        where: {
          teamId: teamToAddTeam.id
        }
      })

      if (theTeamHasInAChamphionship) {
        const isPlayerAlreadyInChampionship = await prisma.championshipPlayer.findFirst({
          where: {
            championshipId: theTeamHasInAChamphionship.championshipId,
            playerId: playerToAdd.id
          }
        })

        if (isPlayerAlreadyInChampionship) {
          return res.status(400).json({
            status: "error",
            message: "Este jogador já está inscrito neste campeonato por outro time. Não é possível transferi-lo durante a competição."
          })
        }

        await prisma.championshipPlayer.create({
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

      console.error('Erro ao adicionar jogador ao time:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}