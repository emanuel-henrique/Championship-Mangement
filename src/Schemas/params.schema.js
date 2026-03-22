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

export const baseCardParamsSchema = z.object({
  champ_id: z.coerce.number({
    required_error: "ID do campeonato é obrigatório",
    invalid_type_error: "ID do campeonato deve ser um número"
  }).int().positive(),

  user_id: z.coerce.number({
    required_error: "ID do usuário é obrigatório",
    invalid_type_error: "ID do usuário deve ser um número"
  }).int().positive(),

  match_id: z.coerce.number({
    required_error: "ID da partida é obrigatório",
    invalid_type_error: "ID da partida deve ser um número"
  }).int().positive(),
})

export const deleteCardParamsSchema = baseCardParamsSchema.extend({
  card_id: z.coerce.number({
    required_error: "ID do cartão é obrigatório",
    invalid_type_error: "ID do cartão deve ser um número"
  }).int().positive()
})

export const championshipViewerParamsSchema = z.object({
  champ_id: z.coerce.number({
    required_error: "ID do campeonato é obrigatório",
    invalid_type_error: "ID do campeonato deve ser um número"
  }).int().positive(),

  user_id: z.coerce.number({
    required_error: "ID do usuário é obrigatório",
    invalid_type_error: "ID do usuário deve ser um número"
  }).int().positive(),
})

export const championshipViewerQuerySchema = z.object({
  status: z.string()
    .trim()
    .optional()
})

export const finishParamsSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  champ_id: z.coerce.number().int().positive(),
  match_id: z.coerce.number().int().positive()
})