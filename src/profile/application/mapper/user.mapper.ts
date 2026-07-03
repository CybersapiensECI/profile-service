import { HttpStatus, Injectable } from '@nestjs/common';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { Admin } from '../../domain/model/admin';
import { Organizer } from '../../domain/model/organizer';
import { Schedule } from '../../domain/model/schedule';
import { Student } from '../../domain/model/student';
import { User } from '../../domain/model/user.entity';
import { AdminResponseDto } from '../dto/response/admin.response.dto';
import { OrganizerResponseDto } from '../dto/response/organizer.response.dto';
import { ScheduleResponseDto } from '../dto/response/schedule.response.dto';
import { StudentProfileResponseDto } from '../dto/response/student-profile.response.dto';
import { TagResponseDto } from '../dto/response/tag.response.dto';
import { UserAuthResponseDto } from '../dto/response/user-auth.response.dto';
import { UserMatchProfileResponseDto } from '../dto/response/user-match-profile.response.dto';
import { UserProfilePhotoResponseDto } from '../dto/response/user-profile-photo.response.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { UserAdminRequestDto } from '../dto/request/user-admin.request.dto';
import { UserAdminUpdateRequestDto } from '../dto/request/user-admin-update.request.dto';
import { UserOrganizerRequestDto } from '../dto/request/user-organizer.request.dto';
import { UserOrganizerUpdateRequestDto } from '../dto/request/user-organizer-update.request.dto';
import { UserStudentRequestDto } from '../dto/request/user-student.request.dto';
import { UserStudentUpdateRequestDto } from '../dto/request/user-student-update.request.dto';
import { ScheduleRequestDto } from '../dto/request/schedule.request.dto';

@Injectable()
export class UserMapper {
  // ─── Domain → Response ───────────────────────────────────────────────────────

  toResponse(user: User): UserResponseDto {
    if (user instanceof Student) return this.toStudentResponse(user);
    if (user instanceof Admin) return this.toAdminResponse(user);
    if (user instanceof Organizer) return this.toOrganizerResponse(user);
    throw new ProfileServiceException(
      `Unknown user type: ${user?.constructor?.name}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  toStudentResponse(student: Student): StudentProfileResponseDto {
    const dto = new StudentProfileResponseDto();
    dto.id = student.id;
    dto.name = student.name;
    dto.createdAt = student.createdAt;
    dto.gender = student.gender;
    dto.userType = 'STUDENT';
    dto.career = student.career;
    dto.semester = student.semester;
    dto.biography = student.biography;
    dto.photoUrl = student.photoUrl;
    dto.privacyLevel = student.privacyLevel;
    dto.geolocationEnabled = student.geolocationEnabled;
    dto.dateOfBirth = student.dateOfBirth?.toISOString().split('T')[0] ?? null;
    dto.tags = this.toTagResponseList(student.tagsId);
    dto.schedules = this.toScheduleResponseList(student.schedulesAvailability);
    dto.active = student.isActive;
    dto.xp = student.xp;
    dto.level = student.level;
    dto.friendsId = student.friendsId;
    return dto;
  }

  toOrganizerResponse(organizer: Organizer): OrganizerResponseDto {
    const dto = new OrganizerResponseDto();
    dto.id = organizer.id;
    dto.name = organizer.name;
    dto.createdAt = organizer.createdAt;
    dto.gender = organizer.gender;
    dto.userType = 'ORGANIZER';
    dto.contactInfo = organizer.contactInfo;
    return dto;
  }

  toAdminResponse(admin: Admin): AdminResponseDto {
    const dto = new AdminResponseDto();
    dto.id = admin.id;
    dto.name = admin.name;
    dto.createdAt = admin.createdAt;
    dto.gender = admin.gender;
    dto.userType = 'ADMIN';
    return dto;
  }

  toScheduleResponse(schedule: Schedule): ScheduleResponseDto {
    const dto = new ScheduleResponseDto();
    dto.dayOfWeek = schedule.dayOfWeek;
    dto.name = schedule.name;
    dto.startTime = schedule.startTime;
    dto.endTime = schedule.endTime;
    return dto;
  }

  toScheduleResponseList(schedules: Schedule[]): ScheduleResponseDto[] {
    return (schedules ?? []).map((s) => this.toScheduleResponse(s));
  }

  toTagResponse(tagId: string): TagResponseDto {
    const dto = new TagResponseDto();
    dto.id = tagId;
    return dto;
  }

  toTagResponseList(tagsId: string[]): TagResponseDto[] {
    return (tagsId ?? []).map((id) => this.toTagResponse(id));
  }

  toUserMatchProfileResponse(student: Student): UserMatchProfileResponseDto {
    const dto = new UserMatchProfileResponseDto();
    dto.id = student.id;
    dto.career = student.career;
    dto.semester = student.semester;
    dto.tags = student.tagsId;
    dto.schedulesAvailable = student.schedulesAvailability.map(
      (s) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`,
    );
    dto.active = student.isActive;
    return dto;
  }

