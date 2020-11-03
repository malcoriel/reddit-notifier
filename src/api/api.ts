import express from "express";
import { config } from "../typedConfig/typedConfig";
import logger from "../logging/logging";
import * as locator from "../locator/locator";
import { usersRouter } from "./usersRouter";
import { subscriptionsRouter } from "./subscriptionsRouter";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import bodyParser from "body-parser";
const swaggerDocument = yaml.load("./src/swagger/swagger.yaml");

const app = express();
const apiConfig = config.getTyped("root").api;
app.use(bodyParser.json());

const scheduler = locator.getScheduler({ singleton: true });
scheduler.init();

app.use("/user", usersRouter);
app.use("/subscription", subscriptionsRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(apiConfig.port, () => {
  logger.info(`API handlers are listening on port ${apiConfig.port}`);
});
