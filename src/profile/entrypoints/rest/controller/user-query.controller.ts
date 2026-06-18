import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { USER_MANAGEMENT_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserManagementServicePort } from '../../../application/service/port/user-management-service.port';
import { BatchProfileRequestDto } from '../../../application/dto/request/batch-profile.request.dto';

@ApiTags('Users - Reading')
@Controller('api/v1/users')
export class UserQueryController {
  constructor(
    @Inject(USER_MANAGEMENT_SERVICE_PORT)
    private readonly userService: UserManagementServicePort,
  ) {}

  @Get(':userId')
  @ApiOperation({
    summary: 'Obtain user by ID',
    description: 'Retrieves a full public representation of a user by ID.',
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtain all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('student-profiles')
  @ApiOperation({ summary: 'Obtain all student profiles' })
  @ApiResponse({ status: 200, description: 'Student profiles retrieved successfully' })
  async getAllStudentProfiles() {
    return this.userService.getAllStudentProfiles();
  }

  @Get('tags')
  @ApiOperation({ summary: 'Obtain tag catalog with categories' })
  @ApiResponse({ status: 200, description: 'Tag catalog retrieved successfully' })
  async getTagCatalog() {
    return this.userService.getTagCatalog();
  }

  @Post('batch')
  @ApiOperation({
    summary: 'Obtain a batch of user profiles by IDs',
    description: 'Returns minimal profile info (id, name, biography, photoUrl) for a list of user IDs.',
  })
  @ApiResponse({ status: 200, description: 'Batch profiles retrieved successfully' })
  async getUsersByIds(@Body() request: BatchProfileRequestDto) {
    return this.userService.getUsersByIds(request.ids);
  }
}
