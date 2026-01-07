import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { chatbotBriefingStyles as styles } from '../../styles/home/chatbotBriefing';
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
        description: '5 meetings scheduled.',
        subtext: 'First one starts in 30m.',
        icon: 'calendar',
        color: '#3B82F6',
        iconType: 'ion',
    },
    {
        id: '3',
        type: 'insight',
        title: 'Weather',
        description: 'Rainy today, bring umbrella ☔',
        subtext: 'High of 24°C.',
        icon: 'weather-pouring',
        color: '#6366F1',
        iconType: 'mc',
    },
    {
        id: '4',
        type: 'news',
        title: 'Tech News',
        description: 'The Future of AI Assistants',
        subtext: 'Boosting daily productivity.',
        icon: 'newspaper',
        color: '#10B981',
        iconType: 'ion',
    },
];

export const ChatbotBriefing: React.FC = () => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const scrollRef = React.useRef<ScrollView>(null);
    const CARD_WIDTH = 280; // Fixed width for carousel item
    const GAP = 12;
    const SNAP_INTERVAL = CARD_WIDTH + GAP;

    // Auto-cycle effect
    React.useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= MOCK_DATA.length) {
                nextIndex = 0;
            }

            setActiveIndex(nextIndex);

            // Programmatic scroll
            scrollRef.current?.scrollTo({
                x: nextIndex * SNAP_INTERVAL,
                animated: true,
            });
        }, 6000);

        return () => clearInterval(interval);
    }, [activeIndex]);

    // Update active index on manual scroll
    const onMomentumScrollEnd = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SNAP_INTERVAL);
        if (index !== activeIndex && index >= 0 && index < MOCK_DATA.length) {
            setActiveIndex(index);
        }
    };

    const activeItem = MOCK_DATA[activeIndex] || MOCK_DATA[0];

    return (
        <View style={styles.container}>
            {/* Bot Avatar (Dynamic) */}
            <View style={styles.botContainer}>
                <View style={styles.botAvatar}>
                    <IconMC name="robot-happy-outline" size={28} color="#4F46E5" />
                </View>
                <Text style={styles.botName}>Assistant</Text>
            </View>

            {/* Carousel */}
            <View style={styles.speechBubbleContainer}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    decelerationRate="fast"
                    snapToInterval={SNAP_INTERVAL}
                    disableIntervalMomentum={true}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                >
                    {MOCK_DATA.map((item) => (
                        <ScalePressable key={item.id} style={styles.briefingItem}>
                            <View style={styles.itemHeader}>
                                <View style={[styles.itemIcon, { backgroundColor: `${item.color}15` }]}>
                                    {item.iconType === 'mc' ? (
                                        <IconMC name={item.icon || 'star'} size={16} color={item.color} />
                                    ) : (
                                        <IconIon name={item.icon || 'star'} size={16} color={item.color} />
                                    )}
                                </View>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                            </View>

                            <Text style={styles.itemDescription} numberOfLines={2}>
                                {item.description}
                            </Text>

                            {item.subtext && (
                                <Text style={styles.itemSubtext} numberOfLines={1}>
                                    {item.subtext}
                                </Text>
                            )}
                        </ScalePressable>
                    ))}
                </ScrollView>

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                    {MOCK_DATA.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                activeIndex === index && styles.paginationDotActive,
                                activeIndex === index && { backgroundColor: MOCK_DATA[index].color || '#4F46E5' }
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};
