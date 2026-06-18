import { Admin } from '../../model/admin';
import { CategoryWithTags } from '../../model/category-with-tags';
import { Student } from '../../model/student';
import { User } from '../../model/user.entity';

export interface UserManagementPort {
  createStudentUser(student: Student): Promise<User>;
  createAdminUser(admin: Admin): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  getUser(userId: string): Promise<User>;
  updateUser(userId: string, user: User): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllStudentProfiles(): Promise<Student[]>;
  getUsersByIds(ids: string[]): Promise<User[]>;
  getTagCatalog(): Promise<CategoryWithTags[]>;
}
