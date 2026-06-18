import { Injectable } from '@nestjs/common';
import { Schedule } from '../../domain/model/schedule';
import { UserMapper } from '../mapper/user.mapper';
import { UserScheduleUseCase } from '../usecase/user-schedule.usecase';
import type { UserScheduleServicePort } from './port/user-schedule-service.port';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Injectable()
export class UserScheduleService implements UserScheduleServicePort {
  constructor(
    private readonly scheduleUseCase: UserScheduleUseCase,
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
