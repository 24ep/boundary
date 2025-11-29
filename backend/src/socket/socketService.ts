import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../services/supabaseService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  familyId?: string;
}

export const initializeSocket = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'bondarys-dev-secret-key'
      ) as any;

      // Verify user exists and get hourse info
      const supabase = getSupabaseClient();
      const { data: user } = await supabase
        .from('users')
        .select('id, email, is_active')
        .eq('id', decoded.id)
        .single();

      if (!user || !user.is_active) {
        return next(new Error('Invalid token or inactive user'));
      }

      // Get user's hourse
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      socket.userId = user.id;
      socket.familyId = familyMember?.family_id;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected to socket`);

    // Join hourse room if user has a hourse
    if (socket.familyId) {
      socket.join(`hourse:${socket.familyId}`);
      console.log(`User ${socket.userId} joined hourse room: ${socket.familyId}`);

      // Notify hourse members that user is online
      socket.to(`hourse:${socket.familyId}`).emit('user:online', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    }

    // Handle chat messages
    socket.on('chat:message', async (data) => {
      try {
        if (!socket.familyId) {
          socket.emit('error', { message: 'Not a member of any hourse' });
          return;
        }

        const { content, type = 'text' } = data;

        // TODO: Save message to database
        const message = {
          id: Date.now().toString(),
          content,
          type,
          senderId: socket.userId,
          familyId: socket.familyId,
          timestamp: new Date().toISOString()
        };

        // Broadcast to hourse members
        io.to(`hourse:${socket.familyId}`).emit('chat:message', message);

      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle location updates
    socket.on('location:update', async (data) => {
      try {
        if (!socket.familyId) {
          socket.emit('error', { message: 'Not a member of any hourse' });
          return;
        }

        const { latitude, longitude, accuracy, address } = data;

        // TODO: Save location to database
        const locationUpdate = {
          userId: socket.userId,
          latitude,
          longitude,
          accuracy,
          address,
          timestamp: new Date().toISOString()
        };

        // Broadcast to hourse members
        socket.to(`hourse:${socket.familyId}`).emit('location:update', locationUpdate);

      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle safety alerts
    socket.on('safety:alert', async (data) => {
      try {
        if (!socket.familyId) {
          socket.emit('error', { message: 'Not a member of any hourse' });
          return;
        }

        const { type, message, location } = data;

        // TODO: Save alert to database
        const alert = {
          id: Date.now().toString(),
          type,
          message,
          location,
          userId: socket.userId,
          familyId: socket.familyId,
          timestamp: new Date().toISOString(),
          status: 'active'
        };

        // Broadcast urgent alert to all hourse members
        io.to(`hourse:${socket.familyId}`).emit('safety:alert', alert);

      } catch (error) {
        console.error('Safety alert error:', error);
        socket.emit('error', { message: 'Failed to send alert' });
      }
    });

    // Handle typing indicators
    socket.on('chat:typing', (data) => {
      if (socket.familyId) {
        socket.to(`hourse:${socket.familyId}`).emit('chat:typing', {
          userId: socket.userId,
          isTyping: data.isTyping
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from socket`);

      // Notify hourse members that user is offline
      if (socket.familyId) {
        socket.to(`hourse:${socket.familyId}`).emit('user:offline', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('Socket.IO server initialized');
};
