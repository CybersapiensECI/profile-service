import { Inject, Injectable } from '@nestjs/common';
import { UserMapper } from '../mapper/user.mapper';
import type { UserTagPort } from '../../domain/ports/in/user-tag.port';
import { USER_TAG_PORT } from '../../domain/ports/injection-tokens';
import type { UserTagServicePort } from './port/user-tag-service.port';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserTagService implements UserTagServicePort {
  constructor(
    @Inject(USER_TAG_PORT)
    private readonly tagUseCase: UserTagPort,
    private readonly userMapper: UserMapper,
  ) {}

  async getUserTags(userId: string): Promise<string[]> {
    return this.tagUseCase.getUserTags(userId);
  }

  async getUserTagsNames(userId: string): Promise<string[]> {
    return this.tagUseCase.getUserTagsNames(userId);
  }

  async addTag(userId: string, tagId: string): Promise<UserResponseDto> {
    const updated = await this.tagUseCase.addTagToStudent(userId, tagId);
    return this.userMapper.toResponse(updated);
  }

  async removeTag(userId: string, tagId: string): Promise<UserResponseDto> {
    const updated = await this.tagUseCase.removeTagFromStudent(userId, tagId);
    return this.userMapper.toResponse(updated);
  }
}
