import type { Request, Response } from "express";
import * as certificationService from "./certification.service";
import type { SubmitExamInput } from "./certification.schema";

export async function getExamForModuleHandler(req: Request, res: Response) {
  const exam = await certificationService.getExamForModule(req.user!.id, req.params.moduleId);
  res.json({ exam });
}

export async function submitExamHandler(req: Request, res: Response) {
  const result = await certificationService.submitExam(req.user!.id, req.params.id, req.body as SubmitExamInput);
  res.json(result);
}
