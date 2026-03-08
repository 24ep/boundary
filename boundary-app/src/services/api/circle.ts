import { appkit } from './appkit';

export interface CircleType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  sort_order: number;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  circleTypeId?: string;
  circleType?: CircleType;
  settings: any;
  createdAt: string;
  updatedAt: string;
  members?: CircleMember[];
}

export interface CircleMember {
  id: string;
  circleId: string;
  userId: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  invitedBy?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    phoneNumber?: string;
  };
}

export interface CircleInvitation {
  id: string;
  circleId: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCircleRequest {
  name: string;
  description?: string;
  circleTypeId?: string;
  type?: string;
  settings?: any;
}

export interface UpdateCircleRequest {
  name?: string;
  description?: string;
  settings?: any;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member';
}

export const circleApi = {
  // Create circle
  createCircle: async (data: CreateCircleRequest): Promise<{ success: boolean; circle: Circle }> => {
    const circle = await appkit.createCircle(data as any);
    return { success: true, circle: circle as any };
  },

  // Get user's circles
  getCircles: async (): Promise<{ success: boolean; circles: Circle[] }> => {
    const circles = await appkit.getUserCircles();
    return { success: true, circles: circles as any[] };
  },

  // Get circle by ID
  getCircle: async (circleId: string): Promise<{ success: boolean; circle: Circle }> => {
    const circle = await (appkit as any).groups.getCircle(circleId);
    return { success: true, circle: circle as any };
  },

  // Update circle
  updateCircle: async (circleId: string, data: UpdateCircleRequest): Promise<{ success: boolean; circle: Circle }> => {
    const circle = await appkit.updateCircle(circleId, data as any);
    return { success: true, circle: circle as any };
  },

  // Delete circle
  deleteCircle: async (circleId: string): Promise<{ success: boolean; message: string }> => {
    await appkit.deleteCircle(circleId);
    return { success: true, message: 'Circle deleted' };
  },

  // Get circle members
  getCircleMembers: async (circleId: string): Promise<{ success: boolean; members: CircleMember[] }> => {
    const members = await (appkit as any).groups.getMembers(circleId);
    return { success: true, members: members as any[] };
  },

  // Add circle member
  addCircleMember: async (circleId: string, data: InviteMemberRequest): Promise<{ success: boolean; invitation: CircleInvitation }> => {
    const invitation = await (appkit as any).groups.addMember(circleId, data.email, data.role);
    return { success: true, invitation: invitation as any };
  },

  // Remove circle member
  removeCircleMember: async (circleId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    await (appkit as any).groups.removeMember(circleId, userId);
    return { success: true, message: 'Member removed' };
  },

  // Update circle member role
  updateCircleMemberRole: async (circleId: string, userId: string, role: 'admin' | 'member'): Promise<{ success: boolean; member: CircleMember }> => {
    const member = await (appkit as any).groups.updateMemberRole(circleId, userId, role);
    return { success: true, member: member as any };
  },

  // Join circle by invitation code
  joinCircleByCode: async (invitationCode: string): Promise<{ success: boolean; circle: Circle }> => {
    const result = await appkit.joinCircle(invitationCode);
    return { success: result.success, circle: result.circle as any };
  },

  // Leave circle
  leaveCircle: async (circleId: string): Promise<{ success: boolean; message: string }> => {
    await appkit.leaveCircle(circleId);
    return { success: true, message: 'Left circle successfully' };
  },

  // Get circle types
  getCircleTypes: async (): Promise<{ success: boolean; data: CircleType[] }> => {
    const result = await appkit.getCircleTypes();
    return result as any;
  },
};

export const CircleApi = circleApi;
export const createCircle = circleApi.createCircle;
export const getFamilies = circleApi.getCircles;
