import { prisma } from "../lib/prisma.js"
import { compare, hash } from "bcryptjs"

export default class UsersController {
  async Create(req, res) {
    const { name, email, password } = req.body

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required fields."
      })
    }

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
  }

  async Update(req, res) {
    const { name, email, old_password, new_password } = req.body
    const { id } = req.params

    const userToUpdate = await prisma.user.findUnique({
      where: {
        id: +id,
      }
    })

    if (!userToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      })
    }

    if (!old_password?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "To confirm the update, you must provide your current password."
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

    if (new_password?.trim()) {
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
        name: name ? name : userToUpdate.name,
        email: email ? email : userToUpdate.email,
        password: newHashedPassword
      }
    })

    const { password: _, ...userWithoutPassword } = updatedUser
    return res.status(200).json(userWithoutPassword)
  }
}