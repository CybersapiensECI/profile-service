import { HttpStatus } from '@nestjs/common';

export class ProfileServiceException extends Error {
  constructor(
    message: string,
    public readonly status: HttpStatus,
  ) {
    super(message);
    this.name = 'ProfileServiceException';
  }
}
