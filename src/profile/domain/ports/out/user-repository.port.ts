import { Admin } from '../../model/admin';
import { Organizer } from '../../model/organizer';
import { Student } from '../../model/student';
import { User } from '../../model/user.entity';

export interface UserRepositoryPort {
  save(user: Student | Admin | Organizer): Promise<User>;
  delete(userId: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  update(id: string, user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findAllStudents(): Promise<Student[]>;
  findAllOrganizers(): Promise<Organizer[]>;
  findAllAdmins(): Promise<Admin[]>;
  findAllByIds(ids: string[]): Promise<User[]>;
}
