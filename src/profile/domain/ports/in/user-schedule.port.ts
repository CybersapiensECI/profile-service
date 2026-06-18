import { Schedule } from '../../model/schedule';
import { User } from '../../model/user.entity';

export interface UserSchedulePort {
  addScheduleToStudent(userId: string, schedule: Schedule): Promise<User>;
  removeScheduleFromStudent(userId: string, schedule: Schedule): Promise<User>;
}
