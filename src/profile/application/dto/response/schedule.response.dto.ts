import { ApiProperty } from '@nestjs/swagger';

export class ScheduleResponseDto {
  @ApiProperty({ example: 'MONDAY' })
  dayOfWeek: string;

  @ApiProperty({ example: 'Cálculo diferencial' })
  name: string;

  @ApiProperty({ example: '08:00' })
  startTime: string;

  @ApiProperty({ example: '10:00' })
  endTime: string;
}
