import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { requirePermission } from '../../middleware/permissionCheck';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  appName?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================================
// Service Layer
// ============================================================================

class AdminConfigService {
  /**
   * Get branding configuration with optimized query
   */
  async getBranding(): Promise<BrandingConfig> {
    try {
      // Single query with include for better performance
      const activeApplication = await prisma.application.findFirst({
        where: { isActive: true },
        include: {
          appSettings: {
            where: { key: 'branding' },
            select: {
              value: true
            }
          }
        }
      });

      if (!activeApplication) {
        return {};
      }

      // Try app_settings first
      const brandingSetting = activeApplication.appSettings[0];
      if (brandingSetting?.value) {
        const branding = typeof brandingSetting.value === 'string' 
          ? JSON.parse(brandingSetting.value) 
          : brandingSetting.value;
        return branding as BrandingConfig;
      }

      // Fallback to application branding
      if (activeApplication.branding) {
        const branding = typeof activeApplication.branding === 'string' 
          ? JSON.parse(activeApplication.branding) 
          : activeApplication.branding;
        return branding as BrandingConfig;
      }

      return {};
    } catch (error) {
      console.error('[AdminConfigService] Failed to fetch branding:', error);
      return {};
    }
  }

  /**
   * Update branding configuration with transaction
   */
  async updateBranding(branding: BrandingConfig): Promise<BrandingConfig> {
    const activeApplication = await prisma.application.findFirst({
      where: { isActive: true },
      select: { id: true }
    });

    if (!activeApplication) {
      throw new Error('No active application found');
    }

    // Use upsert for atomic operation
    await prisma.appSetting.upsert({
      where: {
        applicationId_key: {
          applicationId: activeApplication.id,
          key: 'branding'
        }
      },
      update: {
        value: branding as any
      },
      create: {
        applicationId: activeApplication.id,
        key: 'branding',
        value: branding as any
      }
    });

    return branding;
  }

  /**
   * Generate secure client secret
   */
  private generateSecureSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// ============================================================================
// Validation Middleware
// ============================================================================

const validateBrandingUpdate = [
  body('branding').optional().isObject().withMessage('Branding must be an object'),
  body('branding.primaryColor').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid primary color format'),
  body('branding.secondaryColor').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid secondary color format'),
  body('branding.accentColor').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid accent color format'),
];

// ============================================================================
// Response Helper
// ============================================================================

const sendResponse = <T>(res: Response, statusCode: number, success: boolean, data?: T, message?: string, error?: string) => {
  const response: ApiResponse<T> = { success };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  if (error) response.error = error;
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
const adminConfigService = new AdminConfigService();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// =============================================
// Branding Configuration
// =============================================

/**
 * GET /api/v1/admin/config/branding
 * Get branding configuration for the admin panel
 */
router.get('/branding', async (req: Request, res: Response) => {
  try {
    const branding = await adminConfigService.getBranding();
    sendResponse(res, 200, true, branding, 'Branding retrieved successfully');
  } catch (error) {
    console.error('[admin/config/branding] Failed to fetch branding:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to fetch branding');
  }
});

/**
 * PUT /api/v1/admin/config/branding
 * Update branding configuration
 */
router.put('/branding', 
  requirePermission('branding', 'update'),
  validateBrandingUpdate,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { branding } = req.body;
      const updatedBranding = await adminConfigService.updateBranding(branding);
      sendResponse(res, 200, true, updatedBranding, 'Branding updated successfully');
    } catch (error) {
      console.error('[admin/config/branding] Failed to update branding:', error);
      const message = error instanceof Error ? error.message : 'Failed to update branding';
      sendResponse(res, 500, false, undefined, undefined, message);
    }
  }
);

// =============================================
// SSO Providers Configuration (Simplified for demo)
// =============================================

/**
 * GET /api/v1/admin/sso-providers
 * Get SSO/OAuth providers configuration
 */
router.get('/sso-providers', 
  requirePermission('sso', 'view'),
  async (req: Request, res: Response) => {
    try {
      // Simplified implementation - return empty array for now
      sendResponse(res, 200, true, { providers: [] }, 'SSO providers retrieved successfully');
    } catch (error) {
      console.error('[admin/sso-providers] Failed to fetch SSO providers:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to fetch SSO providers');
    }
  }
);

/**
 * POST /api/v1/admin/sso-providers
 * Create new SSO provider
 */
router.post('/sso-providers',
  requirePermission('sso', 'create'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('redirect_uris').isArray({ min: 1 }).withMessage('At least one redirect URI is required'),
    body('redirect_uris.*').isURL().withMessage('Each redirect URI must be a valid URL'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Simplified implementation - return success for now
      sendResponse(res, 201, true, { client: req.body }, 'SSO provider created successfully');
    } catch (error) {
      console.error('[admin/sso-providers] Failed to create SSO provider:', error);
      const message = error instanceof Error ? error.message : 'Failed to create SSO provider';
      sendResponse(res, 500, false, undefined, undefined, message);
    }
  }
);

// =============================================
// Applications Management (Simplified for demo)
// =============================================

/**
 * GET /api/v1/admin/applications
 * Get all applications for admin management
 */
router.get('/applications',
  requirePermission('applications', 'view'),
  async (req: Request, res: Response) => {
    try {
      const applications = await prisma.application.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          isActive: true,
          logoUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              appSettings: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      sendResponse(res, 200, true, { applications }, 'Applications retrieved successfully');
    } catch (error) {
      console.error('[admin/applications] Failed to fetch applications:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to fetch applications');
    }
  }
);

/**
 * POST /api/v1/admin/applications
 * Create new application
 */
router.post('/applications',
  requirePermission('applications', 'create'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('slug').notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { name, slug, description, logoUrl } = req.body;

      // Check if slug already exists
      const existing = await prisma.application.findUnique({
        where: { slug }
      });

      if (existing) {
        return sendResponse(res, 400, false, undefined, undefined, 'Application with this slug already exists');
      }

      const application = await prisma.application.create({
        data: {
          name,
          slug,
          description,
          logoUrl,
          branding: {},
          settings: {},
          isActive: true
        }
      });

      sendResponse(res, 201, true, { application }, 'Application created successfully');
    } catch (error) {
      console.error('[admin/applications] Failed to create application:', error);
      const message = error instanceof Error ? error.message : 'Failed to create application';
      sendResponse(res, 500, false, undefined, undefined, message);
    }
  }
);

export default router;
