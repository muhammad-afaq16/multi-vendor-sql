export default class ApiResponse<T> {
  public statusCode: number;
  public message: string;
  public data: T | null;
  public status: string;

  constructor(statusCode: number, message: string, data: T | null = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.status = 'success';
  }
}
