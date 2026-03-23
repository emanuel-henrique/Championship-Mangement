import { Router } from "express";
const teamsRoutes = Router()
import TeamsController from "../Controllers/TeamsController.js";
import PlayersTeamsController from "../Controllers/PlayersTeamsController.js";

const teamsController = new TeamsController()
const playersTeamsController = new PlayersTeamsController()

teamsRoutes.post("/:user_id", teamsController.Create)
teamsRoutes.delete("/:user_id/:team_id", teamsController.Delete)
teamsRoutes.put("/:user_id/:team_id", teamsController.Update)
teamsRoutes.get("/:user_id", teamsController.Index)

teamsRoutes.post("/:team_id/:user_id/add/:player_id", playersTeamsController.Create)
//teamsRoutes.delete("/:team_id/:user_id/remove/:player_id", playersTeamsController.Delete)

export default teamsRoutes