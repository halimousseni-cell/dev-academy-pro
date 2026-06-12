import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { getModuleHandler, listModulesHandler } from "./courses.controller";

export const coursesRouter = Router();

coursesRouter.use(authenticate);
coursesRouter.get("/", asyncHandler(listModulesHandler));
coursesRouter.get("/:slug", asyncHandler(getModuleHandler));
