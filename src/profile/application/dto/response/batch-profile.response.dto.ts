import { ApiProperty } from '@nestjs/swagger';

export class BatchProfileResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'María López' })
  name: string;

  @ApiProperty({ example: 'Estudiante de sistemas apasionada por IA', nullable: true })
  biography: string | null;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', nullable: true })
  photoUrl: string | null;
}
