import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { newsFeedStyles as styles } from '../../styles/home/newsFeed';
import { ScalePressable } from '../common/ScalePressable';

interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    category: string;
    image?: string; // URL
    color?: string; // For placeholder/tag
}

const MOCK_NEWS: NewsItem[] = [
    {
        id: '1',
        title: 'Top 5 Financial Tips for Families in 2026',
        source: 'Finance Daily',
        time: '2h ago',
        category: 'Finance',
        color: '#10B981',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: '2',
        title: 'How Smart Homes Are Changing Daily Life',
        source: 'Tech Trends',
        time: '4h ago',
        category: 'Technology',
        color: '#3B82F6',
        image: 'https://images.unsplash.com/photo-1558002038-1091a166111c?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: '3',
        title: 'Healthy Meal Prep Ideas for Busy Parents',
        source: 'Lifestyle Hub',
        time: '6h ago',
        category: 'Lifestyle',
        color: '#F59E0B',
        image: 'https://images.unsplash.com/photo-1505253758473-96b701d2cd03?w=800&auto=format&fit=crop&q=60'
    },
];

export const NewsFeed: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Latest News</Text>
                <ScalePressable>
                    <Text style={styles.seeAllText}>See all</Text>
                </ScalePressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {MOCK_NEWS.map((item) => (
                    <ScalePressable key={item.id} style={styles.newsCard}>
                        <View style={styles.imageContainer}>
                            {/* Use a colored view if image fails or for placeholder */}
                            <Image
                                source={{ uri: item.image }}
                                style={styles.image}
                                // @ts-ignore: web compatibility
                                resizeMode="cover"
                            />
                            <View style={styles.categoryTag}>
                                <Text style={[styles.categoryText, { color: item.color || '#4F46E5' }]}>
                                    {item.category}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.contentContainer}>
                            <Text style={styles.newsTitle} numberOfLines={2}>
                                {item.title}
                            </Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.sourceText}>{item.source}</Text>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </View>
                        </View>
                    </ScalePressable>
                ))}
            </ScrollView>
        </View>
    );
};
