import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TagRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID('all', { message: 'The tag ID cannot be null' })
  tagId: string;
}
