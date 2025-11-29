# Bondarys Widget Customization System

## 🎯 Widget Customization Overview

### Core Features
- **Drag & Drop**: จัดเรียง widget ด้วยการลากวาง
- **Add/Remove**: เพิ่มหรือลบ widget ตามต้องการ
- **Resize**: ปรับขนาด widget
- **Personalize**: ปรับแต่งการแสดงผล
- **Save Layouts**: บันทึกการจัดเรียงหลายแบบ

## 🏗️ Widget System Architecture

### Widget Types
```typescript
interface WidgetType {
  id: string;
  name: string;
  category: 'family' | 'health' | 'finance' | 'entertainment' | 'productivity' | 'safety';
  size: 'small' | 'medium' | 'large' | 'full';
  customizable: boolean;
  premium: boolean;
  defaultEnabled: boolean;
  maxInstances: number;
}

interface WidgetInstance {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large' | 'full';
  settings: WidgetSettings;
  data: any;
  lastUpdated: Date;
}

interface WidgetSettings {
  title: string;
  showHeader: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  privacy: 'family' | 'private' | 'public';
}
```

### Available Widgets

#### 🏠 Family Widgets
```typescript
const familyWidgets: WidgetType[] = [
  {
    id: 'family-members',
    name: 'Family Members',
    category: 'family',
    size: 'large',
    customizable: true,
    premium: false,
    defaultEnabled: true,
    maxInstances: 1,
  },
  {
    id: 'family-location',
    name: 'Family Location Map',
    category: 'family',
    size: 'large',
    customizable: true,
    premium: false,
    defaultEnabled: true,
    maxInstances: 1,
  },
  {
    id: 'family-chat',
    name: 'Family Chat',
    category: 'family',
    size: 'medium',
    customizable: true,
    premium: false,
    defaultEnabled: true,
    maxInstances: 1,
  },
  {
    id: 'family-calendar',
    name: 'Family Calendar',
    category: 'family',
    size: 'medium',
    customizable: true,
    premium: false,
    defaultEnabled: true,
    maxInstances: 1,
  },
];
```

#### 🏥 Health Widgets
```typescript
const healthWidgets: WidgetType[] = [
  {
    id: 'health-summary',
    name: 'Health Summary',
    category: 'health',
    size: 'medium',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 1,
  },
  {
    id: 'medication-reminders',
    name: 'Medication Reminders',
    category: 'health',
    size: 'small',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 3,
  },
  {
    id: 'activity-tracking',
    name: 'Activity Tracking',
    category: 'health',
    size: 'medium',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 1,
  },
  {
    id: 'mood-tracker',
    name: 'Mood Tracker',
    category: 'health',
    size: 'small',
    customizable: true,
    premium: false,
    defaultEnabled: false,
    maxInstances: 1,
  },
];
```

#### 💰 Finance Widgets
```typescript
const financeWidgets: WidgetType[] = [
  {
    id: 'budget-overview',
    name: 'Budget Overview',
    category: 'finance',
    size: 'medium',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 1,
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    category: 'finance',
    size: 'large',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 1,
  },
  {
    id: 'bill-reminders',
    name: 'Bill Reminders',
    category: 'finance',
    size: 'small',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 2,
  },
  {
    id: 'savings-goals',
    name: 'Savings Goals',
    category: 'finance',
    size: 'medium',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 1,
  },
];
```

#### 🛒 Shopping Widgets
```typescript
const shoppingWidgets: WidgetType[] = [
  {
    id: 'shopping-list',
    name: 'Shopping List',
    category: 'shopping',
    size: 'medium',
    customizable: true,
    premium: false,
    defaultEnabled: true,
    maxInstances: 2,
  },
  {
    id: 'price-alerts',
    name: 'Price Alerts',
    category: 'shopping',
    size: 'small',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 3,
  },
  {
    id: 'deals-finder',
    name: 'Deals Finder',
    category: 'shopping',
    size: 'medium',
    customizable: true,
    premium: true,
    defaultEnabled: false,
    maxInstances: 1,
  },
];
```

