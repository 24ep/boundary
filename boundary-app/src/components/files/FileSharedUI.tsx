import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FileItem, FileFolder, StorageQuota } from '../../services/api/fileManagement';

// =====================================
// TYPES
// =====================================

export type ViewMode = 'grid' | 'list';

// =====================================
// HELPER FUNCTIONS
// =====================================

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getFileIcon = (mimeType: string, fileType: string): string => {
    if (fileType === 'image' || mimeType?.startsWith('image/')) return 'file-image-outline';
    if (fileType === 'video' || mimeType?.startsWith('video/')) return 'file-video-outline';
    if (fileType === 'audio' || mimeType?.startsWith('audio/')) return 'file-music-outline';
    if (fileType === 'document' || mimeType?.includes('pdf')) return 'file-pdf-box';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return 'file-word-outline';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return 'file-excel-outline';
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return 'file-powerpoint-outline';
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('compressed')) return 'folder-zip-outline';
    return 'file-outline';
};

export const getFileIconColor = (fileType: string): string => {
    switch (fileType) {
        case 'image': return '#10B981';
        case 'video': return '#F59E0B';
        case 'audio': return '#8B5CF6';
        case 'document': return '#EF4444';
        default: return '#6B7280';
    }
};

// =====================================
// SUB-COMPONENTS
// =====================================

export const FilterChip: React.FC<{
    label: string;
    icon: string;
    active: boolean;
    onPress: () => void;
}> = ({ label, icon, active, onPress }) => (
    <TouchableOpacity
        style={[sharedStyles.filterChip, active && sharedStyles.filterChipActive]}
        onPress={onPress}
    >
        <MaterialCommunityIcons 
            name={icon as any} 
            size={16} 
            color={active ? '#FFF' : '#6B7280'} 
        />
        <Text style={[sharedStyles.filterChipText, active && sharedStyles.filterChipTextActive]}>
            {label}
        </Text>
    </TouchableOpacity>
);

