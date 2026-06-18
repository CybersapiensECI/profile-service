import { Controller, Get, HttpCode, HttpStatus, Inject, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternalServiceGuard } from '../guard/internal-service.guard';
import { INTERNAL_USER_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { InternalUserServicePort } from '../../../application/service/port/internal-user-service.port';

@ApiTags('Internal')
@UseGuards(InternalServiceGuard)
@Controller('api/v1/internal')
export class InternalUserController {
  constructor(
    @Inject(INTERNAL_USER_SERVICE_PORT)
    private readonly internalUserService: InternalUserServicePort,
  ) {}

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
