import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { USER_MANAGEMENT_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserManagementServicePort } from '../../../application/service/port/user-management-service.port';
import { InternalServiceGuard } from '../guard/internal-service.guard';
import { UserMapper } from '../../../application/mapper/user.mapper';
import { UserStudentRequestDto } from '../../../application/dto/request/user-student.request.dto';
import { UserAdminRequestDto } from '../../../application/dto/request/user-admin.request.dto';
import { UserOrganizerRequestDto } from '../../../application/dto/request/user-organizer.request.dto';

@ApiTags('Users - Creation')
@Controller('api/v1/users')
export class UserCreationController {
  constructor(
    @Inject(USER_MANAGEMENT_SERVICE_PORT)
    private readonly userService: UserManagementServicePort,
    private readonly userMapper: UserMapper,
  ) {}

  @Post('student')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(InternalServiceGuard)
  @ApiOperation({
    summary: 'Create user - STUDENT',
    description:
      'Creates a new student user using the supplied request. Validates the payload and returns the created user.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createStudentUser(@Body() request: UserStudentRequestDto) {
    return this.userService.createStudentUser(
      this.userMapper.fromStudentRequest(request),
    );
  }

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(InternalServiceGuard)
  @ApiOperation({
    summary: 'Create user - ADMIN',
    description:
      'Creates a new admin user. Admin users usually require elevated permissions.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createAdminUser(@Body() request: UserAdminRequestDto) {
    return this.userService.createAdminUser(
      this.userMapper.fromAdminRequest(request),
    );
  }

  @Post('organizer')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(InternalServiceGuard)
  @ApiOperation({
    summary: 'Create user - ORGANIZER',
    description: 'Creates a new organizer user using the supplied request.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createOrganizerUser(@Body() request: UserOrganizerRequestDto) {
    return this.userService.createOrganizerUser(
      this.userMapper.fromOrganizerRequest(request),
    );
  }
}
