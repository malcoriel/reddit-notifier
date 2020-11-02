import express from "express";
import { config } from "../typedConfig/typedConfig";
import logger from "../logging/logging";
import * as locator from "../locator/locator";
import { usersRouter } from "./usersRouter";
import { subscriptionsRouter } from "./subscriptionsRouter";

const app = express();

const apiConfig = config.getTyped("root").api;

locator.getScheduler({ singleton: true });

app.use("/users", usersRouter);
app.use("/subscriptions", subscriptionsRouter);

app.listen(apiConfig.port, () => {
  logger.info(`API handlers are listening on port ${apiConfig.port}`);
});
