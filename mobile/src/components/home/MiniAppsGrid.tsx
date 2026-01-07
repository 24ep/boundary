import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { miniAppsStyles as styles } from '../../styles/home/miniApps';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScalePressable } from '../common/ScalePressable';

interface MiniApp {
    id: string;
    label: string;
    icon: string;
    color: string;
    iconType: 'ion' | 'mc';
}

const MINI_APPS: MiniApp[] = [
    { id: '1', label: 'Garden', icon: 'flower', color: '#10B981', iconType: 'mc' },
    { id: '2', label: 'Cooking', icon: 'chef-hat', color: '#F59E0B', iconType: 'mc' },
    { id: '3', label: 'News', icon: 'newspaper', color: '#3B82F6', iconType: 'ion' },
    { id: '4', label: 'Crypto', icon: 'bitcoin', color: '#F59E0B', iconType: 'mc' },
    { id: '5', label: 'Health', icon: 'heart', color: '#EF4444', iconType: 'ion' },
    { id: '6', label: 'Games', icon: 'game-controller', color: '#8B5CF6', iconType: 'ion' },
    { id: '7', label: 'Travel', icon: 'airplane', color: '#06B6D4', iconType: 'ion' },
    { id: '8', label: 'Music', icon: 'musical-notes', color: '#EC4899', iconType: 'ion' },
    { id: '9', label: 'Finance', icon: 'cash', color: '#10B981', iconType: 'ion' }, // Extra for scrolling
    { id: '10', label: 'Shop', icon: 'cart', color: '#F472B6', iconType: 'ion' }, // Extra for scrolling
];

interface MiniAppsGridProps {
    onSeeAllPress?: () => void;
}

export const MiniAppsGrid: React.FC<MiniAppsGridProps> = ({ onSeeAllPress }) => {
    // Chunk into pairs for 2-row layout
    const chunkedApps = [];
    for (let i = 0; i < MINI_APPS.length; i += 2) {
        chunkedApps.push(MINI_APPS.slice(i, i + 2));
    }

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Activities</Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAllPress}>
                    <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {chunkedApps.map((pair, index) => (
                    <View key={index} style={styles.column}>
                        {pair.map((app) => (
                            <ScalePressable key={app.id} style={styles.appItem} onPress={() => console.log('Open', app.label)}>
                                <View style={styles.iconContainer}>
                                    {app.iconType === 'mc' ? (
                                        <IconMC name={app.icon} size={24} color={app.color} />
                                    ) : (
                                        <IconIon name={app.icon} size={24} color={app.color} />
                                    )}
                                </View>
                                <Text style={styles.appLabel}>{app.label}</Text>
                            </ScalePressable>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
