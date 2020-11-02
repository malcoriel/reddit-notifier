import express from "express";
import { config } from "../typedConfig/typedConfig";
import logger from "../logging/logging";
import * as locator from "../locator/locator";
import { usersRouter } from "./users/usersRouter";

const app = express();

const apiConfig = config.getTyped("root").api;

locator.getSubscriptionsService({
  singleton: true,
});

app.use("/users", usersRouter);

app.listen(apiConfig.port, () => {
  logger.info(`API handlers are listening on port ${apiConfig.port}`);
});