#### 🎮 Entertainment Widgets
```typescript
const entertainmentWidgets: WidgetType[] = [
  {
    id: 'family-games',
    name: 'Family Games',
    category: 'entertainment',
    size: 'medium',
    customizable: true,
    premium: false,
    defaultEnabled: false,
    maxInstances: 1,
  },
  {
    id: 'media-gallery',
    name: 'Media Gallery',
    category: 'entertainment',
    size: 'large',
    customizable: true,
    premium: false,
    defaultEnabled: false,
    maxInstances: 1,
  },
  {
    id: 'family-activities',
    name: 'Family Activities',
    category: 'entertainment',
    size: 'medium',
    customizable: true,
    premium: false,
    defaultEnabled: false,
    maxInstances: 1,
  },
];
```

#### 🔧 Productivity Widgets
```typescript
const productivityWidgets: WidgetType[] = [
  {
    id: 'task-manager',
    name: 'Task Manager',
    category: 'productivity',
    size: 'medium',
    customizable: true,
    premium: false,
    defaultEnabled: false,
    maxInstances: 1,
  },
  {
    id: 'notes-widget',
    name: 'Quick Notes',
    category: 'productivity',
    size: 'small',
    customizable: true,
    premium: false,
    defaultEnabled: false,
    maxInstances: 2,
  },
  {
    id: 'weather-widget',
    name: 'Weather',
    category: 'productivity',
    size: 'small',
    customizable: true,
    premium: false,
    defaultEnabled: false,
    maxInstances: 1,
  },
];
```

## 🎨 Widget Customization UI

### Customization Panel
```typescript
// mobile/src/components/widgets/WidgetCustomizationPanel.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Box, VStack, HStack, Text, Icon, Pressable, Badge } from 'native-base';
import { colors, textStyles } from '../../theme';

interface WidgetCustomizationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string) => void;
  onRemoveWidget: (widgetId: string) => void;
  onSaveLayout: () => void;
  availableWidgets: WidgetType[];
  activeWidgets: WidgetInstance[];
}

export const WidgetCustomizationPanel: React.FC<WidgetCustomizationPanelProps> = ({
  isVisible,
  onClose,
  onAddWidget,
  onRemoveWidget,
  onSaveLayout,
  availableWidgets,
  activeWidgets,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: '📱' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'shopping', name: 'Shopping', icon: '🛒' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
    { id: 'productivity', name: 'Productivity', icon: '🔧' },
  ];

  const filteredWidgets = selectedCategory === 'all' 
    ? availableWidgets 
    : availableWidgets.filter(widget => widget.category === selectedCategory);

  const isWidgetActive = (widgetId: string) => {
    return activeWidgets.some(widget => widget.type === widgetId);
  };

  const getActiveCount = (widgetId: string) => {
    return activeWidgets.filter(widget => widget.type === widgetId).length;
  };

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.8)"
      zIndex={1000}
      display={isVisible ? 'flex' : 'none'}
    >
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg={colors.white[500]}
        borderTopRadius={20}
        maxH="80%"
      >
        {/* Header */}
        <HStack
          justifyContent="space-between"
          alignItems="center"
          p={4}
          borderBottomWidth={1}
          borderBottomColor={colors.gold[200]}
        >
          <Text style={textStyles.h3} color={colors.primary[500]}>
            🎨 Customize Widgets
          </Text>
          <Pressable onPress={onClose}>
            <Icon name="close" size={24} color={colors.primary[500]} />
          </Pressable>
        </HStack>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} p={2}>
          <HStack space={2}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Box
                  bg={selectedCategory === category.id ? colors.primary[500] : colors.gold[100]}
                  px={4}
                  py={2}
                  borderRadius={20}
                >
                  <HStack space={2} alignItems="center">
                    <Text fontSize={16}>{category.icon}</Text>
                    <Text
                      color={selectedCategory === category.id ? colors.white[500] : colors.primary[500]}
                      fontWeight="600"
                    >
                      {category.name}
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            ))}
          </HStack>
        </ScrollView>

        {/* Widget List */}
        <ScrollView flex={1} p={4}>
          <VStack space={4}>
            {filteredWidgets.map((widget) => {
              const isActive = isWidgetActive(widget.id);
              const activeCount = getActiveCount(widget.id);
              const canAdd = !isActive || activeCount < widget.maxInstances;

              return (
                <Box
                  key={widget.id}
                  bg={colors.white[500]}
                  borderWidth={2}
                  borderColor={isActive ? colors.gold[500] : colors.gold[200]}
                  borderRadius={12}
                  p={4}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack flex={1}>
                      <HStack space={2} alignItems="center" mb={2}>
                        <Text style={textStyles.h4} color={colors.primary[500]}>
                          {widget.name}
                        </Text>
                        {widget.premium && (
                          <Badge bg={colors.gold[500]} color={colors.primary[500]}>
                            PREMIUM
                          </Badge>
                        )}
                        {isActive && (
                          <Badge bg={colors.success[500]} color={colors.white[500]}>
                            ACTIVE ({activeCount})
                          </Badge>
                        )}
                      </HStack>
                      
                      <HStack space={4} mb={2}>
                        <Text style={textStyles.caption} color={colors.gold[500]}>
                          📏 Size: {widget.size}
                        </Text>
                        <Text style={textStyles.caption} color={colors.gold[500]}>
                          🔢 Max: {widget.maxInstances}
                        </Text>
                      </HStack>
                    </VStack>

                    <VStack space={2}>
                      {isActive ? (
                        <Pressable
                          onPress={() => onRemoveWidget(widget.id)}
                          bg={colors.error[500]}
                          px={4}
                          py={2}
                          borderRadius={8}
                        >
                          <Text color={colors.white[500]} fontWeight="600">
                            Remove
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => onAddWidget(widget.id)}
                          bg={canAdd ? colors.primary[500] : colors.gray[300]}
                          px={4}
                          py={2}
                          borderRadius={8}
                          disabled={!canAdd}
                        >
                          <Text
                            color={canAdd ? colors.white[500] : colors.gray[500]}
                            fontWeight="600"
                          >
                            Add
                          </Text>
                        </Pressable>
                      )}
                    </VStack>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </ScrollView>

        {/* Footer Actions */}
        <Box
          p={4}
          borderTopWidth={1}
          borderTopColor={colors.gold[200]}
        >
          <HStack space={4}>
            <Pressable
              flex={1}
              onPress={onClose}
              bg={colors.gray[300]}
              py={3}
              borderRadius={12}
            >
              <Text textAlign="center" fontWeight="600" color={colors.gray[600]}>
                Cancel
              </Text>
            </Pressable>
            
            <Pressable
              flex={1}
              onPress={onSaveLayout}
              bg={colors.primary[500]}
              py={3}
              borderRadius={12}
            >
              <Text textAlign="center" fontWeight="600" color={colors.white[500]}>
                Save Layout
              </Text>
            </Pressable>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};
```

