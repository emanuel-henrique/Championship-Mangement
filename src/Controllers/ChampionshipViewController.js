import { prisma } from "../lib/prisma.js"

export default class ChampionshipViewController {
  async Overview(req, res) {
    const { user_id, champ_id } = req.params

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

    const championship = await prisma.championship.findUnique({
      where: {
        id: +champ_id
      }
    })

    if (!championship) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    const goalsCount = await prisma.goal.count({
      where: {
        match: {
          championshipId: championship.id
        }
      }
    })

    const matchCount = await prisma.match.count({
      where: {
        championshipId: championship.id
      }
    })

    const topScorer = await prisma.championshipPlayer.findFirst({
      where: {
        championshipId: +champ_id,
        goals: { gt: 0 }
      },
      orderBy: {
        goals: 'desc'
      },
      include: {
        player: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const leader = await prisma.championshipTeam.findFirst({
      where: {
        championshipId: +champ_id
      },
      orderBy: {
        points: 'desc'
      },
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
        stats: {
          totalGoals: goalsCount,
          totalMatches: matchCount
        },
        topScorer: topScorer ? {
          name: topScorer.player.name,
          goals: topScorer.goals
        } : null,
        leader: leader ? {
          name: leader.team.name,
          points: leader.points
        } : null
      }
    })
  }

  async Standings(req, res) {
    const { user_id, champ_id } = req.params

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

    const championship = await prisma.championship.findUnique({
      where: {
        id: +champ_id
      }
    })

    if (!championship) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    const standings = await prisma.championshipTeam.findMany({
      where: {
        championshipId: championship.id
      },
      orderBy: [
        { points: 'desc' },
        { wins: 'desc' },
        { goalsFor: 'desc' }
      ],
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
        standings
      }
    })
  }

  async Matches(req, res) {
    const { user_id, champ_id } = req.params
    const { status } = req.query

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

    const championship = await prisma.championship.findUnique({
      where: {
        id: +champ_id
      }
    })

    if (!championship) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    let where = {
      championshipId: championship.id
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    try {
      const matches = await prisma.match.findMany({
        where,
        orderBy: [
          { matchDate: 'asc' }
        ],
        select: {
          id: true,
          matchDate: true,
          homeScore: true,
          awayScore: true,
          status: true,
          awayTeam: {
            select: {
              id: true,
              name: true,
              emblemUrl: true
            }
          },
          homeTeam: {
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
          matches
        }
      })
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Erro ao buscar partidas."
      })
    }
  }

  async Teams(req, res) {
    const { user_id, champ_id } = req.params

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

    const championship = await prisma.championship.findUnique({
      where: {
        id: +champ_id
      }
    })

    if (!championship) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    const teams = await prisma.championshipTeam.findMany({
      where: {
        championshipId: +champ_id
      },
      select: {
        id: true,
        championshipId: true,
        team: {
          select: {
            id: true,
            name: true,
            emblemUrl: true,
            _count: {
              select: { players: true }
            }
          }
        }
      }
    })

    return res.status(200).json({
      status: "success",
      data: {
        teams
      }
    })
  }

  async TopScorers(req, res) {
    const { user_id, champ_id } = req.params

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

    const championship = await prisma.championship.findUnique({
      where: {
        id: +champ_id
      }
    })

    if (!championship) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    const topscorers = await prisma.championshipPlayer.findMany({
      where: {
        championshipId: championship.id
      },
      orderBy: {
        goals: "desc"
      },
      select: {
        goals: true,
        player: {
          select: {
            name: true,
            team: {
              select: {
                id: true,
                name: true,
                emblemUrl: true
              }
            }
          },
        }
      },
    })

    return res.status(200).json({
      status: "success",
      data: {
        topscorers
      }
    })
  }
}