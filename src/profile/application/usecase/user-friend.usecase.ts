import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InvalidInputException } from '../../domain/exceptions/invalid-input.exception';
import { ProfileServiceException } from '../../domain/exceptions/profile-service.exception';
import { Student } from '../../domain/model/student';
import { User } from '../../domain/model/user.entity';
import type { UserFriendPort } from '../../domain/ports/in/user-friend.port';
import {
  EVENT_PUBLISHER_PORT,
  USER_REPOSITORY_PORT,
} from '../../domain/ports/injection-tokens';
import type { EventPublisherPort } from '../../domain/ports/out/event-publisher.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';

@Injectable()
export class UserFriendUseCase implements UserFriendPort {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async getUserFriends(userId: string): Promise<string[]> {
    const student = await this.findStudentOrThrow(userId);
    return student.friendsId ?? [];
  }

  async addFriendToStudent(userId: string, friendId: string): Promise<User> {
    if (userId === friendId)
      throw new InvalidInputException(
        'A user cannot add themselves as a friend',
      );

    const friend = await this.userRepository.findById(friendId);
    if (!friend)
      throw new ProfileServiceException(
        `Friend not found: ${friendId}`,
        HttpStatus.NOT_FOUND,
      );
    if (!(friend instanceof Student))
      throw new InvalidInputException(
        'Only STUDENT users can be added as friends',
      );

    const student = await this.findStudentOrThrow(userId);

    if (student.friendsId.includes(friendId))
      throw new InvalidInputException('This user is already a friend');

    // Actualización bidireccional con compensación si falla el segundo lado
    student.friendsId.push(friendId);
    await this.userRepository.update(userId, student);

    try {
      friend.friendsId.push(userId);
      await this.userRepository.update(friendId, friend);
    } catch {
      student.friendsId = student.friendsId.filter((f) => f !== friendId);
      await this.userRepository.update(userId, student);
      throw new ProfileServiceException(
        'Could not add friend on the other side. Operation was reverted.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.eventPublisher.publishFriendshipCreated(userId, friendId);
    return student;
  }

  async removeFriendFromStudent(
    userId: string,
    friendId: string,
  ): Promise<User> {
    const student = await this.findStudentOrThrow(userId);

    const before = student.friendsId.length;
    student.friendsId = student.friendsId.filter((f) => f !== friendId);
    if (student.friendsId.length === before)
      throw new ProfileServiceException(
        'Friend not found for removal',
        HttpStatus.BAD_REQUEST,
      );

    await this.userRepository.update(userId, student);

    // Eliminar también del lado del amigo con compensación
    const friend = await this.userRepository.findById(friendId);
    if (friend instanceof Student && friend.friendsId.includes(userId)) {
      try {
        friend.friendsId = friend.friendsId.filter((f) => f !== userId);
        await this.userRepository.update(friendId, friend);
      } catch {
        student.friendsId.push(friendId);
        await this.userRepository.update(userId, student);
        throw new ProfileServiceException(
          'Could not remove friend on the other side. Operation was reverted.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return student;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async findStudentOrThrow(userId: string): Promise<Student> {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new ProfileServiceException(
        `User not found: ${userId}`,
        HttpStatus.NOT_FOUND,
      );
    if (!(user instanceof Student))
      throw new ProfileServiceException(
        'Only STUDENT users can have friends',
        HttpStatus.BAD_REQUEST,
      );
    return user;
  }
}
