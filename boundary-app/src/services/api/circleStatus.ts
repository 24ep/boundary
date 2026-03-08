import { appkit } from './appkit';
import { 
  CircleStatusMember, 
  CircleStatusUpdate, 
  CircleLocationUpdate, 
  CircleStatusFilters 
} from 'alphayard-appkit';

// Re-exporting for compatibility
export type { 
  CircleStatusMember, 
  CircleStatusUpdate, 
  CircleLocationUpdate, 
  CircleStatusFilters 
};

export const circleStatusApi = {
  // Get circle members status
  getCircleMembers: async (circleId: string): Promise<{ success: boolean; members: CircleStatusMember[] }> => {
    const members = await appkit.circleStatus.getCircleMembers(circleId);
    return { success: true, members };
  },

  // Get member status
  getMemberStatus: async (memberId: string): Promise<{ success: boolean; member: CircleStatusMember }> => {
    const member = await appkit.circleStatus.getMemberStatus(memberId);
    return { success: true, member };
  },

  // Update member status
  updateMemberStatus: async (update: CircleStatusUpdate): Promise<{ success: boolean; member: CircleStatusMember }> => {
    const member = await appkit.circleStatus.updateMemberStatus(update);
    return { success: true, member };
  },

  // Update member location
  updateMemberLocation: async (locationUpdate: CircleLocationUpdate): Promise<{ success: boolean; message: string }> => {
    return appkit.circleStatus.updateMemberLocation(locationUpdate);
  },

  // Get circle locations
  getCircleLocations: async (circleId: string): Promise<{ success: boolean; locations: CircleLocationUpdate[] }> => {
    const locations = await appkit.circleStatus.getCircleLocations(circleId);
    return { success: true, locations };
  },

  // Get emergency status
  getEmergencyStatus: async (circleId: string): Promise<{ success: boolean; members: CircleStatusMember[] }> => {
    const members = await appkit.circleStatus.getEmergencyStatus(circleId);
    return { success: true, members };
  },

  // Send emergency alert
  sendEmergencyAlert: async (memberId: string, message?: string): Promise<{ success: boolean; message: string }> => {
    return appkit.circleStatus.sendEmergencyAlert(memberId, message);
  },

  // Get health metrics
  getHealthMetrics: async (memberId: string, dateFrom?: string, dateTo?: string): Promise<{ success: boolean; metrics: any }> => {
    const metrics = await appkit.circleStatus.getHealthMetrics(memberId, dateFrom, dateTo);
    return { success: true, metrics };
  },

  // Update health metrics
  updateHealthMetrics: async (memberId: string, metrics: {
    heartRate?: number;
    steps?: number;
    sleepHours?: number;
    timestamp?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return appkit.circleStatus.updateHealthMetrics(memberId, metrics);
  },

  // Get activity history
  getActivityHistory: async (memberId: string, days: number = 7): Promise<{ success: boolean; activities: any[] }> => {
    const activities = await appkit.circleStatus.getActivityHistory(memberId, days);
    return { success: true, activities };
  }
};

export default circleStatusApi;
