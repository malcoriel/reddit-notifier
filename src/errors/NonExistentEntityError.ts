export class NonExistentEntityError extends Error {
  constructor(public message: string) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NonExistentEntityError);
    }
  }

  code = "NON_EXISTENT_ENTITY";
}
