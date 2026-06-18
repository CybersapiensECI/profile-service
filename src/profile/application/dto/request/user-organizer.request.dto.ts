import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { GenderEnum } from '../../../domain/model/enum';

export class UserOrganizerRequestDto {
  @ApiProperty({ example: 'Empresa Innovadora S.A.' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @ApiProperty({ description: 'Allowed values: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY' })
  @IsEnum(GenderEnum, { message: 'Gender is required' })
  gender: GenderEnum;

  @ApiProperty({ example: 'contacto@empresa.com' })
  @IsString()
  @IsNotEmpty({ message: 'Contact information is required' })
  contactInfo: string;
}
