import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;
}