  toUserMatchProfileResponseFromUser(
    user: User,
  ): UserMatchProfileResponseDto | null {
    if (!(user instanceof Student)) return null;
    return this.toUserMatchProfileResponse(user);
  }

  toProfilePhotoResponse(user: User): UserProfilePhotoResponseDto | null {
    if (!(user instanceof Student)) return null;
    const dto = new UserProfilePhotoResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.profileImageUrl = user.photoUrl ?? '';
    return dto;
  }

  toAuthResponse(user: User): UserAuthResponseDto {
    const dto = new UserAuthResponseDto();
    dto.id = user.id;
    dto.userType = this.resolveUserType(user);
    return dto;
  }

  // ─── Request → Domain ────────────────────────────────────────────────────────

  fromStudentRequest(req: UserStudentRequestDto): Student {
    const student = new Student();
    student.name = req.name;
    student.gender = req.gender;
    student.career = req.career;
    if (req.semester != null) student.semester = req.semester;
    student.studentCarnet = req.studentCarnet;
    student.photoUrl = req.photoUrl ?? null;
    student.biography = req.biography ?? null;
    student.privacyLevel = req.privacyLevel;
    student.dateOfBirth = req.dateOfBirth ? new Date(req.dateOfBirth) : null;
    student.geolocationEnabled = req.geolocationEnabled;
    student.schedulesAvailability = [];
    student.tagsId = [];
    student.friendsId = [];
    return student;
  }

  fromAdminRequest(req: UserAdminRequestDto): Admin {
    const admin = new Admin();
    admin.name = req.name;
    admin.gender = req.gender;
    return admin;
  }

  fromOrganizerRequest(req: UserOrganizerRequestDto): Organizer {
    const organizer = new Organizer();
    organizer.name = req.name;
    organizer.gender = req.gender;
    organizer.contactInfo = req.contactInfo;
    return organizer;
  }

  fromStudentUpdateRequest(req: UserStudentUpdateRequestDto): Student {
    const student = new Student();
    if (req.name !== undefined) student.name = req.name;
    if (req.gender !== undefined) student.gender = req.gender;
    if (req.career !== undefined) student.career = req.career;
    if (req.semester !== undefined) student.semester = req.semester;
    if (req.studentCarnet !== undefined)
      student.studentCarnet = req.studentCarnet;
    if (req.biography !== undefined) student.biography = req.biography ?? null;
    if (req.privacyLevel !== undefined) student.privacyLevel = req.privacyLevel;
    if (req.dateOfBirth !== undefined)
      student.dateOfBirth = new Date(req.dateOfBirth);
    return student;
  }

  fromAdminUpdateRequest(req: UserAdminUpdateRequestDto): Admin {
    const admin = new Admin();
    if (req.name !== undefined) admin.name = req.name;
    if (req.gender !== undefined) admin.gender = req.gender;
    return admin;
  }

  fromOrganizerUpdateRequest(req: UserOrganizerUpdateRequestDto): Organizer {
    const organizer = new Organizer();
    if (req.name !== undefined) organizer.name = req.name;
    if (req.gender !== undefined) organizer.gender = req.gender;
    if (req.contactInfo !== undefined) organizer.contactInfo = req.contactInfo;
    return organizer;
  }

  fromScheduleRequest(req: ScheduleRequestDto): Schedule {
    return new Schedule(req.dayOfWeek, req.name, req.startTime, req.endTime);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private resolveUserType(user: User): string {
    if (user instanceof Student) return 'STUDENT';
    if (user instanceof Admin) return 'ADMIN';
    if (user instanceof Organizer) return 'ORGANIZER';
    return 'UNKNOWN';
  }
}
