import type { Circle, CircleMember, CreateCircleRequest, UpdateCircleRequest, CircleType } from './types';
import { HttpClient } from './http';

export class GroupsModule {
  constructor(private http: HttpClient) {}

  /** Get all circles the current user belongs to */
  async getUserCircles(): Promise<Circle[]> {
    const result = await this.http.get<{ circles: Circle[] }>('/api/v1/circles');
    return result.circles || [];
  }

  /** Get a specific circle by ID */
  async getCircle(circleId: string): Promise<Circle> {
    return this.http.get<Circle>(`/api/v1/circles/${circleId}`);
  }

  /** Get members of a circle */
  async getMembers(circleId: string): Promise<CircleMember[]> {
    const result = await this.http.get<{ members: CircleMember[] }>(
      `/api/v1/circles/${circleId}/members`,
    );
    return result.members || [];
  }

  /** Add a member to a circle (requires management scope) */
  async addMember(circleId: string, userId: string, role: string): Promise<CircleMember> {
    return this.http.post<CircleMember>(`/api/v1/circles/${circleId}/members`, {
      userId,
      role,
    });
  }

  /** Remove a member from a circle */
  async removeMember(circleId: string, userId: string): Promise<void> {
    await this.http.delete(`/api/v1/circles/${circleId}/members/${userId}`);
  }

  /** Update a member's role in a circle */
  async updateMemberRole(circleId: string, userId: string, role: string): Promise<CircleMember> {
    return this.http.patch<CircleMember>(
      `/api/v1/circles/${circleId}/members/${userId}`,
      { role },
    );
  }

  /** Join a circle using an invite code and optional PIN */
  async joinCircle(inviteCode: string, pinCode?: string): Promise<{ success: boolean; circle: Circle }> {
    return this.http.post<{ success: boolean; circle: Circle }>('/api/v1/circles/join', {
      inviteCode,
      pinCode,
    });
  }

  /** Get security codes (PIN and invite code) for a circle */
  async getSecurityCodes(circleId: string): Promise<{ pinCode: string; circleCode: string }> {
    return this.http.get<{ pinCode: string; circleCode: string }>(
      `/api/v1/circles/${circleId}/pincode`,
    );
  }

  /** Generate new security codes (PIN and invite code) for a circle */
  async generateSecurityCodes(circleId: string): Promise<{ pinCode: string; circleCode: string }> {
    return this.http.post<{ pinCode: string; circleCode: string }>(
      `/api/v1/circles/${circleId}/pincode`,
      {},
    );
  }

  /** Create a new circle */
  async createCircle(data: CreateCircleRequest): Promise<Circle> {
    return this.http.post<Circle>('/api/v1/circles', data);
  }

  /** Update a circle's details */
  async updateCircle(circleId: string, data: UpdateCircleRequest): Promise<Circle> {
    return this.http.put<Circle>(`/api/v1/circles/${circleId}`, data);
  }

  /** Delete a circle */
  async deleteCircle(circleId: string): Promise<void> {
    await this.http.delete(`/api/v1/circles/${circleId}`);
  }

  /** Leave a circle */
  async leaveCircle(circleId: string): Promise<void> {
    await this.http.post(`/api/v1/circles/${circleId}/leave`, {});
  }

  /** Get available circle types/categories */
  async getCircleTypes(): Promise<{ success: boolean; data: CircleType[] }> {
    return this.http.get<{ success: boolean; data: CircleType[] }>('/api/v1/circle-types');
  }
}
