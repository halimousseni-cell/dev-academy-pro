import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "@prisma/client";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/** Génère un refresh token opaque (aléatoire), retourne la valeur en clair + son hash à stocker. */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(48).toString("hex");
  return { token, hash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return crypto.createHmac("sha256", env.JWT_REFRESH_PEPPER).update(token).digest("hex");
}

export function getRefreshTokenExpiry(): Date {
  const days = env.REFRESH_TOKEN_TTL_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
