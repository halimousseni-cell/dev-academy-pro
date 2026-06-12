import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(10).max(128),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(1).max(128),
  })
  .strict();

export const mfaCodeSchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, "Le code doit comporter 6 chiffres"),
  })
  .strict();

export const mfaLoginSchema = z
  .object({
    mfaToken: z.string().min(1),
    code: z.string().min(6).max(11),
  })
  .strict();

export const mfaDisableSchema = z
  .object({
    password: z.string().min(1).max(128),
    code: z.string().min(6).max(11),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MfaCodeInput = z.infer<typeof mfaCodeSchema>;
export type MfaLoginInput = z.infer<typeof mfaLoginSchema>;
export type MfaDisableInput = z.infer<typeof mfaDisableSchema>;
