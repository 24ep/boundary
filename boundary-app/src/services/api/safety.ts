import { api } from './index';
import { appkit } from './appkit';

export interface SafetyAlert {
  id: string;
  userId: string;
  circleId: string;
  alertType: 'panic' | 'inactivity' | 'geofence_exit' | 'geofence_enter' | 'low_battery' | 'device_offline';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
  metadata?: any;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  panicAlerts: number;
  inactivityAlerts: number;
  geofenceAlerts: number;
  lastAlert?: SafetyAlert;
}

export interface CreatePanicAlertRequest {
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
  message?: string;
}

export interface CreateInactivityAlertRequest {
  inactivityDuration: number;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
}

export interface CreateEmergencyContactRequest {
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  isPrimary?: boolean;
}

export const safetyApi = {
  // Create panic alert
  createPanicAlert: async (data: CreatePanicAlertRequest): Promise<{ success: boolean; alert: SafetyAlert }> => {
    try {
      const alert = await appkit.safety.createPanicAlert(data);
      return { success: true, alert: alert as any };
    } catch (error) {
      console.error('SDK createPanicAlert error:', error);
      const response = await api.post('/safety/panic', data);
      return response.data;
    }
  },

  // Create inactivity alert
  createInactivityAlert: async (data: CreateInactivityAlertRequest): Promise<{ success: boolean; alert: SafetyAlert }> => {
    try {
      const alert = await appkit.safety.createInactivityAlert(data);
      return { success: true, alert: alert as any };
    } catch (error) {
      console.error('SDK createInactivityAlert error:', error);
      const response = await api.post('/safety/inactivity', data);
      return response.data;
    }
  },

  // Get user's alerts
  getAlerts: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ success: boolean; alerts: SafetyAlert[]; pagination: any }> => {
    const response = await api.get('/safety/alerts', { params });
    return response.data;
  },

  // Get Circle alerts
  getCircleAlerts: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ success: boolean; alerts: SafetyAlert[]; pagination: any }> => {
    const response = await api.get('/safety/alerts/Circle', { params });
    return response.data;
  },

  // Get active alerts
  getActiveAlerts: async (): Promise<{ success: boolean; alerts: SafetyAlert[] }> => {
    try {
      const alerts = await appkit.safety.getActiveAlerts();
      return { success: true, alerts: alerts as any };
    } catch (error) {
      console.error('SDK getActiveAlerts error:', error);
      const response = await api.get('/safety/alerts/active');
      return response.data;
    }
  },

  // Get alert by ID
  getAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const response = await api.get(`/safety/alerts/${alertId}`);
    return response.data;
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    try {
      const alert = await appkit.safety.acknowledgeAlert(alertId);
      return { success: true, alert: alert as any };
    } catch (error) {
      console.error('SDK acknowledgeAlert error:', error);
      const response = await api.put(`/safety/alerts/${alertId}/acknowledge`);
      return response.data;
    }
  },

  // Resolve alert
  resolveAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    try {
      const alert = await appkit.safety.resolveAlert(alertId);
      return { success: true, alert: alert as any };
    } catch (error) {
      console.error('SDK resolveAlert error:', error);
      const response = await api.put(`/safety/alerts/${alertId}/resolve`);
      return response.data;
    }
  },

  // Get emergency contacts
  getEmergencyContacts: async (): Promise<{ success: boolean; emergencyContacts: EmergencyContact[] }> => {
    try {
      const contacts = await appkit.safety.getEmergencyContacts();
      return { success: true, emergencyContacts: contacts as any };
    } catch (error) {
      console.error('SDK getEmergencyContacts error:', error);
      const response = await api.get('/safety/emergency-contacts');
      return response.data;
    }
  },

  // Create emergency contact
  createEmergencyContact: async (data: CreateEmergencyContactRequest): Promise<{ success: boolean; contact: EmergencyContact }> => {
    try {
      const contact = await appkit.safety.createEmergencyContact(data);
      return { success: true, contact: contact as any };
    } catch (error) {
      console.error('SDK createEmergencyContact error:', error);
      const response = await api.post('/safety/emergency-contacts', data);
      return response.data;
    }
  },

  // Update emergency contact
  updateEmergencyContact: async (contactId: string, data: Partial<CreateEmergencyContactRequest>): Promise<{ success: boolean; contact: EmergencyContact }> => {
    const response = await api.put(`/safety/emergency-contacts/${contactId}`, data);
    return response.data;
  },

  // Delete emergency contact
  deleteEmergencyContact: async (contactId: string): Promise<{ success: boolean; message: string }> => {
    try {
      await appkit.safety.deleteEmergencyContact(contactId);
      return { success: true, message: 'Contact deleted' };
    } catch (error) {
      console.error('SDK deleteEmergencyContact error:', error);
      const response = await api.delete(`/safety/emergency-contacts/${contactId}`);
      return response.data;
    }
  },

  // Get safety statistics
  getSafetyStats: async (): Promise<{ success: boolean; stats: SafetyStats }> => {
    const response = await api.get('/safety/stats');
    return response.data;
  },
};

