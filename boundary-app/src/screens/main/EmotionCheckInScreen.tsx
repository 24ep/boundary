import React, { useState } from 'react';
import { VStack, Text, HStack, Button, Pressable, Box, Center, StatusBar } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { emotionService } from '../../services/emotionService';
import { AppStackParamList } from '../../navigation/AppNavigator';

type EmotionCheckInScreenRouteProp = RouteProp<AppStackParamList, 'EmotionCheckIn'>;

const EmotionCheckInScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EmotionCheckInScreenRouteProp>();
    const { date } = route.params;
    const [submitting, setSubmitting] = useState(false);
    const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const handleSave = async () => {
        if (!selectedEmotion) return;
        try {
            setSubmitting(true);
            await emotionService.submitEmotionCheck(selectedEmotion, date, selectedTags);
            navigation.goBack();
        } catch (error) {
            console.error('Failed to submit emotion:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const emotions = [
        { level: 1, icon: 'emoticon-dead-outline', color: '#FF4444', label: 'Very Bad' },
        { level: 2, icon: 'emoticon-sad-outline', color: '#FF8800', label: 'Bad' },
        { level: 3, icon: 'emoticon-neutral-outline', color: '#FFBB00', label: 'Okay' },
        { level: 4, icon: 'emoticon-happy-outline', color: '#88CC00', label: 'Good' },
        { level: 5, icon: 'emoticon-excited-outline', color: '#00AA00', label: 'Great' },
    ];

    const moodTags = [
        'Lovely', 'Alone', 'Tired', 'Excited', 'Productive',
        'Stressed', 'Relaxed', 'Grateful', 'Anxious', 'Content'
    ];

    // Format display date
    const displayDate = new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Box flex={1} bg="white" safeArea>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <Center flex={1} px={4}>
                <VStack space={6} alignItems="center" w="100%" maxW="400px">
                    <VStack space={2} alignItems="center">
                        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                            How are you feeling?
                        </Text>
                        <Text fontSize="md" color="gray.500" textAlign="center">
                            {displayDate}
                        </Text>
                    </VStack>

                    {/* Emotion Selection */}
                    <HStack space={3} justifyContent="center" flexWrap="wrap" w="100%">
                        {emotions.map((e) => {
                            const isSelected = selectedEmotion === e.level;
                            return (
                                <VStack key={e.level} alignItems="center" m={1}>
                                    <Pressable
                                        onPress={() => setSelectedEmotion(e.level)}
                                        disabled={submitting}
                                        rounded="full"
                                        p={3}
                                        bg={isSelected ? `${e.color}20` : 'white'}
                                        borderWidth={2}
                                        borderColor={isSelected ? e.color : 'transparent'}
                                        style={{ transform: [{ scale: isSelected ? 1.1 : 1 }] }}
                                        _pressed={{ bg: `${e.color}10` }}
                                    >
                                        <Icon
                                            name={e.icon}
                                            size={42}
                                            color={isSelected ? e.color : '#CCCCCC'}
                                        />
                                    </Pressable>
                                    <Text fontSize="xs" fontWeight={isSelected ? "700" : "500"} mt={1} color={isSelected ? "gray.800" : "gray.400"}>
                                        {e.label}
                                    </Text>
                                </VStack>
                            );
                        })}
                    </HStack>

                    {/* Mood Tags */}
                    <VStack space={3} w="100%">
                        <Text fontSize="md" fontWeight="600" color="gray.700">
                            Describe your mood (optional)
                        </Text>
                        <HStack space={2} flexWrap="wrap">
                            {moodTags.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <Pressable
                                        key={tag}
                                        onPress={() => toggleTag(tag)}
                                        rounded="full"
                                        px={4}
                                        py={2}
                                        mb={2}
                                        mr={2}
                                        bg={isSelected ? 'primary.100' : 'gray.100'}
                                        borderWidth={1}
                                        borderColor={isSelected ? 'primary.500' : 'gray.200'}
                                    >
                                        <Text
                                            fontSize="sm"
                                            fontWeight={isSelected ? "600" : "400"}
                                            color={isSelected ? 'primary.700' : 'gray.600'}
                                        >
                                            {tag}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </VStack>

                    {/* Action Buttons */}
                    <VStack space={3} w="100%" mt={4}>
                        <Button
                            colorScheme="primary"
                            size="lg"
                            onPress={handleSave}
                            isDisabled={!selectedEmotion || submitting}
                            isLoading={submitting}
                            rounded="full"
                            shadow={2}
                        >
                            Save Check-in
                        </Button>
                        <Button
                            variant="ghost"
                            colorScheme="coolGray"
                            size="md"
                            onPress={() => navigation.goBack()}
                        >
                            Cancel
                        </Button>
                    </VStack>
                </VStack>
            </Center>
        </Box>
    );
};

export default EmotionCheckInScreen;
