import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: Date;
  };
  category: 'personal' | 'work' | 'family' | 'social' | 'health' | 'other';
  color?: string;
  reminder?: {
    type: 'notification' | 'email' | 'sms';
    minutesBefore: number;
  };
  attendees?: Array<{
    userId: string;
    name: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined';
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarFilters {
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  search?: string;
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
 * GET /calendar/events
 * Get calendar events with filters
 */
router.get('/events', [
  query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format'),
  query('category').optional().isIn(['personal', 'work', 'family', 'social', 'health', 'other']).withMessage('Invalid category'),
  query('search').optional().isString().withMessage('Invalid search query'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const filters = req.query as CalendarFilters;
    const { page = 1, limit = 20 } = filters;
    
    // Mock implementation - in real app, query from database
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        allDay: false,
        location: 'Conference Room A',
        isRecurring: true,
        recurrencePattern: {
          type: 'weekly',
          interval: 1
        },
        category: 'work',
        color: '#2196F3',
        reminder: {
          type: 'notification',
          minutesBefore: 15
        },
        attendees: [
          { userId: 'user-1', name: 'John Doe', email: 'john@example.com', status: 'accepted' },
          { userId: 'user-2', name: 'Jane Smith', email: 'jane@example.com', status: 'pending' }
        ],
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Family Dinner',
        description: 'Monthly family gathering',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        allDay: false,
        location: 'Home',
        isRecurring: true,
        recurrencePattern: {
          type: 'monthly',
          interval: 1
        },
        category: 'family',
        color: '#FF6B6B',
        reminder: {
          type: 'notification',
          minutesBefore: 30
        },
        attendees: [
          { userId: 'user-1', name: 'John Doe', email: 'john@example.com', status: 'accepted' },
          { userId: 'user-2', name: 'Jane Smith', email: 'jane@example.com', status: 'accepted' }
        ],
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Apply filters
    let filteredEvents = mockEvents;
    
    if (filters.category) {
      filteredEvents = filteredEvents.filter(event => event.category === filters.category);
    }
    
    if (filters.search) {
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes((filters.search as string).toLowerCase()) ||
        event.description?.toLowerCase().includes((filters.search as string).toLowerCase())
      );
    }
    
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filteredEvents = filteredEvents.filter(event => new Date(event.startTime) >= dateFrom);
    }
    
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      filteredEvents = filteredEvents.filter(event => new Date(event.startTime) <= dateTo);
    }

    // Sort by start time
    filteredEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    sendResponse(res, 200, true, { 
      events: paginatedEvents,
      total: filteredEvents.length,
      page,
      limit,
      hasMore: endIndex < filteredEvents.length
    }, 'Calendar events retrieved successfully');
  } catch (error) {
    console.error('Get calendar events error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get calendar events');
  }
});

/**
 * POST /calendar/create
 * Create new calendar event
 */
router.post('/create', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required'),
  body('startTime').isISO8601().withMessage('Start time is required'),
  body('endTime').isISO8601().withMessage('End time is required'),
  body('category').isIn(['personal', 'work', 'family', 'social', 'health', 'other']).withMessage('Invalid category'),
  body('allDay').optional().isBoolean().withMessage('allDay must be boolean'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location too long')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    
    // Validate that end time is after start time
    if (new Date(eventData.endTime) <= new Date(eventData.startTime)) {
      return sendResponse(res, 400, false, undefined, undefined, 'End time must be after start time');
    }
    
    // Mock implementation - in real app, create in database
    const mockEvent: CalendarEvent = {
      id: '3',
      title: eventData.title,
      description: eventData.description,
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      allDay: eventData.allDay || false,
      location: eventData.location,
      isRecurring: eventData.isRecurring || false,
      recurrencePattern: eventData.recurrencePattern,
      category: eventData.category,
      color: eventData.color,
      reminder: eventData.reminder,
      attendees: eventData.attendees || [],
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    sendResponse(res, 201, true, mockEvent, 'Calendar event created successfully');
  } catch (error) {
    console.error('Create calendar event error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to create calendar event');
  }
});

/**
 * PUT /calendar/events/:id
 * Update calendar event
 */
router.put('/events/:id', [
  param('id').isUUID().withMessage('Invalid event ID'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('startTime').optional().isISO8601().withMessage('Invalid start time format'),
  body('endTime').optional().isISO8601().withMessage('Invalid end time format'),
  body('category').optional().isIn(['personal', 'work', 'family', 'social', 'health', 'other']).withMessage('Invalid category')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate that end time is after start time if both are provided
    if (updateData.startTime && updateData.endTime) {
      if (new Date(updateData.endTime) <= new Date(updateData.startTime)) {
        return sendResponse(res, 400, false, undefined, undefined, 'End time must be after start time');
      }
    }
    
    // Mock implementation - in real app, update in database
    const mockUpdatedEvent: CalendarEvent = {
      id,
      title: updateData.title || 'Updated Event',
      description: updateData.description,
      startTime: updateData.startTime ? new Date(updateData.startTime) : new Date(),
      endTime: updateData.endTime ? new Date(updateData.endTime) : new Date(Date.now() + 60 * 60 * 1000),
      allDay: updateData.allDay || false,
      location: updateData.location,
      isRecurring: updateData.isRecurring || false,
      recurrencePattern: updateData.recurrencePattern,
      category: updateData.category || 'personal',
      color: updateData.color,
      reminder: updateData.reminder,
      attendees: updateData.attendees || [],
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    sendResponse(res, 200, true, mockUpdatedEvent, 'Calendar event updated successfully');
  } catch (error) {
    console.error('Update calendar event error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to update calendar event');
  }
});

/**
 * DELETE /calendar/events/:id
 * Delete calendar event
 */
router.delete('/events/:id', [
  param('id').isUUID().withMessage('Invalid event ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, delete from database
    sendResponse(res, 200, true, undefined, 'Calendar event deleted successfully');
  } catch (error) {
    console.error('Delete calendar event error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to delete calendar event');
  }
});

/**
 * GET /calendar/events/:id
 * Get single calendar event
 */
router.get('/events/:id', [
  param('id').isUUID().withMessage('Invalid event ID')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - in real app, get from database
    const mockEvent: CalendarEvent = {
      id,
      title: 'Sample Event',
      description: 'Sample event description',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      allDay: false,
      location: 'Sample Location',
      isRecurring: false,
      category: 'personal',
      color: '#2196F3',
      reminder: {
        type: 'notification',
        minutesBefore: 15
      },
      attendees: [],
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    };

    sendResponse(res, 200, true, mockEvent, 'Calendar event retrieved successfully');
  } catch (error) {
    console.error('Get calendar event error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get calendar event');
  }
});

/**
 * GET /calendar/stats
 * Get calendar statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Mock implementation - in real app, calculate from database
    const stats = {
      totalEvents: 45,
      thisMonth: 12,
      nextWeek: 3,
      upcoming: 8,
      byCategory: {
        personal: 15,
        work: 18,
        family: 8,
        social: 3,
        health: 2,
        other: 0
      },
      recurringCount: 8,
      todayCount: 2
    };

    sendResponse(res, 200, true, stats, 'Calendar statistics retrieved successfully');
  } catch (error) {
    console.error('Get calendar stats error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get calendar statistics');
  }
});

export default router;