### Draggable Widget Container
```typescript
// mobile/src/components/widgets/DraggableWidgetContainer.tsx
import React, { useState, useRef } from 'react';
import { View, PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated } from 'react-native';
import { Box } from 'native-base';

interface DraggableWidgetContainerProps {
  children: React.ReactNode;
  widgetId: string;
  onMove: (widgetId: string, newPosition: { x: number; y: number }) => void;
  onResize: (widgetId: string, newSize: string) => void;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large' | 'full';
  isEditing: boolean;
}

export const DraggableWidgetContainer: React.FC<DraggableWidgetContainerProps> = ({
  children,
  widgetId,
  onMove,
  onResize,
  position,
  size,
  isEditing,
}) => {
  const translateX = useRef(new Animated.Value(position.x)).current;
  const translateY = useRef(new Animated.Value(position.y)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const newX = position.x + event.nativeEvent.translationX;
      const newY = position.y + event.nativeEvent.translationY;
      
      onMove(widgetId, { x: newX, y: newY });
      
      // Reset animation values
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 150, height: 120 };
      case 'medium':
        return { width: 200, height: 160 };
      case 'large':
        return { width: 300, height: 240 };
      case 'full':
        return { width: '100%', height: 300 };
      default:
        return { width: 200, height: 160 };
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: position.x,
          top: position.y,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
          zIndex: isEditing ? 100 : 1,
        },
        getSizeStyles(),
      ]}
    >
      {isEditing ? (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={{ flex: 1 }}>
            <Box
              borderWidth={2}
              borderColor={colors.gold[500]}
              borderRadius={12}
              bg={colors.white[500]}
              shadow={4}
            >
              {/* Resize Handles */}
              <Box position="absolute" top={-10} right={-10} zIndex={10}>
                <Pressable
                  onPress={() => onResize(widgetId, 'large')}
                  bg={colors.gold[500]}
                  w={20}
                  h={20}
                  borderRadius={10}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text color={colors.white[500]} fontSize={12}>↔</Text>
                </Pressable>
              </Box>
              
              {children}
            </Box>
          </Animated.View>
        </PanGestureHandler>
      ) : (
        <Box
          borderRadius={12}
          bg={colors.white[500]}
          shadow={2}
          overflow="hidden"
        >
          {children}
        </Box>
      )}
    </Animated.View>
  );
};
```

