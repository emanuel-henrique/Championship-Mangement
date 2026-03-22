import { z } from "zod";
const status = ["SCHEDULED", "IN_PROGRESS", "FINISHED", "CANCELED"]

export const createMatchSchema = z.object({
  homeTeamId: z.coerce.number({
    required_error: "ID do HomeTeam é obrigatório",
    invalid_type_error: "ID do HomeTeam deve ser um número"
  }).int().positive(),

  awayTeamId: z.coerce.number({
    required_error: "ID do AwayTeam é obrigatório",
    invalid_type_error: "ID do AwayTeam deve ser um número"
  }).int().positive(),

  status: z.string()
    .trim()
    .transform(val => val.toUpperCase())
    .refine(val => status.includes(val), {
      message: "Invalid match status"
    })
    .optional(),

  matchDate: z.coerce.date({
    required_error: "Please fill in all required fields."
  }).optional(),

  finishedAt: z.coerce.date({
    required_error: "Please fill in all required fields."
  }).optional()
})

export const updateMatchSchema = z.object({
  homeTeamId: z.coerce.number({
    required_error: "ID do HomeTeam é obrigatório",
    invalid_type_error: "ID do HomeTeam deve ser um número"
  }).int().positive().optional(),

  awayTeamId: z.coerce.number({
    required_error: "ID do AwayTeam é obrigatório",
    invalid_type_error: "ID do AwayTeam deve ser um número"
  }).int().positive().optional(),

  status: z.string()
    .trim()
    .transform(val => val.toUpperCase())
    .refine(val => status.includes(val), {
      message: "Invalid modality"
    })
    .optional(),

  matchDate: z.coerce.date({
    required_error: "Please fill in all required fields."
  }).optional(),

  finishedAt: z.coerce.date({
    required_error: "Please fill in all required fields."
  }).optional()
})