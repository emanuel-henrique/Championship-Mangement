import z from "zod";

export const playerTeamsParams = z.object({
  team_id: z.coerce.number({
    required_error: "ID do time é obrigatório",
    invalid_type_error: "ID do time deve ser um número"
  }).int().positive(),

  user_id: z.coerce.number({
    required_error: "ID do usuário é obrigatório",
    invalid_type_error: "ID do usuário deve ser um número"
  }).int().positive(),

  player_id: z.coerce.number({
    required_error: "ID do player é obrigatório",
    invalid_type_error: "ID do player deve ser um número"
  }).int().positive(),
})