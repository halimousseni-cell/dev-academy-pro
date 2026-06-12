import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { getMeHandler } from "./users.controller";

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.get("/me", asyncHandler(getMeHandler));
