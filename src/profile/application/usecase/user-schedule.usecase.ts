import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InvalidInputException } from '../../domain/exceptions/invalid-input.exception';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { Schedule } from '../../domain/model/schedule';
import { Student } from '../../domain/model/student';
import { User } from '../../domain/model/user.entity';
import type { UserSchedulePort } from '../../domain/ports/in/user-schedule.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/injection-tokens';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';

@Injectable()
export class UserScheduleUseCase implements UserSchedulePort {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async addScheduleToStudent(userId: string, schedule: Schedule): Promise<User> {
    const user = await this.findStudentOrThrow(userId);
    this.validateNoOverlap(schedule, user.schedulesAvailability);
    user.schedulesAvailability.push(schedule);
    return this.userRepository.update(userId, user);
  }

  async removeScheduleFromStudent(userId: string, schedule: Schedule): Promise<User> {
    const user = await this.findStudentOrThrow(userId);

    const before = user.schedulesAvailability.length;
    user.schedulesAvailability = user.schedulesAvailability.filter(
      (s) => !(s.dayOfWeek === schedule.dayOfWeek && s.startTime === schedule.startTime),
    );

    if (user.schedulesAvailability.length === before)
      throw new ProfileServiceException('Schedule not found for removal', HttpStatus.BAD_REQUEST);

    return this.userRepository.update(userId, user);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async findStudentOrThrow(userId: string): Promise<Student> {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new ProfileServiceException(`User not found: ${userId}`, HttpStatus.NOT_FOUND);
    if (!(user instanceof Student))
      throw new ProfileServiceException('Only STUDENT users can have schedules', HttpStatus.BAD_REQUEST);
    return user;
  }

  private validateNoOverlap(newSchedule: Schedule, existing: Schedule[]): void {
    for (const s of existing) {
      if (
        s.dayOfWeek === newSchedule.dayOfWeek &&
        this.toMinutes(s.startTime) < this.toMinutes(newSchedule.endTime) &&
        this.toMinutes(newSchedule.startTime) < this.toMinutes(s.endTime)
      ) {
        throw new InvalidInputException(
          `Schedule overlaps with an existing one on ${newSchedule.dayOfWeek}`,
        );
      }
    }
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
