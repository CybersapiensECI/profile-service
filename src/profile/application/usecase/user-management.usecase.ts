import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { Admin } from '../../domain/model/admin';
import { CategoryWithTags } from '../../domain/model/category-with-tags';
import { Organizer } from '../../domain/model/organizer';
import { Student } from '../../domain/model/student';
import { User } from '../../domain/model/user.entity';
import type { UserManagementPort } from '../../domain/ports/in/user-management.port';
import {
  TAG_CATALOG_PORT,
  USER_REPOSITORY_PORT,
} from '../../domain/ports/injection-tokens';
import type { TagCatalogPort } from '../../domain/ports/out/tag-catalog.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';

@Injectable()
export class UserManagementUseCase implements UserManagementPort {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TAG_CATALOG_PORT)
    private readonly tagCatalogPort: TagCatalogPort,
  ) {}

  async createStudentUser(student: Student): Promise<User> {
    return this.userRepository.save(student);
  }

  async createAdminUser(admin: Admin): Promise<User> {
    return this.userRepository.save(admin);
  }

  async createOrganizerUser(organizer: Organizer): Promise<User> {
    return this.userRepository.save(organizer);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.findOrThrow(userId);

    if (user instanceof Student && user.friendsId.length > 0) {
      for (const friendId of [...user.friendsId]) {
        const friend = await this.userRepository.findById(friendId);
        if (friend instanceof Student && friend.friendsId.includes(userId)) {
          friend.friendsId = friend.friendsId.filter((f) => f !== userId);
          await this.userRepository.update(friendId, friend);
        }
      }
    }

    await this.userRepository.delete(userId);
  }

  async getUser(userId: string): Promise<User> {
    return this.findOrThrow(userId);
  }

  async updateUser(userId: string, user: User): Promise<User> {
    if (user instanceof Student) return this.updateStudentUser(userId, user);
    if (user instanceof Admin) return this.updateAdminUser(userId, user);
    if (user instanceof Organizer)
      return this.updateOrganizerUser(userId, user);
    throw new ProfileServiceException(
      'Unsupported user type for update',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getAllStudentProfiles(): Promise<Student[]> {
    return this.userRepository.findAllStudents();
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    return this.userRepository.findAllByIds(ids);
  }

  async getTagCatalog(): Promise<CategoryWithTags[]> {
    return this.tagCatalogPort.getAllCategoriesWithTags();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  async findOrThrow(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new ProfileServiceException(
        `User not found: ${userId}`,
        HttpStatus.NOT_FOUND,
      );
    return user;
  }

  private async updateStudentUser(
    userId: string,
    request: Student,
  ): Promise<User> {
    const student = await this.findOrThrow(userId);
    if (!(student instanceof Student))
      throw new ProfileServiceException(
        'User is not a student',
        HttpStatus.BAD_REQUEST,
      );

    if (request.name != null) student.name = request.name;
    if (request.gender != null) student.gender = request.gender;
    if (request.biography != null) student.biography = request.biography;
    if (request.studentCarnet != null)
      student.studentCarnet = request.studentCarnet;
    if (request.privacyLevel != null)
      student.privacyLevel = request.privacyLevel;
    if (request.career != null) student.career = request.career;
    if (request.semester != null) student.semester = request.semester;
    if (request.dateOfBirth != null) student.dateOfBirth = request.dateOfBirth;
    if (request.tagsId != null) student.tagsId = request.tagsId;

    return this.userRepository.update(userId, student);
  }

  private async updateAdminUser(userId: string, request: Admin): Promise<User> {
    const admin = await this.findOrThrow(userId);
    if (!(admin instanceof Admin))
      throw new ProfileServiceException(
        'User is not an admin',
        HttpStatus.BAD_REQUEST,
      );

    if (request.name != null) admin.name = request.name;
    if (request.gender != null) admin.gender = request.gender;

    return this.userRepository.update(userId, admin);
  }

  private async updateOrganizerUser(
    userId: string,
    request: Organizer,
  ): Promise<User> {
    const organizer = await this.findOrThrow(userId);
    if (!(organizer instanceof Organizer))
      throw new ProfileServiceException(
        'User is not an organizer',
        HttpStatus.BAD_REQUEST,
      );

    if (request.name != null) organizer.name = request.name;
    if (request.gender != null) organizer.gender = request.gender;
    if (request.contactInfo != null)
      organizer.contactInfo = request.contactInfo;

    return this.userRepository.update(userId, organizer);
  }
}
