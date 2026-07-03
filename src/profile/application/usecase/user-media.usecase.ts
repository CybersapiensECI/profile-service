import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InvalidImageInputException } from '../../domain/exceptions/invalid-image-input.exception';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { Student } from '../../domain/model/student';
import { User } from '../../domain/model/user.entity';
import type { UserMediaPort } from '../../domain/ports/in/user-media.port';
import {
  IMAGE_STORAGE_PORT,
  USER_REPOSITORY_PORT,
} from '../../domain/ports/injection-tokens';
import type { ImageStoragePort } from '../../domain/ports/out/image-storage.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg']);

@Injectable()
export class UserMediaUseCase implements UserMediaPort {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    @Inject(IMAGE_STORAGE_PORT)
    private readonly imageStoragePort: ImageStoragePort,
  ) {}

  async updateProfileImage(
    userId: string,
    file: Buffer,
    contentType: string,
  ): Promise<User> {
    if (!file || file.length === 0)
      throw new InvalidImageInputException('The file is empty');
    if (file.length > MAX_IMAGE_SIZE)
      throw new InvalidImageInputException('Image exceeds 5MB limit');
    if (!ALLOWED_TYPES.has(contentType))
      throw new InvalidImageInputException(
        'Invalid format. Only PNG and JPEG are allowed',
      );

    const student = await this.findStudentOrThrow(userId);
    student.photoUrl = await this.imageStoragePort.uploadProfileImage(
      file,
      userId,
      contentType,
    );
    return this.userRepository.update(userId, student);
  }

  async updateGeolocation(
    userId: string,
    geolocationEnabled: boolean,
  ): Promise<User> {
    const student = await this.findStudentOrThrow(userId);
    student.geolocationEnabled = geolocationEnabled;
    return this.userRepository.update(userId, student);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async findStudentOrThrow(userId: string): Promise<Student> {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new ProfileServiceException(
        `User not found: ${userId}`,
        HttpStatus.NOT_FOUND,
      );
    if (!(user instanceof Student))
      throw new ProfileServiceException(
        'Only STUDENT users can perform this action',
        HttpStatus.BAD_REQUEST,
      );
    return user;
  }
}
