import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface LegalDocument {
  id: string;
  title: string;
  slug: string;
  type: 'terms_of_service' | 'privacy_policy' | 'cookie_policy' | 'refund_policy' | 'acceptable_use' | 'other';
  content: string;
  summary?: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  effectiveDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    lastReviewed?: string;
    nextReviewDate?: string;
    reviewer?: string;
    jurisdiction?: string;
    languages?: string[];
  };
}

interface DeveloperDoc {
  id: string;
  title: string;
  slug: string;
  category: 'api' | 'sdk' | 'guidelines' | 'tutorials' | 'reference' | 'other';
  content: string;
  summary?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    estimatedReadTime?: number;
    prerequisites?: string[];
    relatedDocs?: string[];
    codeExamples?: boolean;
  };
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

// ============================================================================
// LEGAL DOCUMENTS
// ============================================================================

/**
 * GET /admin/legal/documents
 * Get all legal documents
 */
router.get('/documents', async (req: Request, res: Response) => {
  try {
    const { type, status, limit = 50 } = req.query;
    
    // Mock implementation - in real app, query from database
    const mockDocuments: LegalDocument[] = [
      {
        id: '1',
        title: 'Terms of Service',
        slug: 'terms-of-service',
        type: 'terms_of_service',
        content: '<h1>Terms of Service</h1><p>By using our service, you agree to these terms...</p>',
        summary: 'Terms and conditions for using the Boundary platform',
        version: '2.1',
        status: 'published',
        effectiveDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          lastReviewed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          reviewer: 'Legal Team',
          jurisdiction: 'US',
          languages: ['en', 'es', 'fr']
        }
      },
      {
        id: '2',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        type: 'privacy_policy',
        content: '<h1>Privacy Policy</h1><p>We are committed to protecting your privacy...</p>',
        summary: 'How we collect, use, and protect your personal information',
        version: '3.0',
        status: 'published',
        effectiveDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          lastReviewed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          nextReviewDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          reviewer: 'Legal Team',
          jurisdiction: 'US',
          languages: ['en', 'es', 'fr', 'de']
        }
      },
      {
        id: '3',
        title: 'Cookie Policy',
        slug: 'cookie-policy',
        type: 'cookie_policy',
        content: '<h1>Cookie Policy</h1><p>This policy explains how we use cookies...</p>',
        summary: 'Information about cookies and how we use them',
        version: '1.5',
        status: 'published',
        effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          lastReviewed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          reviewer: 'Legal Team',
          jurisdiction: 'EU',
          languages: ['en', 'es', 'fr', 'de', 'it']
        }
      }
    ];

    // Apply filters
    let filteredDocuments = mockDocuments;
    
    if (type) {
      filteredDocuments = filteredDocuments.filter(doc => doc.type === type);
    }
    
    if (status) {
      filteredDocuments = filteredDocuments.filter(doc => doc.status === status);
    }

    // Sort by updated date
    filteredDocuments.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Limit results
    const limitedDocuments = filteredDocuments.slice(0, Number(limit));

    sendResponse(res, 200, true, { documents: limitedDocuments }, 'Legal documents retrieved successfully');
  } catch (error) {
    console.error('Get legal documents error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get legal documents');
  }
});

/**
 * GET /admin/legal/documents/:id
 * Get single legal document
 */
router.get('/documents/:id', [
  param('id').isUUID().withMessage('Invalid document ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, get from database
    const mockDocument: LegalDocument = {
      id,
      title: 'Legal Document',
      slug: 'legal-document',
      type: 'other',
      content: '<h1>Legal Document</h1><p>Legal content...</p>',
      summary: 'Legal document summary',
      version: '1.0',
      status: 'draft',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reviewer: 'Legal Team',
        jurisdiction: 'US',
        languages: ['en']
      }
    };

    sendResponse(res, 200, true, mockDocument, 'Legal document retrieved successfully');
  } catch (error) {
    console.error('Get legal document error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get legal document');
  }
});

/**
 * POST /admin/legal/documents
 * Create new legal document
 */
router.post('/documents', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('slug').trim().isLength({ min: 1, max: 100 }).withMessage('Slug is required'),
  body('type').isIn(['terms_of_service', 'privacy_policy', 'cookie_policy', 'refund_policy', 'acceptable_use', 'other']).withMessage('Invalid document type'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('version').trim().isLength({ min: 1, max: 20 }).withMessage('Version is required'),
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('summary').optional().trim().isLength({ max: 500 }).withMessage('Summary too long'),
  body('effectiveDate').optional().isISO8601().withMessage('Invalid effective date format')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const documentData = req.body;
    
    // Check if slug already exists
    // In real app, check database
    
    // Mock implementation - in real app, create in database
    const mockDocument: LegalDocument = {
      id: '4',
      title: documentData.title,
      slug: documentData.slug,
      type: documentData.type,
      content: documentData.content,
      summary: documentData.summary,
      version: documentData.version,
      status: documentData.status,
      effectiveDate: documentData.effectiveDate,
      publishedAt: documentData.status === 'published' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        lastReviewed: new Date().toISOString(),
        reviewer: 'Legal Team',
        jurisdiction: 'US',
        languages: ['en']
      }
    };

    sendResponse(res, 201, true, mockDocument, 'Legal document created successfully');
  } catch (error) {
    console.error('Create legal document error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to create legal document');
  }
});

