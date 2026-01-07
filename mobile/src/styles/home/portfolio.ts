import { StyleSheet } from 'react-native';

export const portfolioStyles = StyleSheet.create({
    // Portfolio styles
    portfolioContainer: {
        gap: 12,
        paddingHorizontal: 20,
    },
    portfolioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    portfolioItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    portfolioIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    portfolioIconText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    portfolioItemInfo: {
        flex: 1,
    },
    portfolioItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    portfolioItemValue: {
        fontSize: 14,
        color: '#6B7280',
    },
    portfolioItemChange: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
    },
    // Asset card styles
    assetCard: {
        width: 280,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    assetCardContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    assetProgressBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 16,
        overflow: 'hidden',
        zIndex: 1,
    },
    assetProgressFill: {
        height: '100%',
        borderRadius: 16,
    },
    assetGradient: {
        padding: 24,
        zIndex: 2,
    },
    assetContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    assetLeft: {
        marginRight: 16,
    },
    coinIcon: {
        position: 'relative',
        width: 60,
        minHeight: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sparkle1: {
        position: 'absolute',
        top: -5,
        right: -5,
    },
    sparkle2: {
        position: 'absolute',
        bottom: -3,
        left: -3,
    },
    assetRight: {
        flex: 1,
    },
    assetLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    assetValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    assetTarget: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});
