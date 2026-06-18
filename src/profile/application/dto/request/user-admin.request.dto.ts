import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { GenderEnum } from '../../../domain/model/enum';

export class UserAdminRequestDto {
  @ApiProperty({ example: 'Carlos Gómez' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @ApiProperty({ description: 'Allowed values: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY' })
  @IsEnum(GenderEnum, { message: 'Gender is required' })
  gender: GenderEnum;
}
