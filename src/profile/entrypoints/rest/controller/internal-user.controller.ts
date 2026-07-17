import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternalServiceGuard } from '../guard/internal-service.guard';
import { INTERNAL_USER_SERVICE_PORT, USER_FRIEND_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { InternalUserServicePort } from '../../../application/service/port/internal-user-service.port';
import type { UserFriendServicePort } from '../../../application/service/port/user-friend-service.port';
import { FriendRequestDto } from '../../../application/dto/request/friend.request.dto';

@ApiTags('Internal')
@UseGuards(InternalServiceGuard)
@Controller('api/v1/internal')
export class InternalUserController {
  constructor(
    @Inject(INTERNAL_USER_SERVICE_PORT)
    private readonly internalUserService: InternalUserServicePort,
    @Inject(USER_FRIEND_SERVICE_PORT)
    private readonly userFriendService: UserFriendServicePort,
  ) {}

  @Get('users/:userId/friends')
  @ApiOperation({
    summary: 'Get all friend IDs for a student (service-to-service)',
    description:
      'Same data as the public /api/v1/users/:userId/friends, reachable without a ' +
      'user JWT for callers like matching-service that act on behalf of two users at once.',
  })
  @ApiResponse({ status: 200, description: 'Friends retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserFriends(@Param('userId') userId: string): Promise<string[]> {
    return this.userFriendService.getUserFriends(userId);
  }

  @Post('users/:userId/friends')
  @ApiOperation({
    summary: 'Add a bidirectional friendship (service-to-service)',
    description:
      'Used by matching-service when a match is accepted: neither side of the match has a ' +
      "JWT representing the other user, so this can't go through the public, OwnershipGuard-" +
      'protected route.',
  })
  @ApiResponse({ status: 200, description: 'Friend added successfully' })
  @ApiResponse({ status: 400, description: 'User is not a student' })
  @ApiResponse({ status: 404, description: 'User or friend not found' })
  async addFriend(@Param('userId') userId: string, @Body() request: FriendRequestDto) {
    return this.userFriendService.addFriend(userId, request.friendId);
  }

  @Delete('users/:userId/friends/:friendId')
  @ApiOperation({
    summary: 'Remove a bidirectional friendship (service-to-service)',
    description:
      'Used by matching-service when unfriending: same rationale as the POST above, no user ' +
      'JWT is available on either side of the pair for this server-to-server call.',
  })
  @ApiResponse({ status: 200, description: 'Friend removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async removeFriend(@Param('userId') userId: string, @Param('friendId') friendId: string) {
    return this.userFriendService.removeFriend(userId, friendId);
  }

  @Get('users/:userId/geolocation')
  @ApiOperation({ summary: 'Check if a student has geolocation enabled' })
  @ApiResponse({ status: 200, description: 'Geolocation status retrieved successfully', type: Boolean })
  @ApiResponse({ status: 404, description: 'User not found' })
  async isGeolocationEnabled(@Param('userId') userId: string): Promise<boolean> {
    return this.internalUserService.isGeolocationEnabled(userId);
  }

  @Get('users/:userId/active')
  @ApiOperation({ summary: 'Check if a student is active' })
  @ApiResponse({ status: 200, description: 'Active status retrieved successfully', type: Boolean })
  @ApiResponse({ status: 404, description: 'User not found' })
  async isActive(@Param('userId') userId: string): Promise<boolean> {
    return this.internalUserService.isActive(userId);
  }

  @Get('matching/profiles/:id')
  @ApiOperation({
    summary: 'Obtain user profile for matching by ID',
    description:
      'Returns a concise profile tailored for matching algorithms including tags, level and availability.',
  })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 400, description: 'User is not a student profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfileForMatching(@Param('id') id: string) {
    return this.internalUserService.getProfileForMatching(id);
  }

  @Get('matching/profiles')
  @ApiOperation({
    summary: 'Obtain all user profiles for matching (unfiltered)',
    description:
      'Returns all available student profiles formatted for matching, excluding private profiles.',
  })
  @ApiResponse({ status: 200, description: 'User profiles retrieved successfully' })
  async getAllProfilesForMatching() {
    return this.internalUserService.getAllProfilesForMatching();
  }

  @Get('matching/profiles/candidates/:userId')
  @ApiOperation({
    summary: 'Obtain matching candidates for a user',
    description:
      'Returns filtered student profiles excluding self, confirmed friends and private profiles.',
  })
  @ApiResponse({ status: 200, description: 'Matching candidates retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMatchingCandidates(@Param('userId') userId: string) {
    return this.internalUserService.getAllProfilesForMatching(userId);
  }
}
