import { appkit } from './appkit';
import { 
  SafetyAlert, 
  EmergencyContact, 
  SafetyStats, 
  CreatePanicAlertRequest, 
  CreateInactivityAlertRequest, 
  CreateEmergencyContactRequest 
} from 'alphayard-appkit';

// Re-exporting for compatibility
export type { 
  SafetyAlert, 
  EmergencyContact, 
  SafetyStats, 
  CreatePanicAlertRequest, 
  CreateInactivityAlertRequest, 
  CreateEmergencyContactRequest 
};

export const safetyApi = {
  // Create panic alert
  createPanicAlert: async (data: CreatePanicAlertRequest): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const alert = await appkit.safety.createPanicAlert(data);
    return { success: true, alert };
  },

  // Create inactivity alert
  createInactivityAlert: async (data: CreateInactivityAlertRequest): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const alert = await appkit.safety.createInactivityAlert(data);
    return { success: true, alert };
  },

  // Get user's alerts
  getAlerts: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ success: boolean; alerts: SafetyAlert[]; pagination: any }> => {
    const result = await appkit.safety.getAlerts(params);
    return { success: true, ...result };
  },

  // Get Circle alerts
  getCircleAlerts: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ success: boolean; alerts: SafetyAlert[]; pagination: any }> => {
    const result = await appkit.safety.getCircleAlerts(params);
    return { success: true, ...result };
  },

  // Get active alerts
  getActiveAlerts: async (): Promise<{ success: boolean; alerts: SafetyAlert[] }> => {
    const alerts = await appkit.safety.getActiveAlerts();
    return { success: true, alerts };
  },

  // Get alert by ID
  getAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const alert = await appkit.safety.getAlert(alertId);
    return { success: true, alert };
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const alert = await appkit.safety.acknowledgeAlert(alertId);
    return { success: true, alert };
  },

  // Resolve alert
  resolveAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const alert = await appkit.safety.resolveAlert(alertId);
    return { success: true, alert };
  },

  // Get emergency contacts
  getEmergencyContacts: async (): Promise<{ success: boolean; emergencyContacts: EmergencyContact[] }> => {
    const emergencyContacts = await appkit.safety.getEmergencyContacts();
    return { success: true, emergencyContacts };
  },

  // Create emergency contact
  createEmergencyContact: async (data: CreateEmergencyContactRequest): Promise<{ success: boolean; contact: EmergencyContact }> => {
    const contact = await appkit.safety.createEmergencyContact(data);
    return { success: true, contact };
  },

  // Update emergency contact
  updateEmergencyContact: async (contactId: string, data: Partial<CreateEmergencyContactRequest>): Promise<{ success: boolean; contact: EmergencyContact }> => {
    const contact = await appkit.safety.updateEmergencyContact(contactId, data as any);
    return { success: true, contact };
  },

  // Delete emergency contact
  deleteEmergencyContact: async (contactId: string): Promise<{ success: boolean; message: string }> => {
    await appkit.safety.deleteEmergencyContact(contactId);
    return { success: true, message: 'Contact deleted' };
  },

  // Get safety statistics
  getSafetyStats: async (): Promise<{ success: boolean; stats: SafetyStats }> => {
    const stats = await appkit.safety.getSafetyStats();
    return { success: true, stats };
  },
};


