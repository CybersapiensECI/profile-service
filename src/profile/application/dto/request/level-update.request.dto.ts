import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min } from 'class-validator';

export class LevelUpdateRequestDto {
  @ApiProperty({ example: 3 })
  @IsDefined({ message: 'Level value must not be null' })
  @IsInt()
  @Min(1, { message: 'Level must be at least 1' })
  level: number;
}
