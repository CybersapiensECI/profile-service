import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../guard/ownership.guard';
import { USER_TAG_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserTagServicePort } from '../../../application/service/port/user-tag-service.port';
import { TagRequestDto } from '../../../application/dto/request/tag.request.dto';

@ApiTags('User Profiles')
@Controller('api/v1/users')
export class UserTagController {
  constructor(
    @Inject(USER_TAG_SERVICE_PORT)
    private readonly tagService: UserTagServicePort,
  ) {}

  @Get(':userId/tags')
  @ApiOperation({ summary: 'Get all tag IDs for a student' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserTags(@Param('userId') userId: string) {
    return this.tagService.getUserTags(userId);
  }

  @Get(':userId/tags/names')
  @ApiOperation({ summary: 'Get all tag names for a student' })
  @ApiResponse({ status: 200, description: 'Tag names retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserTagNames(@Param('userId') userId: string) {
    return this.tagService.getUserTagsNames(userId);
  }

  @Post(':userId/tags')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Add a tag to a student' })
  @ApiResponse({ status: 200, description: 'Tag added successfully' })
  @ApiResponse({ status: 400, description: 'Tag does not exist or user is not a student' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async addTag(@Param('userId') userId: string, @Body() request: TagRequestDto) {
    return this.tagService.addTag(userId, request.tagId);
  }

  @Delete(':userId/tags/:tagId')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Remove a tag from a student' })
  @ApiResponse({ status: 200, description: 'Tag removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async removeTag(@Param('userId') userId: string, @Param('tagId') tagId: string) {
    return this.tagService.removeTag(userId, tagId);
  }
}
