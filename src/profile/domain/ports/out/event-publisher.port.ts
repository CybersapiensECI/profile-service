export interface EventPublisherPort {
  publishFriendshipCreated(userId1: string, userId2: string): Promise<void>;
}
