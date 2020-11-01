export class NonExistentEntityError implements Error {
  constructor(public message: string) {}

  name = "NON_EXISTENT_ENTITY";
}
