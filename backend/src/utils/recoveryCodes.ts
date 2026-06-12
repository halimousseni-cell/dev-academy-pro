import crypto from "crypto";
import { env } from "../config/env";

const RECOVERY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RECOVERY_CODE_COUNT = 8;

function randomRecoveryChunk(length: number): string {
  let chunk = "";
  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(RECOVERY_CODE_ALPHABET.length);
    chunk += RECOVERY_CODE_ALPHABET[index];
  }
  return chunk;
}

/** Génère des codes de récupération MFA au format `XXXX-XXXX`. */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => `${randomRecoveryChunk(4)}-${randomRecoveryChunk(4)}`);
}

export function hashRecoveryCode(code: string): string {
  return crypto
    .createHmac("sha256", env.JWT_REFRESH_PEPPER)
    .update(code.toUpperCase())
    .digest("hex");
}
