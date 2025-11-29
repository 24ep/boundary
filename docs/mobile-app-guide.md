# Bondarys Mobile App Development Guide

## 📱 Overview

The Bondarys mobile application is built with React Native, providing a cross-platform solution for iOS and Android. This guide covers setup, development, testing, and deployment.

## 🛠️ Prerequisites

### Required Software
- **Node.js** 18+ 
- **npm** or **yarn**
- **React Native CLI**
- **Xcode** (for iOS development)
- **Android Studio** (for Android development)
- **Git**

### iOS Development
- **macOS** (required for iOS development)
- **Xcode** 14+ with iOS SDK 16+
- **CocoaPods**
- **iOS Simulator** or physical device

### Android Development
- **Android Studio** 2022+
- **Android SDK** 33+
- **Java Development Kit** (JDK) 11+
- **Android Emulator** or physical device

## 🚀 Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/bondarys/bondarys.git
cd bondarys/mobile
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:3000

# Google Services
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_GOOGLE_SIGN_IN_CLIENT_ID=your_google_client_id

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# App Configuration
REACT_APP_APP_NAME=Bondarys
REACT_APP_APP_VERSION=1.0.0
REACT_APP_BUILD_NUMBER=1
```

## 📱 Development

### Start Development Server
```bash
# Start Metro bundler
npm start

# Or with specific configuration
npm start -- --reset-cache
```

### Run on iOS
```bash
# Run on iOS Simulator
npm run ios

# Run on specific iOS device
npm run ios -- --device "iPhone 14"

# Run on iOS with specific configuration
npm run ios -- --configuration Release
```

### Run on Android
```bash
# Run on Android Emulator
npm run android

# Run on specific Android device
npm run android -- --deviceId "device_id"

# Run on Android with specific configuration
npm run android -- --variant release
```

### Development Commands
```bash
# Clear cache
npm run clean

# Reset Metro cache
npm run reset-cache

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 🏗️ Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Common UI components
│   │   ├── forms/          # Form components
│   │   ├── navigation/     # Navigation components
│   │   └── widgets/        # Home screen widgets
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── home/           # Home screen
│   │   ├── family/         # Family management
│   │   ├── chat/           # Chat screens
│   │   ├── location/       # Location screens
│   │   ├── safety/         # Safety features
│   │   ├── profile/        # Profile screens
│   │   └── apps/           # Integrated apps
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API and external services
│   │   ├── api/           # API client
│   │   ├── auth/          # Authentication service
│   │   ├── storage/       # Local storage
│   │   ├── notifications/ # Push notifications
│   │   ├── location/      # Location services
│   │   └── socket/        # WebSocket service
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants
│   ├── types/             # TypeScript types
│   ├── assets/            # Images, fonts, etc.
│   └── theme/             # Theme configuration
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
├── __tests__/            # Test files
├── App.tsx               # Main app component
├── index.js              # App entry point
└── package.json          # Dependencies and scripts
```

## 🎨 UI Components

### Theme System
The app uses a consistent theme system with the Red-White-Gold color scheme:

```typescript
// src/theme/colors.ts
export const colors = {
  primary: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
  },
};
```

### Common Components
```typescript
// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: colors.primary[500],
  },
});
```

## 🔐 Authentication

### Authentication Service
```typescript
// src/services/auth/AuthService.ts
import { api } from '../api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  static async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  static async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  static async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  static async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  static async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
}
```

### Authentication Hook
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/auth/AuthService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      const { user, tokens } = response.data;
      
      await AsyncStorage.setItem('auth_token', tokens.accessToken);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      
      setToken(tokens.accessToken);
      setUser(user);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      setToken(null);
      setUser(null);
    }
  };

  return {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };
};
```

## 📍 Location Services

### Location Service
```typescript
// src/services/location/LocationService.ts
import Geolocation from '@react-native-community/geolocation';
import { api } from '../api';

export interface LocationData {
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp: string;
}

export class LocationService {
  static async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            altitude: position.coords.altitude || undefined,
            timestamp: new Date(position.timestamp).toISOString(),
          };
          resolve(locationData);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  static async updateLocation(locationData: LocationData) {
    const response = await api.post('/location/update', locationData);
    return response.data;
  }

  static async getLocationHistory(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const response = await api.get('/location/history', { params });
    return response.data;
  }

  static async getFamilyLocations() {
    const response = await api.get('/location/family');
    return response.data;
  }

  static async requestLocation(userId: string, message?: string) {
    const response = await api.post('/location/request', {
      userId,
      message,
      expiresIn: 300,
    });
    return response.data;
  }
}
```

## 🔔 Push Notifications

### Notification Service
```typescript
// src/services/notifications/NotificationService.ts
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { api } from '../api';

export class NotificationService {
  static async requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const fcmToken = await messaging().getToken();
      await this.updateFCMToken(fcmToken);
    }

    return enabled;
  }

  static async updateFCMToken(token: string) {
    try {
      await api.post('/users/fcm-token', { token });
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  }

  static async configurePushNotifications() {
    // Configure local notifications
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });
  }

  static showLocalNotification(remoteMessage: any) {
    PushNotification.localNotification({
      title: remoteMessage.notification?.title,
      message: remoteMessage.notification?.body || '',
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
    });
  }
}
```

## 🔌 WebSocket Integration

