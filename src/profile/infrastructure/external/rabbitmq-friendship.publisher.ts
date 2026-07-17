import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqp-connection-manager';
import type { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import type { Channel } from 'amqplib';
import { FriendshipCreatedEventDto } from '../../application/dto/event/friendship-created.event.dto';
import { EventPublisherPort } from '../../domain/ports/out/event-publisher.port';

const EXCHANGE = 'notification.exchange';
const ROUTING_KEY = 'friendship.created';

/**
 * Publishes to notification.exchange (topic), same exchange every other
 * service in the system already declares/binds to — NOT the previous
 * Transport.RMQ ClientProxy bound directly to a queue named
 * 'friendship_queue', which no consumer anywhere ever bound to (chat-service
 * declares notification.exchange too but had zero @RabbitListener for this
 * event — the event was published into a queue nothing was ever listening
 * on, so friends never got a chat room).
 */
@Injectable()
export class RabbitMQFriendshipPublisher
  implements EventPublisherPort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMQFriendshipPublisher.name);
  private connection: AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.connection = connect([this.buildUrl()]);
    this.connection.on('connectFailed', (err: { err?: Error }) =>
      this.logger.warn(`RabbitMQ connection failed: ${err.err?.message ?? 'unknown error'}`),
    );

    this.channelWrapper = this.connection.createChannel({
      setup: async (channel: Channel) => {
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }

  async publishFriendshipCreated(userId1: string, userId2: string): Promise<void> {
    const event: FriendshipCreatedEventDto = {
      userId1,
      userId2,
      createdAt: new Date(),
    };
    try {
      await this.channelWrapper.publish(EXCHANGE, ROUTING_KEY, event, { persistent: true });
    } catch (error) {
      this.logger.warn(
        `Could not publish friendship.created for ${userId1}/${userId2}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
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
