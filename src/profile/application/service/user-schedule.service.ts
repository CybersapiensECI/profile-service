import { Inject, Injectable } from '@nestjs/common';
import { Schedule } from '../../domain/model/schedule';
import { UserMapper } from '../mapper/user.mapper';
import type { UserSchedulePort } from '../../domain/ports/in/user-schedule.port';
import { USER_SCHEDULE_PORT } from '../../domain/ports/injection-tokens';
import type { UserScheduleServicePort } from './port/user-schedule-service.port';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserScheduleService implements UserScheduleServicePort {
  constructor(
    @Inject(USER_SCHEDULE_PORT)
    private readonly scheduleUseCase: UserSchedulePort,
    private readonly userMapper: UserMapper,
  ) {}

  async addSchedule(
    userId: string,
    schedule: Schedule,
  ): Promise<UserResponseDto> {
    const updated = await this.scheduleUseCase.addScheduleToStudent(
      userId,
      schedule,
    );
    return this.userMapper.toResponse(updated);
  }

  async removeSchedule(
    userId: string,
    schedule: Schedule,
  ): Promise<UserResponseDto> {
    const updated = await this.scheduleUseCase.removeScheduleFromStudent(
      userId,
      schedule,
    );
    return this.userMapper.toResponse(updated);
  }
}
