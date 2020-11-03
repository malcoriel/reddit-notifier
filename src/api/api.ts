import express from "express";
import { config } from "../typedConfig/typedConfig";
import logger from "../logging/logging";
import * as locator from "../locator/locator";
import { usersRouter } from "./usersRouter";
import { subscriptionsRouter } from "./subscriptionsRouter";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
const swaggerDocument = yaml.load("./src/swagger/swagger.yaml");

const app = express();
const apiConfig = config.getTyped("root").api;

locator.getScheduler({ singleton: true });

app.use("/users", usersRouter);
app.use("/subscriptions", subscriptionsRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(apiConfig.port, () => {
  logger.info(`API handlers are listening on port ${apiConfig.port}`);
});
