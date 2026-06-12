import type { Role } from "@prisma/client";
import { prisma } from "../../db/client";
import { AppError } from "../../middleware/errorHandler";
import {
  hashPassword,
  isPasswordStrong,
  verifyPassword,
} from "../../utils/password";
import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  signAccessToken,
} from "../../utils/tokens";
import type { LoginInput, RegisterInput } from "./auth.schema";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

async function audit(userId: string | null, action: string, meta: RequestMeta, metadata?: Record<string, unknown>) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
  });
}

interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface AuthResult {
  user: UserSummary;
  accessToken: string;
  refreshToken: string;
}

export async function register(input: RegisterInput, meta: RequestMeta): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();

  if (!isPasswordStrong(input.password)) {
    throw new AppError(
      400,
      "Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Réponse générique : ne pas révéler qu'un compte existe déjà.
    throw new AppError(409, "Impossible de créer le compte avec ces informations.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
    },
  });

  await audit(user.id, "REGISTER", meta);

  return issueTokens(user, meta);
}

export async function login(input: LoginInput, meta: RequestMeta): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  const genericError = () => new AppError(401, "Identifiants invalides");

  if (!user) {
    await audit(null, "LOGIN_FAILED", meta, { email, reason: "unknown_email" });
    throw genericError();
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await audit(user.id, "LOGIN_FAILED", meta, { reason: "account_locked" });
    throw new AppError(423, "Compte temporairement verrouillé suite à plusieurs échecs. Réessayez plus tard.");
  }

  const validPassword = await verifyPassword(user.passwordHash, input.password);
  if (!validPassword) {
    const failedLoginCount = user.failedLoginCount + 1;
    const lockedUntil = failedLoginCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount, lockedUntil },
    });

    await audit(user.id, "LOGIN_FAILED", meta, { reason: "bad_password", failedLoginCount });
    throw genericError();
  }

  if (user.failedLoginCount > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  await audit(user.id, "LOGIN_SUCCESS", meta);

  return issueTokens(user, meta);
}

async function issueTokens(user: UserSummary, meta: RequestMeta): Promise<AuthResult> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const { token, hash } = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      expiresAt: getRefreshTokenExpiry(),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    },
  });

  return {
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    accessToken,
    refreshToken: token,
  };
}

/**
 * Rotation de refresh token. Si le token fourni a déjà été révoqué (rejeu),
 * cela signale une compromission probable : toutes les sessions de
 * l'utilisateur sont révoquées par précaution.
 */
export async function refreshTokens(rawToken: string, meta: RequestMeta): Promise<AuthResult> {
  const tokenHash = hashRefreshToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });

  if (!stored) {
    throw new AppError(401, "Session invalide");
  }

  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await audit(stored.userId, "REFRESH_TOKEN_REUSE_DETECTED", meta);
    throw new AppError(401, "Session invalide. Toutes les sessions ont été révoquées par sécurité.");
  }

  if (stored.expiresAt < new Date()) {
    throw new AppError(401, "Session expirée");
  }

  const { token: newToken, hash: newHash } = generateRefreshToken();

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedByTokenHash: newHash },
    }),
    prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        tokenHash: newHash,
        expiresAt: getRefreshTokenExpiry(),
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    }),
  ]);

  const accessToken = signAccessToken({ sub: stored.user.id, role: stored.user.role });

  return {
    user: {
      id: stored.user.id,
      email: stored.user.email,
      firstName: stored.user.firstName,
      lastName: stored.user.lastName,
      role: stored.user.role,
    },
    accessToken,
    refreshToken: newToken,
  };
}

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
