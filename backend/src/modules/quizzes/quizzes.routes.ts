import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { submitQuizHandler } from "./quizzes.controller";
import { submitQuizSchema } from "./quizzes.schema";

export const quizzesRouter = Router();

quizzesRouter.use(authenticate);
quizzesRouter.post("/:id/submit", validateBody(submitQuizSchema), asyncHandler(submitQuizHandler));
