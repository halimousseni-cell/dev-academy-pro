import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { getExamForModuleHandler, submitExamHandler } from "./exams.controller";
import { submitExamSchema } from "./certification.schema";

export const examsRouter = Router();

examsRouter.use(authenticate);
examsRouter.get("/module/:moduleId", asyncHandler(getExamForModuleHandler));
examsRouter.post("/:id/submit", validateBody(submitExamSchema), asyncHandler(submitExamHandler));
