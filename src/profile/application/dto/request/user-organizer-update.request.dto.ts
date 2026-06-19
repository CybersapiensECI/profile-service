import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { GenderEnum } from '../../../domain/model/enum';

export class UserOrganizerUpdateRequestDto {
  @ApiProperty({ example: 'Empresa Innovadora S.A.', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiProperty({ description: 'Allowed values: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY', required: false })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @ApiProperty({ example: 'contacto@empresa.com', required: false })
  @IsOptional()
  @IsString()
  contactInfo?: string;
}
