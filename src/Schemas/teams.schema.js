import z from "zod";

export const createTeamSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Please fill in all required fields."),

  emblemUrl: z.url()
    .trim()
    .min(1, "Please fill in all required fields.")
    .optional(),
})

export const updateTeamSchema = createTeamSchema