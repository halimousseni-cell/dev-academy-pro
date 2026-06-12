import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET doit faire au moins 32 caractères"),
  JWT_REFRESH_PEPPER: z.string().min(16, "JWT_REFRESH_PEPPER doit faire au moins 16 caractères"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables d'environnement invalides :", parsed.error.flatten().fieldErrors);
  throw new Error("Configuration d'environnement invalide. Vérifiez votre fichier .env (voir .env.example).");
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const cookieSecure = env.COOKIE_SECURE ?? isProduction;
