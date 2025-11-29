# Bondarys Development Guide

## 🚀 Development Philosophy

### Core Principles
1. **Luxury First**: ทุกโค้ดต้องสะท้อนความหรูหราและคุณภาพ
2. **Universal Accessibility**: พัฒนาเพื่อทุกวัย
3. **Performance Excellence**: ประสิทธิภาพสูงสุด
4. **Security Priority**: ความปลอดภัยเป็นสิ่งสำคัญ
5. **Family-Centric**: ออกแบบโค้ดเพื่อครอบครัว

### Development Goals
- **เด็ก**: ใช้งานง่าย ปลอดภัย สนุก
- **ผู้ใหญ่**: ครบครัน ปลอดภัย ดูมีระดับ
- **ผู้สูงอายุ**: ใช้งานง่าย ตัวอักษรใหญ่ ชัดเจน

## 🛠️ Technology Stack

### Frontend (React Native)
```json
{
  "core": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "typescript": "4.8.4"
  },
  "navigation": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/stack": "^6.3.20"
  },
  "ui": {
    "native-base": "^3.4.28",
    "react-native-vector-icons": "^10.0.2",
    "react-native-svg": "^13.14.0"
  },
  "state": {
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "redux-persist": "^6.0.0"
  },
  "features": {
    "react-native-maps": "^1.7.1",
    "react-native-geolocation-service": "^5.3.1",
    "react-native-camera": "^4.2.1",
    "react-native-webrtc": "^1.106.1"
  }
}
```

### Backend (Node.js)
```json
{
  "core": {
    "express": "^4.18.2",
    "typescript": "^5.1.6",
    "node": ">=18.0.0"
  },
  "database": {
    "mongoose": "^7.5.0",
    "redis": "^4.6.8"
  },
  "authentication": {
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "passport": "^0.6.0"
  },
  "real-time": {
    "socket.io": "^4.7.2"
  },
  "cloud": {
    "aws-sdk": "^2.1438.0",
    "firebase-admin": "^11.10.1"
  }
}
```

## 🎨 Design System Implementation

### Color System Setup
```typescript
// mobile/src/theme/colors.ts
export const colors = {
  // Luxury Red
  primary: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#D32F2F', // Primary Red
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  
  // Pure White
  white: {
    50: '#FFFFFF',
    100: '#FAFAFA',
    200: '#F5F5F5',
    300: '#EEEEEE',
    400: '#E0E0E0',
    500: '#FFFFFF', // Pure White
  },
  
  // Luxury Gold
  gold: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFD700', // Primary Gold
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  
  // Status Colors
  success: {
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
  },
  
  warning: {
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
  },
  
  error: {
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
  },
  
  info: {
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
  },
};
```

### Typography System
```typescript
// mobile/src/theme/typography.ts
export const typography = {
  fonts: {
    heading: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    body: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const textStyles = {
  h1: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
    color: colors.primary[500],
  },
  
  h2: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    color: colors.primary[500],
  },
  
  h3: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
    color: colors.primary[500],
  },
  
  body: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.relaxed,
    color: '#333333',
  },
  
  caption: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.normal,
    color: '#666666',
  },
};
```

### Component Library
```typescript
// mobile/src/components/common/LuxuryButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, textStyles } from '../../theme';

interface LuxuryButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'emergency';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
}

export const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
  ];
  
  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];
  
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  primary: {
    backgroundColor: colors.primary[500],
    borderWidth: 0,
  },
  
  secondary: {
    backgroundColor: colors.gold[500],
    borderWidth: 0,
  },
  
  emergency: {
    backgroundColor: colors.error[500],
    borderWidth: 3,
    borderColor: colors.gold[500],
  },
  
  small: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  
  large: {
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  text: {
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  primaryText: {
    color: colors.white[500],
  },
  
  secondaryText: {
    color: colors.primary[500],
  },
  
  emergencyText: {
    color: colors.white[500],
  },
  
  smallText: {
    fontSize: 14,
  },
  
  mediumText: {
    fontSize: 16,
  },
  
  largeText: {
    fontSize: 18,
  },
  
  disabledText: {
    opacity: 0.7,
  },
});
```

## 🏗️ Architecture Patterns

