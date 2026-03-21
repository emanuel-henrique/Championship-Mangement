import { Router } from "express";
import Championship from "../Controllers/ChampionshipController.js"
import TeamsChampionshipController from "../Controllers/TeamsChampionshipController.js";
import MatchesController from "../Controllers/MatchesController.js";
import GoalsController from "../Controllers/GoalsController.js";
import CardsController from "../Controllers/CardsControllers.js";
import FinishMatchController from "../Controllers/FinishMatchController.js";
import ChampionshipViewController from "../Controllers/ChampionshipViewController.js";
import MatchViewController from "../Controllers/MatchViewController.js"
import { prisma } from "../lib/prisma.js";

const championshipRoutes = Router()
const championshipController = new Championship()
const teamChampionshipController = new TeamsChampionshipController()
const matchesController = new MatchesController()
const goalsController = new GoalsController(prisma)
const cardsController = new CardsController()
const finishMatchController = new FinishMatchController()
const championshipViewController = new ChampionshipViewController()
const matchViewController = new MatchViewController()

// CHAMPIONSHIP DEFAULT ROUTES
championshipRoutes.post("/:user_id", championshipController.Create)
championshipRoutes.put("/:user_id/:champ_id", championshipController.Update)
championshipRoutes.get("/:user_id/", championshipController.Index)

// CHAMPIONSHIP GETS
championshipRoutes.get("/:user_id/:champ_id", championshipViewController.Overview)
championshipRoutes.get("/:user_id/:champ_id/standings", championshipViewController.Standings)
championshipRoutes.get("/:user_id/:champ_id/matches", championshipViewController.Matches)
championshipRoutes.get("/:user_id/:champ_id/teams", championshipViewController.Teams)
championshipRoutes.get("/:user_id/:champ_id/topscorers", championshipViewController.TopScorers)

// MATCH GETS
championshipRoutes.get("/:champ_id/:user_id/matches/:match_id", matchViewController.Show)

// CHAMPIONSHIP TEAMS MANAGEMENT ROUTES
championshipRoutes.post("/:champ_id/:user_id/teams", teamChampionshipController.Create)
championshipRoutes.delete("/:champ_id/teams/:team_id", teamChampionshipController.Delete)

// CHAMPIONSHIP MATCHES MANAGEMENT ROUTES
championshipRoutes.post("/:champ_id/:user_id/matches", matchesController.Create)
championshipRoutes.post("/:champ_id/:user_id/matches/:match_id/finish", finishMatchController.Finish)
championshipRoutes.put("/:champ_id/:user_id/matches/:match_id", matchesController.Update)
championshipRoutes.delete("/:champ_id/:user_id/matches/:match_id", matchesController.Delete)

// CHAMPIONSHIP MATCHES GOALS MANAGEMENT ROUTES
championshipRoutes.post("/:champ_id/:user_id/matches/:match_id/details/goals", goalsController.Create.bind(goalsController))
championshipRoutes.delete("/:champ_id/:user_id/matches/:match_id/details/goals/:goal_id", goalsController.Delete.bind(goalsController))

// CHAMPIONSHIP MATCHES CARDS MANAGEMENT ROUTES
championshipRoutes.post("/:champ_id/:user_id/matches/:match_id/details/cards", cardsController.Create)
championshipRoutes.delete("/:champ_id/:user_id/matches/:match_id/details/cards/:card_id", cardsController.Delete)

export default championshipRoutes