### Socket Service
```typescript
// src/services/socket/SocketService.ts
import io, { Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export class SocketService extends EventEmitter {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    this.socket = io(process.env.REACT_APP_SOCKET_URL!, {
      auth: {
        token,
      },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('error', error);
    });

    // Location events
    this.socket.on('location:update', (data) => {
      this.emit('location:update', data);
    });

    this.socket.on('location:geofence_breach', (data) => {
      this.emit('location:geofence_breach', data);
    });

    // Chat events
    this.socket.on('chat:new_message', (data) => {
      this.emit('chat:new_message', data);
    });

    this.socket.on('chat:typing', (data) => {
      this.emit('chat:typing', data);
    });

    // Safety events
    this.socket.on('safety:emergency', (data) => {
      this.emit('safety:emergency', data);
    });

    this.socket.on('safety:check_request', (data) => {
      this.emit('safety:check_request', data);
    });

    // Family events
    this.socket.on('family:update', (data) => {
      this.emit('family:update', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Location methods
  updateLocation(locationData: any) {
    this.emit('location:update', locationData);
  }

  // Chat methods
  sendMessage(chatId: string, content: string, type: string = 'text') {
    this.emit('chat:send_message', {
      chatId,
      content,
      type,
    });
  }

  typing(chatId: string, isTyping: boolean) {
    this.emit('chat:typing', {
      chatId,
      isTyping,
    });
  }
}

export const socketService = new SocketService();
```

## 🧪 Testing

### Unit Tests
```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/common/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('applies disabled style when disabled', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} disabled={true} />
    );
    
    const button = getByText('Test Button').parent;
    expect(button.props.style).toContainEqual({ opacity: 0.5 });
  });
});
```

### Integration Tests
```typescript
// __tests__/services/AuthService.test.ts
import { AuthService } from '../../src/services/auth/AuthService';
import { api } from '../../src/services/api';

jest.mock('../../src/services/api');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login calls API correctly', async () => {
    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token' },
      },
    };
    
    (api.post as jest.Mock).mockResolvedValue(mockResponse);
    
    const credentials = { email: 'test@example.com', password: 'password' };
    const result = await AuthService.login(credentials);
    
    expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(result).toEqual(mockResponse.data);
  });
});
```

## 📱 Building for Production

### iOS Build

#### 1. Configure iOS Settings
```bash
cd ios
open Bondarys.xcworkspace
```

In Xcode:
1. Set Bundle Identifier
2. Configure signing certificates
3. Set version and build number
4. Configure capabilities (Push Notifications, Background Modes, etc.)

#### 2. Build for Release
```bash
# Clean build
cd ios
xcodebuild clean -workspace Bondarys.xcworkspace -scheme Bondarys

# Build for release
xcodebuild -workspace Bondarys.xcworkspace -scheme Bondarys -configuration Release -destination generic/platform=iOS -archivePath Bondarys.xcarchive archive

# Export IPA
xcodebuild -exportArchive -archivePath Bondarys.xcarchive -exportPath ./build -exportOptionsPlist exportOptions.plist
```

#### 3. App Store Submission
```bash
# Upload to App Store Connect
xcrun altool --upload-app --type ios --file "./build/Bondarys.ipa" --username "your-apple-id" --password "app-specific-password"
```

### Android Build

#### 1. Configure Android Settings
```bash
cd android
```

Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.bondarys.app"
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file("bondarys-release-key.keystore")
            storePassword "your-store-password"
            keyAlias "your-key-alias"
            keyPassword "your-key-password"
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 2. Generate Keystore
```bash
keytool -genkey -v -keystore bondarys-release-key.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### 3. Build APK
```bash
# Clean build
cd android
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease
```

#### 4. Play Store Submission
```bash
# Upload to Play Store
gcloud auth login
gcloud config set project your-project-id
gcloud app deploy android/app/build/outputs/bundle/release/app-release.aab
```

## 🚀 Deployment Scripts

### Automated Build Script
```bash
#!/bin/bash
# scripts/build-mobile.sh

set -e

echo "🚀 Starting mobile app build..."

# Check environment
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Build iOS
echo "📱 Building iOS..."
cd ios
pod install
xcodebuild -workspace Bondarys.xcworkspace -scheme Bondarys -configuration Release -destination generic/platform=iOS -archivePath Bondarys.xcarchive archive
xcodebuild -exportArchive -archivePath Bondarys.xcarchive -exportPath ./build -exportOptionsPlist exportOptions.plist
cd ..

# Build Android
echo "🤖 Building Android..."
cd android
./gradlew assembleRelease
./gradlew bundleRelease
cd ..

echo "✅ Build completed successfully!"
echo "📱 iOS: ios/build/Bondarys.ipa"
echo "🤖 Android: android/app/build/outputs/apk/release/app-release.apk"
echo "📦 Android Bundle: android/app/build/outputs/bundle/release/app-release.aab"
```

### CI/CD Pipeline
```yaml
# .github/workflows/mobile-build.yml
name: Mobile App Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test

  build-android:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '11'
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: cd android && ./gradlew assembleRelease

  build-ios:
    runs-on: macos-latest
    needs: test
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: cd ios && pod install
      - run: cd ios && xcodebuild -workspace Bondarys.xcworkspace -scheme Bondarys -configuration Release -destination generic/platform=iOS -archivePath Bondarys.xcarchive archive
```

## 🔧 Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear all caches
npm run clean
```

#### iOS Build Issues
```bash
# Clean iOS build
cd ios
xcodebuild clean -workspace Bondarys.xcworkspace -scheme Bondarys
rm -rf build/
pod deintegrate
pod install
```

#### Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean
rm -rf app/build/
```

#### Permission Issues
```bash
# Fix file permissions
chmod +x android/gradlew
chmod +x scripts/*.sh
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=*

# Run with debug flags
npm start -- --verbose
```

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [NativeBase](https://docs.nativebase.io/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## 🆘 Support

For mobile app development support:

- **Email**: mobile-support@bondarys.com
- **Documentation**: https://docs.bondarys.com/mobile
- **GitHub Issues**: https://github.com/bondarys/bondarys/issues
- **Discord**: [Join our community](https://discord.gg/bondarys)

---

**Happy coding! 🚀** 