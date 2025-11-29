import express from 'express';
import { authenticateToken, requireFamilyMember, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and hourse membership
router.use(authenticateToken);
router.use(requireFamilyMember);

// Get hourse locations
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      locations: [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Update user location
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;
