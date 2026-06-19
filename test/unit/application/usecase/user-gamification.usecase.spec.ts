import { HttpStatus } from '@nestjs/common';
import { UserGamificationUseCase } from 'src/profile/application/usecase/user-gamification.usecase';
import type { UserRepositoryPort } from 'src/profile/domain/ports/out/user-repository.port';
import { Student } from 'src/profile/domain/model/student';
import { Admin } from 'src/profile/domain/model/admin';
import { CareerEnum } from 'src/profile/domain/model/enum/career.enum';
import { GenderEnum } from 'src/profile/domain/model/enum/gender.enum';
import { PrivacyLevelEnum } from 'src/profile/domain/model/enum/privacyLevel.enum';

function makeStudent(id = 'user-1'): Student {
  const s = new Student();
  s.id = id;
  s.name = 'Test User';
  s.gender = GenderEnum.MALE;
  s.career = CareerEnum.SYSTEMS_ENGINEERING;
  s.privacyLevel = PrivacyLevelEnum.PUBLIC;
  return s;
}

function makeAdmin(id = 'admin-1'): Admin {
  const a = new Admin();
  a.id = id;
  a.name = 'Admin User';
  a.gender = GenderEnum.FEMALE;
  return a;
}

function makeRepo(): jest.Mocked<UserRepositoryPort> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findAllStudents: jest.fn(),
    findAllOrganizers: jest.fn(),
    findAllAdmins: jest.fn(),
    findAllByIds: jest.fn(),
  };
}

describe('UserGamificationUseCase', () => {
  let useCase: UserGamificationUseCase;
  let repo: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new UserGamificationUseCase(repo);
  });

  describe('updateXp', () => {
    it('updates xp on a student', async () => {
      const student = makeStudent();
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.updateXp('user-1', 250);

      expect(student.xp).toBe(250);
      expect(repo.update).toHaveBeenCalledWith('user-1', student);
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.updateXp('x', 10)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws BAD_REQUEST when user is not a student', async () => {
      repo.findById.mockResolvedValue(makeAdmin());
      await expect(useCase.updateXp('admin-1', 10)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('updateLevel', () => {
    it('updates level on a student', async () => {
      const student = makeStudent();
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.updateLevel('user-1', 5);

      expect(student.level).toBe(5);
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.updateLevel('x', 1)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws BAD_REQUEST when user is not a student', async () => {
      repo.findById.mockResolvedValue(makeAdmin());
      await expect(useCase.updateLevel('admin-1', 1)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('updateActiveStatus', () => {
    it('sets isActive to true', async () => {
      const student = makeStudent();
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.updateActiveStatus('user-1', true);

      expect(student.isActive).toBe(true);
    });

    it('sets isActive to false', async () => {
      const student = makeStudent();
      student.isActive = true;
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.updateActiveStatus('user-1', false);

      expect(student.isActive).toBe(false);
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.updateActiveStatus('x', true)).rejects.toMatchObject(
        { status: HttpStatus.NOT_FOUND },
      );
    });

    it('throws BAD_REQUEST when user is not a student', async () => {
      repo.findById.mockResolvedValue(makeAdmin());
      await expect(
        useCase.updateActiveStatus('admin-1', true),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });
});
