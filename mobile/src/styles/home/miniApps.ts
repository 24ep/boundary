import { StyleSheet } from 'react-native';
import { typography } from '../typography';

// Smaller Size for 2-row scroll
const ITEM_SIZE = 72; // reduced from ~90+

export const miniAppsStyles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: typography.heading,
        color: '#1F2937',
    },
    seeAllButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    seeAllText: {
        fontSize: 14,
        fontFamily: typography.bodyMedium,
        color: '#3B82F6',
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    // A column containing 2 items
    column: {
        gap: 12,
    },
    appItem: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconContainer: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    appLabel: {
        fontSize: 10,
        fontFamily: typography.bodyMedium,
        color: '#4B5563',
        textAlign: 'center',
    },
});
