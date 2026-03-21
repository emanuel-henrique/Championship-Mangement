import { z } from 'zod'

export const goalParamsSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  champ_id: z.coerce.number().int().positive(),
  match_id: z.coerce.number().int().positive(),
  goal_id: z.coerce.number().int().positive().optional()
})

export const userParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const baseChampionshipParamsSchema = z.object({
  user_id: z.coerce.number({
    required_error: "User id is required"
  })
})

export const championshipParamsSchema = baseChampionshipParamsSchema.extend({
  champ_id: z.coerce.number({
    required_error: "Championship id is required"
  })
})