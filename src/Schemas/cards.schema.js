import { z } from "zod";

const types = ["RED", "YELLOW"]

export const createCardSchema = z.object({
  player_id: z.coerce.number({
    required_error: "ID do jogador é obrigatório",
    invalid_type_error: "ID do jogador deve ser um número"
  }).int().positive(),

  type: z.string({
    required_error: "Please fill in all required fields."
  })
    .trim()
    .transform(val => val.toUpperCase())
    .refine(val => types.includes(val), {
      message: "Invalid modality"
    }),

  minute: z.coerce
    .number({
      required_error: "Please fill in all required fields.",
    })
    .int()
    .positive()
    .max(120),
})