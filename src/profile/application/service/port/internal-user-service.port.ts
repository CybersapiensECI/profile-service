import type { UserMatchProfileResponseDto } from '../../dto/response/user-match-profile.response.dto';

export interface InternalUserServicePort {
  getProfileForMatching(id: string): Promise<UserMatchProfileResponseDto>;
  getAllProfilesForMatching(
    requestingUserId?: string,
  ): Promise<UserMatchProfileResponseDto[]>;
  isGeolocationEnabled(userId: string): Promise<boolean>;
  isActive(userId: string): Promise<boolean>;
}
