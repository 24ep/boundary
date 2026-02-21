import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { requirePermission } from '../../middleware/permissionCheck';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import sharp from 'sharp';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    [key: string]: any;
  };
}

interface FileUploadOptions {
  type?: 'image' | 'document' | 'video' | 'audio' | 'other';
  category?: string;
  maxSize?: number;
  allowedTypes?: string[];
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm'
];

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const dirs = ['images', 'documents', 'videos', 'audio', 'temp'];
  for (const dir of dirs) {
    const fullPath = path.join(UPLOAD_DIR, dir);
    try {
      await fs.access(fullPath);
    } catch {
      await fs.mkdir(fullPath, { recursive: true });
    }
  }
};

// ============================================================================
// Multer Configuration
// ============================================================================

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    const tempDir = path.join(UPLOAD_DIR, 'temp');
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Max 5 files at once
  },
  fileFilter
});

// ============================================================================
// Helper Functions
// ============================================================================

const getFileType = (mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet')) return 'document';
  return 'other';
};

const getSubDirectory = (fileType: string): string => {
  switch (fileType) {
    case 'image': return 'images';
    case 'document': return 'documents';
    case 'video': return 'videos';
    case 'audio': return 'audio';
    default: return 'other';
  }
};

const processImage = async (filePath: string, options: FileUploadOptions['resize']): Promise<any> => {
  if (!options) return {};

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    let processedImage = image;
    
    // Resize if specified
    if (options.width || options.height) {
      processedImage = processedImage.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Get metadata after processing
    const finalMetadata = await processedImage.metadata();
    
    // Save processed image
    if (options.quality || options.width || options.height) {
      const outputPath = filePath.replace(/(\.[^.]+)$/, '_processed$1');
      await processedImage.jpeg({ quality: options.quality || 80 }).toFile(outputPath);
      
      return {
        width: finalMetadata.width,
        height: finalMetadata.height,
        format: finalMetadata.format,
        processedPath: outputPath
      };
    }
    
    return {
      width: finalMetadata.width,
      height: finalMetadata.height,
      format: finalMetadata.format
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return {};
  }
};

const moveFileToFinalLocation = async (tempPath: string, fileType: string, filename: string): Promise<string> => {
  const subDir = getSubDirectory(fileType);
  const finalDir = path.join(UPLOAD_DIR, subDir);
  const finalPath = path.join(finalDir, filename);
  
  await fs.rename(tempPath, finalPath);
  return finalPath;
};

const generateFileUrl = (filePath: string, filename: string): string => {
  const relativePath = path.relative(process.cwd(), filePath);
  return `/uploads/${relativePath.replace(/\\/g, '/')}`;
};

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

// Apply admin authentication to all routes
router.use(authenticateAdmin);

/**
 * POST /admin/upload
 * Upload single file
 */
router.post('/upload',
  requirePermission('files', 'upload'),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return sendResponse(res, 400, false, undefined, undefined, 'No file uploaded');
      }

      const file = req.file;
      const { type, category, resize } = req.body;
      
      // Validate file type
      const fileType = getFileType(file.mimetype);
      const allowedType = type || fileType;
      
      // Process image if needed
      let metadata: any = {};
      let finalPath = file.path;
      
      if (fileType === 'image' && resize) {
        metadata = await processImage(file.path, resize);
        if (metadata.processedPath) {
          finalPath = metadata.processedPath;
        }
      }
      
      // Move file to final location
      const finalLocation = await moveFileToFinalLocation(finalPath, allowedType, file.filename);
      
      // Generate file URL
      const url = generateFileUrl(finalLocation, file.filename);
      
      // Create file record in database (optional - you might want to store this)
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        url,
        path: finalLocation,
        uploadedBy: (req as any).admin?.id,
        uploadedAt: new Date().toISOString(),
        metadata: {
          ...metadata,
          category: category || 'general',
          type: allowedType
        }
      };
      
      // Clean up temp file if it exists and is different from final location
      if (file.path !== finalLocation) {
        try {
          await fs.unlink(file.path);
        } catch (error) {
          console.warn('Failed to clean up temp file:', error);
        }
      }
      
      sendResponse(res, 200, true, uploadedFile, 'File uploaded successfully');
      
    } catch (error) {
      console.error('File upload error:', error);
      
      // Clean up temp file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.warn('Failed to clean up temp file on error:', cleanupError);
        }
      }
      
      const message = error instanceof Error ? error.message : 'File upload failed';
      sendResponse(res, 500, false, undefined, undefined, message);
    }
  }
);

/**
 * POST /admin/upload/multiple
 * Upload multiple files
 */
