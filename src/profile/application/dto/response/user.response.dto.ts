import { ApiProperty } from '@nestjs/swagger';

export abstract class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'María López' })
  name: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'FEMALE' })
  gender: string;

  @ApiProperty({ example: 'STUDENT' })
  userType: string;
}
