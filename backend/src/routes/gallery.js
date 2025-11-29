const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const File = require('../models/File');
const User = require('../models/User');
const GalleryAlbum = require('../models/GalleryAlbum');
const GalleryItem = require('../models/GalleryItem');

// Use memory storage for incoming file, we will persist using existing storage route or File model
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// Get user's gallery
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const families = await user.getFamilies();
    if (!families || families.length === 0) {
      return res.status(400).json({ success: false, message: 'User not in any hourse' });
    }
    const hourse = families[0];

    const [images, videos, albums] = await Promise.all([
      File.findByFamilyId(hourse.id, { limit: 50, offset: 0, fileType: 'image' }),
      File.findByFamilyId(hourse.id, { limit: 50, offset: 0, fileType: 'video' }),
      GalleryAlbum.listByFamilyId(hourse.id, { limit: 100, offset: 0 })
    ]);

    res.json({
      success: true,
      photos: images.map(f => f.toJSON()),
      videos: videos.map(f => f.toJSON()),
      albums: albums
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Failed to get gallery' });
  }
});

// Upload photo/video and create File record
router.post('/upload', authenticateToken, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    const families = await user.getFamilies();
    if (!families || families.length === 0) {
      return res.status(400).json({ success: false, message: 'User not in any hourse' });
    }
    const hourse = families[0];

    const fileType = File.getFileTypeFromMimeType(req.file.mimetype);

    // Persist using File model with a placeholder URL (in real deployment, integrate storage service)
    const fileRecord = await File.create({
      userId,
      familyId: hourse.id,
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      fileUrl: `/temp/${Date.now()}_${req.file.originalname}`,
      fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      isPublic: false,
      metadata: { uploadedAt: new Date().toISOString() },
    });

    res.json({ success: true, media: fileRecord.toJSON() });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Create album
router.post('/albums', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const families = await user.getFamilies();
    if (!families || families.length === 0) {
      return res.status(400).json({ success: false, message: 'User not in any hourse' });
    }
    const hourse = families[0];

    const { name, description, coverImageId } = req.body;
    const album = await GalleryAlbum.create({
      familyId: hourse.id,
      name,
      description,
      coverImageId: coverImageId || null,
      isShared: true,
      createdBy: userId,
    });

    res.json({ success: true, album });
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
});

// Get album
router.get('/albums/:albumId', authenticateToken, async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.albumId);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });

    const items = await GalleryItem.listByAlbumId(album.id, { limit: 200, offset: 0 });
    res.json({ success: true, album, items });
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ error: 'Failed to get album' });
  }
});

// Add media to album
router.post('/albums/:albumId/media', authenticateToken, async (req, res) => {
  try {
    const { mediaIds = [] } = req.body;
    const album = await GalleryAlbum.findById(req.params.albumId);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });

    const userId = req.user.id;

    const items = [];
    for (const fileId of mediaIds) {
      const item = await GalleryItem.addToAlbum({ albumId: album.id, fileId, uploadedBy: userId });
      items.push(item);
    }

    res.json({ success: true, added: items.length, items });
  } catch (error) {
    console.error('Add media to album error:', error);
    res.status(500).json({ error: 'Failed to add media to album' });
  }
});

// Delete media
router.delete('/media/:mediaId', authenticateToken, async (req, res) => {
  try {
    await GalleryItem.remove(req.params.mediaId);
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Share album
router.post('/albums/:albumId/share', authenticateToken, async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.albumId);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    await album.update({ is_shared: true });
    res.json({ success: true, message: 'Album shared successfully' });
  } catch (error) {
    console.error('Share album error:', error);
    res.status(500).json({ error: 'Failed to share album' });
  }
});

module.exports = router; 