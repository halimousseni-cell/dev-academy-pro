import type { Request, Response } from "express";
import * as quizzesService from "./quizzes.service";
import type { SubmitQuizInput } from "./quizzes.schema";

export async function submitQuizHandler(req: Request, res: Response) {
  const result = await quizzesService.submitQuiz(req.user!.id, req.params.id, req.body as SubmitQuizInput);
  res.json(result);
}