export const FolderItem: React.FC<{
    folder: FileFolder;
    viewMode: ViewMode;
    onPress: () => void;
    onLongPress?: () => void;
}> = ({ folder, viewMode, onPress, onLongPress }) => {
    if (viewMode === 'grid') {
        return (
            <TouchableOpacity 
                style={sharedStyles.gridFolderItem} 
                onPress={onPress}
                onLongPress={onLongPress}
            >
                <View style={[sharedStyles.folderIconContainer, { backgroundColor: folder.color || '#DBEAFE' }]}>
                    <MaterialCommunityIcons name="folder" size={32} color={folder.color ? '#FFF' : '#3B82F6'} />
                </View>
                <Text style={sharedStyles.gridItemName} numberOfLines={1}>{folder.name}</Text>
                <Text style={sharedStyles.gridItemMeta}>{folder.itemCount} items</Text>
                {folder.isPinned && (
                    <MaterialCommunityIcons name="pin" size={14} color="#3B82F6" style={sharedStyles.pinnedIcon} />
                )}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            style={sharedStyles.listFolderItem} 
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <View style={[sharedStyles.listFolderIcon, { backgroundColor: folder.color || '#DBEAFE' }]}>
                <MaterialCommunityIcons name="folder" size={24} color={folder.color ? '#FFF' : '#3B82F6'} />
            </View>
            <View style={sharedStyles.listItemInfo}>
                <View style={sharedStyles.listItemNameRow}>
                    <Text style={sharedStyles.listItemName}>{folder.name}</Text>
                    {folder.isPinned && (
                        <MaterialCommunityIcons name="pin" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                    )}
                </View>
                <Text style={sharedStyles.listItemMeta}>
                    {folder.itemCount} items · {formatFileSize(folder.totalSize)}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );
};

export const FileItemComponent: React.FC<{
    file: FileItem;
    viewMode: ViewMode;
    onPress: () => void;
    onLongPress?: () => void;
    showUploader?: boolean;
}> = ({ file, viewMode, onPress, onLongPress, showUploader = false }) => {
    const iconName = getFileIcon(file.mimeType, file.fileType);
    const iconColor = getFileIconColor(file.fileType);
    const isImage = file.fileType === 'image';

    if (viewMode === 'grid') {
        return (
            <TouchableOpacity 
                style={sharedStyles.gridFileItem} 
                onPress={onPress}
                onLongPress={onLongPress}
            >
                {isImage && file.url ? (
                    <Image source={{ uri: file.url }} style={sharedStyles.gridImagePreview} resizeMode="cover" />
                ) : (
                    <View style={[sharedStyles.gridFileIcon, { backgroundColor: `${iconColor}15` }]}>
                        <MaterialCommunityIcons name={iconName as any} size={32} color={iconColor} />
                    </View>
                )}
                <Text style={sharedStyles.gridItemName} numberOfLines={1}>{file.originalName}</Text>
                <Text style={sharedStyles.gridItemMeta}>{formatFileSize(file.size)}</Text>
                {file.isPinned && (
                    <MaterialCommunityIcons name="pin" size={14} color="#3B82F6" style={sharedStyles.pinnedIcon} />
                )}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            style={sharedStyles.listFileItem} 
            onPress={onPress}
            onLongPress={onLongPress}
        >
            {isImage && file.url ? (
                <Image source={{ uri: file.url }} style={sharedStyles.listImagePreview} resizeMode="cover" />
            ) : (
                <View style={[sharedStyles.listFileIcon, { backgroundColor: `${iconColor}15` }]}>
                    <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
                </View>
            )}
            <View style={sharedStyles.listItemInfo}>
                <View style={sharedStyles.listItemNameRow}>
                    <Text style={sharedStyles.listItemName} numberOfLines={1}>{file.originalName}</Text>
                    {file.isPinned && (
                        <MaterialCommunityIcons name="pin" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                    )}
                </View>
                <Text style={sharedStyles.listItemMeta}>
                    {formatFileSize(file.size)} · {formatDate(file.createdAt)}
                    {showUploader && (file as any).uploaderName && ` · by ${(file as any).uploaderName}`}
                </Text>
            </View>
            <TouchableOpacity style={sharedStyles.moreButton}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export const QuotaBar: React.FC<{ quota: StorageQuota; label?: string }> = ({ quota, label = 'Storage' }) => {
    const percentage = quota.percentUsed;
    const barColor = percentage > 90 ? '#EF4444' : percentage > 70 ? '#F59E0B' : '#3B82F6';

    return (
        <View style={sharedStyles.quotaContainer}>
            <View style={sharedStyles.quotaHeader}>
                <Text style={sharedStyles.quotaLabel}>{label}</Text>
                <Text style={sharedStyles.quotaText}>
                    {formatFileSize(quota.usedBytes)} / {formatFileSize(quota.quotaBytes)}
                </Text>
            </View>
            <View style={sharedStyles.quotaBarBackground}>
                <View style={[sharedStyles.quotaBarFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }]} />
            </View>
        </View>
    );
};

export const BreadcrumbNav: React.FC<{
    path: FileFolder[];
    rootName?: string;
    rootIcon?: string;
    onNavigate: (folderId: string | null) => void;
}> = ({ path, rootName, rootIcon = 'home-group', onNavigate }) => {
    return (
        <View style={sharedStyles.breadcrumbContainer}>
            <TouchableOpacity onPress={() => onNavigate(null)} style={sharedStyles.breadcrumbItem}>
                <MaterialCommunityIcons name={rootIcon as any} size={18} color="#3B82F6" />
                {rootName && <Text style={sharedStyles.breadcrumbRootText}>{rootName}</Text>}
            </TouchableOpacity>
            {path.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <MaterialCommunityIcons name="chevron-right" size={16} color="#D1D5DB" />
                    <TouchableOpacity 
                        onPress={() => onNavigate(folder.id)} 
                        style={sharedStyles.breadcrumbItem}
                    >
                        <Text style={[
                            sharedStyles.breadcrumbText,
                            index === path.length - 1 && sharedStyles.breadcrumbTextActive
                        ]}>
                            {folder.name}
                        </Text>
                    </TouchableOpacity>
                </React.Fragment>
            ))}
        </View>
    );
};

// =====================================
// SHARED STYLES
// =====================================

export const sharedStyles = StyleSheet.create({
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        gap: 4,
    },
    filterChipActive: {
        backgroundColor: '#3B82F6',
    },
    filterChipText: {
        fontSize: 12,
        color: '#6B7280',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    gridFolderItem: {
        flex: 1,
        maxWidth: '33.33%',
        padding: 8,
        alignItems: 'center',
    },
    gridFileItem: {
        flex: 1,
        maxWidth: '33.33%',
        padding: 8,
        alignItems: 'center',
    },
    folderIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridFileIcon: {
        width: 64,
        height: 64,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridImagePreview: {
        width: 64,
        height: 64,
        borderRadius: 12,
        marginBottom: 8,
    },
    gridItemName: {
        fontSize: 12,
        color: '#1F2937',
        textAlign: 'center',
        fontWeight: '500',
    },
    gridItemMeta: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2,
    },
    pinnedIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    listFolderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    listFileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    listFolderIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listFileIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listImagePreview: {
        width: 44,
        height: 44,
        borderRadius: 10,
    },
    listItemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    listItemNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listItemName: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
        flex: 1,
    },
    listItemMeta: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    moreButton: {
        padding: 8,
    },
    quotaContainer: {
        marginTop: 8,
    },
    quotaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    quotaLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    quotaText: {
        fontSize: 12,
        color: '#1F2937',
        fontWeight: '500',
    },
    quotaBarBackground: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    quotaBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    breadcrumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 4,
        flexWrap: 'wrap',
    },
    breadcrumbItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        gap: 4,
    },
    breadcrumbRootText: {
        fontSize: 13,
        color: '#3B82F6',
        fontWeight: '500',
    },
    breadcrumbText: {
        fontSize: 13,
        color: '#6B7280',
    },
    breadcrumbTextActive: {
        color: '#1F2937',
        fontWeight: '600',
    },
});