/**
 * PUT /admin/legal/documents/:id
 * Update legal document
 */
router.put('/documents/:id', [
  param('id').isUUID().withMessage('Invalid document ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('slug').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Slug must be 1-100 characters'),
  body('type').optional().isIn(['terms_of_service', 'privacy_policy', 'cookie_policy', 'refund_policy', 'acceptable_use', 'other']).withMessage('Invalid document type'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock implementation - in real app, update in database
    const mockDocument: LegalDocument = {
      id,
      title: updateData.title || 'Updated Legal Document',
      slug: updateData.slug || 'updated-legal-document',
      type: updateData.type || 'other',
      content: updateData.content || '<h1>Updated Legal Document</h1><p>Updated content...</p>',
      summary: updateData.summary,
      version: '1.1',
      status: updateData.status || 'draft',
      effectiveDate: updateData.effectiveDate,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        lastReviewed: new Date().toISOString(),
        reviewer: 'Legal Team',
        jurisdiction: 'US',
        languages: ['en']
      }
    };

    sendResponse(res, 200, true, mockDocument, 'Legal document updated successfully');
  } catch (error) {
    console.error('Update legal document error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to update legal document');
  }
});

/**
 * DELETE /admin/legal/documents/:id
 * Delete legal document
 */
router.delete('/documents/:id', [
  param('id').isUUID().withMessage('Invalid document ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, delete from database
    sendResponse(res, 200, true, undefined, 'Legal document deleted successfully');
  } catch (error) {
    console.error('Delete legal document error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to delete legal document');
  }
});

/**
 * POST /admin/legal/documents/:id/publish
 * Publish legal document
 */
router.post('/documents/:id/publish', [
  param('id').isUUID().withMessage('Invalid document ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, update status to published
    const mockDocument: LegalDocument = {
      id,
      title: 'Published Legal Document',
      slug: 'published-legal-document',
      type: 'other',
      content: '<h1>Published Legal Document</h1><p>Published content...</p>',
      summary: 'Published legal document',
      version: '1.0',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        lastReviewed: new Date().toISOString(),
        reviewer: 'Legal Team',
        jurisdiction: 'US',
        languages: ['en']
      }
    };

    sendResponse(res, 200, true, mockDocument, 'Legal document published successfully');
  } catch (error) {
    console.error('Publish legal document error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to publish legal document');
  }
});

/**
 * POST /admin/legal/documents/:id/archive
 * Archive legal document
 */
router.post('/documents/:id/archive', [
  param('id').isUUID().withMessage('Invalid document ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, update status to archived
    const mockDocument: LegalDocument = {
      id,
      title: 'Archived Legal Document',
      slug: 'archived-legal-document',
      type: 'other',
      content: '<h1>Archived Legal Document</h1><p>Archived content...</p>',
      summary: 'Archived legal document',
      version: '1.0',
      status: 'archived',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        lastReviewed: new Date().toISOString(),
        reviewer: 'Legal Team',
        jurisdiction: 'US',
        languages: ['en']
      }
    };

    sendResponse(res, 200, true, mockDocument, 'Legal document archived successfully');
  } catch (error) {
    console.error('Archive legal document error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to archive legal document');
  }
});

// ============================================================================
// DEVELOPER DOCUMENTS
// ============================================================================

/**
 * GET /admin/legal/developer-docs
 * Get all developer documentation
 */
