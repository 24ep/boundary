import { StyleSheet } from 'react-native';

export const widgetStyles = StyleSheet.create({
    // Widget Container (Original Design)
    widgetContainer: {
        backgroundColor: '#FAFAFA', // Replaced invalid linear-gradient
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FFD700',
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 32,
        elevation: 8,
        padding: 20,
        margin: 12,
    },
    // Widget Header (Original Design)
    widgetHeader: {
        color: '#D32F2F',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    // Circular Add Wallet Button Styles
    circularAddWalletButton: {
        width: 280,
        height: 120,
        borderRadius: 16,
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    circularAddWalletIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    circularAddWalletText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
    },
});
