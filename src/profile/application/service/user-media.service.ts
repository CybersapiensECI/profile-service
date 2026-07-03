import { Inject, Injectable } from '@nestjs/common';
import { UserMapper } from '../mapper/user.mapper';
import type { UserMediaPort } from '../../domain/ports/in/user-media.port';
import { USER_MEDIA_PORT } from '../../domain/ports/injection-tokens';
import type { UserMediaServicePort } from './port/user-media-service.port';
import { UserProfilePhotoResponseDto } from '../dto/response/user-profile-photo.response.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserMediaService implements UserMediaServicePort {
  constructor(
    @Inject(USER_MEDIA_PORT)
    private readonly mediaUseCase: UserMediaPort,
    private readonly userMapper: UserMapper,
  ) {}

  async updateProfileImage(
    userId: string,
    file: Buffer,
    contentType: string,
  ): Promise<UserProfilePhotoResponseDto> {
    const updated = await this.mediaUseCase.updateProfileImage(
      userId,
      file,
      contentType,
    );
    return this.userMapper.toProfilePhotoResponse(
      updated,
    ) as UserProfilePhotoResponseDto;
  }

  async updateGeolocation(
    userId: string,
    geolocationEnabled: boolean,
  ): Promise<UserResponseDto> {
    const updated = await this.mediaUseCase.updateGeolocation(
      userId,
      geolocationEnabled,
    );
    return this.userMapper.toResponse(updated);
  }
}
