import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { getMeHandler, getSecurityOverviewHandler, revokeSessionHandler } from "./users.controller";

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.get("/me", asyncHandler(getMeHandler));
usersRouter.get("/security", asyncHandler(getSecurityOverviewHandler));
usersRouter.delete("/security/sessions/:id", asyncHandler(revokeSessionHandler));
