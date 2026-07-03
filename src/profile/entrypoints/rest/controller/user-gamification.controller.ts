import { Body, Controller, HttpCode, HttpStatus, Inject, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { USER_GAMIFICATION_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserGamificationServicePort } from '../../../application/service/port/user-gamification-service.port';
import { InternalServiceGuard } from '../guard/internal-service.guard';
import { XpUpdateRequestDto } from '../../../application/dto/request/xp-update.request.dto';
import { LevelUpdateRequestDto } from '../../../application/dto/request/level-update.request.dto';
import { ActiveStatusRequestDto } from '../../../application/dto/request/active-status.request.dto';

@ApiTags('Users - Update')
@Controller('api/v1/users')
@UseGuards(InternalServiceGuard)
export class UserGamificationController {
  constructor(
    @Inject(USER_GAMIFICATION_SERVICE_PORT)
    private readonly gamificationService: UserGamificationServicePort,
  ) {}

  @Patch(':userId/xp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update XP for a student' })
  @ApiResponse({ status: 200, description: 'XP updated successfully' })
  @ApiResponse({ status: 400, description: 'User is not a student' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateXp(@Param('userId') userId: string, @Body() request: XpUpdateRequestDto) {
    return this.gamificationService.updateXp(userId, request.xp);
  }

  @Patch(':userId/level')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update level for a student' })
  @ApiResponse({ status: 200, description: 'Level updated successfully' })
  @ApiResponse({ status: 400, description: 'User is not a student' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateLevel(@Param('userId') userId: string, @Body() request: LevelUpdateRequestDto) {
    return this.gamificationService.updateLevel(userId, request.level);
  }

  @Patch(':userId/active-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update active status for a student' })
  @ApiResponse({ status: 200, description: 'Active status updated successfully' })
  @ApiResponse({ status: 400, description: 'User is not a student' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateActiveStatus(
    @Param('userId') userId: string,
    @Body() request: ActiveStatusRequestDto,
  ) {
    return this.gamificationService.updateActiveStatus(userId, request.active);
  }
}
