import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqp-connection-manager';
import type { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import type { Channel, ConsumeMessage } from 'amqplib';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { USER_MANAGEMENT_SERVICE_PORT } from '../../../domain/ports/injection-tokens';
import type { UserManagementServicePort } from '../../../application/service/port/user-management-service.port';
import { UserMapper } from '../../../application/mapper/user.mapper';
import { UserStudentRequestDto } from '../../../application/dto/request/user-student.request.dto';

const EXCHANGE = 'identity.exchange';
const ROUTING_KEY = 'identity.event.user-verified';
const QUEUE = 'profile-service.identity.user-verified.queue';

/** Shape published by identity-service's EventPublisherAdapter (UserVerifiedEventDto). */
interface UserVerifiedEvent {
  userId: string;
  email: string;
  role: string;
  name: string;
  gender: string;
  career: string;
  semester: number | null;
  studentCarnet: string;
  photoUrl: string | null;
  biography: string | null;
  privacyLevel: string;
  dateOfBirth: string;
  geolocationEnabled: boolean;
}

/**
 * Consumes identity-service's `identity.event.user-verified` events and creates
 * the matching student profile. Without this, a verified account never gets a
 * profile: the front only PATCHes an existing one, and nothing else called
 * POST /api/v1/users/student.
 */
@Injectable()
export class IdentityEventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IdentityEventConsumer.name);
  private connection: AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(
    private readonly config: ConfigService,
    @Inject(USER_MANAGEMENT_SERVICE_PORT)
    private readonly userService: UserManagementServicePort,
    private readonly userMapper: UserMapper,
  ) {}

  onModuleInit(): void {
    this.connection = connect([this.buildUrl()]);
    this.connection.on('connectFailed', (err: { err?: Error }) =>
      this.logger.warn(`RabbitMQ connection failed: ${err.err?.message ?? 'unknown error'}`),
    );

    this.channelWrapper = this.connection.createChannel({
      setup: async (channel: Channel) => {
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(QUEUE, { durable: true });
        await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
        await channel.consume(QUEUE, (msg) => this.handleMessage(channel, msg), { noAck: false });
        this.logger.log(`Listening for ${ROUTING_KEY} on ${EXCHANGE}`);
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }

  private async handleMessage(channel: Channel, msg: ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    let event: UserVerifiedEvent;
    try {
      event = JSON.parse(msg.content.toString()) as UserVerifiedEvent;
    } catch (error) {
      this.logger.error(`Malformed user-verified event, dropping: ${(error as Error).message}`);
      channel.nack(msg, false, false);
      return;
    }

    try {
      await this.createProfile(event);
      channel.ack(msg);
    } catch (error) {
      this.logger.error(
        `Failed to create profile for userId=${event.userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Poison message: drop instead of requeueing forever.
      channel.nack(msg, false, false);
    }
  }

  private async createProfile(event: UserVerifiedEvent): Promise<void> {
    const dto = plainToInstance(UserStudentRequestDto, {
      userId: event.userId,
      name: event.name,
      gender: event.gender,
      career: event.career,
      semester: event.semester ?? undefined,
      studentCarnet: event.studentCarnet,
      photoUrl: event.photoUrl ?? undefined,
      biography: event.biography ?? undefined,
      privacyLevel: event.privacyLevel,
      dateOfBirth: event.dateOfBirth,
      geolocationEnabled: event.geolocationEnabled,
    });

    const errors = await validate(dto);
    if (errors.length > 0) {
      const details = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
      this.logger.error(`Invalid user-verified event for userId=${event.userId}: ${details}`);
      return;
    }

    try {
      await this.userService.createStudentUser(this.userMapper.fromStudentRequest(dto));
      this.logger.log(`Profile created for userId=${event.userId} from identity-service event`);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        this.logger.warn(`Profile already exists for userId=${event.userId}, skipping duplicate event`);
        return;
      }
      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (error as { code?: number })?.code === 11000;
  }

  private buildUrl(): string {
    const ssl = this.config.get<string>('RABBITMQ_SSL_ENABLED') === 'true';
    const protocol = ssl ? 'amqps' : 'amqp';
    const host = this.config.get<string>('RABBITMQ_HOST') ?? 'localhost';
    const port = this.config.get<string>('RABBITMQ_PORT') ?? '5672';
    const user = this.config.get<string>('RABBITMQ_USERNAME') ?? '';
    const pass = this.config.get<string>('RABBITMQ_PASSWORD') ?? '';
    const vhost = this.config.get<string>('RABBITMQ_VHOST') ?? '/';
    const credentials = user ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
    const vhostPath = vhost === '/' ? '' : `/${encodeURIComponent(vhost)}`;
    return `${protocol}://${credentials}${host}:${port}${vhostPath}`;
  }
}
