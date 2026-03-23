import { Router } from "express";
const playersRoutes = Router()
import PlayersController from "../Controllers/PlayersController.js";

const playersController = new PlayersController()

playersRoutes.post("/", playersController.Create)
playersRoutes.put("/:player_id", playersController.Update)
playersRoutes.delete("/:player_id", playersController.Delete)
playersRoutes.get("/", playersController.Index)

export default playersRoutes