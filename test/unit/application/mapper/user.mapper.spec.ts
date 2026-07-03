import { UserMapper } from 'src/profile/application/mapper/user.mapper';
import { Student } from 'src/profile/domain/model/student';
import { Admin } from 'src/profile/domain/model/admin';
import { Organizer } from 'src/profile/domain/model/organizer';
import { Schedule } from 'src/profile/domain/model/schedule';
import { ProfileServiceException } from 'src/profile/domain/exceptions/profile-service.exception';
import { CareerEnum } from 'src/profile/domain/model/enum/career.enum';
import { GenderEnum } from 'src/profile/domain/model/enum/gender.enum';
import { PrivacyLevelEnum } from 'src/profile/domain/model/enum/privacyLevel.enum';
import { DayOfWeekEnum } from 'src/profile/domain/model/enum/dayOfWeek.enum';
import { StudentProfileResponseDto } from 'src/profile/application/dto/response/student-profile.response.dto';
import { AdminResponseDto } from 'src/profile/application/dto/response/admin.response.dto';
import { OrganizerResponseDto } from 'src/profile/application/dto/response/organizer.response.dto';
import { UserStudentRequestDto } from 'src/profile/application/dto/request/user-student.request.dto';
import { UserAdminRequestDto } from 'src/profile/application/dto/request/user-admin.request.dto';
import { UserOrganizerRequestDto } from 'src/profile/application/dto/request/user-organizer.request.dto';
import { UserStudentUpdateRequestDto } from 'src/profile/application/dto/request/user-student-update.request.dto';
import { UserAdminUpdateRequestDto } from 'src/profile/application/dto/request/user-admin-update.request.dto';
import { UserOrganizerUpdateRequestDto } from 'src/profile/application/dto/request/user-organizer-update.request.dto';
import { ScheduleRequestDto } from 'src/profile/application/dto/request/schedule.request.dto';

function makeStudent(): Student {
  const s = new Student();
  s.id = 'student-1';
  s.name = 'Juan Test';
  s.gender = GenderEnum.MALE;
  s.career = CareerEnum.SYSTEMS_ENGINEERING;
  s.privacyLevel = PrivacyLevelEnum.PUBLIC;
  s.createdAt = new Date('2025-01-01');
  s.tagsId = ['tag-1'];
  s.friendsId = ['friend-1'];
  s.xp = 100;
  s.level = 2;
  s.isActive = true;
  return s;
}

function makeAdmin(): Admin {
  const a = new Admin();
  a.id = 'admin-1';
  a.name = 'Maria Admin';
  a.gender = GenderEnum.FEMALE;
  a.createdAt = new Date('2025-01-01');
  return a;
}

