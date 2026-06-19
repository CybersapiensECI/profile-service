import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { FriendshipCreatedEventDto } from '../../application/dto/event/friendship-created.event.dto';
import { EventPublisherPort } from '../../domain/ports/out/event-publisher.port';

export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';

@Injectable()
export class RabbitMQFriendshipPublisher implements EventPublisherPort {
  constructor(@Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy) {}

  async publishFriendshipCreated(
    userId1: string,
    userId2: string,
  ): Promise<void> {
    const event: FriendshipCreatedEventDto = {
      userId1,
      userId2,
      createdAt: new Date(),
    };
    await lastValueFrom(this.client.emit('friendship.created', event));
  }
}
