import crypto from "crypto";
import { env } from "../config/env";

export interface CertificatePayload {
  serialNumber: string;
  userId: string;
  moduleId: string;
  score: number;
  issuedAt: string;
}

function payloadToString(payload: CertificatePayload): string {
  return [payload.serialNumber, payload.userId, payload.moduleId, payload.score, payload.issuedAt].join("|");
}

/**
 * Signature HMAC-SHA256 à but pédagogique : elle prouve que le certificat a
 * été émis par cette instance (détecte toute falsification des champs), mais
 * ce n'est pas une signature numérique de production (pas de PKI/horodatage
 * tiers de confiance).
 */
export function signCertificate(payload: CertificatePayload): string {
  return crypto.createHmac("sha256", env.JWT_ACCESS_SECRET).update(payloadToString(payload)).digest("hex");
}

export function verifyCertificateSignature(payload: CertificatePayload, signature: string): boolean {
  const expected = signCertificate(payload);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export function generateSerialNumber(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `DAP-${year}-${random}`;
}
