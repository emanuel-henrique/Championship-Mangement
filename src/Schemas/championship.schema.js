import { z } from 'zod'

const modalities = ["FUTEBOL", "FUTSAL"]

const baseChampionshipSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Please fill in all required fields."),

  description: z.string()
    .trim()
    .transform(val => val === "" ? "Novo Campeonato" : val)
    .optional(),

  maxTeams: z.coerce
    .number({
      required_error: "Please fill in all required fields.",
    })
    .int()
    .positive()
    .max(32),

  modality: z.string({
    required_error: "Please fill in all required fields."
  })
    .trim()
    .transform(val => val.toUpperCase())
    .refine(val => modalities.includes(val), {
      message: "Invalid modality"
    }),

  startDate: z.coerce.date({
    required_error: "Please fill in all required fields."
  }).optional(),

  endDate: z.coerce.date({
    required_error: "Please fill in all required fields."
  }).optional()
})

export const createChampionshipSchema = baseChampionshipSchema
  .refine(data => {
    if (!data.startDate || !data.endDate) return true
    return data.endDate > data.startDate
  }, {
    message: "End date must be after start date",
    path: ["endDate"]
  })

export const updateChampionshipSchema = baseChampionshipSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  })

export const championshipQuerySchema = z.object({
  modality: z.string()
    .trim()
    .transform(val => val.toUpperCase())
    .refine(val => modalities.includes(val), {
      message: "Invalid modality"
    })
    .optional(),

  search: z.string()
    .trim()
    .optional()
})