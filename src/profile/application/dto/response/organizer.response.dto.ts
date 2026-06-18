import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';

export class OrganizerResponseDto extends UserResponseDto {
  @ApiProperty({ example: 'contacto@empresa.com', nullable: true })
  contactInfo: string | null;
}
