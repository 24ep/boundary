const User = require('../models/User');

module.exports = (io, socket) => {
  // Update user location
  socket.on('update-location', async (data) => {
    try {
      const { latitude, longitude, accuracy, timestamp } = data;
      
      await User.findByIdAndUpdate(socket.userId, {
        location: {
          latitude,
          longitude,
          accuracy,
          lastUpdated: timestamp || new Date()
        }
      });
      
      // Emit to hourse members
      if (socket.familyId) {
        socket.to(`hourse:${socket.familyId}`).emit('member-location-update', {
          userId: socket.userId,
          location: { latitude, longitude, accuracy, timestamp }
        });
      }
    } catch (error) {
      console.error('Update location error:', error);
    }
  });

  // Request location from hourse member
  socket.on('request-location', async (data) => {
    try {
      const { targetUserId, message } = data;
      
      // Emit to specific user
      io.to(`user:${targetUserId}`).emit('location-request', {
        requesterId: socket.userId,
        message: message || 'Can you share your location?'
      });
    } catch (error) {
      console.error('Request location error:', error);
    }
  });

  // Share location with requester
  socket.on('share-location', async (data) => {
    try {
      const { requesterId, location } = data;
      
      io.to(`user:${requesterId}`).emit('location-shared', {
        userId: socket.userId,
        location
      });
    } catch (error) {
      console.error('Share location error:', error);
    }
  });
}; 