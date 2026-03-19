import { prisma } from "../lib/prisma.js"

export default class DashboardControllers {
  async getDashboardData(req, res) {
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

    const championshipsCount = await prisma.championship.count({
      where: {
        userId: +user_id
      }
    })

    const teamsCount = await prisma.team.count({
      where: {
        userId: +user_id
      }
    })

    const playersCount = await prisma.player.count({
      where: {
        userId: +user_id
      }
    })

    const matchesCount = await prisma.match.count({
      where: {
        championship: {
          userId: +user_id
        }
      }
    })

    return res.status(200).json({
      status: "success",
      data: {
        championships: championshipsCount,
        teams: teamsCount,
        players: playersCount,
        matches: matchesCount
      }
    })
  }
}