const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { hourse } = require('../models/hourse');
const { Chat } = require('../models/Chat');
const { Message } = require('../models/Message');
const { Location } = require('../models/Location');
const { SafetyAlert } = require('../models/SafetyAlert');

// Socket.io authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Socket.io event handlers
const setupSocketHandlers = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    console.log(`User ${socket.userId} connected via socket`);

    // Join user to their hourse rooms
    try {
      const userFamilies = await hourse.getUserFamilies(socket.userId);
      userFamilies.forEach(hourse => {
        socket.join(`hourse:${hourse.id}`);
        console.log(`User ${socket.userId} joined hourse room: ${hourse.id}`);
      });
    } catch (error) {
      console.error('Error joining hourse rooms:', error);
    }

    // =============================================
    // CHAT EVENTS
    // =============================================

    // Join chat room
    socket.on('join_chat', async (data) => {
      try {
        const { chatId } = data;
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Check if user is a participant
        const isParticipant = await Chat.isParticipant(chatId, socket.userId);
        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }

        socket.join(`chat:${chatId}`);
        socket.emit('joined_chat', { chatId, message: 'Successfully joined chat room' });
        
        // Notify other participants
        socket.to(`chat:${chatId}`).emit('user_joined_chat', {
          chatId,
          userId: socket.userId,
          userName: socket.user.first_name + ' ' + socket.user.last_name
        });

        console.log(`User ${socket.userId} joined chat room: ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat room' });
      }
    });

    // Leave chat room
    socket.on('leave_chat', (data) => {
      const { chatId } = data;
      socket.leave(`chat:${chatId}`);
      socket.emit('left_chat', { chatId, message: 'Left chat room' });
      
      // Notify other participants
      socket.to(`chat:${chatId}`).emit('user_left_chat', {
        chatId,
        userId: socket.userId,
        userName: socket.user.first_name + ' ' + socket.user.last_name
      });

      console.log(`User ${socket.userId} left chat room: ${chatId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType = 'text', attachments = [] } = data;
        
        // Validate chat access
        const isParticipant = await Chat.isParticipant(chatId, socket.userId);
        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to send messages to this chat' });
          return;
        }

        // Create message
        const message = await Message.create({
          chat_room_id: chatId,
          user_id: socket.userId,
          content,
          message_type: messageType,
          attachments: JSON.stringify(attachments)
        });

        // Emit to all participants in the chat room
        io.to(`chat:${chatId}`).emit('new_message', {
          message: {
            id: message.id,
            chat_room_id: message.chat_room_id,
            user_id: message.user_id,
            content: message.content,
            message_type: message.message_type,
            attachments: message.attachments,
            created_at: message.created_at,
            user: {
              id: socket.user.id,
              first_name: socket.user.first_name,
              last_name: socket.user.last_name,
              avatar_url: socket.user.avatar_url
            }
          }
        });

        console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId: socket.userId,
        userName: socket.user.first_name + ' ' + socket.user.last_name,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId: socket.userId,
        userName: socket.user.first_name + ' ' + socket.user.last_name,
        isTyping: false
      });
    });

    // =============================================
    // LOCATION EVENTS
    // =============================================

    // Update location
    socket.on('update_location', async (data) => {
      try {
        const { latitude, longitude, address, accuracy } = data;
        
        // Save location to database
        const location = await Location.create({
          user_id: socket.userId,
          latitude,
          longitude,
          address,
          accuracy
        });

        // Broadcast to hourse members
        const userFamilies = await hourse.getUserFamilies(socket.userId);
        userFamilies.forEach(hourse => {
          socket.to(`hourse:${hourse.id}`).emit('location_updated', {
            userId: socket.userId,
            userName: socket.user.first_name + ' ' + socket.user.last_name,
            location: {
              id: location.id,
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              accuracy: location.accuracy,
              created_at: location.created_at
            }
          });
        });

        console.log(`Location updated for user ${socket.userId}`);
      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Request location
    socket.on('request_location', async (data) => {
      try {
        const { targetUserId } = data;
        
        // Check if users are in the same hourse
        const userFamilies = await hourse.getUserFamilies(socket.userId);
        const targetFamilies = await hourse.getUserFamilies(targetUserId);
        
        const sharedFamilies = userFamilies.filter(hourse => 
          targetFamilies.some(targetFamily => targetFamily.id === hourse.id)
        );

        if (sharedFamilies.length === 0) {
          socket.emit('error', { message: 'Not authorized to request location' });
          return;
        }

        // Emit location request to target user
        io.to(`user:${targetUserId}`).emit('location_request', {
          fromUserId: socket.userId,
          fromUserName: socket.user.first_name + ' ' + socket.user.last_name,
          timestamp: new Date().toISOString()
        });

        console.log(`Location request sent from ${socket.userId} to ${targetUserId}`);
      } catch (error) {
        console.error('Error requesting location:', error);
        socket.emit('error', { message: 'Failed to request location' });
      }
    });

    // =============================================
    // SAFETY EVENTS
    // =============================================

    // Send emergency alert
    socket.on('emergency_alert', async (data) => {
      try {
        const { message, location, type = 'panic' } = data;
        
        // Create safety alert
        const alert = await SafetyAlert.create({
          user_id: socket.userId,
          type,
          severity: 'high',
          message,
          location,
          is_resolved: false
        });

        // Get user's families
        const userFamilies = await hourse.getUserFamilies(socket.userId);
        
        // Broadcast emergency alert to all hourse members
        userFamilies.forEach(hourse => {
          socket.to(`hourse:${hourse.id}`).emit('emergency_alert', {
            alert: {
              id: alert.id,
              user_id: alert.user_id,
              type: alert.type,
              severity: alert.severity,
              message: alert.message,
              location: alert.location,
              created_at: alert.created_at,
              user: {
                id: socket.user.id,
                first_name: socket.user.first_name,
                last_name: socket.user.last_name,
                phone: socket.user.phone
              }
            }
          });
        });

        console.log(`Emergency alert sent by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending emergency alert:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Acknowledge emergency alert
    socket.on('acknowledge_alert', async (data) => {
      try {
        const { alertId } = data;
        
        // Update alert status
        await SafetyAlert.acknowledge(alertId, socket.userId);
        
        // Broadcast acknowledgment to hourse members
        const userFamilies = await hourse.getUserFamilies(socket.userId);
        userFamilies.forEach(hourse => {
          socket.to(`hourse:${hourse.id}`).emit('alert_acknowledged', {
            alertId,
            acknowledgedBy: socket.userId,
            acknowledgedByName: socket.user.first_name + ' ' + socket.user.last_name,
            timestamp: new Date().toISOString()
          });
        });

        console.log(`Alert ${alertId} acknowledged by user ${socket.userId}`);
      } catch (error) {
        console.error('Error acknowledging alert:', error);
        socket.emit('error', { message: 'Failed to acknowledge alert' });
      }
    });

    // =============================================
    // hourse EVENTS
    // =============================================

    // hourse member status update
    socket.on('update_status', async (data) => {
      try {
        const { status, message } = data;
        
        // Update user status (you might want to add a status field to users table)
        // For now, we'll just broadcast the status change
        
        // Broadcast to hourse members
        const userFamilies = await hourse.getUserFamilies(socket.userId);
        userFamilies.forEach(hourse => {
          socket.to(`hourse:${hourse.id}`).emit('member_status_updated', {
            userId: socket.userId,
            userName: socket.user.first_name + ' ' + socket.user.last_name,
            status,
            message,
            timestamp: new Date().toISOString()
          });
        });

        console.log(`Status updated for user ${socket.userId}: ${status}`);
      } catch (error) {
        console.error('Error updating status:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // =============================================
    // GENERAL EVENTS
    // =============================================

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Notify hourse members about disconnection
      if (socket.userId) {
        // You might want to implement a way to get user families here
        // and notify them about the disconnection
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Successfully connected to Bondarys real-time server',
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  return io;
};

module.exports = {
  setupSocketHandlers,
  authenticateSocket
};
