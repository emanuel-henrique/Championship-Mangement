import { Router } from "express";
const usersRoutes = Router()
import UsersController from "../Controllers/UsersController.js";

const usersController = new UsersController()

usersRoutes.post("/", usersController.Create)
usersRoutes.put("/:id", usersController.Update)

export default usersRoutes