### Component Architecture
```typescript
// mobile/src/components/widgets/FamilyMembersWidget.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { FamilyMemberCard } from '../cards/FamilyMemberCard';
import { LuxuryCard } from '../common/LuxuryCard';
import { colors, textStyles } from '../../theme';

interface FamilyMembersWidgetProps {
  members: FamilyMember[];
  onMemberPress: (member: FamilyMember) => void;
  onCallPress: (member: FamilyMember) => void;
  onMessagePress: (member: FamilyMember) => void;
  onEmergencyPress: (member: FamilyMember) => void;
}

export const FamilyMembersWidget: React.FC<FamilyMembersWidgetProps> = ({
  members,
  onMemberPress,
  onCallPress,
  onMessagePress,
  onEmergencyPress,
}) => {
  return (
    <LuxuryCard>
      <View style={styles.header}>
        <Text style={styles.title}>👨‍👩‍👧‍👦 Family Members</Text>
        <Text style={styles.subtitle}>{members.length} members</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.membersContainer}
      >
        {members.map((member) => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            onPress={() => onMemberPress(member)}
            onCallPress={() => onCallPress(member)}
            onMessagePress={() => onMessagePress(member)}
            onEmergencyPress={() => onEmergencyPress(member)}
          />
        ))}
      </ScrollView>
    </LuxuryCard>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  
  title: {
    ...textStyles.h3,
    color: colors.primary[500],
    marginBottom: 4,
  },
  
  subtitle: {
    ...textStyles.caption,
    color: colors.gold[500],
  },
  
  membersContainer: {
    paddingHorizontal: 4,
  },
});
```

### State Management
```typescript
// mobile/src/store/slices/familySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { familyService } from '../../services/familyService';

export const fetchFamilyMembers = createAsyncThunk(
  'family/fetchMembers',
  async (familyId: string) => {
    const response = await familyService.getFamilyMembers(familyId);
    return response.data;
  }
);

export const updateMemberStatus = createAsyncThunk(
  'family/updateStatus',
  async ({ memberId, status }: { memberId: string; status: string }) => {
    const response = await familyService.updateMemberStatus(memberId, status);
    return response.data;
  }
);

const familySlice = createSlice({
  name: 'family',
  initialState: {
    members: [],
    loading: false,
    error: null,
  },
  reducers: {
    setMemberOnline: (state, action) => {
      const member = state.members.find(m => m.id === action.payload.memberId);
      if (member) {
        member.status = 'online';
        member.lastSeen = new Date().toISOString();
      }
    },
    
    setMemberOffline: (state, action) => {
      const member = state.members.find(m => m.id === action.payload.memberId);
      if (member) {
        member.status = 'offline';
        member.lastSeen = new Date().toISOString();
      }
    },
    
    updateMemberLocation: (state, action) => {
      const member = state.members.find(m => m.id === action.payload.memberId);
      if (member) {
        member.location = action.payload.location;
        member.lastLocationUpdate = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamilyMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFamilyMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchFamilyMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setMemberOnline, setMemberOffline, updateMemberLocation } = familySlice.actions;
export default familySlice.reducer;
```

### Service Layer
```typescript
// mobile/src/services/familyService.ts
import { api } from './api';
import { FamilyMember, Family, CreateFamilyRequest } from '../types/family';

export const familyService = {
  // Get family information
  getFamily: async (familyId: string): Promise<Family> => {
    const response = await api.get(`/families/${familyId}`);
    return response.data;
  },
  
  // Get family members
  getFamilyMembers: async (familyId: string): Promise<FamilyMember[]> => {
    const response = await api.get(`/families/${familyId}/members`);
    return response.data;
  },
  
  // Create new family
  createFamily: async (familyData: CreateFamilyRequest): Promise<Family> => {
    const response = await api.post('/families', familyData);
    return response.data;
  },
  
  // Invite member to family
  inviteMember: async (familyId: string, email: string, role: string): Promise<void> => {
    await api.post(`/families/${familyId}/invite`, { email, role });
  },
  
  // Update member status
  updateMemberStatus: async (memberId: string, status: string): Promise<FamilyMember> => {
    const response = await api.patch(`/members/${memberId}/status`, { status });
    return response.data;
  },
  
  // Update member location
  updateMemberLocation: async (memberId: string, location: any): Promise<void> => {
    await api.post(`/members/${memberId}/location`, location);
  },
  
  // Send emergency alert
  sendEmergencyAlert: async (familyId: string, alertData: any): Promise<void> => {
    await api.post(`/families/${familyId}/emergency`, alertData);
  },
};
```

## 🎯 Age-Appropriate Development

