import { ApiProperty } from '@nestjs/swagger';

export class UserProfilePhotoResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'María López' })
  name: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  profileImageUrl: string;
}
