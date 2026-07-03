import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { Student } from '../../domain/model/student';
import { PrivacyLevelEnum } from '../../domain/model/enum';
import type { UserManagementPort } from '../../domain/ports/in/user-management.port';
import type { UserFriendPort } from '../../domain/ports/in/user-friend.port';
import {
  USER_MANAGEMENT_PORT,
  USER_FRIEND_PORT,
} from '../../domain/ports/injection-tokens';
import { UserMapper } from '../mapper/user.mapper';
import type { InternalUserServicePort } from './port/internal-user-service.port';
import { UserMatchProfileResponseDto } from '../dto/response/user-match-profile.response.dto';

@Injectable()
export class InternalUserService implements InternalUserServicePort {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly managementUseCase: UserManagementPort,
    @Inject(USER_FRIEND_PORT)
    private readonly friendUseCase: UserFriendPort,
    private readonly userMapper: UserMapper,
  ) {}

  async getProfileForMatching(
    id: string,
  ): Promise<UserMatchProfileResponseDto> {
    const user = await this.managementUseCase.getUser(id);
    const dto = this.userMapper.toUserMatchProfileResponseFromUser(user);
    if (!dto) {
      throw new ProfileServiceException(
        'Only student profiles are available for matching',
        HttpStatus.BAD_REQUEST,
      );
    }
    return dto;
  }

  async getAllProfilesForMatching(
    requestingUserId?: string,
  ): Promise<UserMatchProfileResponseDto[]> {
    const students = await this.managementUseCase.getAllStudentProfiles();

    const friendIds = new Set<string>();
    if (requestingUserId) {
      const friends = await this.friendUseCase.getUserFriends(requestingUserId);
      friends.forEach((id) => friendIds.add(id));
    }

    return students
      .filter((s) => s.privacyLevel !== PrivacyLevelEnum.PRIVATE)
      .filter((s) => !requestingUserId || s.id !== requestingUserId)
      .filter((s) => !requestingUserId || !friendIds.has(s.id))
      .map((s) => this.userMapper.toUserMatchProfileResponse(s));
  }

  async isGeolocationEnabled(userId: string): Promise<boolean> {
    const user = await this.managementUseCase.getUser(userId);
    if (!(user instanceof Student)) {
      throw new ProfileServiceException(
        'Only STUDENT users have geolocation settings',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user.geolocationEnabled;
  }

  async isActive(userId: string): Promise<boolean> {
    const user = await this.managementUseCase.getUser(userId);
    if (!(user instanceof Student)) {
      throw new ProfileServiceException(
        'Only STUDENT users have active status',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user.isActive;
  }
}
