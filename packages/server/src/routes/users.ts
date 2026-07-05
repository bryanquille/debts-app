import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router: Router = Router();

router.get("/search", authMiddleware, async (req: Request, res: Response) => {
  const q = (req.query.q as string) || "";

  if (q.length < 2) {
    res.json([]);
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: req.user!.id } },
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 10,
  });

  res.json(users);
});

export default router;
