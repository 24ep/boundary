import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Expense {
  id: string;
  circleId: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: 'food' | 'transportation' | 'entertainment' | 'healthcare' | 'education' | 'shopping' | 'utilities' | 'housing' | 'insurance' | 'other';
  subcategory?: string;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_payment' | 'other';
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate?: Date;
  status: 'pending' | 'paid' | 'cancelled';
  tags: string[];
  attachments?: string[];
  sharedWith: string[];
  splitType: 'equal' | 'percentage' | 'fixed' | 'none';
  splitDetails?: Array<{
    userId: string;
    amount: number;
    percentage?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Budget {
  id: string;
  circleId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  categories: Array<{
    category: string;
    limit: number;
    spent: number;
  }>;
  isActive: boolean;
  notifications: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseFilters {
  category?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

interface ExpenseCategory {
  name: string;
  icon: string;
  color: string;
  description?: string;
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
 * GET /expenses/list
 * Get expenses list with filters
 */
router.get('/list', [
  query('category').optional().isIn(['food', 'transportation', 'entertainment', 'healthcare', 'education', 'shopping', 'utilities', 'housing', 'insurance', 'other']).withMessage('Invalid category'),
  query('status').optional().isIn(['pending', 'paid', 'cancelled']).withMessage('Invalid status'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format'),
  query('search').optional().isString().withMessage('Invalid search query'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const filters = req.query as ExpenseFilters;
    const { page = 1, limit = 20 } = filters;
    
    // Mock implementation - in real app, query from database
    const mockExpenses: Expense[] = [
      {
        id: '1',
        circleId: 'circle-1',
        userId: 'user-1',
        title: 'Grocery Shopping',
        description: 'Weekly grocery run',
        amount: 125.50,
        currency: 'USD',
        category: 'food',
        subcategory: 'groceries',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        paymentMethod: 'card',
        isRecurring: true,
        recurrencePattern: 'weekly',
        nextDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'paid',
        tags: ['groceries', 'weekly'],
        attachments: [],
        sharedWith: ['user-2'],
        splitType: 'equal',
        splitDetails: [
          { userId: 'user-1', amount: 62.75 },
          { userId: 'user-2', amount: 62.75 }
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        circleId: 'circle-1',
        userId: 'user-1',
        title: 'Gas Station',
        description: 'Car fuel',
        amount: 45.00,
        currency: 'USD',
        category: 'transportation',
        subcategory: 'fuel',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paymentMethod: 'card',
        isRecurring: false,
        status: 'paid',
        tags: ['car', 'fuel'],
        attachments: [],
        sharedWith: [],
        splitType: 'none',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Apply filters
    let filteredExpenses = mockExpenses;
    
    if (filters.category) {
      filteredExpenses = filteredExpenses.filter(expense => expense.category === filters.category);
    }
    
    if (filters.status) {
      filteredExpenses = filteredExpenses.filter(expense => expense.status === filters.status);
    }
    
    if (filters.search) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.title.toLowerCase().includes((filters.search as string).toLowerCase()) ||
        expense.description?.toLowerCase().includes((filters.search as string).toLowerCase()) ||
        expense.tags.some(tag => tag.toLowerCase().includes((filters.search as string).toLowerCase()))
      );
    }
    
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) >= dateFrom);
    }
    
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) <= dateTo);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

    sendResponse(res, 200, true, { 
      expenses: paginatedExpenses,
      total: filteredExpenses.length,
      page,
      limit,
      hasMore: endIndex < filteredExpenses.length
    }, 'Expenses retrieved successfully');
  } catch (error) {
    console.error('Get expenses error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get expenses');
  }
});

/**
 * POST /expenses/create
 * Create new expense
 */
router.post('/create', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency code is required'),
  body('category').isIn(['food', 'transportation', 'entertainment', 'healthcare', 'education', 'shopping', 'utilities', 'housing', 'insurance', 'other']).withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Date is required'),
  body('paymentMethod').isIn(['cash', 'card', 'bank_transfer', 'mobile_payment', 'other']).withMessage('Invalid payment method'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const expenseData = req.body;
    
    // Mock implementation - in real app, create in database
    const mockExpense: Expense = {
      id: '3',
      circleId: 'circle-1',
      userId: 'user-1',
      title: expenseData.title,
      description: expenseData.description,
      amount: expenseData.amount,
      currency: expenseData.currency,
      category: expenseData.category,
      subcategory: expenseData.subcategory,
      date: new Date(expenseData.date),
      paymentMethod: expenseData.paymentMethod,
      isRecurring: expenseData.isRecurring || false,
      recurrencePattern: expenseData.recurrencePattern,
      nextDueDate: expenseData.nextDueDate ? new Date(expenseData.nextDueDate) : undefined,
      status: 'pending',
      tags: expenseData.tags || [],
      attachments: [],
      sharedWith: [],
      splitType: 'none',
      splitDetails: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    sendResponse(res, 201, true, mockExpense, 'Expense created successfully');
  } catch (error) {
    console.error('Create expense error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to create expense');
  }
});

/**
 * PUT /expenses/:id
 * Update expense
 */
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid expense ID'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('status').optional().isIn(['pending', 'paid', 'cancelled']).withMessage('Invalid status'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock implementation - in real app, update in database
    const mockUpdatedExpense: Expense = {
      id,
      circleId: 'circle-1',
      userId: 'user-1',
      title: updateData.title || 'Updated Expense',
      description: updateData.description,
      amount: updateData.amount || 100,
      currency: updateData.currency || 'USD',
      category: updateData.category || 'other',
      subcategory: updateData.subcategory,
      date: updateData.date ? new Date(updateData.date) : new Date(),
      paymentMethod: updateData.paymentMethod || 'card',
      isRecurring: updateData.isRecurring || false,
      status: updateData.status || 'pending',
      tags: updateData.tags || [],
      attachments: [],
      sharedWith: [],
      splitType: 'none',
      splitDetails: [],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    sendResponse(res, 200, true, mockUpdatedExpense, 'Expense updated successfully');
  } catch (error) {
    console.error('Update expense error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to update expense');
  }
});