### Children Mode
```typescript
// mobile/src/components/children/ChildModeProvider.tsx
import React, { createContext, useContext, useState } from 'react';

interface ChildModeContextType {
  isChildMode: boolean;
  setChildMode: (enabled: boolean) => void;
  childSettings: ChildSettings;
  updateChildSettings: (settings: Partial<ChildSettings>) => void;
}

interface ChildSettings {
  fontSize: 'large' | 'extra-large';
  animations: boolean;
  soundEffects: boolean;
  simplifiedUI: boolean;
  parentalControls: boolean;
}

const ChildModeContext = createContext<ChildModeContextType | undefined>(undefined);

export const ChildModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChildMode, setIsChildMode] = useState(false);
  const [childSettings, setChildSettings] = useState<ChildSettings>({
    fontSize: 'large',
    animations: true,
    soundEffects: true,
    simplifiedUI: true,
    parentalControls: true,
  });
  
  const setChildMode = (enabled: boolean) => {
    setIsChildMode(enabled);
  };
  
  const updateChildSettings = (settings: Partial<ChildSettings>) => {
    setChildSettings(prev => ({ ...prev, ...settings }));
  };
  
  return (
    <ChildModeContext.Provider
      value={{
        isChildMode,
        setChildMode,
        childSettings,
        updateChildSettings,
      }}
    >
      {children}
    </ChildModeContext.Provider>
  );
};

export const useChildMode = () => {
  const context = useContext(ChildModeContext);
  if (!context) {
    throw new Error('useChildMode must be used within ChildModeProvider');
  }
  return context;
};
```

### Senior Mode
```typescript
// mobile/src/components/seniors/SeniorModeProvider.tsx
import React, { createContext, useContext, useState } from 'react';

interface SeniorModeContextType {
  isSeniorMode: boolean;
  setSeniorMode: (enabled: boolean) => void;
  seniorSettings: SeniorSettings;
  updateSeniorSettings: (settings: Partial<SeniorSettings>) => void;
}

interface SeniorSettings {
  fontSize: 'large' | 'extra-large' | 'huge';
  highContrast: boolean;
  reducedMotion: boolean;
  voiceAssistance: boolean;
  simplifiedNavigation: boolean;
  emergencyAccess: boolean;
}

const SeniorModeContext = createContext<SeniorModeContextType | undefined>(undefined);

export const SeniorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSeniorMode, setIsSeniorMode] = useState(false);
  const [seniorSettings, setSeniorSettings] = useState<SeniorSettings>({
    fontSize: 'large',
    highContrast: true,
    reducedMotion: true,
    voiceAssistance: true,
    simplifiedNavigation: true,
    emergencyAccess: true,
  });
  
  const setSeniorMode = (enabled: boolean) => {
    setIsSeniorMode(enabled);
  };
  
  const updateSeniorSettings = (settings: Partial<SeniorSettings>) => {
    setSeniorSettings(prev => ({ ...prev, ...settings }));
  };
  
  return (
    <SeniorModeContext.Provider
      value={{
        isSeniorMode,
        setSeniorMode,
        seniorSettings,
        updateSeniorSettings,
      }}
    >
      {children}
    </SeniorModeContext.Provider>
  );
};

export const useSeniorMode = () => {
  const context = useContext(SeniorModeContext);
  if (!context) {
    throw new Error('useSeniorMode must be used within SeniorModeProvider');
  }
  return context;
};
```

## 🔒 Security Implementation

### Authentication
```typescript
// mobile/src/services/authService.ts
import { api } from './api';
import { BiometricAuth } from '../utils/biometricAuth';
import { SecureStorage } from '../utils/secureStorage';

export const authService = {
  // Login with email/password
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    // Store tokens securely
    await SecureStorage.setItem('accessToken', accessToken);
    await SecureStorage.setItem('refreshToken', refreshToken);
    await SecureStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },
  
  // SSO Login
  ssoLogin: async (provider: string, token: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/sso', { provider, token });
    const { accessToken, refreshToken, user } = response.data;
    
    await SecureStorage.setItem('accessToken', accessToken);
    await SecureStorage.setItem('refreshToken', refreshToken);
    await SecureStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },
  
  // Biometric authentication
  biometricAuth: async (): Promise<boolean> => {
    try {
      const isAvailable = await BiometricAuth.isAvailable();
      if (!isAvailable) return false;
      
      const result = await BiometricAuth.authenticate();
      return result.success;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  },
  
  // Refresh token
  refreshToken: async (): Promise<string> => {
    const refreshToken = await SecureStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    
    await SecureStorage.setItem('accessToken', accessToken);
    return accessToken;
  },
  
  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await SecureStorage.removeItem('accessToken');
      await SecureStorage.removeItem('refreshToken');
      await SecureStorage.removeItem('user');
    }
  },
};
```

