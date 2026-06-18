import { HttpStatus } from '@nestjs/common';
import { ProfileServiceException } from './profile-service.exception';

export class InvalidInputException extends ProfileServiceException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
    this.name = 'InvalidInputException';
  }
}
