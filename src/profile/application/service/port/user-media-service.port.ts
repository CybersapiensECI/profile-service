import type { UserProfilePhotoResponseDto } from '../../dto/response/user-profile-photo.response.dto';
import type { UserResponseDto } from '../../dto/response/user.response.dto';

export interface UserMediaServicePort {
  updateProfileImage(
    userId: string,
    file: Buffer,
    contentType: string,
  ): Promise<UserProfilePhotoResponseDto>;
  updateGeolocation(
    userId: string,
    geolocationEnabled: boolean,
  ): Promise<UserResponseDto>;
}
