import { prisma } from "../lib/prisma.js"

export default class MatchesController {
  async Create(req, res) {
    const { homeTeamId, awayTeamId, status, matchDate, finishedAt } = req.body
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

    const champToAddMatch = await prisma.championship.findUnique({
      where: {
        id: +champ_id
      }
    })

    if (!champToAddMatch) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({
        status: "error",
        message: "Preencha todos os campos obrigatórios."
      })
    }

    if (homeTeamId === awayTeamId) {
      return res.status(400).json({
        status: "error",
        message: "A partida deve ocorrer com dois times diferentes."
      })
    }

    const areTeamsFromTheSameChampionship = await prisma.championshipTeam.findMany({
      where: {
        championshipId: +champ_id,
        teamId: {
          in: [homeTeamId, awayTeamId]
        }
      }
    })

    if (areTeamsFromTheSameChampionship.length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Os times não estão no mesmo campeonato."
      })
    }

    let formatedMatchDate = matchDate ? new Date(matchDate) : new Date()
    let formatedFinishedDate = finishedAt ? new Date(finishedAt) : undefined

    const match = await prisma.match.create({
      data: {
        championshipId: +champ_id,
        homeTeamId,
        awayTeamId,
        status: status ? status : "SCHEDULED",
        matchDate: formatedMatchDate,
        finishedAt: formatedFinishedDate
      }
    })

    return res.status(201).json(match)
  }

  async Update(req, res) {
    const { homeTeamId, awayTeamId, status, matchDate, finishedAt } = req.body
    const { champ_id, user_id, match_id } = req.params

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

    const champToUpdateMatch = await prisma.championship.findUnique({
      where: {
        id: +champ_id
      }
    })

    if (!champToUpdateMatch) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    const matchToUpdate = await prisma.match.findUnique({
      where: {
        id: +match_id
      }
    })

    if (!matchToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Partida não encontrado."
      })
    }

    if (matchToUpdate.championshipId !== +champ_id) {
      return res.status(400).json({
        status: "error",
        message: "Esta partida não pertence a este campeonato."
      })
    }

    if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
      return res.status(400).json({
        status: "error",
        message: "A partida deve ocorrer com dois times diferentes."
      })
    }

    if (homeTeamId && awayTeamId) {
      const areTeamsFromTheSameChampionship = await prisma.championshipTeam.findMany({
        where: {
          championshipId: +champ_id,
          teamId: {
            in: [homeTeamId, awayTeamId]
          }
        }
      })

      if (areTeamsFromTheSameChampionship.length < 2) {
        return res.status(400).json({
          status: "error",
          message: "Os times não estão no mesmo campeonato."
        })
      }
    }

    const updatedMatch = await prisma.match.update({
      where: {
        id: +match_id,
        championshipId: +champ_id
      },
      data: {
        homeTeamId: homeTeamId ?? matchToUpdate.homeTeamId,
        awayTeamId: awayTeamId ?? matchToUpdate.awayTeamId,
        status: status ?? matchToUpdate.status,
        matchDate: matchDate ? new Date(matchDate) : matchToUpdate.matchDate,
        finishedAt: finishedAt ? new Date(finishedAt) : matchToUpdate.finishedAt
      }
    })

    return res.status(200).json(updatedMatch)
  }

  async Delete(req, res) {
    const { champ_id, user_id, match_id } = req.params

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

    const champToDeleteMatch = await prisma.championship.findUnique({
      where: {
        id: +champ_id,
        userId: +user_id
      }
    })

    if (!champToDeleteMatch) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    const matchToDelete = await prisma.match.findUnique({
      where: {
        id: +match_id
      }
    })

    if (!matchToDelete) {
      return res.status(404).json({
        status: "error",
        message: "Partida não encontrado."
      })
    }

    if (matchToDelete.championshipId !== +champ_id) {
      return res.status(400).json({
        status: "error",
        message: "Esta partida não pertence a este campeonato."
      })
    }

    const deleteMatch = await prisma.match.delete({
      where: {
        id: matchToDelete.id
      }
    })

    return res.status(200).json(deleteMatch)
  }
}