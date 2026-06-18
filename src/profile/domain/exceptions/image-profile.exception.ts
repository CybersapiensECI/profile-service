import { HttpStatus } from '@nestjs/common';
import { ProfileServiceException } from './profile-service.exception';

export class ImageProfileException extends ProfileServiceException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    this.name = 'ImageProfileException';
  }
}
