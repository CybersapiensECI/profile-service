import { HttpStatus } from '@nestjs/common';
import { UserManagementUseCase } from 'src/profile/application/usecase/user-management.usecase';
import type { UserRepositoryPort } from 'src/profile/domain/ports/out/user-repository.port';
import type { TagCatalogPort } from 'src/profile/domain/ports/out/tag-catalog.port';
import { Student } from 'src/profile/domain/model/student';
import { Admin } from 'src/profile/domain/model/admin';
import { Organizer } from 'src/profile/domain/model/organizer';
import { CategoryWithTags } from 'src/profile/domain/model/category-with-tags';
import { CareerEnum } from 'src/profile/domain/model/enum/career.enum';
import { GenderEnum } from 'src/profile/domain/model/enum/gender.enum';
import { PrivacyLevelEnum } from 'src/profile/domain/model/enum/privacyLevel.enum';

function makeStudent(id = 'u1'): Student {
  const s = new Student();
  s.id = id;
  s.name = 'Test User';
  s.gender = GenderEnum.MALE;
  s.career = CareerEnum.SYSTEMS_ENGINEERING;
  s.privacyLevel = PrivacyLevelEnum.PUBLIC;
  return s;
}

function makeAdmin(id = 'a1'): Admin {
  const a = new Admin();
  a.id = id;
  a.name = 'Admin User';
  a.gender = GenderEnum.FEMALE;
  return a;
}

function makeOrganizer(id = 'o1'): Organizer {
  const o = new Organizer();
  o.id = id;
  o.name = 'Org User';
  o.gender = GenderEnum.OTHER;
  o.contactInfo = 'org@test.com';
  return o;
}

function makeRepo(): jest.Mocked<UserRepositoryPort> {
  return { save: jest.fn(), findById: jest.fn(), update: jest.fn(), delete: jest.fn(), findAll: jest.fn(), findAllStudents: jest.fn(), findAllOrganizers: jest.fn(), findAllAdmins: jest.fn(), findAllByIds: jest.fn() };
}

function makeCatalog(): jest.Mocked<TagCatalogPort> {
  return { getAllCategoriesWithTags: jest.fn(), tagExists: jest.fn(), getTagNameById: jest.fn() };
}

