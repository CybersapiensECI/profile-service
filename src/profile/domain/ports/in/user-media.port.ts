import { User } from '../../model/user.entity';

export interface UserMediaPort {
  updateProfileImage(
    userId: string,
    file: Buffer,
    contentType: string,
  ): Promise<User>;
  updateGeolocation(userId: string, geolocationEnabled: boolean): Promise<User>;
}
