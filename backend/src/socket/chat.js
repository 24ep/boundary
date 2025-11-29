const Chat = require('../models/Chat');
const Message = require('../models/Message');

module.exports = (io, socket) => {
  // Join chat room
  socket.on('join-chat', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);
      if (chat) {
        const isParticipant = await chat.isParticipant(socket.userId);
        if (isParticipant) {
          socket.join(`chat:${chatId}`);
          socket.emit('chat-joined', { chatId });
          
          // Notify other participants that user joined
          socket.to(`chat:${chatId}`).emit('user-joined', {
            chatId,
            userId: socket.userId,
            timestamp: new Date().toISOString()
          });
        } else {
          socket.emit('chat-join-error', {
            error: 'Access denied',
            message: 'You are not a participant in this chat room'
          });
        }
      } else {
        socket.emit('chat-join-error', {
          error: 'Chat room not found',
          message: 'The requested chat room does not exist'
        });
      }
    } catch (error) {
      console.error('Join chat error:', error);
      socket.emit('chat-join-error', {
        error: 'Internal server error',
        message: 'Failed to join chat room'
      });
    }
  });

  // Leave chat room
  socket.on('leave-chat', async (chatId) => {
    try {
      socket.leave(`chat:${chatId}`);
      socket.emit('chat-left', { chatId });
      
      // Notify other participants that user left
      socket.to(`chat:${chatId}`).emit('user-left', {
        chatId,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Leave chat error:', error);
    }
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { chatId, content, type = 'text', metadata = {}, replyTo } = data;
      
      if (!chatId || (!content && type === 'text')) {
        socket.emit('message-error', {
          error: 'Invalid message data',
          message: 'Chat ID and content are required'
        });
        return;
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('message-error', {
          error: 'Chat room not found',
          message: 'The requested chat room does not exist'
        });
        return;
      }

      const isParticipant = await chat.isParticipant(socket.userId);
      if (!isParticipant) {
        socket.emit('message-error', {
          error: 'Access denied',
          message: 'You are not a participant in this chat room'
        });
        return;
      }

      // Create the message
      const message = await Message.create({
        chatRoomId: chatId,
        senderId: socket.userId,
        content,
        type,
        metadata,
        replyTo
      });

      // Emit to all users in the chat
      io.to(`chat:${chatId}`).emit('new-message', {
        message: {
          id: message.id,
          chatRoomId: message.chatRoomId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          metadata: message.metadata,
          replyTo: message.replyTo,
          editedAt: message.editedAt,
          deletedAt: message.deletedAt,
          isPinned: message.isPinned,
          reactions: message.reactions,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          sender: message.sender,
          replyToMessage: message.replyToMessage,
          attachments: message.attachments || []
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', {
        error: 'Internal server error',
        message: 'Failed to send message'
      });
    }
  });

  // Update message
  socket.on('update-message', async (data) => {
    try {
      const { messageId, content } = data;
      
      if (!messageId || !content) {
        socket.emit('message-update-error', {
          error: 'Invalid update data',
          message: 'Message ID and content are required'
        });
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('message-update-error', {
          error: 'Message not found',
          message: 'The requested message does not exist'
        });
        return;
      }

      if (message.senderId !== socket.userId) {
        socket.emit('message-update-error', {
          error: 'Access denied',
          message: 'You can only edit your own messages'
        });
        return;
      }

      await message.update({ content });

      // Emit to all users in the chat
      io.to(`chat:${message.chatRoomId}`).emit('message-updated', {
        message: {
          id: message.id,
          chatRoomId: message.chatRoomId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          metadata: message.metadata,
          replyTo: message.replyTo,
          editedAt: message.editedAt,
          deletedAt: message.deletedAt,
          isPinned: message.isPinned,
          reactions: message.reactions,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          sender: message.sender,
          replyToMessage: message.replyToMessage,
          attachments: message.attachments || []
        }
      });
    } catch (error) {
      console.error('Update message error:', error);
      socket.emit('message-update-error', {
        error: 'Internal server error',
        message: 'Failed to update message'
      });
    }
  });

  // Delete message
  socket.on('delete-message', async (data) => {
    try {
      const { messageId } = data;
      
      if (!messageId) {
        socket.emit('message-delete-error', {
          error: 'Invalid delete data',
          message: 'Message ID is required'
        });
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('message-delete-error', {
          error: 'Message not found',
          message: 'The requested message does not exist'
        });
        return;
      }

      const chat = await Chat.findById(message.chatRoomId);
      const isSender = message.senderId === socket.userId;
      const isAdmin = chat ? await chat.isAdmin(socket.userId) : false;

      if (!isSender && !isAdmin) {
        socket.emit('message-delete-error', {
          error: 'Access denied',
          message: 'You can only delete your own messages or be an admin'
        });
        return;
      }

      await message.delete();

      // Emit to all users in the chat
      io.to(`chat:${message.chatRoomId}`).emit('message-deleted', {
        messageId: message.id,
        chatRoomId: message.chatRoomId,
        deletedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('message-delete-error', {
        error: 'Internal server error',
        message: 'Failed to delete message'
      });
    }
  });

  // Add reaction
  socket.on('add-reaction', async (data) => {
    try {
      const { messageId, emoji } = data;
      
      if (!messageId || !emoji) {
        socket.emit('reaction-error', {
          error: 'Invalid reaction data',
          message: 'Message ID and emoji are required'
        });
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('reaction-error', {
          error: 'Message not found',
          message: 'The requested message does not exist'
        });
        return;
      }

      const chat = await Chat.findById(message.chatRoomId);
      if (!chat) {
        socket.emit('reaction-error', {
          error: 'Chat room not found',
          message: 'The chat room for this message does not exist'
        });
        return;
      }

      const isParticipant = await chat.isParticipant(socket.userId);
      if (!isParticipant) {
        socket.emit('reaction-error', {
          error: 'Access denied',
          message: 'You are not a participant in this chat room'
        });
        return;
      }

      await message.addReaction(socket.userId, emoji);

      // Emit to all users in the chat
      io.to(`chat:${message.chatRoomId}`).emit('reaction-added', {
        messageId: message.id,
        chatRoomId: message.chatRoomId,
        userId: socket.userId,
        emoji,
        reactions: message.reactions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Add reaction error:', error);
      socket.emit('reaction-error', {
        error: 'Internal server error',
        message: 'Failed to add reaction'
      });
    }
  });

  // Remove reaction
  socket.on('remove-reaction', async (data) => {
    try {
      const { messageId, emoji } = data;
      
      if (!messageId || !emoji) {
        socket.emit('reaction-error', {
          error: 'Invalid reaction data',
          message: 'Message ID and emoji are required'
        });
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('reaction-error', {
          error: 'Message not found',
          message: 'The requested message does not exist'
        });
        return;
      }

      const chat = await Chat.findById(message.chatRoomId);
      if (!chat) {
        socket.emit('reaction-error', {
          error: 'Chat room not found',
          message: 'The chat room for this message does not exist'
        });
        return;
      }

      const isParticipant = await chat.isParticipant(socket.userId);
      if (!isParticipant) {
        socket.emit('reaction-error', {
          error: 'Access denied',
          message: 'You are not a participant in this chat room'
        });
        return;
      }

      await message.removeReaction(socket.userId, emoji);

      // Emit to all users in the chat
      io.to(`chat:${message.chatRoomId}`).emit('reaction-removed', {
        messageId: message.id,
        chatRoomId: message.chatRoomId,
        userId: socket.userId,
        emoji,
        reactions: message.reactions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Remove reaction error:', error);
      socket.emit('reaction-error', {
        error: 'Internal server error',
        message: 'Failed to remove reaction'
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { chatId, isTyping } = data;
    if (chatId) {
      socket.to(`chat:${chatId}`).emit('user-typing', {
        userId: socket.userId,
        chatId,
        isTyping,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Stop typing indicator
  socket.on('stop-typing', (data) => {
    const { chatId } = data;
    if (chatId) {
      socket.to(`chat:${chatId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        chatId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Mark messages as read
  socket.on('mark-messages-read', async (data) => {
    try {
      const { chatId, lastReadMessageId } = data;
      
      if (!chatId) {
        socket.emit('mark-read-error', {
          error: 'Invalid data',
          message: 'Chat ID is required'
        });
        return;
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('mark-read-error', {
          error: 'Chat room not found',
          message: 'The requested chat room does not exist'
        });
        return;
      }

      const isParticipant = await chat.isParticipant(socket.userId);
      if (!isParticipant) {
        socket.emit('mark-read-error', {
          error: 'Access denied',
          message: 'You are not a participant in this chat room'
        });
        return;
      }

      // Update last read timestamp for the participant
      // This would typically update the chat_participants table
      // For now, we'll just emit the event
      
      socket.emit('messages-marked-read', {
        chatId,
        userId: socket.userId,
        lastReadMessageId,
        timestamp: new Date().toISOString()
      });

      // Notify other participants that messages were read
      socket.to(`chat:${chatId}`).emit('user-read-messages', {
        chatId,
        userId: socket.userId,
        lastReadMessageId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Mark messages read error:', error);
      socket.emit('mark-read-error', {
        error: 'Internal server error',
        message: 'Failed to mark messages as read'
      });
    }
  });

  // Chat room events
  socket.on('chat-room-updated', (data) => {
    const { chatId } = data;
    if (chatId) {
      socket.to(`chat:${chatId}`).emit('chat-room-changed', {
        chatId,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Participant events
  socket.on('participant-added', (data) => {
    const { chatId, addedUserId } = data;
    if (chatId && addedUserId) {
      io.to(`chat:${chatId}`).emit('participant-joined', {
        chatId,
        addedUserId,
        addedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('participant-removed', (data) => {
    const { chatId, removedUserId } = data;
    if (chatId && removedUserId) {
      io.to(`chat:${chatId}`).emit('participant-left', {
        chatId,
        removedUserId,
        removedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    }
  });
}; 