export class ApplicationError extends Error {
  constructor(public readonly code: string, public readonly httpStatus: number, message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}
