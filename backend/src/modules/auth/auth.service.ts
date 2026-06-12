import type { Role } from "@prisma/client";
import { prisma } from "../../db/client";
import { AppError } from "../../middleware/errorHandler";
import {
  hashPassword,
  isPasswordStrong,
  verifyPassword,
} from "../../utils/password";
import { generateRecoveryCodes, hashRecoveryCode } from "../../utils/recoveryCodes";
import { generateTotpSecret, getTotpUri, verifyTotp } from "../../utils/totp";
import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  signAccessToken,
  signMfaChallengeToken,
  verifyMfaChallengeToken,
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

interface MfaChallengeResult {
  mfaRequired: true;
  mfaToken: string;
}

export type LoginResult = AuthResult | MfaChallengeResult;

/**
 * Compare la connexion en cours au dernier login réussi de l'utilisateur :
 * si l'IP ou le user-agent diffère, il s'agit probablement d'un nouvel
 * appareil.
 */
async function detectNewDevice(userId: string, meta: RequestMeta): Promise<boolean> {
  const lastLogin = await prisma.auditLog.findFirst({
    where: { userId, action: { in: ["LOGIN_SUCCESS", "MFA_LOGIN_SUCCESS"] } },
    orderBy: { createdAt: "desc" },
  });

  if (!lastLogin) return false;

  return lastLogin.ipAddress !== meta.ipAddress || lastLogin.userAgent !== meta.userAgent;
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

export async function login(input: LoginInput, meta: RequestMeta): Promise<LoginResult> {
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

  if (user.mfaEnabled) {
    await audit(user.id, "LOGIN_MFA_REQUIRED", meta);
    return { mfaRequired: true, mfaToken: signMfaChallengeToken({ sub: user.id }) };
  }

  const isNewDevice = await detectNewDevice(user.id, meta);
  await audit(user.id, "LOGIN_SUCCESS", meta);
  if (isNewDevice) {
    await audit(user.id, "NEW_DEVICE_LOGIN", meta);
  }

  return issueTokens(user, meta);
}

/**
 * Termine une connexion après une vérification de mot de passe réussie pour
 * un compte ayant la 2FA activée : vérifie un code TOTP ou un code de
 * récupération à usage unique.
 */
export async function completeMfaLogin(mfaToken: string, code: string, meta: RequestMeta): Promise<AuthResult> {
  let userId: string;
  try {
    userId = verifyMfaChallengeToken(mfaToken).sub;
  } catch {
    throw new AppError(401, "Session de connexion expirée. Veuillez vous reconnecter.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    throw new AppError(401, "Session de connexion expirée. Veuillez vous reconnecter.");
  }

  let usedRecoveryCode = false;

  if (/^\d{6}$/.test(code)) {
    if (!verifyTotp(user.mfaSecret, code)) {
      await audit(user.id, "MFA_LOGIN_FAILED", meta);
      throw new AppError(401, "Code invalide");
    }
  } else {
    const codeHash = hashRecoveryCode(code);
    const recoveryCode = await prisma.mfaRecoveryCode.findUnique({ where: { codeHash } });

    if (!recoveryCode || recoveryCode.userId !== user.id || recoveryCode.usedAt) {
      await audit(user.id, "MFA_LOGIN_FAILED", meta);
      throw new AppError(401, "Code invalide");
    }

    await prisma.mfaRecoveryCode.update({
      where: { id: recoveryCode.id },
      data: { usedAt: new Date() },
    });

    usedRecoveryCode = true;
  }

  const isNewDevice = await detectNewDevice(user.id, meta);
  if (usedRecoveryCode) {
    await audit(user.id, "RECOVERY_CODE_USED", meta);
  }
  await audit(user.id, "MFA_LOGIN_SUCCESS", meta);
  if (isNewDevice) {
    await audit(user.id, "NEW_DEVICE_LOGIN", meta);
  }

  return issueTokens(user, meta);
}

/** Initialise la 2FA pour un utilisateur : génère un secret TOTP non encore activé. */
export async function setupMfa(userId: string): Promise<{ secret: string; otpauthUri: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "Utilisateur introuvable");
  }

  if (user.mfaEnabled) {
    throw new AppError(409, "La 2FA est déjà activée");
  }

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } });

  return { secret, otpauthUri: getTotpUri(secret, user.email) };
}

/** Confirme l'activation de la 2FA via un code TOTP et génère les codes de récupération. */
export async function confirmMfa(userId: string, code: string, meta: RequestMeta): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.mfaSecret) {
    throw new AppError(400, "Configuration MFA non initiée");
  }

  if (user.mfaEnabled) {
    throw new AppError(409, "La 2FA est déjà activée");
  }

  if (!verifyTotp(user.mfaSecret, code)) {
    throw new AppError(401, "Code invalide");
  }

  const recoveryCodes = generateRecoveryCodes();

  await prisma.$transaction([
    prisma.mfaRecoveryCode.deleteMany({ where: { userId } }),
    prisma.mfaRecoveryCode.createMany({
      data: recoveryCodes.map((recoveryCode) => ({ userId, codeHash: hashRecoveryCode(recoveryCode) })),
    }),
    prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } }),
  ]);

  await audit(userId, "MFA_ENABLED", meta);

  return recoveryCodes;
}

/** Désactive la 2FA après revérification du mot de passe et d'un code TOTP/récupération. */
export async function disableMfa(userId: string, password: string, code: string, meta: RequestMeta): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    throw new AppError(409, "La 2FA n'est pas activée");
  }

  const validPassword = await verifyPassword(user.passwordHash, password);
  if (!validPassword) {
    await audit(userId, "MFA_DISABLE_FAILED", meta, { reason: "bad_password" });
    throw new AppError(401, "Mot de passe ou code invalide");
  }

  let codeValid: boolean;
  if (/^\d{6}$/.test(code)) {
    codeValid = verifyTotp(user.mfaSecret, code);
  } else {
    const codeHash = hashRecoveryCode(code);
    const recoveryCode = await prisma.mfaRecoveryCode.findUnique({ where: { codeHash } });
    codeValid = !!recoveryCode && recoveryCode.userId === userId && !recoveryCode.usedAt;
  }

  if (!codeValid) {
    await audit(userId, "MFA_DISABLE_FAILED", meta, { reason: "bad_code" });
    throw new AppError(401, "Mot de passe ou code invalide");
  }

  await prisma.$transaction([
    prisma.mfaRecoveryCode.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { mfaEnabled: false, mfaSecret: null } }),
  ]);

  await audit(userId, "MFA_DISABLED", meta);
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
