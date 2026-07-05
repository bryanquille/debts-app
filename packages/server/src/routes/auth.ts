import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { authMiddleware } from "../middleware/auth";
import { RegisterSchema, LoginSchema } from "shared";

const router: Router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(409).json({ message: "Este email ya est� registrado" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashedPassword },
    });

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Datos inv�lidos", errors: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      res.status(401).json({ message: "Credenciales inv�lidas" });
      return;
    }

    const valid = await bcrypt.compare(data.password!, user.password);
    if (!valid) {
      res.status(401).json({ message: "Credenciales inv�lidas" });
      return;
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Datos inv�lidos", errors: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Sesi�n cerrada" });
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true },
  });
  res.json({ user });
});

export default router;
