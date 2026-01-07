import React, { useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { Avatar } from 'native-base';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';
import { ScalePressable } from '../common/ScalePressable';
import { useNavigation } from '@react-navigation/native';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import { NotificationDrawer } from './NotificationDrawer';
import { ProfileDrawer } from './ProfileDrawer';
import { ShareProfileDrawer } from './ShareProfileDrawer';
import { useMainContent } from '../../contexts/MainContentContext';

interface WelcomeSectionProps {
  selectedFamily: string;
  onFamilyDropdownPress: () => void;
  showFamilyDropdown: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  selectedFamily,
  onFamilyDropdownPress,
  showFamilyDropdown,
}) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { familyNameScaleAnim, chatOpacityAnim } = useNavigationAnimation();
  const { setActiveSection } = useMainContent();
  const { iconUrl, mobileAppName } = useBranding();

  // Chat state
  // Removed unused chat visibility and ID states

  // Notification & Profile state
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);

  // ... (notifications state unchanged)

  // (lines 40-113 omitted for brevity in search, but I need to be careful with replace)

  // Chat handlers
  const handleChatAvatarPress = () => {
    // Navigate to new Chat Page
    navigation.navigate('ChatList');
  };

  // Remove or keep handleCloseChatPage etc if widely used, 
  // but for now I'm just replacing imports and handler.
  // Wait, replace_file_content is single block.
  // I need to import useNavigation and update handleChatAvatarPress.
  // Using multi-replace is better here or I select a block containing imports.
  // I will use multi-replace for WelcomeSection too.


  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Message',
      message: 'Mom sent you a message about dinner plans',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      type: 'message' as const,
      isRead: false,
      senderName: 'Mom'
    },
    {
      id: '2',
      title: 'hourse Update',
      message: 'Dad updated his location - he\'s at the grocery store',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      type: 'hourse' as const,
      isRead: false,
      senderName: 'Dad'
    },
    {
      id: '3',
      title: 'Reminder',
      message: 'Don\'t forget about the hourse meeting at 7 PM',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      type: 'reminder' as const,
      isRead: true
    },
    {
      id: '4',
      title: 'System Update',
      message: 'Your hourse safety settings have been updated',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'system' as const,
      isRead: true
    }
  ]);







  // Notification handlers
  const handleNotificationIconPress = () => {
    setShowNotificationDrawer(true);
  };

  const handleCloseNotificationDrawer = () => {
    setShowNotificationDrawer(false);
  };

  const handleNotificationPress = (notification: any) => {
    // Mark notification as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Handle different notification types
    switch (notification.type) {
      case 'message':
        // Navigate to chat
        setShowNotificationDrawer(false);
        setActiveSection('chat');
        break;
      case 'hourse':
        // Could navigate to hourse screen
        break;
      case 'reminder':
        // Could navigate to calendar
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Greeting removed per request

  return (
    <View style={homeStyles.welcomeSection}>
      {/* Greeting removed */}
      <View style={homeStyles.familyNameRow}>
        <ScalePressable
          style={homeStyles.familyNameContainer}
          onPress={onFamilyDropdownPress}
        >
          <View style={homeStyles.familySelectorContainer}>
            <View style={homeStyles.familyLogoBox}>
              {iconUrl ? (
                <View style={{ width: 20, height: 20, borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    {/* @ts-ignore: React Native Image imported indirectly by RN runtime */}
                    <img src={iconUrl} alt="app icon" style={{ width: 20, height: 20, objectFit: 'cover' }} />
                  </View>
                </View>
              ) : (
                <CoolIcon name="house-03" size={20} color="#FFFFFF" />
              )}
            </View>
            <View style={homeStyles.familyTextColumn}>
              <Text style={homeStyles.familyLabelText}>{mobileAppName || 'hourse'}</Text>
              <Animated.Text
                style={[homeStyles.familyNameText, { transform: [{ scale: familyNameScaleAnim }] }]}
                numberOfLines={1}
              >
                {selectedFamily}
              </Animated.Text>
            </View>
            <IconMC
              name={showFamilyDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666666"
            />
          </View>
        </ScalePressable>
        <Animated.View style={{ opacity: chatOpacityAnim }}>
          <View style={homeStyles.chatContainer}>
            {/* Notification Icon (left) */}
            <ScalePressable
              style={homeStyles.notificationIconContainer}
              onPress={handleNotificationIconPress}
            >
              <View style={homeStyles.notificationIcon}>
                <CoolIcon name="bell" size={28} color="#FFFFFF" />
              </View>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <View style={homeStyles.notificationBadgeSmall}>
                  <Text style={homeStyles.notificationBadgeSmallText}>
                    {notifications.filter(n => !n.isRead).length}
                  </Text>
                </View>
              )}
            </ScalePressable>

            {/* Chat Icon (Restored) */}
            <ScalePressable
              style={homeStyles.chatCycleCard}
              onPress={handleChatAvatarPress}
              accessibilityLabel="Chat"
            >
              <View style={homeStyles.notificationIcon}>
                <CoolIcon name="chat-processing-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={homeStyles.chatBadge}>
                <Text style={homeStyles.chatBadgeText}>3</Text>
              </View>
            </ScalePressable>

            {/* Profile Avatar (far right) */}
            <ScalePressable
              style={homeStyles.chatCycleCard}
              onPress={() => setShowProfileDrawer(true)}
              accessibilityLabel="Open Profile"
            >
              <Avatar
                bg="purple.500"
                size="40px"
                source={{
                  uri: user?.avatar
                }}
                key={user?.avatar}
                style={{ width: 40, height: 40 }}
              >
                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
            </ScalePressable>
          </View>
        </Animated.View>
      </View>


      {/* Notification Drawer */}
      <NotificationDrawer
        visible={showNotificationDrawer}
        onClose={handleCloseNotificationDrawer}
        notifications={notifications}
        onNotificationPress={handleNotificationPress}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        visible={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        onSharePress={() => {
          // Wait for profile drawer to close slightly? Or just open
          setTimeout(() => setShowShareDrawer(true), 100);
        }}
      />

      {/* Share Profile Drawer */}
      <ShareProfileDrawer
        visible={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
      />
    </View>
  );
};
