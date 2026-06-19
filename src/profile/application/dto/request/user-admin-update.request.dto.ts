import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { GenderEnum } from '../../../domain/model/enum';

export class UserAdminUpdateRequestDto {
  @ApiProperty({ example: 'Carlos Gómez', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiProperty({ description: 'Allowed values: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY', required: false })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;
}
