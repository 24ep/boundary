import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { usePin } from '../contexts/PinContext';
import { EmotionCheckProvider } from '../contexts/EmotionCheckContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import PinSetupScreen from '../screens/auth/PinSetupScreen';
import PinUnlockScreen from '../screens/auth/PinUnlockScreen';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  PinSetup: undefined;
  PinUnlock: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, setNavigationRef, user, forceUpdate } = useAuth();
  const { hasPin, isPinLocked, isLoading: isPinLoading } = usePin();
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // Set navigation reference in AuthContext for programmatic navigation
    if (setNavigationRef && navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, [setNavigationRef, navigationRef.current]);

  // Simple conditional: if authenticated with valid user, show App; otherwise show Auth
  const showApp = isAuthenticated && user && user.id && user.email;

  // Show loading screen while checking authentication or PIN status
  if (isLoading || isPinLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5A" />
      </View>
    );
  }

  // User is authenticated
  if (showApp) {
    // Check if PIN is locked (session timed out)
    if (hasPin && isPinLocked) {
      return (
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            if (setNavigationRef && navigationRef.current) {
              setNavigationRef(navigationRef.current);
            }
          }}
        >
          <PinUnlockScreen />
        </NavigationContainer>
      );
    }

    // Check if user needs to set up PIN (first login)
    if (!hasPin) {
      return (
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            if (setNavigationRef && navigationRef.current) {
              setNavigationRef(navigationRef.current);
            }
          }}
        >
          <PinSetupScreen />
        </NavigationContainer>
      );
    }

    // All good - show the app
    return (
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          if (setNavigationRef && navigationRef.current) {
            setNavigationRef(navigationRef.current);
          }
        }}
      >
        <AppNavigator />
      </NavigationContainer>
    );
  }

  // Not authenticated - show auth flow
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (setNavigationRef && navigationRef.current) {
          setNavigationRef(navigationRef.current);
        }
      }}
    >
      <AuthNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;