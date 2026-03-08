import type {
  AppKitUser,
  MFAStatus,
  MFAEnrollResponse,
  MFAVerifyOptions,
  UserMFA,
  UserSession,
  UserDevice
} from './types';
import { HttpClient } from './http';

export class IdentityModule {
  constructor(private http: HttpClient) {}

  /** Get the current authenticated user's profile */
  async getUser(): Promise<AppKitUser> {
    return this.http.get<AppKitUser>('/api/v1/users/me');
  }

  /** Get a user by ID (requires management scope) */
  async getUserById(userId: string): Promise<AppKitUser> {
    return this.http.get<AppKitUser>(`/api/v1/users/${userId}`);
  }

  /** Update the current user's profile */
  async updateProfile(data: Partial<Pick<AppKitUser, 'firstName' | 'lastName' | 'phone' | 'avatar'>>): Promise<AppKitUser> {
    return this.http.patch<AppKitUser>('/api/v1/users/me', data);
  }

  /** Get custom attributes for the current user */
  async getAttributes(): Promise<Record<string, unknown>> {
    const user = await this.http.get<AppKitUser>('/api/v1/users/me');
    return user.attributes || {};
  }

  /** Update custom attributes for the current user */
  async updateAttributes(attributes: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await this.http.patch<{ attributes: Record<string, unknown> }>(
      '/api/v1/users/me/attributes',
      attributes,
    );
    return res.attributes;
  }

  /** Delete the current user's account */
  async deleteAccount(): Promise<void> {
    await this.http.delete('/api/v1/users/me');
  }

  /** Verify MFA (e.g. during login or for sensitive actions) */
  async verifyMFA(options: MFAVerifyOptions): Promise<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/api/v1/identity/mfa/verify', options);
  }

  /** Get all MFA methods and their status for the current user */
  async getMFASettings(): Promise<UserMFA[]> {
    return this.http.get<UserMFA[]>('/api/v1/identity/mfa');
  }

  /** Disable an MFA method */
  async disableMFA(mfaType: string): Promise<void> {
    await this.http.post('/api/v1/identity/mfa/disable', { mfaType });
  }

  // ─── Sessions / Devices ──────────────────────────────────────────

  /** Get all active sessions */
  async getSessions(): Promise<UserSession[]> {
    return this.http.get<UserSession[]>('/api/v1/identity/sessions');
  }

  /** Revoke a specific session */
  async revokeSession(sessionId: string): Promise<void> {
    await this.http.post(`/api/v1/identity/sessions/${sessionId}/revoke`, {});
  }

  /** Get all registered devices */
  async getDevices(): Promise<UserDevice[]> {
    return this.http.get<UserDevice[]>('/api/v1/identity/devices');
  }

  /** Trust a device */
  async trustDevice(deviceId: string): Promise<void> {
    await this.http.post(`/api/v1/identity/devices/${deviceId}/trust`, {});
  }

  /** Remove/Unregister a device */
  async removeDevice(deviceId: string): Promise<void> {
    await this.http.delete(`/api/v1/identity/devices/${deviceId}`);
  }

  /** Check if the current user has a PIN set */
  async getPinStatus(): Promise<{ hasPin: boolean }> {
    return this.http.get<{ hasPin: boolean }>('/api/v1/identity/pin');
  }

  /** Set or update the current user's PIN */
  async setPin(pin: string): Promise<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>('/api/v1/identity/pin', { pin });
  }

  /** Verify the current user's PIN */
  async verifyPin(pin: string): Promise<{ success: boolean; verified: boolean; message: string }> {
    return this.http.post<{ success: boolean; verified: boolean; message: string }>('/api/v1/identity/pin/verify', { pin });
  }
}
