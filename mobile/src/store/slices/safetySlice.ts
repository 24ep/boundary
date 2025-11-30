import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'home' | 'school' | 'work' | 'custom';
  isActive: boolean;
}

export interface SafetyAlert {
  id: string;
  type: 'geofence_enter' | 'geofence_exit' | 'emergency' | 'check_in';
  userId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  message: string;
  timestamp: Date;
  read: boolean;
}

interface SafetyState {
  emergencyContacts: EmergencyContact[];
  geofences: Geofence[];
  alerts: SafetyAlert[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: SafetyState = {
  emergencyContacts: [],
  geofences: [],
  alerts: [],
  loading: false,
  error: null,
};

// Create slice
const safetySlice = createSlice({
  name: 'safety',
  initialState,
  reducers: {
    // Emergency contacts
    setEmergencyContacts: (state, action: PayloadAction<EmergencyContact[]>) => {
      state.emergencyContacts = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    addEmergencyContact: (state, action: PayloadAction<EmergencyContact>) => {
      state.emergencyContacts.push(action.payload);
    },
    
    updateEmergencyContact: (state, action: PayloadAction<EmergencyContact>) => {
      const index = state.emergencyContacts.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.emergencyContacts[index] = action.payload;
      }
    },
    
    removeEmergencyContact: (state, action: PayloadAction<string>) => {
      state.emergencyContacts = state.emergencyContacts.filter(
        (c) => c.id !== action.payload
      );
    },
    
    // Geofences
    setGeofences: (state, action: PayloadAction<Geofence[]>) => {
      state.geofences = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    addGeofence: (state, action: PayloadAction<Geofence>) => {
      state.geofences.push(action.payload);
    },
    
    updateGeofence: (state, action: PayloadAction<Geofence>) => {
      const index = state.geofences.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.geofences[index] = action.payload;
      }
    },
    
    removeGeofence: (state, action: PayloadAction<string>) => {
      state.geofences = state.geofences.filter((g) => g.id !== action.payload);
    },
    
    toggleGeofence: (state, action: PayloadAction<string>) => {
      const geofence = state.geofences.find((g) => g.id === action.payload);
      if (geofence) {
        geofence.isActive = !geofence.isActive;
      }
    },
    
    // Alerts
    setAlerts: (state, action: PayloadAction<SafetyAlert[]>) => {
      state.alerts = action.payload;
    },
    
    addAlert: (state, action: PayloadAction<SafetyAlert>) => {
      state.alerts.unshift(action.payload); // Add to beginning
    },
    
    updateAlert: (state, action: PayloadAction<SafetyAlert>) => {
      const index = state.alerts.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.alerts[index] = action.payload;
      }
    },
    
    markAlertAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.read = true;
      }
    },
    
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter((a) => a.id !== action.payload);
    },
    
    clearAlerts: (state) => {
      state.alerts = [];
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
  setEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  removeEmergencyContact,
  setGeofences,
  addGeofence,
  updateGeofence,
  removeGeofence,
  toggleGeofence,
  setAlerts,
  addAlert,
  updateAlert,
  markAlertAsRead,
  removeAlert,
  clearAlerts,
  setLoading,
  setError,
  clearError,
} = safetySlice.actions;

// Export reducer
export default safetySlice.reducer;

