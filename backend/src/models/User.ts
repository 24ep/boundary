export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  notificationSettings?: Record<string, any>;
  preferences?: Record<string, any>;
  isOnboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}
