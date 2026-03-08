import { appkit } from './appkit';
import type { CircleType } from 'alphayard-appkit';

export type { CircleType };

export const circleTypeApi = {
  // Get all circle types
  getAll: async (): Promise<{ success: boolean; data: CircleType[] }> => {
    return appkit.groups.getCircleTypes();
  },

  // Get circle type by ID (Fallback to list for now as SDK might not have direct byId yet)
  getById: async (id: string): Promise<{ success: boolean; data: CircleType | null }> => {
    const result = await appkit.groups.getCircleTypes();
    const type = result.data.find((t: CircleType) => t.id === id) || null;
    return { success: result.success, data: type };
  }
};

export default circleTypeApi;
