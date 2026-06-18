import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ImageProfileException } from '../../../domain/exceptions/image-profile.exception';
import { ImageStoragePort } from '../../../domain/ports/out/image-storage.port';

@Injectable()
export class CloudinaryAdapter implements ImageStoragePort {
  private readonly logger = new Logger(CloudinaryAdapter.name);

  async uploadProfileImage(file: Buffer, userId: string): Promise<string> {
    try {
      const base64 = `data:image/jpeg;base64,${file.toString('base64')}`;

      const result = await cloudinary.uploader.upload(base64, {
        folder: 'profile_pictures',
        public_id: userId,
        overwrite: true,
      });

      return result.secure_url;
    } catch (e) {
      this.logger.error(
        `Error uploading profile image for user ${userId}: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new ImageProfileException(
        'Error uploading profile image. Please try again.',
      );
    }
  }

  async deleteProfileImage(userId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(`profile_pictures/${userId}`);
    } catch (e) {
      this.logger.error(
        `Error deleting profile image for user ${userId}: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new ImageProfileException(
        'Error deleting profile image. Please try again.',
      );
    }
  }
}
