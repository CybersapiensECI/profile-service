import { HttpStatus } from '@nestjs/common';
import { ProfileServiceException } from './profile-service.exception';

export class UserNotFoundException extends ProfileServiceException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'UserNotFoundException';
  }
}
