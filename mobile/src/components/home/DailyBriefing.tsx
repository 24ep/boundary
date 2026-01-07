import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { dailyBriefingStyles as styles } from '../../styles/home/dailyBriefing';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScalePressable } from '../common/ScalePressable';

interface BriefingItem {
    id: string;
    type: 'insight' | 'news';
    title: string;
    description: string;
    subtext?: string;
    icon?: string;
    color?: string;
    iconType?: 'ion' | 'mc';
}

const MOCK_DATA: BriefingItem[] = [
    {
        id: '1',
        type: 'insight',
        title: 'Daily Luck',
        description: 'You will be lucky today! 🍀',
        subtext: 'Great things are coming your way.',
        icon: 'sparkles',
        color: '#F59E0B',
        iconType: 'ion',
    },
    {
        id: '2',
        type: 'insight',
        title: 'Schedule',
        description: 'You have a lot of meetings today.',
        subtext: '5 meetings scheduled. First one starts in 30m.',
        icon: 'calendar',
        color: '#3B82F6',
        iconType: 'ion',
    },
    {
        id: '3',
        type: 'insight',
        title: 'Weather Forecast',
        description: 'Today is rainy, prepare the umbrella! ☔',
        subtext: 'High of 24°C, 80% chance of rain.',
        icon: 'weather-pouring', // MC icon
        color: '#6366F1',
        iconType: 'mc',
    },
    {
        id: '4',
        type: 'news',
        title: 'Tech News',
        description: 'The Future of AI Assistants',
        subtext: 'How AI is transforming daily productivity.',
        icon: 'newspaper',
        color: '#10B981',
        iconType: 'ion',
    },
    {
        id: '5',
        type: 'news',
        title: 'Wellness',
        description: '5 Minute Meditation Guide',
        subtext: 'Reduce stress with these simple steps.',
        icon: 'leaf',
        color: '#EC4899',
        iconType: 'ion',
    }
];

export const DailyBriefing: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Daily Briefing</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={292} // Card width (280) + gap (12)
            >
                {MOCK_DATA.map((item) => (
                    <ScalePressable key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                                {item.iconType === 'mc' ? (
                                    <IconMC name={item.icon || 'star'} size={20} color={item.color} />
                                ) : (
                                    <IconIon name={item.icon || 'star'} size={20} color={item.color} />
                                )}
                            </View>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                        </View>

                        <Text style={styles.cardDescription}>{item.description}</Text>
                        {item.subtext && (
                            <Text style={styles.cardSubtext}>{item.subtext}</Text>
                        )}

                        {item.type === 'news' && (
                            <View style={styles.newsTag}>
                                <Text style={styles.newsTagText}>Recommended</Text>
                            </View>
                        )}
                    </ScalePressable>
                ))}
            </ScrollView>
        </View>
    );
};
