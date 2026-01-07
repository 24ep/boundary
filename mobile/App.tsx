import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { PinProvider } from './src/contexts/PinContext';
import { SocketProvider } from './src/contexts/SocketContext';
import { MainContentProvider } from './src/contexts/MainContentContext';
import { NativeBaseProvider } from 'native-base';
import RootNavigator from './src/navigation/RootNavigator';
import { useFonts } from 'expo-font';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold
} from '@expo-google-fonts/montserrat';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold
} from '@expo-google-fonts/poppins';

/**
 * Main Application Entry Point
 * 
 * Wraps the app with necessary providers:
 * - GestureHandlerRootView for gesture support
 * - SafeAreaProvider for safe area insets
 * - AuthProvider for authentication state
 * - PinProvider for PIN code management
 * - SocketProvider for real-time socket connections
 * - MainContentProvider for main content state
 * - RootNavigator for navigation (shows Auth, PIN setup/unlock, or App based on state)
 */
const App = () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  console.log('🚀 App Starting...');

  if (!fontsLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <NativeBaseProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <PinProvider>
              <SocketProvider>
                <MainContentProvider>
                  <RootNavigator />
                </MainContentProvider>
              </SocketProvider>
            </PinProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NativeBaseProvider>
  );
};

export default App;
