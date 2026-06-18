import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FriendRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID('all', { message: 'The friend ID cannot be null' })
  friendId: string;
}
