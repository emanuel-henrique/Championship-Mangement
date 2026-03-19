import z from "zod"
import { prisma } from "../lib/prisma.js"
import { createGoalSchema } from "../Schemas/goal.schema.js"
import { goalParamsSchema } from "../Schemas/params.schema.js"

export default class GoalsController {
  async Create(req, res) {
    try {
      const body = createGoalSchema.parse(req.body)
      const params = goalParamsSchema.parse(req.params)

      const { player_id, team_id, minute, isOwnGoal, assist_player_id } = body
      const { champ_id, user_id, match_id } = params

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const championship = await prisma.championship.findUnique({
        where: { id: champ_id }
      })

      if (!championship) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const match = await prisma.match.findUnique({
        where: { id: match_id }
      })

      if (!match) {
        return res.status(404).json({
          status: "error",
          message: "Partida não encontrada."
        })
      }

      if (match.championshipId !== champ_id) {
        return res.status(400).json({
          status: "error",
          message: "Esta partida não pertence a este campeonato."
        })
      }

      if (match.status === 'CANCELED') {
        return res.status(400).json({
          status: "error",
          message: "Não é possível adicionar gol em partida cancelada."
        })
      }

      if (match.status === 'FINISHED') {
        return res.status(400).json({
          status: "error",
          message: "Não é possível adicionar gol em partida finalizada."
        })
      }

      const team = await prisma.team.findUnique({
        where: { id: team_id }
      })

      if (!team) {
        return res.status(404).json({
          status: "error",
          message: "Time não encontrado."
        })
      }

      if (team_id !== match.homeTeamId && team_id !== match.awayTeamId) {
        return res.status(400).json({
          status: "error",
          message: "Este time não está jogando nesta partida."
        })
      }

      const player = await prisma.player.findUnique({
        where: { id: player_id }
      })

      if (!player) {
        return res.status(404).json({
          status: "error",
          message: "Jogador não encontrado."
        })
      }

      if (player.teamId !== team_id) {
        return res.status(400).json({
          status: "error",
          message: "Este jogador não pertence a este time."
        })
      }

      const championshipPlayer = await prisma.championshipPlayer.findUnique({
        where: {
          championshipId_playerId: {
            championshipId: champ_id,
            playerId: player_id
          }
        }
      })

      if (!championshipPlayer) {
        return res.status(400).json({
          status: "error",
          message: "Este jogador não está registrado neste campeonato."
        })
      }

      let newHomeTeamScore = match.homeScore
      let newAwayTeamScore = match.awayScore
      let opponentId

      if (isOwnGoal) {
        await prisma.championshipTeam.update({
          where: {
            championshipId_teamId: {
              championshipId: champ_id,
              teamId: team_id
            }
          },
          data: {
            goalsAgainst: { increment: 1 }
          }
        })

        if (team_id === match.homeTeamId) {
          newAwayTeamScore++
          opponentId = match.awayTeamId
        } else {
          newHomeTeamScore++
          opponentId = match.homeTeamId
        }

        await prisma.championshipTeam.update({
          where: {
            championshipId_teamId: {
              championshipId: champ_id,
              teamId: opponentId
            }
          },
          data: {
            goalsFor: { increment: 1 }
          }
        })
      } else {
        await prisma.championshipTeam.update({
          where: {
            championshipId_teamId: {
              championshipId: champ_id,
              teamId: team_id
            }
          },
          data: {
            goalsFor: { increment: 1 }
          }
        })

        if (team_id === match.homeTeamId) {
          newHomeTeamScore++
          opponentId = match.awayTeamId
        } else {
          newAwayTeamScore++
          opponentId = match.homeTeamId
        }

        await prisma.championshipTeam.update({
          where: {
            championshipId_teamId: {
              championshipId: champ_id,
              teamId: opponentId
            }
          },
          data: {
            goalsAgainst: { increment: 1 }
          }
        })
      }

      const goal = await prisma.goal.create({
        data: {
          matchId: match_id,
          playerId: player_id,
          teamId: team_id,
          assistPlayerId: assist_player_id || null,
          minute: minute || null,
          isOwnGoal
        }
      })

      const updatedMatch = await prisma.match.update({
        where: { id: match_id },
        data: {
          homeScore: newHomeTeamScore,
          awayScore: newAwayTeamScore,
          status: match.status === 'SCHEDULED' ? 'IN_PROGRESS' : match.status
        }
      })

      if (!isOwnGoal) {
        await prisma.championshipPlayer.update({
          where: {
            championshipId_playerId: {
              championshipId: champ_id,
              playerId: player_id
            }
          },
          data: {
            goals: { increment: 1 }
          }
        })
      }

      if (assist_player_id) {
        await prisma.championshipPlayer.update({
          where: {
            championshipId_playerId: {
              championshipId: champ_id,
              playerId: assist_player_id
            }
          },
          data: {
            assists: { increment: 1 }
          }
        })
      }

      return res.status(201).json({
        status: "success",
        data: {
          goal,
          match: updatedMatch
        }
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Dados inválidos",
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      console.error('Erro ao criar gol:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Delete(req, res) {
    try {
      const params = goalParamsSchema.parse(req.params)
      const { champ_id, user_id, match_id, goal_id } = params

      const user = await prisma.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuário não encontrado."
        })
      }

      const champToRemoveMatchGoal = await prisma.championship.findUnique({
        where: {
          id: champ_id
        }
      })

      if (!champToRemoveMatchGoal) {
        return res.status(404).json({
          status: "error",
          message: "Campeonato não encontrado."
        })
      }

      const matchToRemoveGoal = await prisma.match.findUnique({
        where: { id: match_id }
      })

      if (!matchToRemoveGoal) {
        return res.status(404).json({
          status: "error",
          message: "Partida não encontrada."
        })
      }

      if (matchToRemoveGoal.championshipId !== champ_id) {
        return res.status(400).json({
          status: "error",
          message: "Esta partida não pertence a este campeonato."
        })
      }

      if (matchToRemoveGoal.status === 'CANCELED') {
        return res.status(400).json({
          status: "error",
          message: "Não é possível remover gol em partida cancelada."
        })
      }

      if (matchToRemoveGoal.status === 'FINISHED') {
        return res.status(400).json({
          status: "error",
          message: "Não é possível remover gol em partida finalizada."
        })
      }

      const goalToRemove = await prisma.goal.findUnique({
        where: {
          id: goal_id,
          matchId: match_id
        }
      })

      if (!goalToRemove) {
        return res.status(404).json({
          status: "error",
          message: "Gol não encontrado."
        })
      }

      const scoringTeamId = goalToRemove.teamId
      const isHomeTeam = scoringTeamId === matchToRemoveGoal.homeTeamId
      const opponentTeamId = isHomeTeam ? matchToRemoveGoal.awayTeamId : matchToRemoveGoal.homeTeamId

      let scoreField = isHomeTeam ? 'homeScore' : 'awayScore'

      if (goalToRemove.isOwnGoal) {
        scoreField = isHomeTeam ? 'awayScore' : 'homeScore'

        await prisma.championshipTeam.update({
          where: {
            championshipId_teamId: {
              championshipId: champ_id,
              teamId: scoringTeamId
            }
          },
          data: { goalsAgainst: { decrement: 1 } }
        })

        await prisma.championshipTeam.update({
          where: {
            championshipId_teamId: {
              championshipId: champ_id,
              teamId: opponentTeamId
            }
          },
          data: { goalsFor: { decrement: 1 } }
        })

      } else {
        await prisma.championshipTeam.update({
          where: {
            championshipId_teamId: {
              championshipId: champ_id,
              teamId: scoringTeamId
            }
          },
          data: { goalsFor: { decrement: 1 } }
        })

        await prisma.championshipTeam.update({
          where: {
            championshipId_teamId: {
              championshipId: champ_id,
              teamId: opponentTeamId
            }
          },
          data: { goalsAgainst: { decrement: 1 } }
        })
      }

      await prisma.match.update({
        where: { id: matchToRemoveGoal.id },
        data: { [scoreField]: { decrement: 1 } }
      })

      await prisma.goal.delete({
        where: {
          id: goalToRemove.id
        }
      })

      if (!goalToRemove.isOwnGoal) {
        await prisma.championshipPlayer.update({
          where: {
            championshipId_playerId: {
              championshipId: champ_id,
              playerId: goalToRemove.playerId
            }
          },
          data: {
            goals: { decrement: 1 }
          }
        })
      }

      if (goalToRemove.assistPlayerId) {
        await prisma.championshipPlayer.update({
          where: {
            championshipId_playerId: {
              championshipId: champ_id,
              playerId: goalToRemove.assistPlayerId
            }
          },
          data: {
            assists: { decrement: 1 }
          }
        })
      }

      return res.status(200).json({
        status: "success",
        message: "Gol removido com sucesso.",
        data: goalToRemove
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

      console.error('Erro ao deletar gol:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}