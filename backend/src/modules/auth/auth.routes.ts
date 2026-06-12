import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimiters";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  loginHandler,
  logoutAllHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
} from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validateBody(registerSchema), asyncHandler(registerHandler));
authRouter.post("/login", authLimiter, validateBody(loginSchema), asyncHandler(loginHandler));
authRouter.post("/refresh", asyncHandler(refreshHandler));
authRouter.post("/logout", asyncHandler(logoutHandler));
authRouter.post("/logout-all", authenticate, asyncHandler(logoutAllHandler));