### Data Encryption
```typescript
// mobile/src/utils/encryption.ts
import CryptoJS from 'crypto-js';

export class Encryption {
  private static readonly SECRET_KEY = 'bondarys-secure-key-2024';
  
  // Encrypt sensitive data
  static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
  }
  
  // Decrypt sensitive data
  static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  // Encrypt location data
  static encryptLocation(latitude: number, longitude: number): string {
    const locationData = JSON.stringify({ latitude, longitude });
    return this.encrypt(locationData);
  }
  
  // Decrypt location data
  static decryptLocation(encryptedLocation: string): { latitude: number; longitude: number } {
    const decrypted = this.decrypt(encryptedLocation);
    return JSON.parse(decrypted);
  }
  
  // Hash sensitive data
  static hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
}
```

## 🎮 Game Development

### Family Games
```typescript
// mobile/src/components/games/FamilyQuizGame.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LuxuryButton } from '../common/LuxuryButton';
import { LuxuryCard } from '../common/LuxuryCard';
import { colors, textStyles } from '../../theme';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'family' | 'general' | 'fun';
}

interface FamilyQuizGameProps {
  onGameComplete: (score: number, totalQuestions: number) => void;
  onGameExit: () => void;
}

export const FamilyQuizGame: React.FC<FamilyQuizGameProps> = ({
  onGameComplete,
  onGameExit,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  const questions: QuizQuestion[] = [
    {
      id: '1',
      question: 'What is the most important thing in a family?',
      options: ['Money', 'Love', 'Success', 'Fame'],
      correctAnswer: 1,
      category: 'family',
    },
    {
      id: '2',
      question: 'How many family members are in your family?',
      options: ['1-2', '3-4', '5-6', '7+'],
      correctAnswer: 1,
      category: 'family',
    },
    // Add more questions...
  ];
  
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
      // Play success animation
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        onGameComplete(score + (answerIndex === questions[currentQuestion].correctAnswer ? 1 : 0), questions.length);
      }
    }, 2000);
  };
  
  const question = questions[currentQuestion];
  
  return (
    <View style={styles.container}>
      <LuxuryCard>
        <View style={styles.header}>
          <Text style={styles.title}>🎮 Family Quiz</Text>
          <Text style={styles.progress}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <Text style={styles.score}>Score: {score}</Text>
        </View>
        
        <Animated.View
          style={[
            styles.questionContainer,
            {
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.question}>{question.question}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <LuxuryButton
                key={index}
                title={option}
                variant={
                  showResult
                    ? index === question.correctAnswer
                      ? 'secondary'
                      : index === selectedAnswer
                      ? 'emergency'
                      : 'primary'
                    : 'primary'
                }
                size="large"
                onPress={() => handleAnswerSelect(index)}
                disabled={showResult}
              />
            ))}
          </View>
          
          {showResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                {selectedAnswer === question.correctAnswer ? '✅ Correct!' : '❌ Wrong!'}
              </Text>
            </View>
          )}
        </Animated.View>
        
        <View style={styles.actions}>
          <LuxuryButton
            title="Exit Game"
            variant="secondary"
            size="medium"
            onPress={onGameExit}
          />
        </View>
      </LuxuryCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  title: {
    ...textStyles.h2,
    color: colors.primary[500],
    marginBottom: 8,
  },
  
  progress: {
    ...textStyles.body,
    color: colors.gold[500],
    marginBottom: 4,
  },
  
  score: {
    ...textStyles.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
  
  questionContainer: {
    marginBottom: 24,
  },
  
  question: {
    ...textStyles.h3,
    color: colors.primary[500],
    textAlign: 'center',
    marginBottom: 24,
  },
  
  optionsContainer: {
    gap: 12,
  },
  
  resultContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  
  resultText: {
    ...textStyles.h4,
    color: colors.gold[500],
  },
  
  actions: {
    alignItems: 'center',
  },
});
```

## 📊 Performance Optimization

### Image Optimization
```typescript
// mobile/src/utils/imageOptimizer.ts
import { Image } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export class ImageOptimizer {
  // Optimize image for upload
  static async optimizeForUpload(uri: string): Promise<string> {
    try {
      const result = await manipulateAsync(
        uri,
        [
          { resize: { width: 1024 } }, // Resize to max 1024px width
        ],
        {
          compress: 0.8, // 80% quality
          format: SaveFormat.JPEG,
        }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Image optimization error:', error);
      return uri; // Return original if optimization fails
    }
  }
  
  // Optimize image for display
  static async optimizeForDisplay(uri: string, width: number, height: number): Promise<string> {
    try {
      const result = await manipulateAsync(
        uri,
        [
          { resize: { width, height } },
        ],
        {
          compress: 0.9, // 90% quality for display
          format: SaveFormat.JPEG,
        }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Image optimization error:', error);
      return uri;
    }
  }
  
  // Generate thumbnail
  static async generateThumbnail(uri: string): Promise<string> {
    try {
      const result = await manipulateAsync(
        uri,
        [
          { resize: { width: 200, height: 200 } },
        ],
        {
          compress: 0.7, // 70% quality for thumbnails
          format: SaveFormat.JPEG,
        }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return uri;
    }
  }
}
```

