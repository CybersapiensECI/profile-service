import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { Student } from '../../domain/model/student';
import { User } from '../../domain/model/user.entity';
import type { UserGamificationPort } from '../../domain/ports/in/user-gamification.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/injection-tokens';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';

@Injectable()
export class UserGamificationUseCase implements UserGamificationPort {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async updateXp(userId: string, xp: number): Promise<User> {
    const student = await this.findStudentOrThrow(userId);
    student.xp = xp;
    return this.userRepository.update(userId, student);
  }

  async updateLevel(userId: string, level: number): Promise<User> {
    const student = await this.findStudentOrThrow(userId);
    student.level = level;
    return this.userRepository.update(userId, student);
  }

  async updateActiveStatus(userId: string, active: boolean): Promise<User> {
    const student = await this.findStudentOrThrow(userId);
    student.isActive = active;
    return this.userRepository.update(userId, student);
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
        'Only STUDENT users have this property',
        HttpStatus.BAD_REQUEST,
      );
    return user;
  }
}
