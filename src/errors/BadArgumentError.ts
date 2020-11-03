export class BadArgumentError extends Error {
  public stack?: string;
  constructor(public message: string) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BadArgumentError);
    }
  }

  httpCode = 400;
  code = "BAD_ARGUMENT";
}