function makeOrganizer(): Organizer {
  const o = new Organizer();
  o.id = 'org-1';
  o.name = 'Org Name';
  o.gender = GenderEnum.OTHER;
  o.contactInfo = 'org@test.com';
  o.createdAt = new Date('2025-01-01');
  return o;
}

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  describe('toResponse', () => {
    it('maps Student → StudentProfileResponseDto', () => {
      const result = mapper.toResponse(makeStudent());
      expect(result).toBeInstanceOf(StudentProfileResponseDto);
      expect(result.userType).toBe('STUDENT');
    });

    it('maps Admin → AdminResponseDto', () => {
      const result = mapper.toResponse(makeAdmin());
      expect(result).toBeInstanceOf(AdminResponseDto);
      expect(result.userType).toBe('ADMIN');
    });

    it('maps Organizer → OrganizerResponseDto', () => {
      const result = mapper.toResponse(makeOrganizer());
      expect(result).toBeInstanceOf(OrganizerResponseDto);
      expect(result.userType).toBe('ORGANIZER');
    });

    it('throws ProfileServiceException for unknown type', () => {
      const unknown = Object.create(null) as Student;
      expect(() => mapper.toResponse(unknown)).toThrow(ProfileServiceException);
    });
  });

  describe('toStudentResponse', () => {
    it('maps all fields including dateOfBirth', () => {
      const student = makeStudent();
      student.dateOfBirth = new Date('2000-06-15');
      student.biography = 'Test bio';

      const dto = mapper.toStudentResponse(student);

      expect(dto.id).toBe('student-1');
      expect(dto.career).toBe(CareerEnum.SYSTEMS_ENGINEERING);
      expect(dto.xp).toBe(100);
      expect(dto.level).toBe(2);
      expect(dto.active).toBe(true);
      expect(dto.friendsId).toEqual(['friend-1']);
      expect(dto.dateOfBirth).toBe('2000-06-15');
      expect(dto.tags).toHaveLength(1);
    });

    it('maps null dateOfBirth to null', () => {
      const student = makeStudent();
      student.dateOfBirth = null;
      expect(mapper.toStudentResponse(student).dateOfBirth).toBeNull();
    });
  });

  describe('toAdminResponse', () => {
    it('maps id, name and userType', () => {
      const dto = mapper.toAdminResponse(makeAdmin());
      expect(dto.id).toBe('admin-1');
      expect(dto.name).toBe('Maria Admin');
      expect(dto.userType).toBe('ADMIN');
    });
  });

  describe('toOrganizerResponse', () => {
    it('maps contactInfo and userType', () => {
      const dto = mapper.toOrganizerResponse(makeOrganizer());
      expect(dto.contactInfo).toBe('org@test.com');
      expect(dto.userType).toBe('ORGANIZER');
    });
  });

  describe('toScheduleResponseList', () => {
    it('maps a list of schedules', () => {
      const sched = new Schedule(DayOfWeekEnum.MONDAY, 'Math', '07:00', '08:30');
      const result = mapper.toScheduleResponseList([sched]);
      expect(result).toHaveLength(1);
      expect(result[0].dayOfWeek).toBe(DayOfWeekEnum.MONDAY);
    });

    it('returns empty array for null input', () => {
      expect(mapper.toScheduleResponseList(null as never)).toEqual([]);
    });
  });

  describe('toTagResponseList', () => {
    it('maps tag ids to TagResponseDto list', () => {
      const result = mapper.toTagResponseList(['t1', 't2']);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('t1');
    });
  });

  describe('toUserMatchProfileResponse', () => {
    it('maps student to match profile dto', () => {
      const student = makeStudent();
      student.schedulesAvailability = [
        new Schedule(DayOfWeekEnum.MONDAY, 'Math', '07:00', '08:30'),
      ];
      const dto = mapper.toUserMatchProfileResponse(student);
      expect(dto.id).toBe('student-1');
      expect(dto.tags).toEqual(['tag-1']);
      expect(dto.schedulesAvailable).toHaveLength(1);
    });
  });

  describe('toUserMatchProfileResponseFromUser', () => {
    it('returns null for non-student', () => {
      expect(mapper.toUserMatchProfileResponseFromUser(makeAdmin())).toBeNull();
    });

    it('returns dto for student', () => {
      expect(mapper.toUserMatchProfileResponseFromUser(makeStudent())).not.toBeNull();
    });
  });

  describe('toProfilePhotoResponse', () => {
    it('returns null for non-student', () => {
      expect(mapper.toProfilePhotoResponse(makeAdmin())).toBeNull();
    });

    it('returns dto with photoUrl for student', () => {
      const student = makeStudent();
      student.photoUrl = 'https://example.com/photo.jpg';
      expect(mapper.toProfilePhotoResponse(student)?.profileImageUrl).toBe('https://example.com/photo.jpg');
    });
  });

  describe('toAuthResponse', () => {
    it('resolves STUDENT type', () => { expect(mapper.toAuthResponse(makeStudent()).userType).toBe('STUDENT'); });
    it('resolves ADMIN type', () => { expect(mapper.toAuthResponse(makeAdmin()).userType).toBe('ADMIN'); });
    it('resolves ORGANIZER type', () => { expect(mapper.toAuthResponse(makeOrganizer()).userType).toBe('ORGANIZER'); });
  });

  describe('fromStudentRequest', () => {
    it('maps request to Student domain', () => {
      const req = new UserStudentRequestDto();
      req.name = 'New Student';
      req.gender = GenderEnum.FEMALE;
      req.career = CareerEnum.MATHEMATICS;
      req.semester = 3;
      req.studentCarnet = '2023123456';
      req.privacyLevel = PrivacyLevelEnum.PRIVATE;
      req.geolocationEnabled = true;

      const student = mapper.fromStudentRequest(req);

      expect(student).toBeInstanceOf(Student);
      expect(student.name).toBe('New Student');
      expect(student.semester).toBe(3);
      expect(student.tagsId).toEqual([]);
    });
  });

  describe('fromAdminRequest', () => {
    it('maps request to Admin domain', () => {
      const req = new UserAdminRequestDto();
      req.name = 'New Admin';
      req.gender = GenderEnum.MALE;
      expect(mapper.fromAdminRequest(req)).toBeInstanceOf(Admin);
    });
  });

  describe('fromOrganizerRequest', () => {
    it('maps request to Organizer domain', () => {
      const req = new UserOrganizerRequestDto();
      req.name = 'New Org';
      req.gender = GenderEnum.OTHER;
      req.contactInfo = 'org@new.com';
      const org = mapper.fromOrganizerRequest(req);
      expect(org).toBeInstanceOf(Organizer);
      expect(org.contactInfo).toBe('org@new.com');
    });
  });

  describe('fromStudentUpdateRequest', () => {
    it('maps all defined fields', () => {
      const req = new UserStudentUpdateRequestDto();
      req.name = 'Updated';
      req.gender = GenderEnum.FEMALE;
      req.career = CareerEnum.SYSTEMS_ENGINEERING;
      req.semester = 2;
      req.studentCarnet = '2023123456';
      req.biography = 'Updated bio';
      req.privacyLevel = PrivacyLevelEnum.PRIVATE;
      req.dateOfBirth = '2000-06-15';
      const student = mapper.fromStudentUpdateRequest(req);
      expect(student.name).toBe('Updated');
      expect(student.studentCarnet).toBe('2023123456');
      expect(student.dateOfBirth).toBeInstanceOf(Date);
    });
  });

  describe('fromAdminUpdateRequest', () => {
    it('maps all defined fields', () => {
      const req = new UserAdminUpdateRequestDto();
      req.name = 'Updated Admin';
      req.gender = GenderEnum.MALE;
      const admin = mapper.fromAdminUpdateRequest(req);
      expect(admin.name).toBe('Updated Admin');
      expect(admin.gender).toBe(GenderEnum.MALE);
    });
  });

  describe('fromOrganizerUpdateRequest', () => {
    it('maps all defined fields', () => {
      const req = new UserOrganizerUpdateRequestDto();
      req.name = 'Updated Org';
      req.gender = GenderEnum.OTHER;
      req.contactInfo = 'new@contact.com';
      const org = mapper.fromOrganizerUpdateRequest(req);
      expect(org.contactInfo).toBe('new@contact.com');
      expect(org.name).toBe('Updated Org');
      expect(org.gender).toBe(GenderEnum.OTHER);
    });
  });

  describe('fromScheduleRequest', () => {
    it('creates Schedule from request dto', () => {
      const req = new ScheduleRequestDto();
      req.dayOfWeek = DayOfWeekEnum.FRIDAY;
      req.name = 'Programming';
      req.startTime = '14:00';
      req.endTime = '15:30';

      const schedule = mapper.fromScheduleRequest(req);

      expect(schedule).toBeInstanceOf(Schedule);
      expect(schedule.startTime).toBe('14:00');
    });
  });
});
