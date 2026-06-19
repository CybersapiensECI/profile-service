import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined } from 'class-validator';

export class ActiveStatusRequestDto {
  @ApiProperty({ example: true })
  @IsDefined({ message: 'Active status must not be null' })
  @IsBoolean()
  active: boolean;
}
