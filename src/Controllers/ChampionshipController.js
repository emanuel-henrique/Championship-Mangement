import { prisma } from "../lib/prisma.js"

export default class Championship {
  async Create(req, res) {
    const { name, description, maxTeams, modality, startDate, endDate } = req.body
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

    if (!name?.trim() || !maxTeams || !modality?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Preencha todos os campos obrigatórios."
      })
    }

    const nameAlreadyInUse = await prisma.championship.findFirst({
      where: {
        userId: +user_id,
        name,
      }
    })

    if (nameAlreadyInUse) {
      return res.status(400).json({
        status: "error",
        message: "Você já possui um campeonato com este nome."
      })
    }

    let formatedStartDate = new Date()
    let formatedEndDate = new Date()

    if (startDate) {
      formatedStartDate = new Date(startDate)
    }
    if (endDate) {
      formatedStartDate = new Date(endDate)
    }

    const formatedModality = modality.toUpperCase()

    const championship = await prisma.championship.create({
      data: {
        name,
        description: description?.trim() ?? "Novo Campeonato",
        maxTeams,
        modality: formatedModality,
        startDate: formatedStartDate,
        endDate: formatedEndDate,
        userId: +user_id
      }
    })

    return res.status(201).send(championship)
  }

  async Update(req, res) {
    const { name, description, maxTeams, modality, startDate, endDate } = req.body
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

    const champToUpdate = await prisma.championship.findUnique({
      where: {
        id: +champ_id
      }
    })

    if (!champToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Campeonato não encontrado."
      })
    }

    if (!name?.trim() || !description?.trim() || !maxTeams || !modality?.trim() || !startDate?.trim() || !endDate?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Preencha todos os campos."
      })
    }

    const nameAlreadyInUse = await prisma.championship.findFirst({
      where: {
        userId: +user_id,
        name,
      }
    })

    if (nameAlreadyInUse) {
      return res.status(400).json({
        status: "error",
        message: "Você já possui um campeonato com este nome."
      })
    }

    const formatedStartDate = new Date(startDate)
    const formatedEndDate = new Date(endDate)
    const formatedModality = modality.toUpperCase()

    const updatedChampionship = await prisma.championship.update({
      where: {
        id: champToUpdate.id
      },
      data: {
        name,
        description,
        maxTeams,
        modality: formatedModality,
        startDate: formatedStartDate,
        endDate: formatedEndDate
      }
    })

    return res.status(200).json(updatedChampionship)
  }

  async Index(req, res) {
    const { user_id } = req.params
    const { modality, search } = req.query

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

    if (modality) {
      where.modality = modality.toUpperCase()
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    try {
      const championships = await prisma.championship.findMany({
        where,
        include: {
          _count: {
            select: { teams: true }
          }
        }
      })

      return res.status(200).json({
        status: "success",
        data: {
          championships
        }
      })
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Erro ao buscar campeonatos."
      })
    }
  }
}