import { Body, Controller, HttpCode, HttpStatus, Inject, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { USER_MANAGEMENT_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserManagementServicePort } from '../../../application/service/port/user-management-service.port';
import { UserMapper } from '../../../application/mapper/user.mapper';
import { UserStudentUpdateRequestDto } from '../../../application/dto/request/user-student-update.request.dto';
import { UserAdminUpdateRequestDto } from '../../../application/dto/request/user-admin-update.request.dto';
import { UserOrganizerUpdateRequestDto } from '../../../application/dto/request/user-organizer-update.request.dto';

@ApiTags('Users - Update')
@Controller('api/v1/users')
export class UserUpdateController {
  constructor(
    @Inject(USER_MANAGEMENT_SERVICE_PORT)
    private readonly userService: UserManagementServicePort,
    private readonly userMapper: UserMapper,
  ) {}

  @Patch(':userId/student')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update student profile',
    description: 'Partially updates a student user profile. Only provided fields are applied.',
  })
  @ApiResponse({ status: 200, description: 'Student profile updated successfully' })
  @ApiResponse({ status: 400, description: 'User is not a student or validation failed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateStudentUser(
    @Param('userId') userId: string,
    @Body() request: UserStudentUpdateRequestDto,
  ) {
    return this.userService.updateUser(userId, this.userMapper.fromStudentUpdateRequest(request));
  }

  @Patch(':userId/admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update admin profile',
    description: 'Partially updates an admin user profile. Only provided fields are applied.',
  })
  @ApiResponse({ status: 200, description: 'Admin profile updated successfully' })
  @ApiResponse({ status: 400, description: 'User is not an admin or validation failed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateAdminUser(
    @Param('userId') userId: string,
    @Body() request: UserAdminUpdateRequestDto,
  ) {
    return this.userService.updateUser(userId, this.userMapper.fromAdminUpdateRequest(request));
  }

  @Patch(':userId/organizer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update organizer profile',
    description: 'Partially updates an organizer user profile. Only provided fields are applied.',
  })
  @ApiResponse({ status: 200, description: 'Organizer profile updated successfully' })
  @ApiResponse({ status: 400, description: 'User is not an organizer or validation failed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateOrganizerUser(
    @Param('userId') userId: string,
    @Body() request: UserOrganizerUpdateRequestDto,
  ) {
    return this.userService.updateUser(userId, this.userMapper.fromOrganizerUpdateRequest(request));
  }
}
