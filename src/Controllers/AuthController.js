import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export default class AuthController {
  async Login(req, res) {
    try {
      const loginSchema = z.object({
        email: z.string().email("Formato de e-mail inválido."),
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.")
      });

      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ status: "error", message: "E-mail ou senha incorretos." });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ status: "error", message: "E-mail ou senha incorretos." });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        status: "success",
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ status: "error", errors: error.issues });
      }
      console.error("Erro no login:", error);
      return res.status(500).json({ status: "error", message: "Erro interno do servidor." });
    }
  }
}