import appkit from './appkit';
import { RegisterRequest as AppKitRegisterRequest } from 'alphayard-appkit';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isOnboardingComplete: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isOnboardingComplete: boolean;
  families?: any[];
  preferences?: any;
}

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await appkit.signup(data as AppKitRegisterRequest);
    return {
      success: !!response.user,
      message: response.message || 'Success',
      user: response.user ? {
        id: response.user.id,
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        email: response.user.email,
        isOnboardingComplete: !!(response.user as any).isOnboardingComplete
      } : null as any,
      accessToken: response.accessToken || '',
      refreshToken: response.refreshToken || ''
    };
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await appkit.loginWithCredentials({
      email: data.email,
      password: data.password
    });
    return {
      success: !!response.user,
      message: response.message || 'Success',
      user: response.user ? {
        id: response.user.id,
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        email: response.user.email,
        isOnboardingComplete: !!(response.user as any).isOnboardingComplete
      } : null as any,
      accessToken: response.accessToken || '',
      refreshToken: response.refreshToken || ''
    };
  },

  // Get current user
  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const user = await appkit.getUser();
    return {
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phoneNumber: user.phone,
        avatarUrl: user.avatar,
        isOnboardingComplete: !!(user as any).isOnboardingComplete,
        preferences: user.attributes?.preferences
      }
    };
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const user = await appkit.updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phoneNumber,
      avatar: data.avatarUrl
    });
    return {
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phoneNumber: user.phone,
        avatarUrl: user.avatar,
        isOnboardingComplete: !!(user as any).isOnboardingComplete,
        preferences: user.attributes?.preferences
      }
    };
  },

  // Refresh token
  refreshToken: async (_refreshToken: string): Promise<{ success: boolean; accessToken: string }> => {
    const tokens = await appkit.refreshToken();
    return {
      success: true,
      accessToken: tokens.accessToken
    };
  },

  // Logout
  logout: async (_refreshToken: string): Promise<{ success: boolean; message: string }> => {
    await appkit.logout();
    return { success: true, message: 'Logged out' };
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await appkit.forgotPassword({ email });
    return {
      success: response.success,
      message: response.message || 'Success'
    };
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await appkit.resetPassword({ token, password });
    return {
      success: response.success,
      message: response.message || 'Success'
    };
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    // Note: Verify email usually takes email and code/token. 
    // The previous implementation was just token.
    const response = await appkit.verifyEmail({ email: '', code: token }); // Stub email if only token available
    return {
      success: !!response.user,
      message: response.message || 'Success'
    };
  },

  // Complete onboarding
  completeOnboarding: async (data: any): Promise<{ success: boolean; user: User }> => {
    const response = await appkit.completeOnboarding(data);
    return {
      success: !!response.user,
      user: response.user ? {
        id: response.user.id,
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        email: response.user.email,
        isOnboardingComplete: true
      } as any : null as any
    };
  },
};
