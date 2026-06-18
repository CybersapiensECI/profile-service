import type { UserResponseDto } from '../../dto/response/user.response.dto';

export interface UserTagServicePort {
  getUserTags(userId: string): Promise<string[]>;
  getUserTagsNames(userId: string): Promise<string[]>;
  addTag(userId: string, tagId: string): Promise<UserResponseDto>;
  removeTag(userId: string, tagId: string): Promise<UserResponseDto>;
}