### Widget Settings Modal
```typescript
// mobile/src/components/widgets/WidgetSettingsModal.tsx
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Box, VStack, HStack, Text, Switch, Slider, Pressable } from 'native-base';
import { colors, textStyles } from '../../theme';

interface WidgetSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (settings: WidgetSettings) => void;
  widget: WidgetInstance;
}

export const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({
  isVisible,
  onClose,
  onSave,
  widget,
}) => {
  const [settings, setSettings] = useState<WidgetSettings>(widget.settings);
  const [refreshInterval, setRefreshInterval] = useState(settings.refreshInterval);

  const handleSave = () => {
    onSave({
      ...settings,
      refreshInterval,
    });
    onClose();
  };

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.8)"
      zIndex={1000}
      display={isVisible ? 'flex' : 'none'}
    >
      <Box
        position="absolute"
        top="20%"
        left={20}
        right={20}
        bg={colors.white[500]}
        borderRadius={16}
        maxH="60%"
      >
        {/* Header */}
        <Box
          p={4}
          borderBottomWidth={1}
          borderBottomColor={colors.gold[200]}
        >
          <Text style={textStyles.h3} color={colors.primary[500]}>
            ⚙️ Widget Settings
          </Text>
          <Text style={textStyles.caption} color={colors.gold[500]}>
            {widget.type}
          </Text>
        </Box>

        {/* Settings */}
        <ScrollView flex={1} p={4}>
          <VStack space={6}>
            {/* Title */}
            <VStack space={2}>
              <Text style={textStyles.h4} color={colors.primary[500]}>
                Widget Title
              </Text>
              <TextInput
                value={settings.title}
                onChangeText={(text) => setSettings({ ...settings, title: text })}
                style={{
                  borderWidth: 1,
                  borderColor: colors.gold[300],
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholder="Enter widget title"
              />
            </VStack>

            {/* Display Options */}
            <VStack space={2}>
              <Text style={textStyles.h4} color={colors.primary[500]}>
                Display Options
              </Text>
              
              <HStack justifyContent="space-between" alignItems="center">
                <Text style={textStyles.body}>Show Header</Text>
                <Switch
                  value={settings.showHeader}
                  onValueChange={(value) => setSettings({ ...settings, showHeader: value })}
                  colorScheme="red"
                />
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <Text style={textStyles.body}>Enable Notifications</Text>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => setSettings({ ...settings, notifications: value })}
                  colorScheme="red"
                />
              </HStack>
            </VStack>

            {/* Refresh Interval */}
            <VStack space={2}>
              <Text style={textStyles.h4} color={colors.primary[500]}>
                Refresh Interval: {refreshInterval} minutes
              </Text>
              <Slider
                value={refreshInterval}
                onChange={setRefreshInterval}
                minValue={1}
                maxValue={60}
                step={1}
                colorScheme="red"
              >
                <Slider.Track>
                  <Slider.FilledTrack />
                </Slider.Track>
                <Slider.Thumb />
              </Slider>
            </VStack>

            {/* Privacy */}
            <VStack space={2}>
              <Text style={textStyles.h4} color={colors.primary[500]}>
                Privacy Level
              </Text>
              <VStack space={2}>
                {[
                  { value: 'family', label: 'Family Only', icon: '👨‍👩‍👧‍👦' },
                  { value: 'private', label: 'Private', icon: '🔒' },
                  { value: 'public', label: 'Public', icon: '🌍' },
                ].map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setSettings({ ...settings, privacy: option.value as any })}
                  >
                    <HStack
                      space={3}
                      p={3}
                      bg={settings.privacy === option.value ? colors.primary[100] : colors.gray[100]}
                      borderRadius={8}
                      alignItems="center"
                    >
                      <Text fontSize={20}>{option.icon}</Text>
                      <Text
                        style={textStyles.body}
                        color={settings.privacy === option.value ? colors.primary[500] : colors.gray[600]}
                        fontWeight={settings.privacy === option.value ? '600' : '400'}
                      >
                        {option.label}
                      </Text>
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>

        {/* Footer Actions */}
        <Box
          p={4}
          borderTopWidth={1}
          borderTopColor={colors.gold[200]}
        >
          <HStack space={4}>
            <Pressable
              flex={1}
              onPress={onClose}
              bg={colors.gray[300]}
              py={3}
              borderRadius={12}
            >
              <Text textAlign="center" fontWeight="600" color={colors.gray[600]}>
                Cancel
              </Text>
            </Pressable>
            
            <Pressable
              flex={1}
              onPress={handleSave}
              bg={colors.primary[500]}
              py={3}
              borderRadius={12}
            >
              <Text textAlign="center" fontWeight="600" color={colors.white[500]}>
                Save Settings
              </Text>
            </Pressable>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};
```

