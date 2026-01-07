import { StyleSheet } from 'react-native';

export const chatbotBriefingStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'flex-start', // Align bot to top
        gap: 12,
    },
    botContainer: {
        alignItems: 'center',
        marginTop: 16, // Further increased top alignment
    },
    botAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'transparent', // No background
        justifyContent: 'center',
        alignItems: 'center',
        // No border, no shadow
    },
    botName: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B7280',
        marginTop: 4,
    },
    speechBubbleContainer: {
        flex: 1,
        // Removed bubble styles from container
        overflow: 'visible', // Allow shadows to show
        marginLeft: 0,
    },
    scrollContent: {
        paddingRight: 20, // Padding for last item
        gap: 12, // Space between bubbles
        paddingVertical: 10, // For shadow
    },
    briefingItem: {
        width: 280, // Fixed width for carousel item (matches ChatbotBriefing.tsx)
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderTopLeftRadius: 4, // "Tail" of the bubble
        borderBottomLeftRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        minHeight: 120,
        // Ensure tail logic visually works
        marginLeft: 0,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    itemIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    itemDescription: {
        fontSize: 15,
        color: '#1F2937',
        lineHeight: 20,
        marginBottom: 4,
    },
    itemSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    newsTag: {
        marginTop: 8,
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    newsTagText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#3B82F6',
    },
    // Pagination Dots
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    paginationDotActive: {
        width: 18, // Elongated active dot
        backgroundColor: '#4F46E5',
    },
});
