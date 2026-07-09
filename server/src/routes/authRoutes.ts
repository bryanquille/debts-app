import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

// POST /api/auth/register — Crear cuenta nueva
router.post("/register", authController.register);

// POST /api/auth/login — Iniciar sesión
router.post("/login", authController.login);

// POST /api/auth/refresh — Refrescar access token (usando cookie)
router.post("/refresh", authController.refresh);

// POST /api/auth/logout — Cerrar sesión (limpia cookie)
router.post("/logout", authController.logout);

export default router;