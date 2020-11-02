import { NextFunction, Request, Response } from "express";
import logger, { formatError } from "../logging/logging";

export const handle = (fn: (req: Request) => any) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fn(req);
    res.json(result);
  } catch (e) {
    const httpCode = e.httpCode || 500;
    const code = e.code || "INTERNAL_SERVER_ERROR";
    logger.error(formatError(e, `failed to handle request:`, req.originalUrl));
    res.writeHead(httpCode, { "Content-Type": "text/plain" });
    res.write(`${httpCode} ${code}`, "utf8");
  } finally {
    res.end();
  }
};
