import { HttpStatus } from '@nestjs/common';
import { ProfileServiceException } from './profile-service.exception';

export class UserAlreadyExistsException extends ProfileServiceException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
    this.name = 'UserAlreadyExistsException';
  }
}
