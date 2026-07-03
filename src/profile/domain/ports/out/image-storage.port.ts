export interface ImageStoragePort {
  uploadProfileImage(
    imageBuffer: Buffer,
    userId: string,
    contentType: string,
  ): Promise<string>;
  deleteProfileImage(userId: string): Promise<void>;
}
