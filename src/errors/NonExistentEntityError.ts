export class NonExistentEntityError extends Error {
  constructor(public message: string) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NonExistentEntityError);
    }
  }

  httpCode = 404;
  code = "NON_EXISTENT_ENTITY";
}
