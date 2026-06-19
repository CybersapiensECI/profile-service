import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InvalidInputException } from '../../domain/exceptions/invalid-input.exception';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { Student } from '../../domain/model/student';
import type { UserTagPort } from '../../domain/ports/in/user-tag.port';
import {
  TAG_CATALOG_PORT,
  USER_REPOSITORY_PORT,
} from '../../domain/ports/injection-tokens';
import type { TagCatalogPort } from '../../domain/ports/out/tag-catalog.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { User } from '../../domain/model/user.entity';

@Injectable()
export class UserTagUseCase implements UserTagPort {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TAG_CATALOG_PORT)
    private readonly tagCatalogPort: TagCatalogPort,
  ) {}

  async addTagToStudent(userId: string, tagId: string): Promise<User> {
    if (!(await this.tagCatalogPort.tagExists(tagId)))
      throw new InvalidInputException(`Tag not found in the catalog: ${tagId}`);

    const student = await this.findStudentOrThrow(userId);

    if (student.tagsId.includes(tagId))
      throw new ProfileServiceException(
        'Tag already assigned to this student',
        HttpStatus.CONFLICT,
      );

    student.tagsId.push(tagId);
    return this.userRepository.update(userId, student);
  }

  async removeTagFromStudent(userId: string, tagId: string): Promise<User> {
    const student = await this.findStudentOrThrow(userId);

    const before = student.tagsId.length;
    student.tagsId = student.tagsId.filter((t) => t !== tagId);

    if (student.tagsId.length === before)
      throw new ProfileServiceException(
        'Tag not found for removal',
        HttpStatus.BAD_REQUEST,
      );

    return this.userRepository.update(userId, student);
  }

  async getUserTags(userId: string): Promise<string[]> {
    const student = await this.findStudentOrThrow(userId);
    return student.tagsId ?? [];
  }

  async getUserTagsNames(userId: string): Promise<string[]> {
    const tags = await this.getUserTags(userId);
    const names = await Promise.all(
      tags.map((id) => this.tagCatalogPort.getTagNameById(id)),
    );
    return names.filter((n): n is string => n != null);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async findStudentOrThrow(userId: string): Promise<Student> {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new ProfileServiceException(
        `User not found: ${userId}`,
        HttpStatus.NOT_FOUND,
      );
    if (!(user instanceof Student))
      throw new ProfileServiceException(
        'Only STUDENT users can have tags',
        HttpStatus.BAD_REQUEST,
      );
    return user;
  }
}
