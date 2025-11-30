import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface FamilyMemberLocation {
  userId: string;
  location: Location;
  name: string;
  avatar?: string;
  lastSeen: Date;
}

interface LocationState {
  currentLocation: Location | null;
  familyLocations: FamilyMemberLocation[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LocationState = {
  currentLocation: null,
  familyLocations: [],
  loading: false,
  error: null,
};

// Create slice
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // Set current location
    setCurrentLocation: (state, action: PayloadAction<Location | null>) => {
      state.currentLocation = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Set family locations
    setFamilyLocations: (state, action: PayloadAction<FamilyMemberLocation[]>) => {
      state.familyLocations = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Update family member location
    updateFamilyMemberLocation: (state, action: PayloadAction<FamilyMemberLocation>) => {
      const index = state.familyLocations.findIndex(
        (l) => l.userId === action.payload.userId
      );
      if (index !== -1) {
        state.familyLocations[index] = action.payload;
      } else {
        state.familyLocations.push(action.payload);
      }
    },
    
    // Remove family member location
    removeFamilyMemberLocation: (state, action: PayloadAction<string>) => {
      state.familyLocations = state.familyLocations.filter(
        (l) => l.userId !== action.payload
      );
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
  setCurrentLocation,
  setFamilyLocations,
  updateFamilyMemberLocation,
  removeFamilyMemberLocation,
  setLoading,
  setError,
  clearError,
} = locationSlice.actions;

// Export reducer
export default locationSlice.reducer;

