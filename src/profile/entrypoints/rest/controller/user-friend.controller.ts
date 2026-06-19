import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../guard/ownership.guard';
import { USER_FRIEND_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserFriendServicePort } from '../../../application/service/port/user-friend-service.port';
import { FriendRequestDto } from '../../../application/dto/request/friend.request.dto';

@ApiTags('User Profiles')
@Controller('api/v1/users')
export class UserFriendController {
  constructor(
    @Inject(USER_FRIEND_SERVICE_PORT)
    private readonly friendService: UserFriendServicePort,
  ) {}

  @Get(':userId/friends')
  @ApiOperation({ summary: 'Get all friend IDs for a student' })
  @ApiResponse({ status: 200, description: 'Friends retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserFriends(@Param('userId') userId: string) {
    return this.friendService.getUserFriends(userId);
  }

  @Post(':userId/friends')
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary: 'Add a friend to a student',
    description: 'Adds a bidirectional friendship between the student and the specified friend.',
  })
  @ApiResponse({ status: 200, description: 'Friend added successfully' })
  @ApiResponse({ status: 400, description: 'User is not a student' })
  @ApiResponse({ status: 404, description: 'User or friend not found' })
  async addFriend(@Param('userId') userId: string, @Body() request: FriendRequestDto) {
    return this.friendService.addFriend(userId, request.friendId);
  }

  @Delete(':userId/friends/:friendId')
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary: 'Remove a friend from a student',
    description: 'Removes the bidirectional friendship between the student and the specified friend.',
  })
  @ApiResponse({ status: 200, description: 'Friend removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async removeFriend(@Param('userId') userId: string, @Param('friendId') friendId: string) {
    return this.friendService.removeFriend(userId, friendId);
  }
}
