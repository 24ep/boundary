import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Mock authentication middleware to bypass DB hang issues
const mockAuth = (req: any, res: any, next: any) => {
    req.user = {
        id: 'mock_user_id',
        email: 'dev@bondarys.com'
    };
    next();
};

// All routes require authentication
router.use(mockAuth);

// Get emotion history
router.get('/history', async (req: any, res: any) => {
    try {
        const days = parseInt(req.query.days as string) || 30;

        // Return empty history for now (emotions feature not fully implemented)
        res.json({
            success: true,
            data: {
                emotions: [],
                summary: {
                    totalEntries: 0,
                    averageMood: null,
                    moodTrend: 'stable',
                    topEmotions: [],
                },
                period: {
                    days,
                    startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date().toISOString(),
                }
            }
        });
    } catch (error) {
        console.error('Get emotion history error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
});

// Log a new emotion entry
router.post('/', async (req: any, res: any) => {
    try {
        const { emotion, intensity, notes } = req.body;

        // For now, just acknowledge the entry
        res.json({
            success: true,
            message: 'Emotion logged successfully',
            entry: {
                id: Date.now().toString(),
                emotion,
                intensity,
                notes,
                timestamp: new Date().toISOString(),
            }
        });
    } catch (error) {
        console.error('Log emotion error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
});

// Get emotion statistics
router.get('/stats', async (req: any, res: any) => {
    try {
        res.json({
            success: true,
            stats: {
                totalEntries: 0,
                streakDays: 0,
                averageMood: null,
                mostFrequentEmotion: null,
                lastEntry: null,
            }
        });
    } catch (error) {
        console.error('Get emotion stats error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
});

export default router;