## 🎨 Updated HomeScreen with Widget Customization

```typescript
// mobile/src/screens/main/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Box, VStack, HStack, Text, Icon, Pressable, Badge, useColorModeValue } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

import { TopMenu } from '../../components/navigation/TopMenu';
import { WidgetCustomizationPanel } from '../../components/widgets/WidgetCustomizationPanel';
import { DraggableWidgetContainer } from '../../components/widgets/DraggableWidgetContainer';
import { WidgetSettingsModal } from '../../components/widgets/WidgetSettingsModal';
import { useFamily } from '../../hooks/useFamily';
import { useLocation } from '../../hooks/useLocation';
import { useNotifications } from '../../hooks/useNotifications';
import { colors, textStyles } from '../../theme';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetInstance | null>(null);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<WidgetType[]>([]);

  const { family, familyMembers, refreshFamily } = useFamily();
  const { currentLocation, familyLocations } = useLocation();
  const { unreadCount, markAsRead } = useNotifications();

  // Color mode values
  const bgColor = useColorModeValue(colors.white[500], colors.gray[900]);
  const cardBgColor = useColorModeValue(colors.white[500], colors.gray[800]);

  useEffect(() => {
    loadUserWidgets();
    loadAvailableWidgets();
  }, []);

  const loadUserWidgets = async () => {
    // Load user's saved widget layout
    const savedWidgets = await getUserWidgets();
    setWidgets(savedWidgets);
  };

  const loadAvailableWidgets = () => {
    // Load all available widgets based on user's subscription
    const allWidgets = [
      ...familyWidgets,
      ...healthWidgets,
      ...financeWidgets,
      ...shoppingWidgets,
      ...entertainmentWidgets,
      ...productivityWidgets,
    ];
    setAvailableWidgets(allWidgets);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFamily();
    setRefreshing(false);
  };

  const handleAddWidget = (widgetType: string) => {
    const widgetConfig = availableWidgets.find(w => w.id === widgetType);
    if (!widgetConfig) return;

    const newWidget: WidgetInstance = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      position: { x: 20, y: 100 + widgets.length * 200 },
      size: widgetConfig.size,
      settings: {
        title: widgetConfig.name,
        showHeader: true,
        refreshInterval: 5,
        theme: 'auto',
        notifications: true,
        privacy: 'family',
      },
      data: {},
      lastUpdated: new Date(),
    };

    setWidgets([...widgets, newWidget]);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleMoveWidget = (widgetId: string, newPosition: { x: number; y: number }) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, position: newPosition } : w
    ));
  };

  const handleResizeWidget = (widgetId: string, newSize: string) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, size: newSize as any } : w
    ));
  };

  const handleWidgetSettings = (widget: WidgetInstance) => {
    setSelectedWidget(widget);
    setShowSettings(true);
  };

  const handleSaveSettings = (settings: WidgetSettings) => {
    if (!selectedWidget) return;
    
    setWidgets(widgets.map(w => 
      w.id === selectedWidget.id ? { ...w, settings } : w
    ));
  };

  const handleSaveLayout = async () => {
    try {
      await saveUserWidgets(widgets);
      setIsCustomizing(false);
      Alert.alert('Success', 'Widget layout saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save widget layout');
    }
  };

  const renderWidget = (widget: WidgetInstance) => {
    const widgetConfig = availableWidgets.find(w => w.id === widget.type);
    if (!widgetConfig) return null;

    return (
      <DraggableWidgetContainer
        key={widget.id}
        widgetId={widget.id}
        onMove={handleMoveWidget}
        onResize={handleResizeWidget}
        position={widget.position}
        size={widget.size}
        isEditing={isCustomizing}
      >
        <Box p={3}>
          {widget.settings.showHeader && (
            <HStack justifyContent="space-between" alignItems="center" mb={3}>
              <Text style={textStyles.h4} color={colors.primary[500]}>
                {widget.settings.title}
              </Text>
              {isCustomizing && (
                <Pressable onPress={() => handleWidgetSettings(widget)}>
                  <Icon name="cog" size={20} color={colors.gold[500]} />
                </Pressable>
              )}
            </HStack>
          )}
          
          {/* Render widget content based on type */}
          {renderWidgetContent(widget)}
        </Box>
      </DraggableWidgetContainer>
    );
  };

  const renderWidgetContent = (widget: WidgetInstance) => {
    switch (widget.type) {
      case 'family-members':
        return <FamilyMembersWidget members={familyMembers} />;
      case 'family-location':
        return <LocationMapWidget familyLocations={familyLocations} currentLocation={currentLocation} />;
      case 'family-chat':
        return <FamilyChatWidget />;
      case 'family-calendar':
        return <FamilyCalendarWidget />;
      case 'shopping-list':
        return <ShoppingListWidget />;
      case 'health-summary':
        return <HealthSummaryWidget />;
      case 'budget-overview':
        return <BudgetOverviewWidget />;
      default:
        return <Text>Widget content not available</Text>;
    }
  };

  return (
    <Box flex={1} bg={bgColor} safeArea>
      <TopMenu
        unreadCount={unreadCount}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onChatPress={() => navigation.navigate('Chat')}
        onCallPress={() => navigation.navigate('VideoCall')}
      />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack space={4} p={4}>
          {/* Welcome Section */}
          <Box bg={cardBgColor} rounded="lg" shadow={2} p={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text style={textStyles.h2} color={colors.primary[500]}>
                  Welcome back!
                </Text>
                <Text style={textStyles.body} color={colors.gold[500]}>
                  {family?.name || 'Family'}
                </Text>
              </VStack>
              
              <HStack space={2}>
                <Pressable
                  onPress={() => setIsCustomizing(!isCustomizing)}
                  bg={isCustomizing ? colors.primary[500] : colors.gold[100]}
                  px={4}
                  py={2}
                  borderRadius={8}
                >
                  <HStack space={2} alignItems="center">
                    <Icon name="palette" size={20} color={isCustomizing ? colors.white[500] : colors.primary[500]} />
                    <Text
                      color={isCustomizing ? colors.white[500] : colors.primary[500]}
                      fontWeight="600"
                    >
                      {isCustomizing ? 'Done' : 'Customize'}
                    </Text>
                  </HStack>
                </Pressable>
                
                <Pressable
                  onPress={() => navigation.navigate('Settings')}
                  bg={colors.gray[100]}
                  px={4}
                  py={2}
                  borderRadius={8}
                >
                  <Icon name="cog" size={20} color={colors.primary[500]} />
                </Pressable>
              </HStack>
            </HStack>
          </Box>

          {/* Widgets Container */}
          <Box position="relative" minH={600}>
            {widgets.map(renderWidget)}
            
            {widgets.length === 0 && (
              <Box
                bg={cardBgColor}
                rounded="lg"
                shadow={2}
                p={8}
                alignItems="center"
              >
                <Icon name="widgets" size={48} color={colors.gold[500]} mb={4} />
                <Text style={textStyles.h3} color={colors.primary[500]} mb={2}>
                  No Widgets Added
                </Text>
                <Text style={textStyles.body} color={colors.gray[600]} textAlign="center" mb={4}>
                  Tap the customize button to add widgets to your home screen
                </Text>
                <Pressable
                  onPress={() => setIsCustomizing(true)}
                  bg={colors.primary[500]}
                  px={6}
                  py={3}
                  borderRadius={12}
                >
                  <Text color={colors.white[500]} fontWeight="600">
                    Add Widgets
                  </Text>
                </Pressable>
              </Box>
            )}
          </Box>

          {/* Emergency Section */}
          <Box bg={colors.error[500]} rounded="lg" shadow={2} p={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text style={textStyles.h4} color={colors.white[500]}>
                  🚨 Emergency Alert
                </Text>
                <Text style={textStyles.caption} color={colors.white[500]}>
                  Tap to send emergency alert to family
                </Text>
              </VStack>
              
              <Pressable
                onPress={() => navigation.navigate('Emergency')}
                bg={colors.white[500]}
                px={6}
                py={3}
                borderRadius={12}
              >
                <Text color={colors.error[500]} fontWeight="700">
                  SOS
                </Text>
              </Pressable>
            </HStack>
          </Box>
        </VStack>
      </ScrollView>

      {/* Widget Customization Panel */}
      <WidgetCustomizationPanel
        isVisible={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        onAddWidget={handleAddWidget}
        onRemoveWidget={handleRemoveWidget}
        onSaveLayout={handleSaveLayout}
        availableWidgets={availableWidgets}
        activeWidgets={widgets}
      />

      {/* Widget Settings Modal */}
      {selectedWidget && (
        <WidgetSettingsModal
          isVisible={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          widget={selectedWidget}
        />
      )}
    </Box>
  );
};

export default HomeScreen;
```

