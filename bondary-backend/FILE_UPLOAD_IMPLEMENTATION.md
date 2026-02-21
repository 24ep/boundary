# File Upload System - Implementation Guide

## 🚀 **Features Implemented**

### **Core Functionality**
- ✅ **Single File Upload** - `POST /admin/upload`
- ✅ **Multiple File Upload** - `POST /admin/upload/multiple` (up to 5 files)
- ✅ **File Listing** - `GET /admin/upload/list`
- ✅ **File Deletion** - `DELETE /admin/upload/:filename`
- ✅ **Upload Configuration** - `GET /admin/upload/info`

### **Security Features**
- ✅ **File Type Validation** - Only allowed MIME types
- ✅ **File Size Limits** - 50MB max per file, 5 files max
- ✅ **Authentication Required** - Admin authentication for all operations
- ✅ **Permission Checks** - `files:upload`, `files:delete`, `files:view`
- ✅ **Secure File Storage** - Files stored outside web root
- ✅ **Filename Sanitization** - Unique filenames with timestamps

### **Image Processing**
- ✅ **Automatic Resizing** - Sharp-based image processing
- ✅ **Format Conversion** - JPEG compression with quality control
- ✅ **Metadata Extraction** - Width, height, format information
- ✅ **Multiple Formats** - JPEG, PNG, GIF, WebP, SVG support

### **File Organization**
```
uploads/
├── images/          # Image files (JPEG, PNG, GIF, WebP, SVG)
├── documents/       # Documents (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV)
├── videos/          # Video files (MP4, WebM, OGG)
├── audio/           # Audio files (MP3, WAV, OGG, WebM)
├── temp/            # Temporary files during processing
└── other/           # Other file types
```

## 📋 **API Endpoints**

### **Upload Information**
```http
GET /api/admin/upload/info
Authorization: Bearer <token>
Permission: files:view
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "maxFileSize": 52428800,
    "maxFiles": 5,
    "allowedTypes": ["image/jpeg", "image/png", ...],
    "supportedFormats": {
      "images": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
      "documents": [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv"],
      "videos": [".mp4", ".webm", ".ogg"],
      "audio": [".mp3", ".wav", ".ogg", ".webm"]
    },
    "features": {
      "imageProcessing": true,
      "resizing": true,
      "compression": true,
      "metadata": true
    }
  }
}
```

### **Single File Upload**
```http
POST /api/admin/upload
Authorization: Bearer <token>
Permission: files:upload
Content-Type: multipart/form-data

Body: file (binary)
      type (optional) - image|document|video|audio|other
      category (optional) - category name
      resize[width] (optional) - resize width
      resize[height] (optional) - resize height
      resize[quality] (optional) - JPEG quality (1-100)
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "id": "uuid-string",
    "originalName": "photo.jpg",
    "filename": "photo-1642240600000-123456789.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "/uploads/images/photo-1642240600000-123456789.jpg",
    "path": "/path/to/uploads/images/photo-1642240600000-123456789.jpg",
    "uploadedBy": "admin-id",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "jpeg",
      "category": "profile",
      "type": "image"
    }
  },
  "message": "File uploaded successfully"
}
```

### **Multiple File Upload**
```http
POST /api/admin/upload/multiple
Authorization: Bearer <token>
Permission: files:upload
Content-Type: multipart/form-data

Body: files[] (binary array, max 5 files)
      type (optional) - file type for all files
      category (optional) - category for all files
      resize[width] (optional) - resize width for images
      resize[height] (optional) - resize height for images
      resize[quality] (optional) - JPEG quality for images
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "files": [
      {
        "id": "uuid-1",
        "originalName": "photo1.jpg",
        "filename": "photo1-1642240600000-123456789.jpg",
        "url": "/uploads/images/photo1-1642240600000-123456789.jpg",
        "size": 1024000,
        "uploadedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "errors": []
  },
  "message": "Uploaded 1 files successfully"
}
```

### **File Listing**
```http
GET /api/admin/upload/list
Authorization: Bearer <token>
Permission: files:view
Query Parameters:
  type (optional) - Filter by file type
  category (optional) - Filter by category
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "files": [
      {
        "filename": "photo-1642240600000-123456789.jpg",
        "url": "/uploads/images/photo-1642240600000-123456789.jpg",
        "size": 1024000,
        "type": "images",
        "uploadedAt": "2024-01-15T10:30:00.000Z",
        "category": "profile"
      }
    ]
  }
}
```

### **File Deletion**
```http
DELETE /api/admin/upload/:filename
Authorization: Bearer <token>
Permission: files:delete
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "File deleted successfully"
}
```

## 🔧 **Frontend Integration**

