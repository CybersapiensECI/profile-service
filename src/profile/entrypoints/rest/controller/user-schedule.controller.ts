import { Body, Controller, Delete, Inject, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { USER_SCHEDULE_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserScheduleServicePort } from '../../../application/service/port/user-schedule-service.port';
import { UserMapper } from '../../../application/mapper/user.mapper';
import { ScheduleRequestDto } from '../../../application/dto/request/schedule.request.dto';

@ApiTags('User Profiles')
@Controller('api/v1/users')
export class UserScheduleController {
  constructor(
    @Inject(USER_SCHEDULE_SERVICE_PORT)
    private readonly scheduleService: UserScheduleServicePort,
    private readonly userMapper: UserMapper,
  ) {}

  @Post(':userId/schedules')
  @ApiOperation({
    summary: 'Add an availability schedule to a student',
    description: 'Adds a time block to the student schedule. Validates for time overlaps.',
  })
  @ApiResponse({ status: 200, description: 'Schedule added successfully' })
  @ApiResponse({ status: 400, description: 'Overlap detected or user is not a student' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async addSchedule(@Param('userId') userId: string, @Body() request: ScheduleRequestDto) {
    return this.scheduleService.addSchedule(userId, this.userMapper.fromScheduleRequest(request));
  }

  @Delete(':userId/schedules')
  @ApiOperation({
    summary: 'Remove an availability schedule from a student',
    description: 'Removes the matching time block from the student schedule.',
  })
  @ApiResponse({ status: 200, description: 'Schedule removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async removeSchedule(@Param('userId') userId: string, @Body() request: ScheduleRequestDto) {
    return this.scheduleService.removeSchedule(userId, this.userMapper.fromScheduleRequest(request));
  }
}
