import React from 'react';
import { View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface GradientIconProps {
    name: string;
    size: number;
    colors: string[];
    style?: any;
}

export const GradientIcon: React.FC<GradientIconProps> = ({ name, size, colors, style }) => {
    return (
        <View style={[{ width: size, height: size }, style]}>
            <MaskedView
                style={{ flex: 1, flexDirection: 'row', height: size }}
                maskElement={
                    <View
                        style={{
                            backgroundColor: 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flex: 1,
                        }}
                    >
                        <IconMC name={name} size={size} color="black" />
                    </View>
                }
            >
                <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                />
            </MaskedView>
        </View>
    );
};