### Memory Management
```typescript
// mobile/src/utils/memoryManager.ts
import { Platform } from 'react-native';

export class MemoryManager {
  private static cache = new Map<string, any>();
  private static maxCacheSize = 50 * 1024 * 1024; // 50MB
  private static currentCacheSize = 0;
  
  // Add item to cache
  static set(key: string, value: any, size: number = 0): void {
    // Remove old items if cache is full
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.cleanup();
    }
    
    this.cache.set(key, { value, size, timestamp: Date.now() });
    this.currentCacheSize += size;
  }
  
  // Get item from cache
  static get(key: string): any {
    const item = this.cache.get(key);
    if (item) {
      item.timestamp = Date.now(); // Update access time
      return item.value;
    }
    return null;
  }
  
  // Remove item from cache
  static remove(key: string): void {
    const item = this.cache.get(key);
    if (item) {
      this.currentCacheSize -= item.size;
      this.cache.delete(key);
    }
  }
  
  // Clean up old items
  static cleanup(): void {
    const items = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    for (const [key, item] of items) {
      if (this.currentCacheSize <= this.maxCacheSize * 0.8) break;
      
      this.currentCacheSize -= item.size;
      this.cache.delete(key);
    }
  }
  
  // Clear all cache
  static clear(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
  }
  
  // Get cache statistics
  static getStats(): { size: number; items: number; maxSize: number } {
    return {
      size: this.currentCacheSize,
      items: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }
}
```

## 🧪 Testing Strategy

### Unit Testing
```typescript
// mobile/src/__tests__/components/LuxuryButton.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LuxuryButton } from '../../components/common/LuxuryButton';

describe('LuxuryButton', () => {
  it('renders correctly with primary variant', () => {
    const { getByText } = render(
      <LuxuryButton
        title="Test Button"
        variant="primary"
        onPress={() => {}}
      />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <LuxuryButton
        title="Test Button"
        variant="primary"
        onPress={onPressMock}
      />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
  
  it('applies correct styles for different variants', () => {
    const { getByText, rerender } = render(
      <LuxuryButton
        title="Test Button"
        variant="primary"
        onPress={() => {}}
      />
    );
    
    const button = getByText('Test Button').parent;
    expect(button).toHaveStyle({ backgroundColor: '#D32F2F' });
    
    rerender(
      <LuxuryButton
        title="Test Button"
        variant="secondary"
        onPress={() => {}}
      />
    );
    
    expect(button).toHaveStyle({ backgroundColor: '#FFD700' });
  });
});
```

### Integration Testing
```typescript
// mobile/src/__tests__/integration/FamilyWidget.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { FamilyMembersWidget } from '../../components/widgets/FamilyMembersWidget';

const mockMembers = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar1.jpg',
    status: 'online',
    lastSeen: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Doe',
    avatar: 'https://example.com/avatar2.jpg',
    status: 'offline',
    lastSeen: new Date().toISOString(),
  },
];

describe('FamilyMembersWidget Integration', () => {
  it('renders family members correctly', () => {
    const { getByText } = render(
      <Provider store={store}>
        <FamilyMembersWidget
          members={mockMembers}
          onMemberPress={() => {}}
          onCallPress={() => {}}
          onMessagePress={() => {}}
          onEmergencyPress={() => {}}
        />
      </Provider>
    );
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Doe')).toBeTruthy();
  });
  
  it('handles member press events', async () => {
    const onMemberPressMock = jest.fn();
    const { getByText } = render(
      <Provider store={store}>
        <FamilyMembersWidget
          members={mockMembers}
          onMemberPress={onMemberPressMock}
          onCallPress={() => {}}
          onMessagePress={() => {}}
          onEmergencyPress={() => {}}
        />
      </Provider>
    );
    
    fireEvent.press(getByText('John Doe'));
    
    await waitFor(() => {
      expect(onMemberPressMock).toHaveBeenCalledWith(mockMembers[0]);
    });
  });
});
```

This development guide provides comprehensive instructions for building a luxury, modern family application that is accessible and easy to use for all ages, with a focus on the red-white-gold color scheme and family-centric features. 