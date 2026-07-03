import { HttpStatus } from '@nestjs/common';
import { UserMediaUseCase } from 'src/profile/application/usecase/user-media.usecase';
import type { UserRepositoryPort } from 'src/profile/domain/ports/out/user-repository.port';
import type { ImageStoragePort } from 'src/profile/domain/ports/out/image-storage.port';
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

function makeStorage(): jest.Mocked<ImageStoragePort> {
  return { uploadProfileImage: jest.fn(), deleteProfileImage: jest.fn() };
}

const VALID_PNG = Buffer.alloc(100, 1);

describe('UserMediaUseCase', () => {
  let useCase: UserMediaUseCase;
  let repo: jest.Mocked<UserRepositoryPort>;
  let storage: jest.Mocked<ImageStoragePort>;

  beforeEach(() => {
    repo = makeRepo();
    storage = makeStorage();
    useCase = new UserMediaUseCase(repo, storage);
  });

  describe('updateProfileImage', () => {
    it('uploads image and updates student photoUrl', async () => {
      const student = makeStudent();
      repo.findById.mockResolvedValue(student);
      storage.uploadProfileImage.mockResolvedValue('https://cdn.example.com/photo.png');
      repo.update.mockResolvedValue(student);

      await useCase.updateProfileImage('user-1', VALID_PNG, 'image/png');

      expect(storage.uploadProfileImage).toHaveBeenCalledWith(VALID_PNG, 'user-1', 'image/png');
      expect(student.photoUrl).toBe('https://cdn.example.com/photo.png');
    });

    it('accepts jpeg content type', async () => {
      const student = makeStudent();
      repo.findById.mockResolvedValue(student);
      storage.uploadProfileImage.mockResolvedValue('https://cdn.example.com/photo.jpg');
      repo.update.mockResolvedValue(student);

      await useCase.updateProfileImage('user-1', VALID_PNG, 'image/jpeg');

      expect(storage.uploadProfileImage).toHaveBeenCalled();
    });

    it('throws when buffer is empty', async () => {
      await expect(
        useCase.updateProfileImage('user-1', Buffer.alloc(0), 'image/png'),
      ).rejects.toMatchObject({ message: expect.stringContaining('empty') });
    });

    it('throws when file exceeds 5MB', async () => {
      await expect(
        useCase.updateProfileImage('user-1', Buffer.alloc(6 * 1024 * 1024, 1), 'image/png'),
      ).rejects.toMatchObject({ message: expect.stringContaining('5MB') });
    });

    it('throws when content type is not allowed', async () => {
      await expect(
        useCase.updateProfileImage('user-1', VALID_PNG, 'image/gif'),
      ).rejects.toMatchObject({ message: expect.stringContaining('PNG and JPEG') });
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.updateProfileImage('x', VALID_PNG, 'image/png')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws BAD_REQUEST when user is not a student', async () => {
      repo.findById.mockResolvedValue(makeAdmin());
      await expect(useCase.updateProfileImage('admin-1', VALID_PNG, 'image/png')).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });

  describe('updateGeolocation', () => {
    it('enables geolocation for a student', async () => {
      const student = makeStudent();
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.updateGeolocation('user-1', true);

      expect(student.geolocationEnabled).toBe(true);
    });

    it('disables geolocation for a student', async () => {
      const student = makeStudent();
      student.geolocationEnabled = true;
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.updateGeolocation('user-1', false);

      expect(student.geolocationEnabled).toBe(false);
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.updateGeolocation('x', true)).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws BAD_REQUEST when user is not a student', async () => {
      repo.findById.mockResolvedValue(makeAdmin());
      await expect(useCase.updateGeolocation('admin-1', true)).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });
});
