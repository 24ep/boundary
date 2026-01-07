import { StyleSheet } from 'react-native';
import { typography } from '../typography';

export const dailyBriefingStyles = StyleSheet.create({
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 12,
    },
    card: {
        width: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginRight: 0, // Using gap in ScrollView instead
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        flex: 1,
    },
    cardDescription: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
        lineHeight: 22,
    },
    cardSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
        lineHeight: 16,
        marginTop: 4,
    },
    newsTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    newsTagText: {
        fontSize: 10,
        color: '#3B82F6',
        fontWeight: '600',
    }
});