/**
 * DELETE /expenses/:id
 * Delete expense
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid expense ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, delete from database
    sendResponse(res, 200, true, undefined, 'Expense deleted successfully');
  } catch (error) {
    console.error('Delete expense error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to delete expense');
  }
});

/**
 * GET /expenses/categories
 * Get expense categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    // Mock implementation - in real app, get from database or config
    const categories: ExpenseCategory[] = [
      {
        name: 'food',
        icon: '🍔',
        color: '#FF6B6B',
        description: 'Food and dining expenses'
      },
      {
        name: 'transportation',
        icon: '🚗',
        color: '#4ECDC4',
        description: 'Transportation and travel'
      },
      {
        name: 'entertainment',
        icon: '🎮',
        color: '#9B59B6',
        description: 'Entertainment and leisure'
      },
      {
        name: 'healthcare',
        icon: '🏥',
        color: '#FF6B6B',
        description: 'Medical and health expenses'
      },
      {
        name: 'education',
        icon: '📚',
        color: '#61DAFB',
        description: 'Education and learning'
      },
      {
        name: 'shopping',
        icon: '🛍',
        color: '#F7DC6F',
        description: 'Shopping and retail'
      },
      {
        name: 'utilities',
        icon: '💡',
        color: '#FFC107',
        description: 'Utilities and bills'
      },
      {
        name: 'housing',
        icon: '🏠',
        color: '#8D6E63',
        description: 'Housing and rent'
      },
      {
        name: 'insurance',
        icon: '🛡️',
        color: '#2196F3',
        description: 'Insurance premiums'
      },
      {
        name: 'other',
        icon: '📋',
        color: '#9E9E9E',
        description: 'Other expenses'
      }
    ];

    sendResponse(res, 200, true, categories, 'Expense categories retrieved successfully');
  } catch (error) {
    console.error('Get expense categories error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get expense categories');
  }
});

/**
 * GET /expenses/stats
 * Get expense statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Mock implementation - in real app, calculate from database
    const stats = {
      totalExpenses: 1250.75,
      thisMonth: 425.30,
      lastMonth: 380.15,
      averageMonthly: 416.50,
      topCategory: 'food',
      categoryBreakdown: {
        food: 450.25,
        transportation: 180.00,
        entertainment: 125.50,
        healthcare: 95.00,
        shopping: 200.00,
        utilities: 150.00,
        housing: 0.00,
        insurance: 50.00,
        other: 0.00
      },
      paidPercentage: 85.2,
      pendingCount: 2,
      recurringCount: 3
    };

    sendResponse(res, 200, true, stats, 'Expense statistics retrieved successfully');
  } catch (error) {
    console.error('Get expense stats error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get expense statistics');
  }
});

export default router;
