export default class AppError extends Error {
  public statusCode: number;
  public status: string;
  public success: boolean = false;

  constructor(message: string, statusCode: number, success: boolean = false) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.success = success;

    // Capture stack trace (excluding constructor)
    Error.captureStackTrace(this, this.constructor);
  }
}
