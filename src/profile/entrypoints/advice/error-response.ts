export class ErrorResponse {
  message: string;
  status: number;
  timestamp: string;

  constructor(message: string, status: number) {
    this.message = message;
    this.status = status;
    this.timestamp = new Date().toISOString().substring(0, 19);
  }
}
