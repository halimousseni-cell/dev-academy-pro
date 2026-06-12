import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Dev Academy Pro API démarrée sur http://localhost:${env.PORT}`);
});
