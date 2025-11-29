import express from 'express';
import { authenticateToken, requireFamilyMember, AuthenticatedRequest } from '../middleware/auth';
import { ChatController } from '../controllers/ChatController';

const router = express.Router();

// All routes require authentication and hourse membership
router.use(authenticateToken as any);
router.use(requireFamilyMember as any);

// Chat Rooms Routes
router.get('/families/:familyId/rooms', ChatController.getChatRooms);
router.post('/families/:familyId/rooms', ChatController.createChatRoom);
router.get('/rooms/:chatId', ChatController.getChatRoom);
router.put('/rooms/:chatId', ChatController.updateChatRoom);
router.delete('/rooms/:chatId', ChatController.deleteChatRoom);

// Chat Participants Routes
router.post('/rooms/:chatId/participants', ChatController.addParticipant);
router.delete('/rooms/:chatId/participants/:userId', ChatController.removeParticipant);

// Messages Routes
router.get('/rooms/:chatId/messages', ChatController.getMessages);
router.post('/rooms/:chatId/messages', ChatController.sendMessage);
router.put('/messages/:messageId', ChatController.updateMessage);
router.delete('/messages/:messageId', ChatController.deleteMessage);

// Message Reactions Routes
router.post('/messages/:messageId/reactions', ChatController.addReaction);
router.delete('/messages/:messageId/reactions', ChatController.removeReaction);

export default router;
