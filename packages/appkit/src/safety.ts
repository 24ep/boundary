import type { SafetyAlert, EmergencyContact } from './types';
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

  /** Get active alerts for the user or their circles */
  async getActiveAlerts(): Promise<SafetyAlert[]> {
    return this.http.get<SafetyAlert[]>('/api/v1/safety/alerts/active');
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

  /** Delete an emergency contact */
  async deleteEmergencyContact(contactId: string): Promise<void> {
    await this.http.delete(`/api/v1/safety/emergency-contacts/${contactId}`);
  }
}
