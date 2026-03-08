import type { SafetyAlert, EmergencyContact, SafetyStats } from './types';
import { HttpClient } from './http';

export class SafetyModule {
  constructor(private http: HttpClient) {}

  /** Create a panic alert */
  async createPanicAlert(data: {
    locationLatitude?: number;
    locationLongitude?: number;
    locationAddress?: string;
    message?: string;
  }): Promise<SafetyAlert> {
    return this.http.post<SafetyAlert>('/api/v1/safety/panic', data);
  }

  /** Create an inactivity alert */
  async createInactivityAlert(data: {
    inactivityDuration: number;
    locationLatitude?: number;
    locationLongitude?: number;
    locationAddress?: string;
  }): Promise<SafetyAlert> {
    return this.http.post<SafetyAlert>('/api/v1/safety/inactivity', data);
  }

  /** Get user's alerts */
  async getAlerts(params?: { status?: string; limit?: number; offset?: number }): Promise<{ alerts: SafetyAlert[]; pagination: any }> {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.offset) q.append('offset', params.offset.toString());
    
    return this.http.get<{ alerts: SafetyAlert[]; pagination: any }>(`/api/v1/safety/alerts?${q.toString()}`);
  }

  /** Get Circle alerts */
  async getCircleAlerts(params?: { status?: string; limit?: number; offset?: number }): Promise<{ alerts: SafetyAlert[]; pagination: any }> {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.offset) q.append('offset', params.offset.toString());
    
    return this.http.get<{ alerts: SafetyAlert[]; pagination: any }>(`/api/v1/safety/alerts/circle?${q.toString()}`);
  }

  /** Get active alerts for the user or their circles */
  async getActiveAlerts(): Promise<SafetyAlert[]> {
    return this.http.get<SafetyAlert[]>('/api/v1/safety/alerts/active');
  }

  /** Get alert by ID */
  async getAlert(alertId: string): Promise<SafetyAlert> {
    return this.http.get<SafetyAlert>(`/api/v1/safety/alerts/${alertId}`);
  }

  /** Acknowledge a safety alert */
  async acknowledgeAlert(alertId: string): Promise<SafetyAlert> {
    return this.http.put<SafetyAlert>(`/api/v1/safety/alerts/${alertId}/acknowledge`, {});
  }

  /** Resolve a safety alert */
  async resolveAlert(alertId: string): Promise<SafetyAlert> {
    return this.http.put<SafetyAlert>(`/api/v1/safety/alerts/${alertId}/resolve`, {});
  }

  // ─── Emergency Contacts ──────────────────────────────────────────

  /** Get all emergency contacts */
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return this.http.get<EmergencyContact[]>('/api/v1/safety/emergency-contacts');
  }

  /** Create a new emergency contact */
  async createEmergencyContact(data: {
    name: string;
    phoneNumber: string;
    relationship: string;
    isPrimary?: boolean;
    email?: string;
  }): Promise<EmergencyContact> {
    return this.http.post<EmergencyContact>('/api/v1/safety/emergency-contacts', data);
  }

  /** Update an emergency contact */
  async updateEmergencyContact(contactId: string, data: Partial<{
    name: string;
    phoneNumber: string;
    relationship: string;
    isPrimary: boolean;
    email: string;
  }>): Promise<EmergencyContact> {
    return this.http.put<EmergencyContact>(`/api/v1/safety/emergency-contacts/${contactId}`, data);
  }

  /** Delete an emergency contact */
  async deleteEmergencyContact(contactId: string): Promise<void> {
    await this.http.delete(`/api/v1/safety/emergency-contacts/${contactId}`);
  }

  // ─── Statistics ──────────────────────────────────────────────────

  /** Get safety statistics */
  async getSafetyStats(): Promise<SafetyStats> {
    return this.http.get<SafetyStats>('/api/v1/safety/stats');
  }
}
