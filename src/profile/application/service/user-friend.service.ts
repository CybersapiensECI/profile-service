import { Injectable } from '@nestjs/common';
import { UserMapper } from '../mapper/user.mapper';
import { UserFriendUseCase } from '../usecase/user-friend.usecase';
import type { UserFriendServicePort } from './port/user-friend-service.port';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserFriendService implements UserFriendServicePort {
  constructor(
    private readonly friendUseCase: UserFriendUseCase,
    private readonly userMapper: UserMapper,
  ) {}

  async getUserFriends(userId: string): Promise<string[]> {
    return this.friendUseCase.getUserFriends(userId);
  }

  async addFriend(userId: string, friendId: string): Promise<UserResponseDto> {
    const updated = await this.friendUseCase.addFriendToStudent(
      userId,
      friendId,
    );
    return this.userMapper.toResponse(updated);
  }

  async removeFriend(
    userId: string,
    friendId: string,
  ): Promise<UserResponseDto> {
    const updated = await this.friendUseCase.removeFriendFromStudent(
      userId,
      friendId,
    );
    return this.userMapper.toResponse(updated);
  }
}
