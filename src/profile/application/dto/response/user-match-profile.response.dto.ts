import { ApiProperty } from '@nestjs/swagger';

export class UserMatchProfileResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'SYSTEMS_ENGINEERING' })
  career: string;

  @ApiProperty({ example: 5 })
  semester: number | null;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: [String], example: ['MONDAY 08:00-10:00'] })
  schedulesAvailable: string[];

  @ApiProperty({ example: true })
  active: boolean;
}
