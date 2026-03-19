import { prisma } from "../lib/prisma.js"

export default class CardsController {
  async Create(req, res) {
    const { player_id, type, minute } = req.body
    const { champ_id, user_id, match_id } = req.params

    const user = await prisma.user.findUnique({
      where: { id: +user_id }
    })

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuário não encontrado."
      })
    }

    const champToAddMatchCard = await prisma.championship.findFirst({
      where: {
        id: +champ_id,
        userId: user.id
      }
    })

    if (!champToAddMatchCard) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    const matchToAddCard = await prisma.match.findUnique({
      where: { id: +match_id }
    })

    if (!matchToAddCard) {
      return res.status(404).json({
        status: "error",
        message: "Partida não encontrada."
      })
    }

    if (matchToAddCard.championshipId !== +champ_id) {
      return res.status(400).json({
        status: "error",
        message: "Esta partida não pertence a este campeonato."
      })
    }

    if (matchToAddCard.status === 'CANCELED') {
      return res.status(400).json({
        status: "error",
        message: "Não é possível adicionar cartão em partida cancelada."
      })
    }

    if (!player_id || !type?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Preencha todos os campos obrigatórios."
      })
    }

    if (!["YELLOW", "RED"].includes(type.toUpperCase())) {
      return res.status(400).json({
        status: "error",
        message: "Tipo de cartão inválido."
      })
    }

    const playerToAddCard = await prisma.player.findUnique({
      where: { id: +player_id }
    })

    if (!playerToAddCard) {
      return res.status(404).json({
        status: "error",
        message: "Jogador não encontrado."
      })
    }

    const teamToAddPlayerCard = await prisma.team.findUnique({
      where: { id: playerToAddCard.teamId }
    })

    if (!teamToAddPlayerCard) {
      return res.status(404).json({
        status: "error",
        message: "Time não encontrado."
      })
    }

    if (
      teamToAddPlayerCard.id !== matchToAddCard.homeTeamId &&
      teamToAddPlayerCard.id !== matchToAddCard.awayTeamId
    ) {
      return res.status(400).json({
        status: "error",
        message: "Este time não está jogando nesta partida."
      })
    }

    const championshipPlayer = await prisma.championshipPlayer.findUnique({
      where: {
        championshipId_playerId: {
          championshipId: +champ_id,
          playerId: +player_id
        }
      }
    })

    if (!championshipPlayer) {
      return res.status(400).json({
        status: "error",
        message: "Este jogador não está registrado neste campeonato."
      })
    }

    let cardType = type.toUpperCase()

    const hasARedCard = await prisma.card.findFirst({
      where: {
        matchId: matchToAddCard.id,
        playerId: playerToAddCard.id,
        teamId: teamToAddPlayerCard.id,
        type: "RED"
      }
    })

    if (hasARedCard) {
      return res.status(400).json({
        status: "error",
        message: "Esse jogador já foi expulso."
      })
    }

    if (cardType === "YELLOW") {
      const hasAYellowCard = await prisma.card.findFirst({
        where: {
          matchId: matchToAddCard.id,
          playerId: playerToAddCard.id,
          teamId: teamToAddPlayerCard.id,
          type: "YELLOW"
        }
      })

      if (hasAYellowCard) {
        cardType = "RED"
      }
    }

    const card = await prisma.card.create({
      data: {
        matchId: matchToAddCard.id,
        playerId: playerToAddCard.id,
        teamId: teamToAddPlayerCard.id,
        type: cardType,
        minute
      }
    })

    const updateField = `${cardType.toLowerCase()}Cards`

    await prisma.championshipPlayer.update({
      where: {
        championshipId_playerId: {
          championshipId: +champ_id,
          playerId: playerToAddCard.id
        }
      },
      data: {
        [updateField]: { increment: 1 }
      }
    })

    return res.status(201).json({
      Card: card,
      Player: playerToAddCard
    })
  }

  async Delete(req, res) {
    const { champ_id, user_id, match_id, card_id } = req.params

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

    const match = await prisma.match.findUnique({
      where: { id: +match_id }
    })

    if (!match) {
      return res.status(404).json({
        status: "error",
        message: "Partida não encontrada."
      })
    }

    if (match.championshipId !== +champ_id) {
      return res.status(400).json({
        status: "error",
        message: "Esta partida não pertence a este campeonato."
      })
    }

    if (match.status === 'CANCELED') {
      return res.status(400).json({
        status: "error",
        message: "Não é possível remover cartão em partida cancelada."
      })
    }

    const card = await prisma.card.findUnique({
      where: { id: +card_id }
    })

    if (!card) {
      return res.status(404).json({
        status: "error",
        message: "Cartão não encontrado."
      })
    }

    if (card.matchId !== match.id) {
      return res.status(400).json({
        status: "error",
        message: "Este cartão não pertence a esta partida."
      })
    }

    const player = await prisma.player.findUnique({
      where: { id: card.playerId }
    })

    if (!player) {
      return res.status(404).json({
        status: "error",
        message: "Jogador não encontrado."
      })
    }

    const team = await prisma.team.findUnique({
      where: { id: player.teamId }
    })

    if (!team) {
      return res.status(404).json({
        status: "error",
        message: "Time não encontrado."
      })
    }

    if (team.id !== match.homeTeamId && team.id !== match.awayTeamId) {
      return res.status(400).json({
        status: "error",
        message: "Este time não está jogando nesta partida."
      })
    }

    const championshipPlayer = await prisma.championshipPlayer.findUnique({
      where: {
        championshipId_playerId: {
          championshipId: championship.id,
          playerId: player.id
        }
      }
    })

    if (!championshipPlayer) {
      return res.status(400).json({
        status: "error",
        message: "Jogador não registrado neste campeonato."
      })
    }

    await prisma.card.delete({
      where: { id: card.id }
    })

    const cardType = `${card.type.toLowerCase()}Cards`

    await prisma.championshipPlayer.update({
      where: {
        championshipId_playerId: {
          championshipId: championship.id,
          playerId: player.id
        }
      },
      data: {
        [cardType]: { decrement: 1 }
      }
    })

    return res.status(200).json({
      status: "success",
      message: "Cartão removido com sucesso."
    })
  }
}