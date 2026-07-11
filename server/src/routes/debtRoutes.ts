import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as debtController from "../controllers/debtController.js";

const router = Router();

router.use(authenticate);

router.get("/", debtController.getDebts);
router.post("/", debtController.createDebt);
router.get("/:id", debtController.getDebtById);
router.put("/:id", debtController.updateDebt);
router.post("/:id/request-liquidation", debtController.requestLiquidation);
router.post("/:id/settle", debtController.settleDebt);
router.post("/:id/cancel", debtController.cancelDebt);
router.post("/:id/request-deletion", debtController.requestDeletion);
router.post("/:id/approve-deletion", debtController.approveDeletion);
router.post("/:id/reject-deletion", debtController.rejectDeletion);
router.get("/:id/deletion-status", debtController.getDeletionStatus);

export default router;
