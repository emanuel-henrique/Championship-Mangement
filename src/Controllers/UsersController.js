import { prisma } from "../lib/prisma.js"
import { compare, hash } from "bcryptjs"
import { createUserSchema, updateUserSchema } from "../Schemas/user.schema.js"
import z from "zod"
import { userParamsSchema } from "../Schemas/params.schema.js"

export default class UsersController {
  async Create(req, res) {
    try {
      const body = createUserSchema.parse(req.body)
      const { name, email, password } = body

      const emailAlreadyInUse = await prisma.user.findUnique({
        where: {
          email,
        }
      })

      if (emailAlreadyInUse) {
        return res.status(400).json({
          status: "error",
          message: "Email is already in use."
        })
      }

      const hashedPassword = await hash(password, 8)

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      })

      const { password: _, ...userWithoutPassword } = user

      return res.status(201).json(userWithoutPassword)

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      console.error('Erro ao criar usuário:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }

  async Update(req, res) {
    try {
      const body = updateUserSchema.parse(req.body)
      const { name, email, old_password, new_password } = body

      const params = userParamsSchema.parse(req.params)
      const { id } = params

      const userToUpdate = await prisma.user.findUnique({
        where: { id }
      })

      if (!userToUpdate) {
        return res.status(404).json({
          status: "error",
          message: "User not found."
        })
      }

      if (email && email !== userToUpdate.email) {
        const emailIsInUse = await prisma.user.findUnique({
          where: { email },
        });

        if (emailIsInUse) {
          return res.status(400).json({
            status: "error",
            message: "This email is already in use."
          })
        }
      }

      const passwordMatches = await compare(old_password, userToUpdate.password)
      if (!passwordMatches) {
        return res.status(403).json({
          status: "error",
          message: "Current password is incorrect."
        })
      }

      let newHashedPassword = userToUpdate.password

      if (new_password) {
        const newIsEqualToOldPassword = await compare(new_password, userToUpdate.password)

        if (newIsEqualToOldPassword) {
          return res.status(400).json({
            status: "error",
            message: "The new password must be different from the current one."
          })
        }
        newHashedPassword = await hash(new_password, 8)
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: userToUpdate.id
        },
        data: {
          name: name || userToUpdate.name,
          email: email || userToUpdate.email,
          password: newHashedPassword
        }
      })

      const { password: _, ...userWithoutPassword } = updatedUser
      return res.status(200).json(userWithoutPassword)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Parâmetros inválidos",
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      console.error('Erro ao criar usuário:', error)
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor."
      })
    }
  }
}