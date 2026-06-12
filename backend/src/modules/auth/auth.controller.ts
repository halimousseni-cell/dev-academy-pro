import type { Request, Response } from "express";
import { cookieSecure, env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import * as authService from "./auth.service";
import type { LoginInput, MfaCodeInput, MfaDisableInput, MfaLoginInput, RegisterInput } from "./auth.schema";

const REFRESH_COOKIE = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: "strict" as const,
  path: "/api/auth",
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

function meta(req: Request) {
  return { ipAddress: req.ip, userAgent: req.headers["user-agent"] };
}

function sendAuthResult(res: Response, result: Awaited<ReturnType<typeof authService.refreshTokens>>) {
  res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
  res.json({ user: result.user, accessToken: result.accessToken });
}

export async function registerHandler(req: Request, res: Response) {
  const result = await authService.register(req.body as RegisterInput, meta(req));
  sendAuthResult(res, result);
}

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body as LoginInput, meta(req));
  if ("mfaRequired" in result) {
    res.json({ mfaRequired: true, mfaToken: result.mfaToken });
    return;
  }
  sendAuthResult(res, result);
}

export async function mfaLoginHandler(req: Request, res: Response) {
  const { mfaToken, code } = req.body as MfaLoginInput;
  const result = await authService.completeMfaLogin(mfaToken, code, meta(req));
  sendAuthResult(res, result);
}

export async function mfaSetupHandler(req: Request, res: Response) {
  const result = await authService.setupMfa(req.user!.id);
  res.json(result);
}

export async function mfaVerifyHandler(req: Request, res: Response) {
  const { code } = req.body as MfaCodeInput;
  const recoveryCodes = await authService.confirmMfa(req.user!.id, code, meta(req));
  res.json({ recoveryCodes });
}

export async function mfaDisableHandler(req: Request, res: Response) {
  const { password, code } = req.body as MfaDisableInput;
  await authService.disableMfa(req.user!.id, password, code, meta(req));
  res.status(204).send();
}

export async function refreshHandler(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) {
    throw new AppError(401, "Session absente");
  }
  const result = await authService.refreshTokens(token, meta(req));
  sendAuthResult(res, result);
}

export async function logoutHandler(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (token) {
    await authService.logout(token);
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
}

export async function logoutAllHandler(req: Request, res: Response) {
  await authService.logoutAll(req.user!.id);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
}
