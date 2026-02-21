import { Router, Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Photo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  isFavorite: boolean;
  albumId?: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  metadata?: any;
}

interface Album {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  photoCount: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface GalleryFilters {
  type?: 'all' | 'photos' | 'videos' | 'favorites';
  searchQuery?: string;
  albumId?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Response Helper
// ============================================================================

const sendResponse = <T>(res: Response, statusCode: number, success: boolean, data?: T, message?: string, error?: string) => {
  const response = { 
    success,
    timestamp: new Date().toISOString()
  };
  if (data !== undefined) (response as any).data = data;
  if (message) (response as any).message = message;
  if (error) (response as any).error = error;
  return res.status(statusCode).json(response);
};

const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, undefined, undefined, errors.array()[0].msg);
  }
  next();
};

// ============================================================================
// Routes
// ============================================================================

const router = Router();

/**
 * GET /gallery/personal/photos
 * Get personal photos for the authenticated user
 */
router.get('/personal/photos', [
  query('type').optional().isIn(['all', 'photos', 'videos', 'favorites']).withMessage('Invalid type'),
  query('search').optional().isString().withMessage('Invalid search query'),
  query('albumId').optional().isUUID().withMessage('Invalid album ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { type = 'all', searchQuery, albumId, page = 1, limit = 20 } = req.query as GalleryFilters;
    
    // Mock implementation - in real app, query from database
    const mockPhotos: Photo[] = [
      {
        id: '1',
        filename: 'photo1.jpg',
        originalName: 'vacation-beach.jpg',
        mimeType: 'image/jpeg',
        size: 2048000,
        url: '/uploads/images/photo1.jpg',
        thumbnailUrl: '/uploads/images/thumbnails/photo1.jpg',
        width: 1920,
        height: 1080,
        isFavorite: false,
        albumId: albumId || 'album-1',
        uploadedBy: 'user-1',
        uploadedAt: new Date().toISOString(),
        tags: ['vacation', 'beach', 'summer'],
        metadata: { location: 'Malibu, CA', camera: 'iPhone 13' }
      },
      {
        id: '2',
        filename: 'photo2.jpg',
        originalName: 'family-dinner.jpg',
        mimeType: 'image/jpeg',
        size: 1536000,
        url: '/uploads/images/photo2.jpg',
        thumbnailUrl: '/uploads/images/thumbnails/photo2.jpg',
        width: 1600,
        height: 1200,
        isFavorite: true,
        albumId: albumId || 'album-1',
        uploadedBy: 'user-1',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        tags: ['family', 'dinner', 'home'],
        metadata: { location: 'Home', camera: 'Canon EOS' }
      }
    ];

    // Apply filters
    let filteredPhotos = mockPhotos;
    
    if (type !== 'all') {
      if (type === 'favorites') {
        filteredPhotos = mockPhotos.filter(photo => photo.isFavorite);
      }
      // For photos/videos, we'd filter by mimeType in real implementation
    }
    
    if (searchQuery) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (albumId) {
      filteredPhotos = filteredPhotos.filter(photo => photo.albumId === albumId);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPhotos = filteredPhotos.slice(startIndex, endIndex);

    sendResponse(res, 200, true, { 
      photos: paginatedPhotos,
      total: filteredPhotos.length,
      page,
      limit,
      hasMore: endIndex < filteredPhotos.length
    }, 'Personal photos retrieved successfully');
  } catch (error) {
    console.error('Get personal photos error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get personal photos');
  }
});

/**
 * POST /gallery/photos/upload
 * Upload photo(s)
 */
router.post('/photos/upload', async (req: Request, res: Response) => {
  try {
    // Mock implementation - in real app, handle file uploads
    const mockUploadedPhoto: Photo = {
      id: '3',
      filename: `photo-${Date.now()}.jpg`,
      originalName: 'new-photo.jpg',
      mimeType: 'image/jpeg',
      size: 1024000,
      url: '/uploads/images/new-photo.jpg',
      thumbnailUrl: '/uploads/images/thumbnails/new-photo.jpg',
      width: 1280,
      height: 720,
      isFavorite: false,
      albumId: undefined,
      uploadedBy: 'user-1',
      uploadedAt: new Date().toISOString(),
      tags: [],
      metadata: {}
    };

    sendResponse(res, 201, true, mockUploadedPhoto, 'Photo uploaded successfully');
  } catch (error) {
    console.error('Upload photo error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to upload photo');
  }
});

/**
 * DELETE /gallery/photos/:id
 * Delete photo
 */
router.delete('/photos/:id', [
  param('id').isUUID().withMessage('Invalid photo ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, delete from database and file system
    sendResponse(res, 200, true, undefined, 'Photo deleted successfully');
  } catch (error) {
    console.error('Delete photo error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to delete photo');
  }
});

/**
 * GET /gallery/albums
 * Get user's albums
 */
router.get('/albums', async (req: Request, res: Response) => {
  try {
    // Mock implementation - in real app, query from database
    const mockAlbums: Album[] = [
      {
        id: 'album-1',
        name: 'Summer Vacation 2024',
        description: 'Photos from our summer beach trip',
        coverImage: '/uploads/images/photo1.jpg',
        photoCount: 25,
        isPublic: false,
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'album-2',
        name: 'Family Events',
        description: 'Family gatherings and celebrations',
        coverImage: '/uploads/images/photo2.jpg',
        photoCount: 18,
        isPublic: false,
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    sendResponse(res, 200, true, mockAlbums, 'Albums retrieved successfully');
  } catch (error) {
    console.error('Get albums error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get albums');
  }
});

/**
 * POST /gallery/albums
 * Create new album
 */
router.post('/albums', async (req: Request, res: Response) => {
  try {
    const { name, description, isPublic = false } = req.body;
    
    // Mock implementation - in real app, create in database
    const mockAlbum: Album = {
      id: 'album-3',
      name,
      description,
      coverImage: undefined,
      photoCount: 0,
      isPublic,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    sendResponse(res, 201, true, mockAlbum, 'Album created successfully');
  } catch (error) {
    console.error('Create album error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to create album');
  }
});

/**
 * GET /gallery/stats
 * Get gallery statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Mock implementation - in real app, calculate from database
    const stats = {
      totalPhotos: 150,
      totalVideos: 25,
      totalSize: 524288000, // bytes
      albumCount: 8,
      favoriteCount: 12,
      recentCount: 5,
      storageUsed: 524288000,
      storageLimit: 10737418240, // 10GB
      storagePercentage: 4.88
    };

    sendResponse(res, 200, true, stats, 'Gallery stats retrieved successfully');
  } catch (error) {
    console.error('Get gallery stats error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get gallery stats');
  }
});

/**
 * POST /gallery/photos/:id/favorite
 * Toggle photo favorite status
 */
router.post('/photos/:id/favorite', [
  param('id').isUUID().withMessage('Invalid photo ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    
    // Mock implementation - in real app, update in database
    sendResponse(res, 200, true, { isFavorite }, 'Photo favorite status updated');
  } catch (error) {
    console.error('Toggle favorite error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to update favorite status');
  }
});

/**
 * POST /gallery/photos/:id/share
 * Share photo
 */
router.post('/photos/:id/share', [
  param('id').isUUID().withMessage('Invalid photo ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { shareUrl, expiresAt } = req.body;
    
    // Mock implementation - in real app, generate share URL
    const mockShareData = {
      shareUrl: `https://share.boundary.app/photos/${id}`,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      shareId: `share-${id}-${Date.now()}`
    };

    sendResponse(res, 200, true, mockShareData, 'Photo shared successfully');
  } catch (error) {
    console.error('Share photo error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to share photo');
  }
});

export default router;
