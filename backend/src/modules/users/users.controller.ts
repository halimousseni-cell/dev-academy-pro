import type { Request, Response } from "express";
import { prisma } from "../../db/client";
import { AppError } from "../../middleware/errorHandler";

export async function getMeHandler(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      weeklyGoalMinutes: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "Utilisateur introuvable");
  }

  res.json({ user });
}
