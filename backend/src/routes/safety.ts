import express from 'express';
import { authenticateToken, requireFamilyMember, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and hourse membership
router.use(authenticateToken);
router.use(requireFamilyMember);

// Get safety alerts
router.get('/alerts', async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      alerts: [],
      activeAlerts: 0
    });
  } catch (error) {
    console.error('Get safety alerts error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Create safety alert
router.post('/alerts', async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      message: 'Safety alert created successfully'
    });
  } catch (error) {
    console.error('Create safety alert error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;
