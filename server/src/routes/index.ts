import { Router } from "express";
import authRoutes from "./authRoutes.js";
import debtRoutes from "./debtRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/debts", debtRoutes);
router.use("/debts", paymentRoutes);
router.use("/users", userRoutes);

export default router;