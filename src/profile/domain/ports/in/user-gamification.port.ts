import { User } from '../../model/user.entity';

export interface UserGamificationPort {
  updateXp(userId: string, xp: number): Promise<User>;
  updateLevel(userId: string, level: number): Promise<User>;
  updateActiveStatus(userId: string, active: boolean): Promise<User>;
}