router.get('/developer-docs', async (req: Request, res: Response) => {
  try {
    const { category, difficulty, status, limit = 50 } = req.query;
    
    // Mock implementation - in real app, query from database
    const mockDeveloperDocs: DeveloperDoc[] = [
      {
        id: '1',
        title: 'API Getting Started',
        slug: 'api-getting-started',
        category: 'api',
        content: '<h1>API Getting Started</h1><p>Learn how to use our API...</p>',
        summary: 'Introduction to the Boundary API',
        difficulty: 'beginner',
        tags: ['api', 'getting-started', 'rest'],
        status: 'published',
        publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          estimatedReadTime: 15,
          prerequisites: ['Basic HTTP knowledge', 'API key'],
          relatedDocs: ['api-reference', 'authentication'],
          codeExamples: true
        }
      },
      {
        id: '2',
        title: 'Mobile SDK Integration',
        slug: 'mobile-sdk-integration',
        category: 'sdk',
        content: '<h1>Mobile SDK Integration</h1><p>Integrate our mobile SDK...</p>',
        summary: 'How to integrate the Boundary mobile SDK',
        difficulty: 'intermediate',
        tags: ['sdk', 'mobile', 'integration'],
        status: 'published',
        publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          estimatedReadTime: 30,
          prerequisites: ['Mobile development experience', 'API key'],
          relatedDocs: ['api-getting-started', 'authentication'],
          codeExamples: true
        }
      }
    ];

    // Apply filters
    let filteredDocs = mockDeveloperDocs;
    
    if (category) {
      filteredDocs = filteredDocs.filter(doc => doc.category === category);
    }
    
    if (difficulty) {
      filteredDocs = filteredDocs.filter(doc => doc.difficulty === difficulty);
    }
    
    if (status) {
      filteredDocs = filteredDocs.filter(doc => doc.status === status);
    }

    // Sort by updated date
    filteredDocs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Limit results
    const limitedDocs = filteredDocs.slice(0, Number(limit));

    sendResponse(res, 200, true, { documents: limitedDocs }, 'Developer documentation retrieved successfully');
  } catch (error) {
    console.error('Get developer docs error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get developer documentation');
  }
});

/**
 * GET /admin/legal/developer-docs/:id
 * Get single developer documentation
 */
router.get('/developer-docs/:id', [
  param('id').isUUID().withMessage('Invalid document ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, get from database
    const mockDeveloperDoc: DeveloperDoc = {
      id,
      title: 'Developer Documentation',
      slug: 'developer-documentation',
      category: 'other',
      content: '<h1>Developer Documentation</h1><p>Developer content...</p>',
      summary: 'Developer documentation summary',
      difficulty: 'beginner',
      tags: ['development'],
      status: 'draft',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        estimatedReadTime: 10,
        prerequisites: [],
        relatedDocs: [],
        codeExamples: false
      }
    };

    sendResponse(res, 200, true, mockDeveloperDoc, 'Developer documentation retrieved successfully');
  } catch (error) {
    console.error('Get developer doc error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get developer documentation');
  }
});

/**
 * POST /admin/legal/developer-docs
 * Create new developer documentation
 */
router.post('/developer-docs', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('slug').trim().isLength({ min: 1, max: 100 }).withMessage('Slug is required'),
  body('category').isIn(['api', 'sdk', 'guidelines', 'tutorials', 'reference', 'other']).withMessage('Invalid category'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('summary').optional().trim().isLength({ max: 500 }).withMessage('Summary too long'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const docData = req.body;
    
    // Check if slug already exists
    // In real app, check database
    
    // Mock implementation - in real app, create in database
    const mockDeveloperDoc: DeveloperDoc = {
      id: '3',
      title: docData.title,
      slug: docData.slug,
      category: docData.category,
      content: docData.content,
      summary: docData.summary,
      difficulty: docData.difficulty,
      tags: docData.tags || [],
      status: docData.status,
      publishedAt: docData.status === 'published' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        estimatedReadTime: 20,
        prerequisites: [],
        relatedDocs: [],
        codeExamples: true
      }
    };

    sendResponse(res, 201, true, mockDeveloperDoc, 'Developer documentation created successfully');
  } catch (error) {
    console.error('Create developer doc error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to create developer documentation');
  }
});

/**
 * PUT /admin/legal/developer-docs/:id
 * Update developer documentation
 */
router.put('/developer-docs/:id', [
  param('id').isUUID().withMessage('Invalid document ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('slug').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Slug must be 1-100 characters'),
  body('category').optional().isIn(['api', 'sdk', 'guidelines', 'tutorials', 'reference', 'other']).withMessage('Invalid category'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock implementation - in real app, update in database
    const mockDeveloperDoc: DeveloperDoc = {
      id,
      title: updateData.title || 'Updated Developer Documentation',
      slug: updateData.slug || 'updated-developer-documentation',
      category: updateData.category || 'other',
      content: updateData.content || '<h1>Updated Developer Documentation</h1><p>Updated content...</p>',
      summary: updateData.summary,
      difficulty: 'beginner',
      tags: [],
      status: updateData.status || 'draft',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        estimatedReadTime: 15,
        prerequisites: [],
        relatedDocs: [],
        codeExamples: true
      }
    };

    sendResponse(res, 200, true, mockDeveloperDoc, 'Developer documentation updated successfully');
  } catch (error) {
    console.error('Update developer doc error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to update developer documentation');
  }
});

/**
 * DELETE /admin/legal/developer-docs/:id
 * Delete developer documentation
 */
router.delete('/developer-docs/:id', [
  param('id').isUUID().withMessage('Invalid document ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, delete from database
    sendResponse(res, 200, true, undefined, 'Developer documentation deleted successfully');
  } catch (error) {
    console.error('Delete developer doc error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to delete developer documentation');
  }
});

export default router;
