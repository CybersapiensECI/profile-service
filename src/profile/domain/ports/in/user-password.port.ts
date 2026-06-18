export interface UserPasswordPort {
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
  verifyUser(userId: string): Promise<void>;
  resetPassword(userId: string, newPassword: string): Promise<void>;
}
