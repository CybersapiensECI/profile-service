import { Controller, Delete, HttpCode, HttpStatus, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { USER_MANAGEMENT_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserManagementServicePort } from '../../../application/service/port/user-management-service.port';

@ApiTags('Users - Deletion')
@Controller('api/v1/users')
export class UserDeletionController {
  constructor(
    @Inject(USER_MANAGEMENT_SERVICE_PORT)
    private readonly userService: UserManagementServicePort,
  ) {}

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user by ID',
    description:
      'Removes a user and associated profile data from the system. This operation is irreversible.',
  })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    await this.userService.deleteUser(userId);
  }
}
