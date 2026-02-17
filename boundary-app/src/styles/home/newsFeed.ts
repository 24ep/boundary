import { StyleSheet } from 'react-native';

export const newsFeedStyles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    seeAllText: {
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 16,
    },
    newsCard: {
        width: 260,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    imageContainer: {
        height: 140,
        backgroundColor: '#E5E7EB',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    categoryTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4F46E5',
        textTransform: 'uppercase',
    },
    contentContainer: {
        padding: 16,
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sourceText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    timeText: {
        fontSize: 11,
        color: '#9CA3AF',
    },
});
