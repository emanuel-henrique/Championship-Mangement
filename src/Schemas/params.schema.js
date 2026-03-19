import { z } from 'zod'

export const goalParamsSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  champ_id: z.coerce.number().int().positive(),
  match_id: z.coerce.number().int().positive(),
  goal_id: z.coerce.number().int().positive().optional()
})