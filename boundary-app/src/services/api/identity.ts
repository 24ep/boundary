import { appkit } from './appkit';
import { 
  UserSession, 
  UserDevice, 
  UserMFA as SDKUserMFA, 
  LoginHistoryEntry, 
  SecuritySettings,
  MFASetupResponse
} from 'alphayard-appkit';

// =====================================================
// INTERFACES (Re-exporting from SDK for compatibility)
// =====================================================

export type { UserSession, UserDevice, LoginHistoryEntry, SecuritySettings, MFASetupResponse };
export type UserMFA = SDKUserMFA;

// =====================================================
// SESSION MANAGEMENT
// =====================================================

export const identityApi = {
  // Get all sessions for current user
  getSessions: async (includeExpired = false): Promise<{ sessions: UserSession[]; total: number }> => {
    const sessions = await appkit.identity.getSessions(includeExpired);
    return { sessions, total: sessions.length };
  },

  // Revoke a specific session
  revokeSession: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    await appkit.identity.revokeSession(sessionId);
    return { success: true, message: 'Session revoked' };
  },

  // Revoke all sessions except current
  revokeAllSessions: async (): Promise<{ success: boolean; revokedCount: number }> => {
    return appkit.identity.revokeAllSessions();
  },

  // =====================================================
  // DEVICE MANAGEMENT
  // =====================================================

  // Get all devices for current user
  getDevices: async (): Promise<{ devices: UserDevice[]; total: number }> => {
    const devices = await appkit.identity.getDevices();
    return { devices, total: devices.length };
  },

  // Trust a device
  trustDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    await appkit.identity.trustDevice(deviceId);
    return { success: true, message: 'Device trusted' };
  },

  // Block a device
  blockDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    await appkit.identity.blockDevice(deviceId);
    return { success: true, message: 'Device blocked' };
  },

  // Remove a device
  removeDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    await appkit.identity.removeDevice(deviceId);
    return { success: true, message: 'Device removed' };
  },

  // =====================================================
  // MFA MANAGEMENT
  // =====================================================

  // Get MFA settings
  getMFASettings: async (): Promise<{ mfaSettings: UserMFA[]; backupCodesRemaining?: number }> => {
    const mfaSettings = await appkit.identity.getMFASettings();
    return { mfaSettings: mfaSettings as any };
  },

  // Setup MFA (initiate)
  setupMFA: async (mfaType: 'totp' | 'sms' | 'email'): Promise<MFASetupResponse> => {
    return appkit.identity.setupMFA(mfaType);
  },

  // Verify MFA setup
  verifyMFASetup: async (mfaType: string, code: string): Promise<{ success: boolean; backupCodes?: string[] }> => {
    const user = await appkit.identity.verifyMFASetup(mfaType as any, code);
    return { success: !!user };
  },

  // Disable MFA
  disableMFA: async (mfaType: string, _password: string): Promise<{ success: boolean; message: string }> => {
    await appkit.identity.disableMFA(mfaType as any);
    return { success: true, message: 'MFA disabled' };
  },

  // Get new backup codes
  regenerateBackupCodes: async (): Promise<{ backupCodes: string[] }> => {
    return appkit.identity.regenerateBackupCodes();
  },

  // =====================================================
  // LOGIN HISTORY
  // =====================================================

  // Get login history
  getLoginHistory: async (options?: {
    page?: number;
    limit?: number;
    success?: boolean;
  }): Promise<{ history: LoginHistoryEntry[]; total: number; page: number; totalPages: number }> => {
    return appkit.identity.getLoginHistory(options);
  },

  // =====================================================
  // SECURITY SETTINGS
  // =====================================================

  // Get security overview
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    return appkit.identity.getSecuritySettings();
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return appkit.identity.changePassword(currentPassword, newPassword);
  },

  // Request account deletion
  requestAccountDeletion: async (password: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    return appkit.identity.requestAccountDeletion(password, reason);
  },

  // Export user data (GDPR)
  requestDataExport: async (): Promise<{ success: boolean; message: string; estimatedTime?: string }> => {
    return appkit.identity.requestDataExport();
  },

  // =====================================================
  // PIN MANAGEMENT
  // =====================================================

  // Check if user has a PIN set
  getPinStatus: async (): Promise<{ hasPin: boolean }> => {
    return appkit.identity.getPinStatus();
  },
  
  // Set or update user PIN
  setPin: async (pin: string): Promise<{ success: boolean; message: string }> => {
    return appkit.identity.setPin(pin);
  },
  
  // Verify user PIN
  verifyPin: async (pin: string): Promise<{ success: boolean; message: string }> => {
    const result = await appkit.identity.verifyPin(pin);
    return { success: result.success, message: result.message };
  },
};

export default identityApi;
