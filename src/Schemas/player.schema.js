import { z } from "zod";

const position = [
  "GOL",
  "ZAG",
  "LE",
  "LD",
  "VOL",
  "MEI",
  "MC",
  "MA",
  "MD",
  "ME",
  "ATA",
  "PD",
  "PE",
  "SA",
  "CA",
  "FIX",
  "ALA",
  "ALD",
  "ALE",
  "PIV"
]

export const playerSchema = z.object({
  name: z.string({
    required_error: "Please fill in all required fields."
  })
    .trim()
    .min(1, "Please fill in all required fields."),

  birthDate: z.coerce.date().optional(),

  jerseyNumber: z.coerce.number({
    required_error: "Please fill in all required fields."
  })
    .int()
    .positive(),

  position: z.string()
    .trim()
    .transform(val => val.toUpperCase())
    .refine(val => position.includes(val), {
      message: "Invalid position"
    })
    .optional(),
})
//const { search, team, position } = req.query
export const playerSchemaQuery = z.object({
  search: z.string()
    .trim()
    .optional(),

  team: z.string()
    .trim()
    .optional(),

  position: z.string()
    .trim()
    .transform(val => val.toUpperCase())
    .refine(val => position.includes(val), {
      message: "Invalid position"
    })
    .optional(),
})