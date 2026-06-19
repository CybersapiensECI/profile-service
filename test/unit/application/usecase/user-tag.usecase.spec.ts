import { HttpStatus } from '@nestjs/common';
import { UserTagUseCase } from 'src/profile/application/usecase/user-tag.usecase';
import type { UserRepositoryPort } from 'src/profile/domain/ports/out/user-repository.port';
import type { TagCatalogPort } from 'src/profile/domain/ports/out/tag-catalog.port';
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

function makeCatalog(): jest.Mocked<TagCatalogPort> {
  return { getAllCategoriesWithTags: jest.fn(), tagExists: jest.fn(), getTagNameById: jest.fn() };
}

describe('UserTagUseCase', () => {
  let useCase: UserTagUseCase;
  let repo: jest.Mocked<UserRepositoryPort>;
  let catalog: jest.Mocked<TagCatalogPort>;

  beforeEach(() => {
    repo = makeRepo();
    catalog = makeCatalog();
    useCase = new UserTagUseCase(repo, catalog);
  });

  describe('addTagToStudent', () => {
    it('adds a valid tag to the student', async () => {
      const student = makeStudent();
      catalog.tagExists.mockResolvedValue(true);
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.addTagToStudent('user-1', 'tag-abc');

      expect(student.tagsId).toContain('tag-abc');
      expect(repo.update).toHaveBeenCalledWith('user-1', student);
    });

    it('throws when tag does not exist in catalog', async () => {
      catalog.tagExists.mockResolvedValue(false);
      await expect(useCase.addTagToStudent('user-1', 'bad-tag')).rejects.toMatchObject({
        message: expect.stringContaining('Tag not found'),
      });
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      catalog.tagExists.mockResolvedValue(true);
      repo.findById.mockResolvedValue(null);
      await expect(useCase.addTagToStudent('x', 'tag-1')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws BAD_REQUEST when user is not a student', async () => {
      catalog.tagExists.mockResolvedValue(true);
      repo.findById.mockResolvedValue(makeAdmin());
      await expect(useCase.addTagToStudent('admin-1', 'tag-1')).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws CONFLICT when tag is already assigned', async () => {
      const student = makeStudent();
      student.tagsId = ['tag-1'];
      catalog.tagExists.mockResolvedValue(true);
      repo.findById.mockResolvedValue(student);
      await expect(useCase.addTagToStudent('user-1', 'tag-1')).rejects.toMatchObject({ status: HttpStatus.CONFLICT });
    });
  });

  describe('removeTagFromStudent', () => {
    it('removes an existing tag', async () => {
      const student = makeStudent();
      student.tagsId = ['tag-1', 'tag-2'];
      repo.findById.mockResolvedValue(student);
      repo.update.mockResolvedValue(student);

      await useCase.removeTagFromStudent('user-1', 'tag-1');

      expect(student.tagsId).toEqual(['tag-2']);
    });

    it('throws BAD_REQUEST when tag is not assigned', async () => {
      const student = makeStudent();
      student.tagsId = ['tag-2'];
      repo.findById.mockResolvedValue(student);
      await expect(useCase.removeTagFromStudent('user-1', 'tag-x')).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.removeTagFromStudent('x', 'tag-1')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });
  });

  describe('getUserTags', () => {
    it('returns the student tag ids', async () => {
      const student = makeStudent();
      student.tagsId = ['t1', 't2'];
      repo.findById.mockResolvedValue(student);
      expect(await useCase.getUserTags('user-1')).toEqual(['t1', 't2']);
    });

    it('returns empty array when student has no tags', async () => {
      repo.findById.mockResolvedValue(makeStudent());
      expect(await useCase.getUserTags('user-1')).toEqual([]);
    });
  });

  describe('getUserTagsNames', () => {
    it('resolves tag names from catalog', async () => {
      const student = makeStudent();
      student.tagsId = ['t1', 't2'];
      repo.findById.mockResolvedValue(student);
      catalog.getTagNameById.mockImplementation((id) => Promise.resolve(`Name-${id}`));
      expect(await useCase.getUserTagsNames('user-1')).toEqual(['Name-t1', 'Name-t2']);
    });

    it('returns empty array when student has no tags', async () => {
      repo.findById.mockResolvedValue(makeStudent());
      expect(await useCase.getUserTagsNames('user-1')).toEqual([]);
    });
  });
});
