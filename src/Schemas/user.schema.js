import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Please fill in all required fields."),

  email: z.string()
    .trim()
    .min(1, "Please fill in all required fields.")
    .email("Invalid email"),

  password: z.string()
    .trim()
    .min(1, "Please fill in all required fields."),
});

export const updateUserSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Please fill in all required fields.")
    .optional(),

  email: z.string()
    .trim()
    .min(1, "Please fill in all required fields.")
    .email("Invalid email")
    .optional(),

  old_password: z.string()
    .trim()
    .min(1, "To confirm the update, you must provide your current password."),

  new_password: z.string()
    .trim()
    .min(1, "Please fill in all required fields.")
    .optional(),
})