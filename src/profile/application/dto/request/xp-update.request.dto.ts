import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min } from 'class-validator';

export class XpUpdateRequestDto {
  @ApiProperty({ example: 150 })
  @IsDefined({ message: 'XP value must not be null' })
  @IsInt()
  @Min(0, { message: 'XP must be zero or positive' })
  xp: number;
}
