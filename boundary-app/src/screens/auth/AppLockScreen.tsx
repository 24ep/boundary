import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Delete, Lock } from 'lucide-react-native';
import { identityApi } from '../../services/api';
import { ScreenBackground } from '../../components/ScreenBackground';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface AppLockScreenProps {
  navigation: any;
  onUnlock?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ navigation, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleNumberPress = (num: number) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 6) {
      handleVerifyPin();
    }
  }, [pin]);

  const handleVerifyPin = async () => {
    try {
      setLoading(true);
      const result = await identityApi.verifyPin(pin);
      if (result.success) {
        if (onUnlock) {
          onUnlock();
        } else {
          navigation.replace('MainTabs');
        }
      }
    } catch (error: any) {
      console.error('PIN verification failed:', error);
      Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
          await logout();
        }}
      ]
    );
  };

  const renderPinDot = (index: number) => {
    const isFilled = pin.length > index;
    return (
      <View 
        key={index} 
        style={[styles.pinDot, isFilled && styles.pinDotFilled]} 
      />
    );
  };

  return (
    <ScreenBackground screenId="auth">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Lock size={40} color="#3B82F6" />
          <Text style={styles.headerTitle}>App Locked</Text>
          <Text style={styles.headerSubtitle}>Enter your 6-digit PIN to continue</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.pinContainer}>
            {[0, 1, 2, 3, 4, 5].map(renderPinDot)}
          </View>

          {loading && <ActivityIndicator color="#3B82F6" style={styles.loader} />}

          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <TouchableOpacity 
                key={num} 
                style={styles.key} 
                onPress={() => handleNumberPress(num)}
                disabled={loading}
              >
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.key} 
              onPress={handleLogout}
              disabled={loading}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.key} 
              onPress={() => handleNumberPress(0)}
              disabled={loading}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.key} 
              onPress={handleDelete}
              disabled={loading}
            >
              <Delete size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  pinDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginHorizontal: 10,
  },
  pinDotFilled: {
    backgroundColor: '#3B82F6',
  },
  loader: {
    marginBottom: 20,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: width * 0.8,
  },
  key: {
    width: width * 0.2,
    height: width * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    borderRadius: width * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutText: {
    fontSize: 12,
    color: '#F87171',
    fontWeight: '600',
  },
});

export default AppLockScreen;
