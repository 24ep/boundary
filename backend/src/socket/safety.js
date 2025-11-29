const EmergencyAlert = require('../models/EmergencyAlert');
const SafetyCheck = require('../models/SafetyCheck');

module.exports = (io, socket) => {
  // Emergency alert
  socket.on('emergency-alert', async (data) => {
    try {
      const { location, message, contacts } = data;
      
      const alert = new EmergencyAlert({
        user: socket.userId,
        location,
        message,
        contacts,
        status: 'active'
      });
      
      await alert.save();
      
      // Emit to hourse members
      if (socket.familyId) {
        io.to(`hourse:${socket.familyId}`).emit('emergency-alert', {
          alertId: alert._id,
          userId: socket.userId,
          location,
          message,
          timestamp: alert.createdAt
        });
      }
      
      // Emit to emergency contacts
      contacts.forEach(contactId => {
        io.to(`user:${contactId}`).emit('emergency-alert', {
          alertId: alert._id,
          userId: socket.userId,
          location,
          message,
          timestamp: alert.createdAt
        });
      });
    } catch (error) {
      console.error('Emergency alert error:', error);
    }
  });

  // Safety check request
  socket.on('safety-check-request', async (data) => {
    try {
      const { targetId, message } = data;
      
      const check = new SafetyCheck({
        requester: socket.userId,
        target: targetId,
        message,
        status: 'pending'
      });
      
      await check.save();
      
      io.to(`user:${targetId}`).emit('safety-check-request', {
        checkId: check._id,
        requesterId: socket.userId,
        message,
        timestamp: check.createdAt
      });
    } catch (error) {
      console.error('Safety check request error:', error);
    }
  });

  // Safety check response
  socket.on('safety-check-response', async (data) => {
    try {
      const { checkId, response, location } = data;
      
      await SafetyCheck.findByIdAndUpdate(checkId, {
        status: response,
        responseLocation: location,
        respondedAt: new Date()
      });
      
      // Emit to requester
      io.to(`user:${socket.userId}`).emit('safety-check-response', {
        checkId,
        targetId: socket.userId,
        response,
        location,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Safety check response error:', error);
    }
  });
}; 