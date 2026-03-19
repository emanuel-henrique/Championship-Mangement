import { z } from 'zod'

export const createGoalSchema = z.object({
  player_id: z.coerce.number({
    required_error: "ID do jogador é obrigatório",
    invalid_type_error: "ID do jogador deve ser um número"
  }).int().positive(),

  team_id: z.coerce.number({
    required_error: "ID do time é obrigatório",
    invalid_type_error: "ID do time deve ser um número"
  }).int().positive(),

  minute: z.coerce.number()
    .int("Minuto deve ser inteiro")
    .min(1, "Minuto mínimo é 1")
    .max(120, "Minuto máximo é 120")
    .optional()
    .nullable(),

  isOwnGoal: z.boolean({
    invalid_type_error: "isOwnGoal deve ser true ou false"
  }).default(false),

  assist_player_id: z.coerce.number()
    .int()
    .positive()
    .optional()
    .nullable()
})