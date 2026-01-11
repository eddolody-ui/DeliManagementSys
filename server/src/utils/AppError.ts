export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;

    // restore proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
