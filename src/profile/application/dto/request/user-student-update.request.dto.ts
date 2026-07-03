import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CareerEnum,
  GenderEnum,
  PrivacyLevelEnum,
} from '../../../domain/model/enum';

export class UserStudentUpdateRequestDto {
  @ApiProperty({ example: 'María López', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiProperty({
    description: 'Allowed values: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
    required: false,
  })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @ApiProperty({
    description: 'Allowed values: SYSTEMS_ENGINEERING, ...',
    required: false,
  })
  @IsOptional()
  @IsEnum(CareerEnum)
  career?: CareerEnum;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  semester?: number;

  @ApiProperty({ example: '2025100001', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'The carnet must have exactly 10 digits' })
  studentCarnet?: string;

  @ApiProperty({ example: 'Estudiante apasionada por IA', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  biography?: string;

  @ApiProperty({
    description: 'Allowed values: PUBLIC, PRIVATE, MATCH_ONLY',
    required: false,
  })
  @IsOptional()
  @IsEnum(PrivacyLevelEnum)
  privacyLevel?: PrivacyLevelEnum;

  @ApiProperty({ example: '2002-05-14', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
