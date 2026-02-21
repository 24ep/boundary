import express from 'express';
import path from 'path';
import fs from 'fs';

// ============================================================================
// Static File Server for Uploads
// ============================================================================

const uploadsRouter = express.Router();

// Serve uploaded files statically
const uploadsDir = path.join(process.cwd(), 'uploads');

// Check if uploads directory exists
if (fs.existsSync(uploadsDir)) {
  // Serve files with proper headers
  uploadsRouter.use('/uploads', express.static(uploadsDir, {
    maxAge: '1y', // Cache for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set proper content type headers
      if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (path.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      } else if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (path.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (path.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
      } else if (path.endsWith('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg');
      } else if (path.endsWith('.wav')) {
        res.setHeader('Content-Type', 'audio/wav');
      }
      
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
  }));
} else {
  // Create uploads directory if it doesn't exist
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  } catch (error) {
    console.error('Failed to create uploads directory:', error);
  }
}

export default uploadsRouter;
