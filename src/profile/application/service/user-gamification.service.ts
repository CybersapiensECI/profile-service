import { Injectable } from '@nestjs/common';
import { UserMapper } from '../mapper/user.mapper';
import { UserGamificationUseCase } from '../usecase/user-gamification.usecase';
import type { UserGamificationServicePort } from './port/user-gamification-service.port';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserGamificationService implements UserGamificationServicePort {
  constructor(
    private readonly gamificationUseCase: UserGamificationUseCase,
    private readonly userMapper: UserMapper,
  ) {}

  async updateXp(userId: string, xp: number): Promise<UserResponseDto> {
    const updated = await this.gamificationUseCase.updateXp(userId, xp);
    return this.userMapper.toResponse(updated);
  }

  async updateLevel(userId: string, level: number): Promise<UserResponseDto> {
    const updated = await this.gamificationUseCase.updateLevel(userId, level);
    return this.userMapper.toResponse(updated);
  }

  async updateActiveStatus(
    userId: string,
    active: boolean,
  ): Promise<UserResponseDto> {
    const updated = await this.gamificationUseCase.updateActiveStatus(
      userId,
      active,
    );
    return this.userMapper.toResponse(updated);
  }
}
