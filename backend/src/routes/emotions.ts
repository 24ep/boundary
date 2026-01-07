import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/database';

const router = express.Router();

// Map emotion_type strings to numeric values for mobile app
const emotionTypeToNumber = (emotionType: string): number => {
    switch (emotionType) {
        case 'very_bad': return 1;
        case 'bad': return 2;
        case 'neutral': return 3;
        case 'good': return 4;
        case 'very_good': return 5;
        default: return 3;
    }
};

// Map numeric values to emotion_type strings for database
const numberToEmotionType = (num: number): string => {
    switch (num) {
        case 1: return 'very_bad';
        case 2: return 'bad';
        case 3: return 'neutral';
        case 4: return 'good';
        case 5: return 'very_good';
        default: return 'neutral';
    }
};

// All routes require authentication
router.use(authenticateToken as unknown as express.RequestHandler);

// Get emotion history
router.get('/history', async (req: any, res: any) => {
    try {
        const userId = req.user?.id;
        const days = parseInt(req.query.days as string) || 30;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        // Calculate the start date for the query
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Query emotion records from database
        const result = await pool.query(
            `SELECT id, user_id, emotion_type, notes, recorded_at
             FROM emotion_records
             WHERE user_id = $1 AND recorded_at >= $2
             ORDER BY recorded_at DESC`,
            [userId, startDate.toISOString()]
        );

        // Transform records to match mobile app expected format
        const emotions = result.rows.map((record: any) => ({
            id: record.id,
            user_id: record.user_id,
            emotion: emotionTypeToNumber(record.emotion_type),
            date: new Date(record.recorded_at).toISOString().split('T')[0],
            created_at: record.recorded_at,
            notes: record.notes,
        }));

        // Calculate summary stats
        const totalEntries = emotions.length;
        const averageMood = totalEntries > 0
            ? emotions.reduce((sum: number, e: any) => sum + e.emotion, 0) / totalEntries
            : null;

        res.json({
            success: true,
            data: {
                emotions,
                summary: {
                    totalEntries,
                    averageMood,
                    moodTrend: 'stable',
                    topEmotions: [],
                },
                period: {
                    days,
                    startDate: startDate.toISOString(),
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
        const userId = req.user?.id;
        const { emotion, date, notes } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        if (!emotion || emotion < 1 || emotion > 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid emotion value. Must be between 1 and 5.',
            });
        }

        // Convert numeric emotion to database enum value
        const emotionType = numberToEmotionType(emotion);

        // Use provided date or today's date
        const recordDate = date ? new Date(date) : new Date();
        recordDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

        // Get date string for comparison (YYYY-MM-DD)
        const dateStr = recordDate.toISOString().split('T')[0];

        // Check if a record already exists for this user on this date
        const existingRecord = await pool.query(
            `SELECT id FROM emotion_records 
             WHERE user_id = $1 AND DATE(recorded_at) = $2`,
            [userId, dateStr]
        );

        let result;
        if (existingRecord.rows.length > 0) {
            // Update existing record
            result = await pool.query(
                `UPDATE emotion_records 
                 SET emotion_type = $1, notes = $2, recorded_at = $3
                 WHERE id = $4
                 RETURNING id, user_id, emotion_type, notes, recorded_at`,
                [emotionType, notes || null, recordDate.toISOString(), existingRecord.rows[0].id]
            );
        } else {
            // Insert new record
            result = await pool.query(
                `INSERT INTO emotion_records (user_id, emotion_type, notes, recorded_at)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, user_id, emotion_type, notes, recorded_at`,
                [userId, emotionType, notes || null, recordDate.toISOString()]
            );
        }

        const record = result.rows[0];

        res.json({
            success: true,
            message: 'Emotion logged successfully',
            entry: {
                id: record.id,
                user_id: record.user_id,
                emotion: emotionTypeToNumber(record.emotion_type),
                date: new Date(record.recorded_at).toISOString().split('T')[0],
                notes: record.notes,
                timestamp: record.recorded_at,
            }
        });
    } catch (error: any) {
        console.error('Log emotion error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error?.message || 'An unexpected error occurred'
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
