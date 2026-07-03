import { Inject, Injectable } from '@nestjs/common';
import { UserMapper } from '../mapper/user.mapper';
import type { UserGamificationPort } from '../../domain/ports/in/user-gamification.port';
import { USER_GAMIFICATION_PORT } from '../../domain/ports/injection-tokens';
import type { UserGamificationServicePort } from './port/user-gamification-service.port';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserGamificationService implements UserGamificationServicePort {
  constructor(
    @Inject(USER_GAMIFICATION_PORT)
    private readonly gamificationUseCase: UserGamificationPort,
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
