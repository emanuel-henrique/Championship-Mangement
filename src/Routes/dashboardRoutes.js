import { Router } from "express";

import DashboardControllers from "../Controllers/DashboardControllers.js";

const dashboardRoutes = Router()
const dashboardControllers = new DashboardControllers()

dashboardRoutes.get("/:user_id", dashboardControllers.getDashboardData)

export default dashboardRoutes