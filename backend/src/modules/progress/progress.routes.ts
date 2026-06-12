import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { getDashboardHandler, updateLessonProgressHandler } from "./progress.controller";
import { updateLessonProgressSchema } from "./progress.schema";

export const progressRouter = Router();

progressRouter.use(authenticate);
progressRouter.get("/dashboard", asyncHandler(getDashboardHandler));
progressRouter.post("/lessons", validateBody(updateLessonProgressSchema), asyncHandler(updateLessonProgressHandler));
