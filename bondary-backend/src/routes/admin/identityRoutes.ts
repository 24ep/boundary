import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: string[];
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  metadata?: Record<string, any>;
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
 * GET /admin/identity/users
 * Get all users with filtering
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { 
      search, page = 1, limit = 20, status, role, attribute, app 
    } = req.query;
    
    // Mock implementation - in real app, query from database
    const mockUsers: AdminUser[] = [
      {
        id: '1',
        email: 'admin@boundary.app',
        firstName: 'John',
        lastName: 'Doe',
        role: 'super_admin',
        permissions: ['all'],
        isSuperAdmin: true,
        isActive: true,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          department: 'IT',
          location: 'Remote',
          employeeId: 'EMP001'
        }
      },
      {
        id: '2',
        email: 'manager@boundary.app',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'manager',
        permissions: ['users.view', 'users.create', 'users.update'],
        isSuperAdmin: false,
        isActive: true,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          department: 'Operations',
          location: 'Remote',
          employeeId: 'EMP002'
        }
      },
      {
        id: '3',
        email: 'user@boundary.app',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'user',
        permissions: ['dashboard.view'],
        isSuperAdmin: false,
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          department: 'Customer Support',
          location: 'Remote',
          employeeId: 'EMP003'
        }
      }
    ];

    // Apply filters
    let filteredUsers = mockUsers;
    
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.isActive === (status === 'active'));
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (attribute) {
      filteredUsers = filteredUsers.filter(user => 
        user.metadata?.[attribute as string] !== undefined
      );
    }

    // Sort by created date
    filteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    sendResponse(res, 200, true, { 
      users: paginatedUsers,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / Number(limit)),
      currentPage: Number(page)
    }, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get users error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get users');
  }
});

/**
 * GET /admin/identity/users/:id
 * Get single user by ID
 */
router.get('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, get from database
    const mockUser: AdminUser = {
      id,
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      permissions: ['dashboard.view'],
      isSuperAdmin: false,
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        department: 'General',
        location: 'Remote'
      }
    };

    sendResponse(res, 200, true, { user: mockUser }, 'User retrieved successfully');
  } catch (error) {
    console.error('Get user error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get user');
  }
});

/**
 * POST /admin/identity/users
 * Create new user
 */
router.post('/users', [
  body('email').isEmail().withMessage('Valid email required'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['super_admin', 'admin', 'manager', 'user']).withMessage('Invalid role'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department too long'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location too long'),
  body('employeeId').optional().trim().isLength({ max: 50 }).withMessage('Employee ID too long')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    // In real app, check database
    
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);
    
    // Mock implementation - in real app, create in database
    const mockUser: AdminUser = {
      id: '4',
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      permissions: userData.permissions || ['dashboard.view'],
      isSuperAdmin: userData.role === 'super_admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        department: userData.department || 'General',
        location: userData.location || 'Remote',
        employeeId: userData.employeeId
      }
    };

    sendResponse(res, 201, true, mockUser, 'User created successfully');
  } catch (error) {
    console.error('Create user error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to create user');
  }
});

/**
 * PUT /admin/identity/users/:id
 * Update user
 */
router.put('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
  body('role').optional().isIn(['super_admin', 'admin', 'manager', 'user']).withMessage('Invalid role'),
  body('status').optional().isIn(['inactive', 'active']).withMessage('Invalid status'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department too long'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location too long')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock implementation - in real app, update in database
    const mockUser: AdminUser = {
      id,
      email: 'updated@example.com',
      firstName: updateData.firstName || 'Updated',
      lastName: updateData.lastName || 'User',
      role: updateData.role || 'user',
      permissions: updateData.permissions || ['dashboard.view'],
      isSuperAdmin: updateData.role === 'super_admin',
      isActive: updateData.status !== 'inactive',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        department: updateData.department || 'General',
        location: updateData.location || 'Remote'
      }
    };

    sendResponse(res, 200, true, { user: mockUser }, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to update user');
  }
});

/**
 * DELETE /admin/identity/users/:id
 * Delete user (soft delete)
 */
router.delete('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, soft delete by setting isActive to false
    sendResponse(res, 200, true, undefined, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to delete user');
  }
});

/**
 * POST /admin/identity/users/bulk
 * Bulk user operations
 */
router.post('/users/bulk', [
  body('action').isIn(['create', 'update', 'delete', 'activate', 'deactivate']).withMessage('Invalid action'),
  body('userIds').isArray().withMessage('User IDs must be an array'),
  body('data').optional().isObject().withMessage('Data is required for create/update actions')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { action, userIds, data } = req.body;
    
    // Mock implementation - in real app, perform bulk operation
    const results = {
      affected: userIds.length,
      action,
      message: `Bulk ${action} operation completed for ${userIds.length} users`
    };

    sendResponse(res, 200, true, results, 'Bulk operation completed successfully');
  } catch (error) {
    console.error('Bulk user operation error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to perform bulk operation');
  }
});

export default router;
