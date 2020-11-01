export class BadArgumentError implements Error {
  constructor(public message: string) {}

  name = "BAD_ARGUMENT";
}
