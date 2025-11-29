import { Router } from 'express';
import { CMSController } from '../controllers/CMSController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const cmsController = new CMSController();

// Content Management Routes
router.get('/families/:familyId/content', authenticateToken, cmsController.getContent.bind(cmsController));
router.get('/content/:contentId', authenticateToken, cmsController.getContentById.bind(cmsController));
router.post('/families/:familyId/content', authenticateToken, cmsController.createContent.bind(cmsController));
router.put('/content/:contentId', authenticateToken, cmsController.updateContent.bind(cmsController));
router.delete('/content/:contentId', authenticateToken, cmsController.deleteContent.bind(cmsController));

// Content Interaction Routes
router.post('/content/:contentId/like', authenticateToken, cmsController.likeContent.bind(cmsController));
router.post('/content/:contentId/view', authenticateToken, cmsController.viewContent.bind(cmsController));
router.post('/content/:contentId/share', authenticateToken, cmsController.shareContent.bind(cmsController));

// Comment Routes
router.get('/content/:contentId/comments', authenticateToken, cmsController.getComments.bind(cmsController));
router.post('/content/:contentId/comments', authenticateToken, cmsController.createComment.bind(cmsController));

// Category Routes
router.get('/families/:familyId/categories', authenticateToken, cmsController.getCategories.bind(cmsController));
router.post('/families/:familyId/categories', authenticateToken, cmsController.createCategory.bind(cmsController));

// Analytics Routes
router.get('/families/:familyId/analytics/content', authenticateToken, cmsController.getContentAnalytics.bind(cmsController));
router.get('/families/:familyId/content/popular', authenticateToken, cmsController.getPopularContent.bind(cmsController));

export default router;
