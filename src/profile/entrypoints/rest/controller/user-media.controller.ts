import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Redirect,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OwnershipGuard } from '../guard/ownership.guard';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  USER_MANAGEMENT_SERVICE_PORT,
  USER_MEDIA_SERVICE_PORT,
} from '../../../domain/ports/injection-tokens';
import type { UserManagementServicePort } from '../../../application/service/port/user-management-service.port';
import type { UserMediaServicePort } from '../../../application/service/port/user-media-service.port';
import { GeolocationRequestDto } from '../../../application/dto/request/geolocation.request.dto';
import { StudentProfileResponseDto } from '../../../application/dto/response/student-profile.response.dto';

@ApiTags('User Profiles')
@Controller('api/v1/users')
export class UserMediaController {
  constructor(
    @Inject(USER_MEDIA_SERVICE_PORT)
    private readonly mediaService: UserMediaServicePort,
    @Inject(USER_MANAGEMENT_SERVICE_PORT)
    private readonly managementService: UserManagementServicePort,
  ) {}

  @Post(':userId/profile-image')
  @UseGuards(OwnershipGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload or update the profile image of the user',
    description:
      'Accepts a multipart file. Validates readability and content type.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile image updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'File is missing, unreadable or invalid format',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async uploadProfileImage(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'It was not possible to read the file. Please try again.',
      );
    }
    return this.mediaService.updateProfileImage(
      userId,
      file.buffer,
      file.mimetype,
    );
  }

  @Get(':userId/profile-image')
  @Redirect('', HttpStatus.FOUND)
  @ApiOperation({
    summary: 'Retrieve the profile image of the user',
    description:
      'Redirects (302) to the stored profile image URL for the given user.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to the profile image URL',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not have a valid profile image',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfileImage(@Param('userId') userId: string) {
    const user = await this.managementService.getUser(userId);

    if (user.userType !== 'STUDENT') {
      throw new BadRequestException(
        'This user does not have a valid profile image.',
      );
    }

    const studentUser = user as StudentProfileResponseDto;
    const { photoUrl } = studentUser;

    if (
      !photoUrl?.trim() ||
      (!photoUrl.startsWith('http://') && !photoUrl.startsWith('https://'))
    ) {
      throw new BadRequestException(
        'This user does not have a valid profile image.',
      );
    }

    return { url: photoUrl };
  }

  @Patch(':userId/geolocation')
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary: 'Update geolocation setting for a student',
    description: 'Enables or disables geolocation for the given student user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Geolocation setting updated successfully',
  })
  @ApiResponse({ status: 400, description: 'User is not a student' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateGeolocation(
    @Param('userId') userId: string,
    @Body() request: GeolocationRequestDto,
  ) {
    return this.mediaService.updateGeolocation(
      userId,
      request.geolocationEnabled,
    );
  }
}
