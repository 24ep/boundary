import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CircleType {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
 * GET /circle-types
 * Get all circle types
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const circleTypes = await prisma.circleType.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        icon: true,
        color: true,
        defaultSettings: true,
        isSystem: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to match expected format
    const transformedTypes: CircleType[] = circleTypes.map((type: any) => ({
      id: type.id,
      name: type.name,
      displayName: type.displayName || undefined,
      description: type.description || undefined,
      icon: type.icon || undefined,
      color: type.color || undefined,
      isActive: true, // All circle types are considered active since no isActive field exists
      createdAt: type.createdAt.toISOString(),
      updatedAt: type.createdAt.toISOString() // Use createdAt as updatedAt since updatedAt doesn't exist
    }));

    sendResponse(res, 200, true, transformedTypes, 'Circle types retrieved successfully');
  } catch (error) {
    console.error('Get circle types error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get circle types');
  }
});

/**
 * GET /circle-types/:id
 * Get circle type by ID
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid circle type ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const circleType = await prisma.circleType.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        icon: true,
        color: true,
        defaultSettings: true,
        isSystem: true,
        createdAt: true
      }
    });

    if (!circleType) {
      return sendResponse(res, 404, false, undefined, undefined, 'Circle type not found');
    }

    const transformedType: CircleType = {
      id: circleType.id,
      name: circleType.name,
      displayName: circleType.displayName || undefined,
      description: circleType.description || undefined,
      icon: circleType.icon || undefined,
      color: circleType.color || undefined,
      isActive: true, // All circle types are considered active since no isActive field exists
      createdAt: circleType.createdAt.toISOString(),
      updatedAt: circleType.createdAt.toISOString() // Use createdAt as updatedAt since updatedAt doesn't exist
    };

    sendResponse(res, 200, true, transformedType, 'Circle type retrieved successfully');
  } catch (error) {
    console.error('Get circle type error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get circle type');
  }
});

export default router;
