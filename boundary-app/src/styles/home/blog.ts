import { StyleSheet } from 'react-native';

export const blogStyles = StyleSheet.create({
    blogSliderContainer: {
        marginTop: 8,
    },
    blogSliderContent: {
        paddingHorizontal: 4,
        paddingLeft: 16,
        paddingRight: 16,
    },
    blogCard: {
        width: 220,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    blogCardImageWrapper: {
        position: 'relative',
        width: '100%',
        height: 140,
    },
    blogCardImage: {
        width: '100%',
        height: '100%',
    },
    blogCardImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    blogCardOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    blogCardTextOverlay: {
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: 10,
    },
    blogCardTitleOverlay: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    blogCardSubtitleOverlay: {
        marginTop: 4,
        fontSize: 12,
        color: '#F3F4F6',
    },
});
