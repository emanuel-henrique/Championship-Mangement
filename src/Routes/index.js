import { Router } from "express";
const Routes = Router()

import usersRoutes from "./usersRoutes.js";
import championshipRoutes from "./championshipRoutes.js"
import teamsRoutes from "./teamsRoutes.js";
import playersRoutes from "./playersRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import authRoutes from "./authRoutes.js";
import { authMiddleware } from "../Middlewares/authMiddleware.js";

Routes.use("/auth", authRoutes);

Routes.use("/users", usersRoutes)

Routes.use("/championships", authMiddleware, championshipRoutes)
Routes.use("/teams", authMiddleware, teamsRoutes)
Routes.use("/players", authMiddleware, playersRoutes)
Routes.use("/dashboard", authMiddleware, dashboardRoutes)

export default Routes