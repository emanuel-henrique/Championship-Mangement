import { Router } from "express";
const playersRoutes = Router()
import PlayersController from "../Controllers/PlayersController.js";

const playersController = new PlayersController()

playersRoutes.post("/:user_id", playersController.Create)
playersRoutes.put("/:user_id/:player_id", playersController.Update)
playersRoutes.delete("/:user_id/:player_id", playersController.Delete)
playersRoutes.get("/:user_id", playersController.Index)

export default playersRoutes