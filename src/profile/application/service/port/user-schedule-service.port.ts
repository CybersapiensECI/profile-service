import type { Schedule } from '../../../domain/model/schedule';
import type { UserResponseDto } from '../../dto/response/user.response.dto';

export interface UserScheduleServicePort {
  addSchedule(userId: string, schedule: Schedule): Promise<UserResponseDto>;
  removeSchedule(userId: string, schedule: Schedule): Promise<UserResponseDto>;
}
