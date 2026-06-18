export interface ImageStoragePort {
  uploadProfileImage(imageBuffer: Buffer, userId: string): Promise<string>;
  deleteProfileImage(userId: string): Promise<void>;
}
