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
    logger.error(formatError(e, `failed to handle request:`, req.originalUrl));
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.write("500 Internal Server Error", "utf8");
  } finally {
    res.end();
  }
};
