import type { Admin } from '../../../domain/model/admin';
import type { Organizer } from '../../../domain/model/organizer';
import type { Student } from '../../../domain/model/student';
import type { User } from '../../../domain/model/user.entity';
import type { BatchProfileResponseDto } from '../../dto/response/batch-profile.response.dto';
import type { CategoryWithTagsResponseDto } from '../../dto/response/category-with-tags.response.dto';
import type { UserResponseDto } from '../../dto/response/user.response.dto';

export interface UserManagementServicePort {
  createStudentUser(user: Student): Promise<UserResponseDto>;
  createAdminUser(user: Admin): Promise<UserResponseDto>;
  createOrganizerUser(user: Organizer): Promise<UserResponseDto>;
  deleteUser(userId: string): Promise<void>;
  getUser(userId: string): Promise<UserResponseDto>;
  updateUser(userId: string, user: User): Promise<UserResponseDto>;
  getAllUsers(): Promise<UserResponseDto[]>;
  getAllStudentProfiles(): Promise<UserResponseDto[]>;
  getUsersByIds(ids: string[]): Promise<BatchProfileResponseDto[]>;
  getTagCatalog(): Promise<CategoryWithTagsResponseDto[]>;
}
