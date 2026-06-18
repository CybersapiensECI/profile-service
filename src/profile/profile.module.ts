import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';

// ── Config & middleware ─────────────────────────────────────────────────────
import { KongAuthMiddleware } from './infrastructure/config/kong-auth.middleware';
import { StartupDependencyCheck } from './infrastructure/config/startup-check.service';

// ── Infrastructure — persistence ────────────────────────────────────────────
import { UserDocument, UserDocumentSchema } from './infrastructure/adapters/persistence/entity/user.document';
import { StudentDocument, StudentDocumentSchema } from './infrastructure/adapters/persistence/entity/student.document';
import { AdminDocument, AdminDocumentSchema } from './infrastructure/adapters/persistence/entity/admin.document';
import { OrganizerDocument, OrganizerDocumentSchema } from './infrastructure/adapters/persistence/entity/organizer.document';
import { UserMongoRepository } from './infrastructure/adapters/persistence/repository/user-mongo.repository';
import { UserPersistenceMapper } from './infrastructure/adapters/persistence/mapper/user-persistence.mapper';

// ── Infrastructure — adapters ───────────────────────────────────────────────
import { UserRepositoryAdapter } from './infrastructure/adapters/adapter/user-repository.adapter';
import { CloudinaryAdapter } from './infrastructure/adapters/adapter/cloudinary-adapter';
import { RabbitMQFriendshipPublisher, RABBITMQ_CLIENT } from './infrastructure/external/rabbitmq-friendship.publisher';

// ── Domain ports (tokens) ───────────────────────────────────────────────────
import {
  USER_REPOSITORY_PORT,
  IMAGE_STORAGE_PORT,
  TAG_CATALOG_PORT,
  EVENT_PUBLISHER_PORT,
  USER_MANAGEMENT_SERVICE_PORT,
  USER_SCHEDULE_SERVICE_PORT,
  USER_TAG_SERVICE_PORT,
  USER_FRIEND_SERVICE_PORT,
  USER_MEDIA_SERVICE_PORT,
  USER_GAMIFICATION_SERVICE_PORT,
  INTERNAL_USER_SERVICE_PORT,
} from './domain/ports/injection-tokens';

// ── Application — mapper ────────────────────────────────────────────────────
import { UserMapper } from './application/mapper/user.mapper';

// ── Application — use cases ─────────────────────────────────────────────────
import { UserManagementUseCase } from './application/usecase/user-management.usecase';
import { UserScheduleUseCase } from './application/usecase/user-schedule.usecase';
import { UserTagUseCase } from './application/usecase/user-tag.usecase';
import { UserFriendUseCase } from './application/usecase/user-friend.usecase';
import { UserMediaUseCase } from './application/usecase/user-media.usecase';
import { UserGamificationUseCase } from './application/usecase/user-gamification.usecase';

// ── Application — services ──────────────────────────────────────────────────
import { UserManagementService } from './application/service/user-management.service';
import { UserScheduleService } from './application/service/user-schedule.service';
import { UserTagService } from './application/service/user-tag.service';
import { UserFriendService } from './application/service/user-friend.service';
import { UserMediaService } from './application/service/user-media.service';
import { UserGamificationService } from './application/service/user-gamification.service';
import { InternalUserService } from './application/service/internal-user.service';

// ── Entrypoints — controllers ───────────────────────────────────────────────
import { InternalUserController } from './entrypoints/rest/controller/internal-user.controller';
import { UserCreationController } from './entrypoints/rest/controller/user-creation.controller';
import { UserDeletionController } from './entrypoints/rest/controller/user-deletion.controller';
import { UserQueryController } from './entrypoints/rest/controller/user-query.controller';
import { UserUpdateController } from './entrypoints/rest/controller/user-update.controller';
import { UserMediaController } from './entrypoints/rest/controller/user-media.controller';
import { UserTagController } from './entrypoints/rest/controller/user-tag.controller';
import { UserFriendController } from './entrypoints/rest/controller/user-friend.controller';
import { UserScheduleController } from './entrypoints/rest/controller/user-schedule.controller';
import { UserGamificationController } from './entrypoints/rest/controller/user-gamification.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserDocument.name,
        schema: UserDocumentSchema,
        discriminators: [
          { name: StudentDocument.name, schema: StudentDocumentSchema },
          { name: AdminDocument.name, schema: AdminDocumentSchema },
          { name: OrganizerDocument.name, schema: OrganizerDocumentSchema },
        ],
      },
    ]),
    ClientsModule.register([
      {
        name: RABBITMQ_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.RABBITMQ_QUEUE ?? 'friendship_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [
    InternalUserController,
    UserCreationController,
    UserDeletionController,
    UserQueryController,
    UserUpdateController,
    UserMediaController,
    UserTagController,
    UserFriendController,
    UserScheduleController,
    UserGamificationController,
  ],
  providers: [
    // ── Infrastructure ────────────────────────────────────────────────────────
    StartupDependencyCheck,
    UserMongoRepository,
    UserPersistenceMapper,
    { provide: USER_REPOSITORY_PORT, useClass: UserRepositoryAdapter },
    { provide: IMAGE_STORAGE_PORT, useClass: CloudinaryAdapter },
    {
      provide: TAG_CATALOG_PORT,
      useValue: {
        getAllCategoriesWithTags: () => Promise.resolve([]),
        tagExists: () => Promise.resolve(true),
        getTagNameById: (id: string) => Promise.resolve(id),
      },
    },
    { provide: EVENT_PUBLISHER_PORT, useClass: RabbitMQFriendshipPublisher },

    // ── Application mapper ────────────────────────────────────────────────────
    UserMapper,

    // ── Use cases ─────────────────────────────────────────────────────────────
    UserManagementUseCase,
    UserScheduleUseCase,
    UserTagUseCase,
    UserFriendUseCase,
    UserMediaUseCase,
    UserGamificationUseCase,

    // ── Services (provided with port tokens for controller injection) ──────────
    { provide: USER_MANAGEMENT_SERVICE_PORT, useClass: UserManagementService },
    { provide: USER_SCHEDULE_SERVICE_PORT, useClass: UserScheduleService },
    { provide: USER_TAG_SERVICE_PORT, useClass: UserTagService },
    { provide: USER_FRIEND_SERVICE_PORT, useClass: UserFriendService },
    { provide: USER_MEDIA_SERVICE_PORT, useClass: UserMediaService },
    { provide: USER_GAMIFICATION_SERVICE_PORT, useClass: UserGamificationService },
    { provide: INTERNAL_USER_SERVICE_PORT, useClass: InternalUserService },
  ],
})
export class ProfileModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(KongAuthMiddleware).forRoutes('*');
  }
}