describe('UserManagementUseCase', () => {
  let useCase: UserManagementUseCase;
  let repo: jest.Mocked<UserRepositoryPort>;
  let catalog: jest.Mocked<TagCatalogPort>;

  beforeEach(() => {
    repo = makeRepo();
    catalog = makeCatalog();
    useCase = new UserManagementUseCase(repo, catalog);
  });

  it('createStudentUser saves and returns the student', async () => {
    const s = makeStudent();
    repo.save.mockResolvedValue(s);
    expect(await useCase.createStudentUser(s)).toBe(s);
  });

  it('createAdminUser saves and returns the admin', async () => {
    const a = makeAdmin();
    repo.save.mockResolvedValue(a);
    expect(await useCase.createAdminUser(a)).toBe(a);
  });

  it('createOrganizerUser saves and returns the organizer', async () => {
    const o = makeOrganizer();
    repo.save.mockResolvedValue(o);
    expect(await useCase.createOrganizerUser(o)).toBe(o);
  });

  describe('getUser', () => {
    it('returns the user when found', async () => {
      const s = makeStudent();
      repo.findById.mockResolvedValue(s);
      expect(await useCase.getUser('u1')).toBe(s);
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.getUser('x')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });
  });

  it('getAllUsers returns all users from repository', async () => {
    repo.findAll.mockResolvedValue([makeStudent(), makeAdmin()]);
    expect(await useCase.getAllUsers()).toHaveLength(2);
  });

  it('getAllStudentProfiles returns all students', async () => {
    repo.findAllStudents.mockResolvedValue([makeStudent('u1'), makeStudent('u2')]);
    expect(await useCase.getAllStudentProfiles()).toHaveLength(2);
  });

  it('getUsersByIds delegates to repository', async () => {
    repo.findAllByIds.mockResolvedValue([makeStudent()]);
    await useCase.getUsersByIds(['u1']);
    expect(repo.findAllByIds).toHaveBeenCalledWith(['u1']);
  });

  it('getTagCatalog delegates to catalog port', async () => {
    const cats: CategoryWithTags[] = [{ id: 'c1', name: 'Cat', tags: [] }];
    catalog.getAllCategoriesWithTags.mockResolvedValue(cats);
    expect(await useCase.getTagCatalog()).toBe(cats);
  });

  describe('deleteUser', () => {
    it('deletes a student with no friends', async () => {
      repo.findById.mockResolvedValue(makeStudent());
      await useCase.deleteUser('u1');
      expect(repo.delete).toHaveBeenCalledWith('u1');
    });

    it('removes user from friends lists before deleting', async () => {
      const s1 = makeStudent('u1');
      s1.friendsId = ['u2'];
      const s2 = makeStudent('u2');
      s2.friendsId = ['u1'];
      repo.findById.mockImplementation((id) =>
        Promise.resolve(id === 'u1' ? s1 : id === 'u2' ? s2 : null),
      );
      repo.update.mockResolvedValue(s2);

      await useCase.deleteUser('u1');

      expect(s2.friendsId).not.toContain('u1');
      expect(repo.delete).toHaveBeenCalledWith('u1');
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.deleteUser('x')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });
  });

  describe('updateUser', () => {
    it('updates student fields', async () => {
      const existing = makeStudent('u1');
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(existing);

      const patch = new Student();
      patch.name = 'New Name';
      patch.career = CareerEnum.COMPUTER_SCIENCE;
      patch.studentCarnet = '2023123456';
      patch.privacyLevel = PrivacyLevelEnum.PRIVATE;
      await useCase.updateUser('u1', patch);

      expect(existing.name).toBe('New Name');
      expect(existing.career).toBe(CareerEnum.COMPUTER_SCIENCE);
      expect(existing.studentCarnet).toBe('2023123456');
      expect(existing.privacyLevel).toBe(PrivacyLevelEnum.PRIVATE);
    });

    it('updates admin fields', async () => {
      const existing = makeAdmin('a1');
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(existing);

      const patch = new Admin();
      patch.name = 'New Admin';
      await useCase.updateUser('a1', patch);

      expect(existing.name).toBe('New Admin');
    });

    it('updates organizer fields', async () => {
      const existing = makeOrganizer('o1');
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(existing);

      const patch = new Organizer();
      patch.contactInfo = 'new@contact.com';
      await useCase.updateUser('o1', patch);

      expect(existing.contactInfo).toBe('new@contact.com');
    });

    it('throws BAD_REQUEST when stored type does not match patch type', async () => {
      repo.findById.mockResolvedValue(makeAdmin('u1'));
      await expect(useCase.updateUser('u1', new Student())).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws BAD_REQUEST for unsupported user type in update', async () => {
      const unknown = Object.create(null) as Student;
      await expect(useCase.updateUser('u1', unknown)).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws BAD_REQUEST when admin patch targets a non-admin stored user', async () => {
      repo.findById.mockResolvedValue(makeStudent('u1'));
      await expect(useCase.updateUser('u1', new Admin())).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws BAD_REQUEST when organizer patch targets a non-organizer stored user', async () => {
      repo.findById.mockResolvedValue(makeStudent('u1'));
      await expect(useCase.updateUser('u1', new Organizer())).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });

  describe('Student and User domain model validation', () => {
    it('throws for name shorter than 2 characters', () => {
      expect(() => { makeStudent().name = 'X'; }).toThrow();
    });

    it('throws for null gender', () => {
      const s = new Student();
      expect(() => { s.gender = null as unknown as GenderEnum; }).toThrow();
    });

    it('throws for a future dateOfBirth', () => {
      expect(() => { makeStudent().dateOfBirth = new Date('2099-01-01'); }).toThrow();
    });

    it('throws for null career', () => {
      const s = new Student();
      expect(() => { s.career = null as unknown as CareerEnum; }).toThrow();
    });

    it('throws for semester out of range', () => {
      expect(() => { makeStudent().semester = 11; }).toThrow();
    });

    it('throws for null privacy level', () => {
      const s = new Student();
      expect(() => { s.privacyLevel = null as unknown as PrivacyLevelEnum; }).toThrow();
    });

    it('throws for blank photoUrl', () => {
      expect(() => { makeStudent().photoUrl = '   '; }).toThrow();
    });

    it('throws for biography exceeding 200 characters', () => {
      expect(() => { makeStudent().biography = 'a'.repeat(201); }).toThrow();
    });

    it('throws for carnet with invalid format', () => {
      expect(() => { makeStudent().studentCarnet = 'ABC123'; }).toThrow();
    });
  });
});
