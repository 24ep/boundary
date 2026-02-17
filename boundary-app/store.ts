import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import authReducer from './src/store/slices/authSlice';
import familyReducer from './src/store/slices/familySlice';
import chatReducer from './src/store/slices/chatSlice';
import locationReducer from './src/store/slices/locationSlice';
import safetyReducer from './src/store/slices/safetySlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  family: familyReducer,
  chat: chatReducer,
  location: locationReducer,
  safety: safetyReducer,
});

// Configure persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'family'], // Only persist auth and family data
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'payload.createdAt', 'payload.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: ['chat.messages', 'location.familyLocations'],
      },
    }),
});

export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 