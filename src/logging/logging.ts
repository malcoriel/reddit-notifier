import winston from "winston";
import { TransformableInfo } from "logform";
import { config } from "../typedConfig/typedConfig";

const { combine, timestamp, simple, printf } = winston.format;
const loggingConfig = config.getTyped("root").logging;

let formatLog = (info: TransformableInfo) => {
  return `[${info.level.toUpperCase()}] ${info.timestamp}: ${JSON.stringify(
    info.message,
    null,
    4
  )}`;
};
const logger = winston.createLogger({
  level: loggingConfig.level,
  format: combine(timestamp(), simple(), printf(formatLog)),
  defaultMeta: { service: "reddit-notifier" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/all.log" }),
  ],
});

if (loggingConfig.enableConsole) {
  logger.add(new winston.transports.Console());
}

export default logger;

export const formatError = (e: Error, extra?: string, url?: string): string => {
  let urlParam = url ? `[${url}] ` : "";
  let extraParam = extra ? `${extra} ` : "";
  console.log(e.message);
  return `${urlParam}${extraParam}${e.message} at ${e.stack}`;
};
