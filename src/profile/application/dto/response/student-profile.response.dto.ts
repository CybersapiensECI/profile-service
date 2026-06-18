import { ApiProperty } from '@nestjs/swagger';
import { ScheduleResponseDto } from './schedule.response.dto';
import { TagResponseDto } from './tag.response.dto';
import { UserResponseDto } from './user.response.dto';

export class StudentProfileResponseDto extends UserResponseDto {
  @ApiProperty({ example: 'SYSTEMS_ENGINEERING' })
  career: string;

  @ApiProperty({ example: 5, nullable: true })
  semester: number | null;

  @ApiProperty({ example: 'Apasionada por la IA', nullable: true })
  biography: string | null;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', nullable: true })
  photoUrl: string | null;

  @ApiProperty({ example: 'PUBLIC' })
  privacyLevel: string;

  @ApiProperty({ example: false })
  geolocationEnabled: boolean;

  @ApiProperty({ example: '2002-05-14', nullable: true })
  dateOfBirth: string | null;

  @ApiProperty({ type: [TagResponseDto] })
  tags: TagResponseDto[];

  @ApiProperty({ type: [ScheduleResponseDto] })
  schedules: ScheduleResponseDto[];

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: 150 })
  xp: number;

  @ApiProperty({ example: 2 })
  level: number;

  @ApiProperty({ type: [String] })
  friendsId: string[];
}
