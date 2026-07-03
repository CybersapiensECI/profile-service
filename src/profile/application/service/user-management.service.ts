import { Inject, Injectable } from '@nestjs/common';
import { Admin } from '../../domain/model/admin';
import { Organizer } from '../../domain/model/organizer';
import { Student } from '../../domain/model/student';
import { User } from '../../domain/model/user.entity';
import {
  USER_MANAGEMENT_PORT,
} from '../../domain/ports/injection-tokens';
import type { UserManagementPort } from '../../domain/ports/in/user-management.port';
import { UserMapper } from '../mapper/user.mapper';
import type { UserManagementServicePort } from './port/user-management-service.port';
import { BatchProfileResponseDto } from '../dto/response/batch-profile.response.dto';
import { CategoryWithTagsResponseDto } from '../dto/response/category-with-tags.response.dto';
import { TagSummaryResponseDto } from '../dto/response/tag-summary.response.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserManagementService implements UserManagementServicePort {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly managementUseCase: UserManagementPort,
    private readonly userMapper: UserMapper,
  ) {}

  async createStudentUser(user: Student): Promise<UserResponseDto> {
    const created = await this.managementUseCase.createStudentUser(user);
    return this.userMapper.toResponse(created);
  }

  async createAdminUser(user: Admin): Promise<UserResponseDto> {
    const created = await this.managementUseCase.createAdminUser(user);
    return this.userMapper.toResponse(created);
  }

  async createOrganizerUser(user: Organizer): Promise<UserResponseDto> {
    const created = await this.managementUseCase.createOrganizerUser(user);
    return this.userMapper.toResponse(created);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.managementUseCase.deleteUser(userId);
  }

  async getUser(userId: string): Promise<UserResponseDto> {
    const user = await this.managementUseCase.getUser(userId);
    return this.userMapper.toResponse(user);
  }

  async updateUser(userId: string, user: User): Promise<UserResponseDto> {
    const updated = await this.managementUseCase.updateUser(userId, user);
    return this.userMapper.toResponse(updated);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.managementUseCase.getAllUsers();
    return users.map((u) => this.userMapper.toResponse(u));
  }

  async getAllStudentProfiles(): Promise<UserResponseDto[]> {
    const students = await this.managementUseCase.getAllStudentProfiles();
    return students.map((s) => this.userMapper.toResponse(s));
  }

  async getAllOrganizerProfiles(): Promise<UserResponseDto[]> {
    const organizers = await this.managementUseCase.getAllOrganizerProfiles();
    return organizers.map((o) => this.userMapper.toResponse(o));
  }

  async getAllAdminProfiles(): Promise<UserResponseDto[]> {
    const admins = await this.managementUseCase.getAllAdminProfiles();
    return admins.map((a) => this.userMapper.toResponse(a));
  }

  async getUsersByIds(ids: string[]): Promise<BatchProfileResponseDto[]> {
    const users = await this.managementUseCase.getUsersByIds(ids);
    return users.map((user) => {
      const dto = new BatchProfileResponseDto();
      dto.id = user.id;
      dto.name = user.name;
      dto.biography = user instanceof Student ? user.biography : null;
      dto.photoUrl = user instanceof Student ? user.photoUrl : null;
      return dto;
    });
  }

  async getTagCatalog(): Promise<CategoryWithTagsResponseDto[]> {
    const categories = await this.managementUseCase.getTagCatalog();
    return categories.map((cat) => {
      const dto = new CategoryWithTagsResponseDto();
      dto.id = cat.id;
      dto.name = cat.name;
      dto.tags = cat.tags.map((t) => {
        const tagDto = new TagSummaryResponseDto();
        tagDto.id = t.id;
        tagDto.name = t.name;
        return tagDto;
      });
      return dto;
    });
  }
}
