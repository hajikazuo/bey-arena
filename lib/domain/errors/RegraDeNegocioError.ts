export class RegraDeNegocioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegraDeNegocioError";
  }
}
