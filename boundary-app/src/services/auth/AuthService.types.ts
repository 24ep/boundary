export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  preferences?: any;
  emergencyContacts?: any[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: string;
  userType?: 'Circle' | 'children' | 'seniors' | 'workplace';
  subscriptionTier?: 'free' | 'premium' | 'elite';
  circleIds?: string[];
  isOnboardingComplete?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginData {
  email: string;
  password?: string;
  otp?: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  dateOfBirth?: Date;
  userType?: 'Circle' | 'children' | 'seniors' | 'workplace';
}
