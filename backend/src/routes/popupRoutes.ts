import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { PopupController } from '../controllers/PopupController';
import { validatePopup } from '../validators/popupValidator';

const router = express.Router();
const popupController = new PopupController();

// Public routes (for fetching active popups)
router.get('/active', popupController.getActivePopups);
router.post('/analytics', popupController.recordAnalytics);

// Protected routes (for user popup settings)
router.get('/user/:userId/settings', authMiddleware, popupController.getUserSettings);
router.put('/user/:userId/settings', authMiddleware, popupController.updateUserSettings);
router.post('/:popupId/shown', authMiddleware, popupController.markAsShown);

// Admin routes (for managing popups)
router.get('/', authMiddleware, adminMiddleware, popupController.getAllPopups);
router.get('/:id', authMiddleware, adminMiddleware, popupController.getPopupById);
router.post('/', authMiddleware, adminMiddleware, validatePopup, popupController.createPopup);
router.put('/:id', authMiddleware, adminMiddleware, validatePopup, popupController.updatePopup);
router.delete('/:id', authMiddleware, adminMiddleware, popupController.deletePopup);

// Admin analytics routes
router.get('/analytics/overview', authMiddleware, adminMiddleware, popupController.getAnalyticsOverview);
router.get('/analytics/:popupId', authMiddleware, adminMiddleware, popupController.getPopupAnalytics);
router.get('/analytics/export', authMiddleware, adminMiddleware, popupController.exportAnalytics);

export default router; 