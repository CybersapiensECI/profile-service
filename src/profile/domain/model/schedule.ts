import { InvalidInputException } from '../exceptions/invalid-input.exception';
import { DayOfWeekEnum } from './enum';

export class Schedule {
  dayOfWeek: DayOfWeekEnum;
  name: string;
  startTime: string;
  endTime: string;

  constructor(
    dayOfWeek: DayOfWeekEnum,
    name: string,
    startTime: string,
    endTime: string,
  ) {
    if (dayOfWeek == null)
      throw new InvalidInputException('Day of week is required');
    if (!startTime || !endTime)
      throw new InvalidInputException('Start and end time are required');
    if (!name || name.trim().length === 0)
      throw new InvalidInputException('Name is required');
    if (name.trim().length > 100)
      throw new InvalidInputException('Name must be less than 100 characters');

    const start = this.toMinutes(startTime);
    const end = this.toMinutes(endTime);

    if (start >= end)
      throw new InvalidInputException('Start time must be before end time');
    if (end - start !== 90)
      throw new InvalidInputException(
        'Schedule duration must be exactly 90 minutes (e.g., 7:00–8:30)',
      );

    this.dayOfWeek = dayOfWeek;
    this.name = name.trim();
    this.startTime = startTime;
    this.endTime = endTime;
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
