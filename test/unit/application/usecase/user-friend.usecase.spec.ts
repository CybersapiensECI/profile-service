import { HttpStatus } from '@nestjs/common';
import { UserFriendUseCase } from 'src/profile/application/usecase/user-friend.usecase';
import type { UserRepositoryPort } from 'src/profile/domain/ports/out/user-repository.port';
import type { EventPublisherPort } from 'src/profile/domain/ports/out/event-publisher.port';
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
  return { save: jest.fn(), findById: jest.fn(), update: jest.fn(), delete: jest.fn(), findAll: jest.fn(), findAllStudents: jest.fn(), findAllOrganizers: jest.fn(), findAllAdmins: jest.fn(), findAllByIds: jest.fn() };
}

function makePublisher(): jest.Mocked<EventPublisherPort> {
  return { publishFriendshipCreated: jest.fn().mockResolvedValue(undefined) };
}

describe('UserFriendUseCase', () => {
  let useCase: UserFriendUseCase;
  let repo: jest.Mocked<UserRepositoryPort>;
  let publisher: jest.Mocked<EventPublisherPort>;

  beforeEach(() => {
    repo = makeRepo();
    publisher = makePublisher();
    useCase = new UserFriendUseCase(repo, publisher);
  });

  describe('getUserFriends', () => {
    it('returns friend ids of a student', async () => {
      const student = makeStudent();
      student.friendsId = ['f1', 'f2'];
      repo.findById.mockResolvedValue(student);
      expect(await useCase.getUserFriends('user-1')).toEqual(['f1', 'f2']);
    });

    it('returns empty array when student has no friends', async () => {
      repo.findById.mockResolvedValue(makeStudent());
      expect(await useCase.getUserFriends('user-1')).toEqual([]);
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.getUserFriends('x')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws BAD_REQUEST when user is not a student', async () => {
      repo.findById.mockResolvedValue(makeAdmin());
      await expect(useCase.getUserFriends('admin-1')).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });

  describe('addFriendToStudent', () => {
    it('adds friend bidirectionally and publishes event', async () => {
      const s1 = makeStudent('u1');
      const s2 = makeStudent('u2');
      repo.findById.mockImplementation((id) => Promise.resolve(id === 'u1' ? s1 : s2));
      repo.update.mockResolvedValue(s1);

      await useCase.addFriendToStudent('u1', 'u2');

      expect(s1.friendsId).toContain('u2');
      expect(s2.friendsId).toContain('u1');
      expect(publisher.publishFriendshipCreated).toHaveBeenCalledWith('u1', 'u2');
    });

    it('throws when user tries to add themselves', async () => {
      await expect(useCase.addFriendToStudent('u1', 'u1')).rejects.toMatchObject({
        message: expect.stringContaining('themselves'),
      });
    });

    it('throws NOT_FOUND when friend does not exist', async () => {
      repo.findById.mockImplementation((id) =>
        Promise.resolve(id === 'u1' ? makeStudent('u1') : null),
      );
      await expect(useCase.addFriendToStudent('u1', 'u2')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws when friend is not a student', async () => {
      repo.findById.mockImplementation((id) =>
        Promise.resolve(id === 'u1' ? makeStudent('u1') : makeAdmin('u2')),
      );
      await expect(useCase.addFriendToStudent('u1', 'u2')).rejects.toMatchObject({
        message: expect.stringContaining('STUDENT'),
      });
    });

    it('throws when user is already a friend', async () => {
      const s1 = makeStudent('u1');
      s1.friendsId = ['u2'];
      repo.findById.mockImplementation((id) => Promise.resolve(id === 'u1' ? s1 : makeStudent('u2')));
      await expect(useCase.addFriendToStudent('u1', 'u2')).rejects.toMatchObject({
        message: expect.stringContaining('already a friend'),
      });
    });

    it('throws NOT_FOUND when requesting user does not exist', async () => {
      repo.findById.mockImplementation((id) =>
        Promise.resolve(id === 'u2' ? makeStudent('u2') : null),
      );
      await expect(useCase.addFriendToStudent('u1', 'u2')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });
  });

  describe('removeFriendFromStudent', () => {
    it('removes friend from both sides', async () => {
      const s1 = makeStudent('u1');
      s1.friendsId = ['u2'];
      const s2 = makeStudent('u2');
      s2.friendsId = ['u1'];
      repo.findById.mockImplementation((id) => Promise.resolve(id === 'u1' ? s1 : s2));
      repo.update.mockResolvedValue(s1);

      await useCase.removeFriendFromStudent('u1', 'u2');

      expect(s1.friendsId).not.toContain('u2');
      expect(s2.friendsId).not.toContain('u1');
    });

    it('skips other-side removal when friend no longer has the user', async () => {
      const s1 = makeStudent('u1');
      s1.friendsId = ['u2'];
      const s2 = makeStudent('u2');
      s2.friendsId = [];
      repo.findById.mockImplementation((id) => Promise.resolve(id === 'u1' ? s1 : s2));
      repo.update.mockResolvedValue(s1);

      await useCase.removeFriendFromStudent('u1', 'u2');

      expect(s1.friendsId).not.toContain('u2');
    });

    it('throws BAD_REQUEST when friend is not in list', async () => {
      const s1 = makeStudent('u1');
      s1.friendsId = [];
      repo.findById.mockResolvedValue(s1);
      await expect(useCase.removeFriendFromStudent('u1', 'u2')).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.removeFriendFromStudent('x', 'u2')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });
  });
});
