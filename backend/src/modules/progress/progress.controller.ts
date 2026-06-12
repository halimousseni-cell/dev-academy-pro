import type { Request, Response } from "express";
import * as progressService from "./progress.service";
import type { UpdateLessonProgressInput } from "./progress.schema";

export async function getDashboardHandler(req: Request, res: Response) {
  const dashboard = await progressService.getDashboard(req.user!.id);
  res.json(dashboard);
}

export async function updateLessonProgressHandler(req: Request, res: Response) {
  const progress = await progressService.upsertLessonProgress(req.user!.id, req.body as UpdateLessonProgressInput);
  res.json({ progress });
}
