import { HttpStatus } from '@nestjs/common';
import { ProfileServiceException } from './profile-service.exception';

export class ExternalServiceException extends ProfileServiceException {
  constructor(message: string) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
    this.name = 'ExternalServiceException';
  }
}
