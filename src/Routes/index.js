import { Router } from "express";
const Routes = Router()

import usersRoutes from "./usersRoutes.js";
import championshipRoutes from "./championshipRoutes.js"
import teamsRoutes from "./teamsRoutes.js";
import playersRoutes from "./playersRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";


Routes.use("/users", usersRoutes)
Routes.use("/championships", championshipRoutes)
Routes.use("/teams", teamsRoutes)
Routes.use("/players", playersRoutes)
Routes.use("/dashboard", dashboardRoutes)

export default Routes