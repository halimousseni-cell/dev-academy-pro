import type { Request, Response } from "express";
import { prisma } from "../../db/client";
import { AppError } from "../../middleware/errorHandler";
import { hashRefreshToken } from "../../utils/tokens";

const REFRESH_COOKIE = "refreshToken";

export async function getMeHandler(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      mfaEnabled: true,
      weeklyGoalMinutes: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "Utilisateur introuvable");
  }

  res.json({ user });
}

export async function getSecurityOverviewHandler(req: Request, res: Response) {
  const userId = req.user!.id;

  const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  const currentTokenHash = rawToken ? hashRefreshToken(rawToken) : null;

  const [user, sessions, recentActivity] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { mfaEnabled: true } }),
    prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, tokenHash: true, userAgent: true, ipAddress: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, action: true, ipAddress: true, userAgent: true, createdAt: true },
    }),
  ]);

  if (!user) {
    throw new AppError(404, "Utilisateur introuvable");
  }

  res.json({
    mfaEnabled: user.mfaEnabled,
    sessions: sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      current: currentTokenHash !== null && session.tokenHash === currentTokenHash,
    })),
    recentActivity,
  });
}

export async function revokeSessionHandler(req: Request, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = await prisma.refreshToken.findUnique({ where: { id } });
  if (!session || session.userId !== userId || session.revokedAt) {
    throw new AppError(404, "Session introuvable");
  }

  await prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "SESSION_REVOKED",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  res.status(204).send();
}
