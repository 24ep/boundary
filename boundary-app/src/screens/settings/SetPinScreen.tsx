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
import { ArrowLeft, Delete } from 'lucide-react-native';
import { appkit } from '../../services/api/appkit';
import { ScreenBackground } from '../../components/ScreenBackground';

const { width } = Dimensions.get('window');

interface SetPinScreenProps {
  navigation: any;
}

export const SetPinScreen: React.FC<SetPinScreenProps> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [loading, setLoading] = useState(false);

  const handleNumberPress = (num: number) => {
    if (step === 'create') {
      if (pin.length < 6) {
        setPin(prev => prev + num);
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin(prev => prev + num);
      }
    }
  };

  const handleDelete = () => {
    if (step === 'create') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (pin.length === 6 && step === 'create') {
      setStep('confirm');
    }
  }, [pin, step]);

  useEffect(() => {
    if (confirmPin.length === 6 && step === 'confirm') {
      if (pin === confirmPin) {
        handleSavePin();
      } else {
        Alert.alert('Error', 'PINs do not match. Please try again.', [
          { text: 'OK', onPress: () => {
            setConfirmPin('');
            setStep('create');
            setPin('');
          }}
        ]);
      }
    }
  }, [confirmPin, step, pin]);

  const handleSavePin = async () => {
    try {
      setLoading(true);
      await appkit.setPin(pin);
      Alert.alert('Success', 'Security PIN has been set successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error setting PIN:', error);
      Alert.alert('Error', error?.message || 'Failed to save PIN. Please try again.');
      setConfirmPin('');
      setPin('');
      setStep('create');
    } finally {
      setLoading(false);
    }
  };

  const renderPinDot = (index: number) => {
    const currentVal = step === 'create' ? pin : confirmPin;
    const isFilled = currentVal.length > index;
    return (
      <View 
        key={index} 
        style={[styles.pinDot, isFilled && styles.pinDotFilled]} 
      />
    );
  };

  return (
    <ScreenBackground screenId="settings">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'create' ? 'Set Security PIN' : 'Confirm Security PIN'}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.instruction}>
            {step === 'create' 
              ? 'Create a 6-digit PIN to secure your app' 
              : 'Re-enter your 6-digit PIN to confirm'}
          </Text>

          <View style={styles.pinContainer}>
            {[0, 1, 2, 3, 4, 5].map(renderPinDot)}
          </View>

          {loading && (
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginBottom: 20 }} />
          )}

          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <TouchableOpacity 
                key={num} 
                style={styles.key} 
                onPress={() => handleNumberPress(num)}
              >
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.key} />
            <TouchableOpacity 
              style={styles.key} 
              onPress={() => handleNumberPress(0)}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.key} 
              onPress={handleDelete}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  instruction: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    marginBottom: 50,
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
});

export default SetPinScreen;
