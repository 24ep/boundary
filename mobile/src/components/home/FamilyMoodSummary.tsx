import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

export const FamilyMoodSummary: React.FC<{ onPress: () => void; emotionData: any[] }> = ({ onPress, emotionData }) => {
    // Mock calculation or use emotionData
    const moodScore = 7.5; // 0-10
    const vibe = "Happy & Energetic";

    return (
        <TouchableOpacity onPress={onPress}>
            <LinearGradient
                colors={['#FFF0F5', '#FFE4E1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <IconMC name="emoticon-happy-outline" size={24} color="#FF69B4" />
                        <Text style={styles.title}>Family Vibe</Text>
                    </View>
                    <IconMC name="chevron-right" size={20} color="#FF69B4" />
                </View>

                <View style={styles.content}>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.score}>{moodScore}</Text>
                        <Text style={styles.scoreLabel}>/10</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.vibeText}>{vibe}</Text>
                        <Text style={styles.subText}>2 members are feeling great!</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 182, 193, 0.4)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    score: {
        fontSize: 24,
        fontWeight: '800',
        color: '#D81B60',
    },
    scoreLabel: {
        fontSize: 14,
        color: '#D81B60',
        fontWeight: '600',
    },
    vibeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    subText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
});
