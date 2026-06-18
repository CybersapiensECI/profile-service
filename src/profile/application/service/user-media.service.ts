import { Injectable } from '@nestjs/common';
import { UserMapper } from '../mapper/user.mapper';
import { UserMediaUseCase } from '../usecase/user-media.usecase';
import type { UserMediaServicePort } from './port/user-media-service.port';
import { UserProfilePhotoResponseDto } from '../dto/response/user-profile-photo.response.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserMediaService implements UserMediaServicePort {
  constructor(
    private readonly mediaUseCase: UserMediaUseCase,
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
