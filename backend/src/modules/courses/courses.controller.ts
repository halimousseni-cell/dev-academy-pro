import type { Request, Response } from "express";
import * as coursesService from "./courses.service";

export async function listModulesHandler(req: Request, res: Response) {
  const modules = await coursesService.listModules(req.user!.id);
  res.json({ modules });
}

export async function getModuleHandler(req: Request, res: Response) {
  const module = await coursesService.getModuleBySlug(req.params.slug, req.user!.id);
  res.json({ module });
}
