import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsString, IsUUID } from 'class-validator';

export class UserMatchProfileRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'SYSTEMS_ENGINEERING' })
  @IsString()
  career: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  semester: number;

  @ApiProperty({ type: [String], example: ['tag-id-1', 'tag-id-2'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ type: [String], example: ['Monday 08:00-10:00'] })
  @IsArray()
  @IsString({ each: true })
  schedulesAvailable: string[];

  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean;
}
