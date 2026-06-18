import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { ErrorResponse } from './error-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    let status: number;
    let message: string;

    if (exception instanceof ProfileServiceException) {
      status = exception.status;
      message = exception.message;
      this.logger.warn(`Business error: ${message}`);
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      this.logger.warn(`Not found: ${exception.message}`);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        const msg = (res as { message: string | string[] }).message;
        message = Array.isArray(msg) ? (msg[0] ?? exception.message) : msg;
      } else {
        message = exception.message;
      }
      this.logger.warn(`HTTP error [${status}]: ${message}`);
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor';
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor';
      this.logger.error('Unknown error', String(exception));
    }

    response.status(status).json(new ErrorResponse(message, status));
  }
}
