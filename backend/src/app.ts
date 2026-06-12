import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { globalLimiter } from "./middleware/rateLimiters";
import { requestLogger } from "./middleware/requestLogger";
import { authRouter } from "./modules/auth/auth.routes";
import { certificatesRouter } from "./modules/certification/certificates.routes";
import { examsRouter } from "./modules/certification/exams.routes";
import { coursesRouter } from "./modules/courses/courses.routes";
import { progressRouter } from "./modules/progress/progress.routes";
import { quizzesRouter } from "./modules/quizzes/quizzes.routes";
import { usersRouter } from "./modules/users/users.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      referrerPolicy: { policy: "no-referrer" },
      crossOriginResourcePolicy: { policy: "same-site" },
      frameguard: { action: "deny" },
    })
  );

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(globalLimiter);

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/modules", coursesRouter);
  app.use("/api/quizzes", quizzesRouter);
  app.use("/api/progress", progressRouter);
  app.use("/api/exams", examsRouter);
  app.use("/api/certificates", certificatesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
