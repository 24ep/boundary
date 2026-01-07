import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle, StyleProp } from 'react-native';

interface ScalePressableProps {
    onPress?: () => void;
    onLongPress?: () => void;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
    scaleTo?: number;
    disabled?: boolean;
}

export const ScalePressable: React.FC<ScalePressableProps> = ({
    onPress,
    onLongPress,
    style,
    children,
    scaleTo = 0.96,
    disabled = false,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
        >
            <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};
