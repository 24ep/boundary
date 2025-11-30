import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: 'parent' | 'child' | 'senior' | 'guardian';
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FamilyState {
  members: FamilyMember[];
  currentFamily: Family | null;
  families: Family[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: FamilyState = {
  members: [],
  currentFamily: null,
  families: [],
  loading: false,
  error: null,
};

// Create slice
const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    // Set members
    setMembers: (state, action: PayloadAction<FamilyMember[]>) => {
      state.members = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Add member
    addMember: (state, action: PayloadAction<FamilyMember>) => {
      state.members.push(action.payload);
    },
    
    // Update member
    updateMember: (state, action: PayloadAction<FamilyMember>) => {
      const index = state.members.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    
    // Remove member
    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
    },
    
    // Set current family
    setCurrentFamily: (state, action: PayloadAction<Family | null>) => {
      state.currentFamily = action.payload;
    },
    
    // Set families
    setFamilies: (state, action: PayloadAction<Family[]>) => {
      state.families = action.payload;
    },
    
    // Update family
    updateFamily: (state, action: PayloadAction<Family>) => {
      if (state.currentFamily?.id === action.payload.id) {
        state.currentFamily = action.payload;
      }
      const index = state.families.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.families[index] = action.payload;
      }
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setMembers,
  addMember,
  updateMember,
  removeMember,
  setCurrentFamily,
  setFamilies,
  updateFamily,
  setLoading,
  setError,
  clearError,
} = familySlice.actions;

// Export reducer
export default familySlice.reducer;

