import { Router } from "express";
import AuthController from "../Controllers/AuthController.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.Login);

export default authRoutes;