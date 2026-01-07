import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Mock Data
const STORIES = [
    { id: 'add', name: 'Add Story', isAdd: true },
    { id: '1', name: 'Caroline', avatar: 'https://i.pravatar.cc/100?img=1' },
    { id: '2', name: 'Steve', avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: '3', name: 'Gregory', avatar: 'https://i.pravatar.cc/100?img=3' },
    { id: '4', name: 'Rosalie', avatar: 'https://i.pravatar.cc/100?img=4' },
    { id: '5', name: 'Julia', avatar: 'https://i.pravatar.cc/100?img=5' },
    { id: '6', name: 'Marcus', avatar: 'https://i.pravatar.cc/100?img=6' },
];

const CHATS = [
    { id: '1', name: 'Rafael Mante', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=11', unread: 0 },
    { id: '2', name: 'Katherine Bernhard', message: '✔ Figma', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=12', unread: 0 },
    { id: '3', name: 'Terrence Lemke', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=13', unread: 2 },
    { id: '4', name: 'Alyssa Wisozk-Kihn', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=14', unread: 0 },
    { id: '5', name: 'Andrew Legros', message: '✔ Figma', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=15', unread: 0 },
    { id: '6', name: 'Dixie Haag', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=16', unread: 1 },
    { id: '7', name: 'Rafael Mante', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=11', unread: 0 },
];

const ChatListScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Saad Shaikh';

    // Header Gradient Colors (Matching Homescreen Default)
    const headerGradient = ['#FA7272', '#FFBBB4'];

    const renderStory = ({ item }: { item: any }) => {
        if (item.isAdd) {
            return (
                <TouchableOpacity style={styles.storyItem}>
                    <View style={[styles.storyCircle, styles.addStoryCircle]}>
                        <IconMC name="plus" size={24} color="#6B7280" />
                    </View>
                    <Text style={[styles.storyName, { color: '#4B5563' }]}>Add Story</Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity style={styles.storyItem}>
                <View style={[styles.storyCircle, styles.storyAvatarBorder]}>
                    <Image source={{ uri: item.avatar }} style={styles.storyImage} />
                </View>
                <Text style={[styles.storyName, { color: '#4B5563' }]}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const renderChat = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.chatItem}>
            <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <View style={styles.chatFooter}>
                    <Text style={[styles.chatMessage, item.unread > 0 && styles.chatMessageUnread]} numberOfLines={1}>
                        {item.message}
                    </Text>
                    {item.unread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header Background Gradient (Top Section) */}
            <LinearGradient
                colors={headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
            >
                <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafeArea}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <View>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <IconMC name="arrow-left" size={24} color="#FFFFFF" />
                                <Text style={styles.greeting}>Hi {userName}</Text>
                            </TouchableOpacity>
                            <Text style={styles.subtitle}>06 unread messages</Text>
                        </View>
                        <TouchableOpacity>
                            <Image
                                source={{ uri: user?.avatar || 'https://i.pravatar.cc/100?img=60' }}
                                style={styles.profileAvatar}
                            />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Scrollable Content (Bottom Section) - Starts Overlapping or Below? Image shows distinct list */}
            {/* We want the Lists to be on White background. */}

            <View style={styles.contentContainer}>
                {/* Stories */}
                <View style={styles.storiesContainer}>
                    <FlatList
                        data={STORIES}
                        renderItem={renderStory}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.storiesList}
                    />
                </View>

                {/* Chats List Section */}
                <View style={styles.chatsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Chats</Text>
                        <IconMC name="dots-horizontal" size={24} color="#6B7280" />
                    </View>

                    <FlatList
                        data={CHATS}
                        renderItem={renderChat}
                        keyExtractor={item => item.id + Math.random()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.chatsList}
                    />
                </View>
            </View>

            {/* Floating 'New' Button */}
            <View style={styles.floatingButtonContainer}>
                <TouchableOpacity style={styles.newChatButton}>
                    <IconMC name="plus" size={20} color="white" />
                    <Text style={styles.newChatText}>New</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    gradientHeader: {
        width: '100%',
        paddingBottom: 20, // Add space for content overlap if needed, or just header
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    headerSafeArea: {
        paddingBottom: 10,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    greeting: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF', // White for gradient
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)', // White semi-transp
        marginTop: 4,
        marginLeft: 32,
    },
    profileAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FCFCFC',
        marginTop: -10, // Slight overlap? Or straight
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
    },
    storiesContainer: {
        marginBottom: 24,
    },
    storiesList: {
        paddingHorizontal: 24,
        gap: 20,
    },
    storyItem: {
        alignItems: 'center',
        gap: 8,
    },
    storyCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        padding: 3,
        borderWidth: 0,
    },
    addStoryCircle: {
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyAvatarBorder: {
        borderWidth: 2,
        borderColor: '#10B981', // Green ring
    },
    storyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    storyName: {
        fontSize: 12,
        fontWeight: '500',
    },
    chatsSection: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    chatsList: {
        paddingHorizontal: 24,
        paddingBottom: 80,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    chatAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 16,
        backgroundColor: '#F3F4F6',
    },
    chatContent: {
        flex: 1,
        gap: 4,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    chatTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    chatFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatMessage: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
        marginRight: 8,
    },
    chatMessageUnread: {
        color: '#1F2937',
        fontWeight: '500',
    },
    unreadBadge: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    newChatButton: {
        backgroundColor: '#1F2937',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    newChatText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    }
});

export default ChatListScreen;
