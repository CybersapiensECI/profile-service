import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class BatchProfileRequestDto {
  @ApiProperty({ type: [String], example: ['a1b2c3d4-...', 'e5f6g7h8-...'] })
  @IsArray()
  @ArrayNotEmpty({ message: 'The list of IDs must not be empty' })
  @IsUUID('all', { each: true })
  ids: string[];
}
