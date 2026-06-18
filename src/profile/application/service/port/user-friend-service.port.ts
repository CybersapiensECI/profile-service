import type { UserResponseDto } from '../../dto/response/user.response.dto';

export interface UserFriendServicePort {
  getUserFriends(userId: string): Promise<string[]>;
  addFriend(userId: string, friendId: string): Promise<UserResponseDto>;
  removeFriend(userId: string, friendId: string): Promise<UserResponseDto>;
}
