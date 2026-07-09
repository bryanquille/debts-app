import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as debtController from "../controllers/debtController.js";

const router = Router();

// Todas las rutas de deudas requieren autenticación
router.use(authenticate);

// GET /api/debts — Listar mis deudas
router.get("/", debtController.getDebts);

// POST /api/debts — Crear una deuda
router.post("/", debtController.createDebt);

// GET /api/debts/:id — Detalle de una deuda
router.get("/:id", debtController.getDebtById);

// PUT /api/debts/:id — Editar deuda (solo acreedor)
router.put("/:id", debtController.updateDebt);

// POST /api/debts/:id/request-liquidation — Deudor solicita liquidación
router.post("/:id/request-liquidation", debtController.requestLiquidation);

// POST /api/debts/:id/settle — Acreedor liquida la deuda
router.post("/:id/settle", debtController.settleDebt);

// POST /api/debts/:id/cancel — Cancelar deuda (solo acreedor)
router.post("/:id/cancel", debtController.cancelDebt);

export default router;