### **JavaScript/TypeScript Example**
```typescript
// File Upload Service
class FileUploadService {
  private baseUrl = '/api/admin';

  async uploadFile(file: File, options?: {
    type?: string;
    category?: string;
    resize?: { width?: number; height?: number; quality?: number };
  }): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.type) formData.append('type', options.type);
    if (options?.category) formData.append('category', options.category);
    if (options?.resize) {
      if (options.resize.width) formData.append('resize[width]', options.resize.width.toString());
      if (options.resize.height) formData.append('resize[height]', options.resize.height.toString());
      if (options.resize.quality) formData.append('resize[quality]', options.resize.quality.toString());
    }

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return response.json();
  }

  async uploadMultipleFiles(files: File[], options?: any): Promise<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    if (options?.type) formData.append('type', options.type);
    if (options?.category) formData.append('category', options.category);

    const response = await fetch(`${this.baseUrl}/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return response.json();
  }

  async getUploadInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/upload/info`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.json();
  }

  async listFiles(type?: string, category?: string): Promise<any> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);

    const response = await fetch(`${this.baseUrl}/upload/list?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.json();
  }

  async deleteFile(filename: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/upload/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.json();
  }
}
```

### **React Component Example**
```tsx
import React, { useState } from 'react';

const FileUploadComponent: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const results = await Promise.all(
        files.map(file => fileUploadService.uploadFile(file, {
          type: 'image',
          category: 'profile',
          resize: { width: 800, height: 600, quality: 80 }
        }))
      );

      setUploadedFiles(prev => [...prev, ...results]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx"
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

## 🛡️ **Security Considerations**

### **File Validation**
- **MIME Type Checking** - Only allowed file types accepted
- **File Size Limits** - 50MB per file, 5 files maximum
- **Filename Sanitization** - Prevents directory traversal attacks
- **Content Type Verification** - Validates actual file content

### **Storage Security**
- **Outside Web Root** - Files stored in secure directory
- **Unique Filenames** - Prevents filename collisions
- **Access Control** - Admin authentication required
- **Permission Checks** - Granular permission system

### **HTTP Headers**
- **X-Content-Type-Options: nosniff** - Prevents MIME sniffing
- **X-Frame-Options: DENY** - Prevents clickjacking
- **X-XSS-Protection** - XSS protection
- **Cache Control** - Proper caching headers for static files

## 📊 **Performance Features**

### **Image Optimization**
- **Automatic Resizing** - Reduces file size while maintaining quality
- **JPEG Compression** - Configurable quality levels (1-100)
- **Format Conversion** - Converts to optimal formats
- **Metadata Extraction** - Stores image dimensions and format info

### **Caching Strategy**
- **Static File Caching** - 1-year cache for uploaded files
- **ETag Support** - Efficient conditional requests
- **Last-Modified Headers** - Proper browser caching
- **Compression** - Gzip compression for text files

## 🧪 **Testing**

### **Manual Testing**
```bash
# Test upload info
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/upload/info

# Test file upload
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg" \
  -F "type=image" \
  -F "category=profile" \
  http://localhost:3000/api/admin/upload

# Test multiple files
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  http://localhost:3000/api/admin/upload/multiple

# Test file listing
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/upload/list

# Test file deletion
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/upload/filename.jpg
```

### **Automated Testing**
```bash
# Run the test script
chmod +x test-upload.sh
./test-upload.sh
```

## 📁 **Directory Structure**

```
bondary-backend/
├── src/
│   └── routes/
│       └── admin/
│           └── uploadRoutes.ts
├── uploads/           # Created automatically
│   ├── images/
│   ├── documents/
│   ├── videos/
│   ├── audio/
│   ├── temp/
│   └── other/
└── test-upload.sh      # Test script
```

## 🚀 **Usage Examples**

### **Frontend Integration**
```javascript
// Upload a profile picture
const result = await fetch('/api/admin/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});
```

### **Image Processing**
```javascript
// Upload with automatic resizing
const formData = new FormData();
formData.append('file', imageFile);
formData.append('type', 'image');
formData.append('resize[width]', '800');
formData.append('resize[height]', '600');
formData.append('resize[quality]', '85');
```

### **File Management**
```javascript
// List all images
const images = await fetch('/api/admin/upload/list?type=images');

// Delete a file
await fetch('/api/admin/upload/old-photo.jpg', { method: 'DELETE' });
```

## 📈 **Monitoring & Logging**

### **Upload Metrics**
- File size distribution
- Upload success/failure rates
- Popular file types
- Storage usage by category

### **Error Handling**
- Comprehensive error logging
- Automatic cleanup of temp files
- Graceful degradation on processing failures
- User-friendly error messages

The file upload system is now production-ready with enterprise-grade security, performance, and usability features! 🎉
