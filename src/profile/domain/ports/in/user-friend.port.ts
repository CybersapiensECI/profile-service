import { User } from '../../model/user.entity';

export interface UserFriendPort {
  getUserFriends(userId: string): Promise<string[]>;
  addFriendToStudent(userId: string, friendId: string): Promise<User>;
  removeFriendFromStudent(userId: string, friendId: string): Promise<User>;
}
