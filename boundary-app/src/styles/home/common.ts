import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
    // Placeholder Card
    placeholderCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginTop: 16,
        marginBottom: 8,
    },
    placeholderSubtext: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
    // Emergency Section
    emergencySection: {
        paddingVertical: 20,
        paddingHorizontal: 4,
    },
    emergencyButton: {
        backgroundColor: '#EF4444',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#EF4444',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    emergencyButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    // Section Styles
    section: {
        marginBottom: 18,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D32F2F',
        paddingHorizontal: 20,
    },
    addAppointmentButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FEF7F7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFB6C1',
        marginRight: 10,
    },
});
