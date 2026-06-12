import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Ressource introuvable" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Données invalides", details: err.flatten() });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error("Erreur non gérée", {
    message: err instanceof Error ? err.message : String(err),
    path: req.path,
  });

  // Ne jamais exposer la stack trace ou les détails internes au client.
  res.status(500).json({ error: "Erreur interne du serveur" });
}
