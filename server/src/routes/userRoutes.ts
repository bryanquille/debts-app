import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as userController from "../controllers/userController.js";

const router = Router();

// Todas las rutas de usuario requieren autenticación
router.use(authenticate);

// GET /api/users/me — Obtener mi perfil
router.get("/me", userController.getProfile);

// PUT /api/users/me — Actualizar mi perfil
router.put("/me", userController.updateProfile);

// PUT /api/users/me/password — Cambiar mi contraseña
router.put("/me/password", userController.changePassword);

// GET /api/users/search?q= — Buscar usuarios por nombre/email
router.get("/search", userController.searchUsers);

export default router;