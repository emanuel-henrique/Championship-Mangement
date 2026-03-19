import { prisma } from "../lib/prisma.js"

export default class MatchViewController {
  async Show(req, res) {
    const { user_id, champ_id, match_id } = req.params

    const user = await prisma.user.findUnique({
      where: { id: +user_id }
    })

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuário não encontrado."
      })
    }

    const championship = await prisma.championship.findFirst({
      where: {
        id: +champ_id,
        userId: user.id
      }
    })

    if (!championship) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    const match = await prisma.match.findFirst({
      where: {
        id: +match_id,
        championshipId: championship.id
      },
      select: {
        id: true,
        matchDate: true,
        status: true,
        homeScore: true,
        awayScore: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            emblemUrl: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            emblemUrl: true
          }
        },
        goals: {
          orderBy: { minute: 'asc' },
          select: {
            id: true,
            minute: true,
            isOwnGoal: true,
            player: {
              select: {
                id: true,
                name: true,
                jerseyNumber: true
              }
            },
            assistPlayer: {
              select: {
                id: true,
                name: true,
                jerseyNumber: true
              }
            }
          }
        },
        cards: {
          orderBy: { minute: 'asc' },
          select: {
            id: true,
            type: true,
            minute: true,
            player: {
              select: {
                id: true,
                name: true,
                jerseyNumber: true
              }
            }
          }
        }
      }
    })

    if (!match) {
      return res.status(404).json({
        status: "error",
        message: "Partida não encontrada."
      })
    }

    return res.status(200).json({
      status: "success",
      data: { match }
    })
  }
}