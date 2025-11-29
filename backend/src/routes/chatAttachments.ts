import express from 'express';
import multer from 'multer';
import { authenticateToken, requireFamilyMember, AuthenticatedRequest } from '../middleware/auth';
import { ChatService } from '../services/chatService';
import Chat from '../models/Chat';
import Message from '../models/Message';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now, but you can add restrictions here
    cb(null, true);
  }
});

// All routes require authentication and hourse membership
router.use(authenticateToken);
router.use(requireFamilyMember);

/**
 * Upload attachment for a message
 */
router.post('/messages/:messageId/attachments', upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please provide a file to upload'
      });
    }

    if (!messageId) {
      return res.status(400).json({
        error: 'Message ID is required',
        message: 'Please provide a valid message ID'
      });
    }

    // Verify message exists and user has access
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'The requested message does not exist'
      });
    }

    const chatRoom = await Chat.findById(message.chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({
        error: 'Chat room not found',
        message: 'The chat room for this message does not exist'
      });
    }

    const isParticipant = await chatRoom.isParticipant(userId);
    if (!isParticipant) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You are not a participant in this chat room'
      });
    }

    // Upload the file
    const attachment = await ChatService.uploadAttachment(file, messageId, userId);

    res.status(201).json({
      success: true,
      data: attachment
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to upload attachment'
    });
  }
});

/**
 * Get attachment by ID
 */
router.get('/attachments/:attachmentId', async (req: AuthenticatedRequest, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user?.id;

    if (!attachmentId) {
      return res.status(400).json({
        error: 'Attachment ID is required',
        message: 'Please provide a valid attachment ID'
      });
    }

    const attachment = await ChatService.getAttachment(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        error: 'Attachment not found',
        message: 'The requested attachment does not exist'
      });
    }

    // Verify user has access to the message
    const message = await Message.findById(attachment.message_id);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'The message for this attachment does not exist'
      });
    }

    const chatRoom = await Chat.findById(message.chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({
        error: 'Chat room not found',
        message: 'The chat room for this attachment does not exist'
      });
    }

    const isParticipant = await chatRoom.isParticipant(userId);
    if (!isParticipant) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You are not a participant in this chat room'
      });
    }

    res.json({
      success: true,
      data: attachment
    });
  } catch (error) {
    console.error('Get attachment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve attachment'
    });
  }
});

/**
 * Delete attachment
 */
router.delete('/attachments/:attachmentId', async (req: AuthenticatedRequest, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user?.id;

    if (!attachmentId) {
      return res.status(400).json({
        error: 'Attachment ID is required',
        message: 'Please provide a valid attachment ID'
      });
    }

    const attachment = await ChatService.getAttachment(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        error: 'Attachment not found',
        message: 'The requested attachment does not exist'
      });
    }

    // Verify user has access to the message
    const message = await Message.findById(attachment.message_id);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'The message for this attachment does not exist'
      });
    }

    const chatRoom = await Chat.findById(message.chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({
        error: 'Chat room not found',
        message: 'The chat room for this attachment does not exist'
      });
    }

    // Check if user is the sender or admin
    const isSender = message.senderId === userId;
    const isAdmin = await chatRoom.isAdmin(userId);

    if (!isSender && !isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete attachments from your own messages or be an admin'
      });
    }

    await ChatService.deleteAttachment(attachmentId, userId);

    res.json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete attachment'
    });
  }
});

/**
 * Search messages in a chat
 */
router.get('/rooms/:chatId/search', async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const { q: query } = req.query;
    const userId = req.user?.id;

    if (!chatId) {
      return res.status(400).json({
        error: 'Chat ID is required',
        message: 'Please provide a valid chat ID'
      });
    }

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Search query is required',
        message: 'Please provide a search query'
      });
    }

    const results = await ChatService.searchMessages(chatId, query, userId);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search messages'
    });
  }
});

/**
 * Get unread message count for user
 */
router.get('/unread-count', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    const unreadData = await ChatService.getUnreadCount(userId);

    res.json({
      success: true,
      data: unreadData
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get unread count'
    });
  }
});

/**
 * Mark messages as read
 */
router.post('/rooms/:chatId/mark-read', async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const { lastReadMessageId } = req.body;
    const userId = req.user?.id;

    if (!chatId) {
      return res.status(400).json({
        error: 'Chat ID is required',
        message: 'Please provide a valid chat ID'
      });
    }

    await ChatService.markMessagesAsRead(chatId, userId, lastReadMessageId);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to mark messages as read'
    });
  }
});

/**
 * Get chat statistics
 */
router.get('/families/:familyId/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user?.id;

    if (!familyId) {
      return res.status(400).json({
        error: 'hourse ID is required',
        message: 'Please provide a valid hourse ID'
      });
    }

    const stats = await ChatService.getChatStats(familyId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get chat statistics'
    });
  }
});

export default router;
