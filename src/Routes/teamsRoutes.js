import { Router } from "express";
const teamsRoutes = Router()
import TeamsController from "../Controllers/TeamsController.js";
import PlayersTeamsController from "../Controllers/PlayersTeamsController.js";

const teamsController = new TeamsController()
const playersTeamsController = new PlayersTeamsController()

teamsRoutes.post("/", teamsController.Create)
teamsRoutes.delete("/:team_id", teamsController.Delete)
teamsRoutes.put("/:team_id", teamsController.Update)
teamsRoutes.get("/", teamsController.Index)

teamsRoutes.post("/:team_id/add/:player_id", playersTeamsController.Create)
//teamsRoutes.delete("/:team_id/remove/:player_id", playersTeamsController.Delete)

export default teamsRoutes