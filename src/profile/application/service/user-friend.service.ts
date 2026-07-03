import { Inject, Injectable } from '@nestjs/common';
import { UserMapper } from '../mapper/user.mapper';
import type { UserFriendPort } from '../../domain/ports/in/user-friend.port';
import { USER_FRIEND_PORT } from '../../domain/ports/injection-tokens';
import type { UserFriendServicePort } from './port/user-friend-service.port';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserFriendService implements UserFriendServicePort {
  constructor(
    @Inject(USER_FRIEND_PORT)
    private readonly friendUseCase: UserFriendPort,
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
