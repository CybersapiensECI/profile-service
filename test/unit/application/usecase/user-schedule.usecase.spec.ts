import { HttpStatus } from '@nestjs/common';
import { UserScheduleUseCase } from 'src/profile/application/usecase/user-schedule.usecase';
import type { UserRepositoryPort } from 'src/profile/domain/ports/out/user-repository.port';
import { Student } from 'src/profile/domain/model/student';
import { Admin } from 'src/profile/domain/model/admin';
import { Schedule } from 'src/profile/domain/model/schedule';
import { CareerEnum } from 'src/profile/domain/model/enum/career.enum';
import { GenderEnum } from 'src/profile/domain/model/enum/gender.enum';
import { PrivacyLevelEnum } from 'src/profile/domain/model/enum/privacyLevel.enum';
import { DayOfWeekEnum } from 'src/profile/domain/model/enum/dayOfWeek.enum';

function makeStudent(id = 'user-1'): Student {
  const s = new Student();
  s.id = id;
  s.name = 'Test User';
  s.gender = GenderEnum.MALE;
  s.career = CareerEnum.SYSTEMS_ENGINEERING;
  s.privacyLevel = PrivacyLevelEnum.PUBLIC;
  return s;
}

function makeAdmin(): Admin {
  const a = new Admin();
  a.id = 'admin-1';
  a.name = 'Admin User';
  a.gender = GenderEnum.FEMALE;
  return a;
}

function makeRepo(): jest.Mocked<UserRepositoryPort> {
  return { save: jest.fn(), findById: jest.fn(), update: jest.fn(), delete: jest.fn(), findAll: jest.fn(), findAllStudents: jest.fn(), findAllOrganizers: jest.fn(), findAllAdmins: jest.fn(), findAllByIds: jest.fn() };
}

const S_MON_07 = new Schedule(DayOfWeekEnum.MONDAY, 'Math', '07:00', '08:30');
const S_MON_09 = new Schedule(DayOfWeekEnum.MONDAY, 'Physics', '09:00', '10:30');
const S_TUE_07 = new Schedule(DayOfWeekEnum.TUESDAY, 'History', '07:00', '08:30');

describe('UserScheduleUseCase', () => {
  let useCase: UserScheduleUseCase;
  let repo: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new UserScheduleUseCase(repo);
  });

  describe('addScheduleToStudent', () => {
    it('adds a non-overlapping schedule', async () => {
      const student = makeStudent();
      student.schedulesAvailability = [S_MON_09];
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.addScheduleToStudent('user-1', S_MON_07);

      expect(student.schedulesAvailability).toHaveLength(2);
    });

    it('adds schedule on a different day without conflict', async () => {
      const student = makeStudent();
      student.schedulesAvailability = [S_MON_07];
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.addScheduleToStudent('user-1', S_TUE_07);

      expect(student.schedulesAvailability).toHaveLength(2);
    });

    it('throws InvalidInputException on overlapping schedule', async () => {
      const student = makeStudent();
      student.schedulesAvailability = [S_MON_07];
      repo.findById.mockResolvedValue(student);

      const overlap = new Schedule(DayOfWeekEnum.MONDAY, 'Overlap', '07:30', '09:00');
      await expect(useCase.addScheduleToStudent('user-1', overlap)).rejects.toMatchObject({
        message: expect.stringContaining('overlaps'),
      });
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.addScheduleToStudent('x', S_MON_07)).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws BAD_REQUEST when user is not a student', async () => {
      repo.findById.mockResolvedValue(makeAdmin());
      await expect(useCase.addScheduleToStudent('admin-1', S_MON_07)).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });

  describe('removeScheduleFromStudent', () => {
    it('removes a matching schedule', async () => {
      const student = makeStudent();
      student.schedulesAvailability = [S_MON_07, S_MON_09];
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.removeScheduleFromStudent('user-1', S_MON_07);

      expect(student.schedulesAvailability).toHaveLength(1);
      expect(student.schedulesAvailability[0].startTime).toBe('09:00');
    });

    it('throws BAD_REQUEST when schedule is not found', async () => {
      const student = makeStudent();
      student.schedulesAvailability = [S_MON_09];
      repo.findById.mockResolvedValue(student);
      await expect(useCase.removeScheduleFromStudent('user-1', S_MON_07)).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.removeScheduleFromStudent('x', S_MON_07)).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });
  });

  describe('Schedule domain validation', () => {
    it('rejects duration different from 90 minutes', () => {
      expect(() => new Schedule(DayOfWeekEnum.MONDAY, 'Short', '07:00', '08:00')).toThrow();
    });

    it('rejects start time after end time', () => {
      expect(() => new Schedule(DayOfWeekEnum.MONDAY, 'Bad', '09:00', '07:30')).toThrow();
    });

    it('rejects null day of week', () => {
      expect(() => new Schedule(null as unknown as DayOfWeekEnum, 'No day', '07:00', '08:30')).toThrow();
    });
  });
});
