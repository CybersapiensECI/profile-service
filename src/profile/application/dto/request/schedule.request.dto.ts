import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { DayOfWeekEnum } from '../../../domain/model/enum';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ScheduleRequestDto {
  @ApiProperty({ description: 'Allowed values: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY' })
  @IsEnum(DayOfWeekEnum, { message: 'Day of week is required' })
  dayOfWeek: DayOfWeekEnum;

  @ApiProperty({ example: 'Cálculo diferencial' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: '08:00', description: 'Format HH:mm' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'Start time must be in HH:mm format' })
  startTime: string;

  @ApiProperty({ example: '10:00', description: 'Format HH:mm' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'End time must be in HH:mm format' })
  endTime: string;
}
