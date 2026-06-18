import { User } from '../../model/user.entity';

export interface UserTagPort {
  addTagToStudent(userId: string, tagId: string): Promise<User>;
  removeTagFromStudent(userId: string, tagId: string): Promise<User>;
  getUserTags(userId: string): Promise<string[]>;
  getUserTagsNames(userId: string): Promise<string[]>;
}