## 💾 Data Storage & Sync

### Widget Layout Storage
```typescript
// mobile/src/services/widgetService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const widgetService = {
  // Save user's widget layout
  saveUserWidgets: async (widgets: WidgetInstance[]): Promise<void> => {
    try {
      // Save locally
      await AsyncStorage.setItem('user_widgets', JSON.stringify(widgets));
      
      // Sync to server
      await api.post('/users/widgets', { widgets });
    } catch (error) {
      console.error('Failed to save widgets:', error);
      throw error;
    }
  },

  // Load user's widget layout
  getUserWidgets: async (): Promise<WidgetInstance[]> => {
    try {
      // Try to load from server first
      const response = await api.get('/users/widgets');
      const serverWidgets = response.data.widgets;
      
      // Save to local storage
      await AsyncStorage.setItem('user_widgets', JSON.stringify(serverWidgets));
      
      return serverWidgets;
    } catch (error) {
      // Fallback to local storage
      const localWidgets = await AsyncStorage.getItem('user_widgets');
      return localWidgets ? JSON.parse(localWidgets) : [];
    }
  },

  // Get available widgets for user
  getAvailableWidgets: async (): Promise<WidgetType[]> => {
    try {
      const response = await api.get('/widgets/available');
      return response.data.widgets;
    } catch (error) {
      // Return default widgets
      return [
        ...familyWidgets,
        ...healthWidgets.filter(w => !w.premium),
        ...shoppingWidgets.filter(w => !w.premium),
        ...entertainmentWidgets.filter(w => !w.premium),
        ...productivityWidgets.filter(w => !w.premium),
      ];
    }
  },

  // Reset to default layout
  resetToDefault: async (): Promise<WidgetInstance[]> => {
    const defaultWidgets: WidgetInstance[] = [
      {
        id: 'family-members-default',
        type: 'family-members',
        position: { x: 20, y: 100 },
        size: 'large',
        settings: {
          title: 'Family Members',
          showHeader: true,
          refreshInterval: 5,
          theme: 'auto',
          notifications: true,
          privacy: 'family',
        },
        data: {},
        lastUpdated: new Date(),
      },
      {
        id: 'family-location-default',
        type: 'family-location',
        position: { x: 20, y: 320 },
        size: 'large',
        settings: {
          title: 'Family Location',
          showHeader: true,
          refreshInterval: 10,
          theme: 'auto',
          notifications: true,
          privacy: 'family',
        },
        data: {},
        lastUpdated: new Date(),
      },
      {
        id: 'shopping-list-default',
        type: 'shopping-list',
        position: { x: 20, y: 540 },
        size: 'medium',
        settings: {
          title: 'Shopping List',
          showHeader: true,
          refreshInterval: 5,
          theme: 'auto',
          notifications: true,
          privacy: 'family',
        },
        data: {},
        lastUpdated: new Date(),
      },
    ];

    await widgetService.saveUserWidgets(defaultWidgets);
    return defaultWidgets;
  },
};
```

This comprehensive widget customization system allows users to:
- **Add/Remove** widgets from their homepage
- **Drag & Drop** to rearrange widgets
- **Resize** widgets to different sizes
- **Customize** widget settings and appearance
- **Save** multiple layout configurations
- **Sync** layouts across devices
- **Reset** to default layout when needed

The system is designed to be intuitive, flexible, and maintain the luxury aesthetic of the Bondarys app while providing powerful customization capabilities for all family members. 