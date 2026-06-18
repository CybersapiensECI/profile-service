import { Injectable } from '@nestjs/common';
import { Admin } from '../../../domain/model/admin';
import { Organizer } from '../../../domain/model/organizer';
import { Student } from '../../../domain/model/student';
import { User } from '../../../domain/model/user.entity';
import { InvalidInputException } from '../../../domain/exceptions/invalid-input.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { UserRepositoryPort } from '../../../domain/ports/out/user-repository.port';
import { AdminDocument } from '../persistence/entity/admin.document';
import { OrganizerDocument } from '../persistence/entity/organizer.document';
import { StudentDocument } from '../persistence/entity/student.document';
import { UserType } from '../persistence/entity/user-type.enum';
import { UserPersistenceMapper } from '../persistence/mapper/user-persistence.mapper';
import { UserMongoRepository } from '../persistence/repository/user-mongo.repository';

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    private readonly userMongoRepository: UserMongoRepository,
    private readonly userMapper: UserPersistenceMapper,
  ) {}

  async save(user: Student | Admin | Organizer): Promise<User> {
    if (user instanceof Student) {
      const saved = await this.userMongoRepository.save(
        this.userMapper.studentToDocument(user),
      );
      return this.userMapper.studentToDomain(
        saved as unknown as StudentDocument,
      );
    }
    if (user instanceof Admin) {
      const saved = await this.userMongoRepository.save(
        this.userMapper.adminToDocument(user),
      );
      return this.userMapper.adminToDomain(saved as unknown as AdminDocument);
    }
    if (user instanceof Organizer) {
      const saved = await this.userMongoRepository.save(
        this.userMapper.organizerToDocument(user),
      );
      return this.userMapper.organizerToDomain(
        saved as unknown as OrganizerDocument,
      );
    }
    throw new InvalidInputException('Unsupported user type.');
  }

  async delete(userId: string): Promise<void> {
    await this.userMongoRepository.delete(userId);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userMongoRepository.findById(id);
    return doc ? this.userMapper.toDomainByType(doc) : null;
  }

  async update(id: string, user: User): Promise<User> {
    if (user instanceof Student) {
      const saved = await this.userMongoRepository.update(
        id,
        this.userMapper.studentToDocument(user),
      );
      if (!saved) throw new UserNotFoundException(`User ${id} not found`);
      return this.userMapper.studentToDomain(
        saved as unknown as StudentDocument,
      );
    }
    if (user instanceof Admin) {
      const saved = await this.userMongoRepository.update(
        id,
        this.userMapper.adminToDocument(user),
      );
      if (!saved) throw new UserNotFoundException(`User ${id} not found`);
      return this.userMapper.adminToDomain(saved as unknown as AdminDocument);
    }
    if (user instanceof Organizer) {
      const saved = await this.userMongoRepository.update(
        id,
        this.userMapper.organizerToDocument(user),
      );
      if (!saved) throw new UserNotFoundException(`User ${id} not found`);
      return this.userMapper.organizerToDomain(
        saved as unknown as OrganizerDocument,
      );
    }
    throw new InvalidInputException('Unsupported user type for update.');
  }

  async findAll(): Promise<User[]> {
    const docs = await this.userMongoRepository.findAll();
    return docs
      .map((doc) => this.userMapper.toDomainByType(doc))
      .filter((user): user is User => user !== null);
  }

  async findAllStudents(): Promise<Student[]> {
    const docs = await this.userMongoRepository.findByUserType(
      UserType.STUDENT,
    );
    return docs
      .map((doc) => this.userMapper.toDomainByType(doc))
      .filter((user): user is Student => user instanceof Student);
  }

  async findAllOrganizers(): Promise<Organizer[]> {
    const docs = await this.userMongoRepository.findByUserType(
      UserType.ORGANIZER,
    );
    return docs
      .map((doc) => this.userMapper.toDomainByType(doc))
      .filter((user): user is Organizer => user instanceof Organizer);
  }

  async findAllAdmins(): Promise<Admin[]> {
    const docs = await this.userMongoRepository.findByUserType(UserType.ADMIN);
    return docs
      .map((doc) => this.userMapper.toDomainByType(doc))
      .filter((user): user is Admin => user instanceof Admin);
  }

  async findAllByIds(ids: string[]): Promise<User[]> {
    const docs = await this.userMongoRepository.findAllByIds(ids);
    return docs
      .map((doc) => this.userMapper.toDomainByType(doc))
      .filter((user): user is User => user !== null);
  }
}
