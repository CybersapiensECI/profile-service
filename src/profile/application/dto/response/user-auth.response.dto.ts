import { ApiProperty } from '@nestjs/swagger';

export class UserAuthResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'STUDENT' })
  userType: string;
}
