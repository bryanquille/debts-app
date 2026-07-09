import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as paymentController from "../controllers/paymentController.js";

const router = Router();

// Todas las rutas de pagos requieren autenticación
router.use(authenticate);

// GET /api/debts/:id/payments — Listar pagos de una deuda
router.get("/:id/payments", paymentController.getPayments);

// POST /api/debts/:id/payments — Registrar un pago
router.post("/:id/payments", paymentController.createPayment);

export default router;