import { StyleSheet } from 'react-native';

export const calendarStyles = StyleSheet.create({
    // Calendar Drawer Styles
    calendarDrawerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    calendarDrawerContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        minHeight: '60%',
    },
    calendarDrawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    calendarDrawerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
    },
    calendarDrawerContent: {
        flex: 1,
        padding: 20,
    },
    calendarInputGroup: {
        marginBottom: 20,
    },
    calendarInputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    calendarInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#374151',
        backgroundColor: '#FFFFFF',
    },
    calendarTextArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    calendarDrawerFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    calendarShareButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    calendarShareButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        gap: 8,
    },
    calendarShareButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    calendarCreateButton: {
        backgroundColor: '#FFB6C1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    calendarCreateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