router.post('/upload/multiple',
  requirePermission('files', 'upload'),
  upload.array('files', 5),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return sendResponse(res, 400, false, undefined, undefined, 'No files uploaded');
      }
      
      const { type, category, resize } = req.body;
      const uploadedFiles: UploadedFile[] = [];
      const errors: string[] = [];
      
      for (const file of files) {
        try {
          // Validate file type
          const fileType = getFileType(file.mimetype);
          const allowedType = type || fileType;
          
          // Process image if needed
          let metadata: any = {};
          let finalPath = file.path;
          
          if (fileType === 'image' && resize) {
            metadata = await processImage(file.path, resize);
            if (metadata.processedPath) {
              finalPath = metadata.processedPath;
            }
          }
          
          // Move file to final location
          const finalLocation = await moveFileToFinalLocation(finalPath, allowedType, file.filename);
          
          // Generate file URL
          const url = generateFileUrl(finalLocation, file.filename);
          
          // Create file record
          const uploadedFile: UploadedFile = {
            id: crypto.randomUUID(),
            originalName: file.originalname,
            filename: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            url,
            path: finalLocation,
            uploadedBy: (req as any).admin?.id,
            uploadedAt: new Date().toISOString(),
            metadata: {
              ...metadata,
              category: category || 'general',
              type: allowedType
            }
          };
          
          uploadedFiles.push(uploadedFile);
          
          // Clean up temp file if needed
          if (file.path !== finalLocation) {
            await fs.unlink(file.path);
          }
          
        } catch (error) {
          errors.push(`Failed to upload ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Clean up temp file on error
          try {
            await fs.unlink(file.path);
          } catch (cleanupError) {
            console.warn('Failed to clean up temp file:', cleanupError);
          }
        }
      }
      
      if (uploadedFiles.length > 0) {
        const message = errors.length > 0 
          ? `Uploaded ${uploadedFiles.length} files successfully. ${errors.length} files failed.`
          : `Uploaded ${uploadedFiles.length} files successfully`;
          
        sendResponse(res, 200, true, { 
          files: uploadedFiles,
          errors: errors.length > 0 ? errors : undefined 
        }, message);
      } else {
        sendResponse(res, 500, false, undefined, undefined, 'All files failed to upload');
      }
      
    } catch (error) {
      console.error('Multiple file upload error:', error);
      
      // Clean up all temp files
      if (req.files) {
        for (const file of req.files as Express.Multer.File[]) {
          try {
            await fs.unlink(file.path);
          } catch (cleanupError) {
            console.warn('Failed to clean up temp file:', cleanupError);
          }
        }
      }
      
      const message = error instanceof Error ? error.message : 'Multiple file upload failed';
      sendResponse(res, 500, false, undefined, undefined, message);
    }
  }
);

/**
 * GET /admin/upload/info
 * Get upload configuration and limits
 */
router.get('/upload/info',
  requirePermission('files', 'view'),
  async (req: Request, res: Response) => {
    try {
      const info = {
        maxFileSize: MAX_FILE_SIZE,
        maxFiles: 5,
        allowedTypes: ALLOWED_MIME_TYPES,
        supportedFormats: {
          images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
          documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
          videos: ['.mp4', '.webm', '.ogg'],
          audio: ['.mp3', '.wav', '.ogg', '.webm']
        },
        features: {
          imageProcessing: true,
          resizing: true,
          compression: true,
          metadata: true
        }
      };
      
      sendResponse(res, 200, true, info, 'Upload information retrieved successfully');
    } catch (error) {
      console.error('Get upload info error:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to get upload information');
    }
  }
);

/**
 * DELETE /admin/upload/:filename
 * Delete uploaded file
 */
router.delete('/upload/:filename',
  requirePermission('files', 'delete'),
  [param('filename').trim().isLength({ min: 1 }).withMessage('Filename is required')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      
      // Find file in upload directories
      const directories = ['images', 'documents', 'videos', 'audio', 'other'];
      let fileDeleted = false;
      
      for (const dir of directories) {
        const filePath = path.join(UPLOAD_DIR, dir, filename);
        try {
          await fs.access(filePath);
          await fs.unlink(filePath);
          fileDeleted = true;
          break;
        } catch {
          // File doesn't exist in this directory, continue
        }
      }
      
      if (fileDeleted) {
        sendResponse(res, 200, true, undefined, 'File deleted successfully');
      } else {
        sendResponse(res, 404, false, undefined, undefined, 'File not found');
      }
      
    } catch (error) {
      console.error('Delete file error:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to delete file');
    }
  }
);

/**
 * GET /admin/upload/list
 * List uploaded files (optional filtering)
 */
router.get('/upload/list',
  requirePermission('files', 'view'),
  async (req: Request, res: Response) => {
    try {
      const { type, category } = req.query;
      
      // In a real implementation, you would query your database for file records
      // For now, scan the upload directories
      const directories = type ? [type as string] : ['images', 'documents', 'videos', 'audio', 'other'];
      const files: any[] = [];
      
      for (const dir of directories) {
        try {
          const dirPath = path.join(UPLOAD_DIR, dir);
          const fileNames = await fs.readdir(dirPath);
          
          for (const fileName of fileNames) {
            const filePath = path.join(dirPath, fileName);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile()) {
              files.push({
                filename: fileName,
                url: `/uploads/${dir}/${fileName}`,
                size: stats.size,
                type: dir,
                uploadedAt: stats.mtime.toISOString(),
                category: category || 'general'
              });
            }
          }
        } catch (error) {
          // Directory doesn't exist or can't be read
          continue;
        }
      }
      
      // Sort by upload date (newest first)
      files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      
      sendResponse(res, 200, true, { files }, 'Files retrieved successfully');
    } catch (error) {
      console.error('List files error:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to list files');
    }
  }
);

export default router;
