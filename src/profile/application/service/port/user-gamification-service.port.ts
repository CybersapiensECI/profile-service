import type { UserResponseDto } from '../../dto/response/user.response.dto';

export interface UserGamificationServicePort {
  updateXp(userId: string, xp: number): Promise<UserResponseDto>;
  updateLevel(userId: string, level: number): Promise<UserResponseDto>;
  updateActiveStatus(userId: string, active: boolean): Promise<UserResponseDto>;
}
