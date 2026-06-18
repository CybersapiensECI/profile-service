import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CareerEnum, GenderEnum, PrivacyLevelEnum } from '../../../domain/model/enum';

export class UserStudentRequestDto {
  @ApiProperty({ example: 'María López' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 50)
  name: string;

  @ApiProperty({ description: 'Allowed values: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY' })
  @IsEnum(GenderEnum, { message: 'Gender is required' })
  gender: GenderEnum;

  @ApiProperty({ description: 'Allowed values: SYSTEMS_ENGINEERING, CIVIL_ENGINEERING, ...' })
  @IsEnum(CareerEnum, { message: 'Career is required' })
  career: CareerEnum;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El semestre mínimo es 1' })
  @Max(10, { message: 'El semestre máximo es 10' })
  semester?: number;

  @ApiProperty({ example: '2025100001' })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'The carnet must have exactly 10 digits' })
  studentCarnet: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ example: 'Estudiante apasionada por IA', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'The biography cannot exceed 200 characters' })
  biography?: string;

  @ApiProperty({ description: 'Allowed values: PUBLIC, PRIVATE, MATCH_ONLY' })
  @IsEnum(PrivacyLevelEnum, { message: 'Privacy level is required' })
  privacyLevel: PrivacyLevelEnum;

  @ApiProperty({ example: '2002-05-14' })
  @IsDateString({}, { message: 'Date of birth must be in the past (ISO 8601)' })
  dateOfBirth: string;

  @ApiProperty({ example: false })
  @IsBoolean({ message: 'Geolocation enabled is required' })
  geolocationEnabled: boolean;
}
