export class NonExistentEntityError implements Error {
  constructor(public message: string) {
    this.message = message;
  }

  name = "NON_EXISTENT_ENTITY";
}
