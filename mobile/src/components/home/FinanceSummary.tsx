import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { typography } from '../../styles/typography';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

interface FinanceSummaryProps {
    onGoToFinance: () => void;
}

export const FinanceSummary: React.FC<FinanceSummaryProps> = ({ onGoToFinance }) => {
    const cardWidth = 280;
    const cardHeight = 150;

    // Mock Data for Line Chart (Net Worth Trend)
    const lineData = {
        labels: ["", "", "", "", "", ""], // Hide labels for mini chart
        datasets: [
            {
                data: [2100, 2300, 2200, 2400, 2350, 2600],
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                strokeWidth: 2,
            }
        ],
    };

    const lineConfig = {
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
        propsForDots: { r: "0" }, // Hide dots
        decimalPlaces: 0,
    };

    // Mock Data for Progress Chart (Budget)
    const progressData = {
        labels: ["Spend"], // optional
        data: [0.7]
    };

    const progressConfig = {
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <IconMC name="finance" size={24} color="#4F46E5" />
                    <Text style={styles.title}>Finance Summary</Text>
                </View>
                <TouchableOpacity
                    onPress={onGoToFinance}
                    style={styles.button}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.buttonText}>Open Finance</Text>
                    <IconMC name="arrow-right" size={16} color="#4F46E5" />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Card 1: Net Worth */}
                <LinearGradient
                    colors={['#4F46E5', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { width: cardWidth, height: cardHeight }]}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>Net Worth</Text>
                        <View style={styles.trendBadge}>
                            <IconMC name="trending-up" size={14} color="#34D399" />
                            <Text style={styles.trendText}>+12%</Text>
                        </View>
                    </View>
                    <View style={styles.cardBodyRow}>
                        <Text style={styles.bigValue}>$124k</Text>
                        <View style={{ marginBottom: -10, marginRight: -10 }}>
                            <LineChart
                                data={lineData}
                                width={120}
                                height={80}
                                chartConfig={lineConfig}
                                bezier
                                withInnerLines={false}
                                withOuterLines={false}
                                withVerticalLines={false}
                                withHorizontalLines={false}
                                withVerticalLabels={false}
                                withHorizontalLabels={false}
                            />
                        </View>
                    </View>
                </LinearGradient>

                {/* Card 2: Budget */}
                <LinearGradient
                    colors={['#EA580C', '#F97316']} // Orange
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { width: cardWidth, height: cardHeight }]}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>Monthly Budget</Text>
                    </View>
                    <View style={styles.cardBodyRow}>
                        <View>
                            <Text style={styles.bigValue}>$1,200</Text>
                            <Text style={styles.subText}>Remaining</Text>
                        </View>
                        <ProgressChart
                            data={progressData}
                            width={80}
                            height={80}
                            strokeWidth={8}
                            radius={28}
                            chartConfig={progressConfig}
                            hideLegend={true}
                        />
                    </View>
                </LinearGradient>

                {/* Card 3: Upcoming Bill */}
                <LinearGradient
                    colors={['#059669', '#10B981']} // Emerald
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { width: 200, height: cardHeight }]} // Smaller width
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>Upcoming</Text>
                        <IconMC name="calendar-clock" size={16} color="rgba(255,255,255,0.8)" />
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.billName}>Home Loan</Text>
                        <Text style={styles.bigValue}>$1,200</Text>
                        <Text style={styles.subText}>Due in 3 days</Text>
                    </View>
                </LinearGradient>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontFamily: typography.heading,
        color: '#1F2937',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4F46E5',
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 4, // for shadow
    },
    card: {
        borderRadius: 20,
        padding: 16,
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
    },
    trendText: {
        color: '#34D399',
        fontSize: 12,
        fontWeight: '700',
    },
    cardBodyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    bigValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: typography.heading,
    },
    subText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    billName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    }
});
