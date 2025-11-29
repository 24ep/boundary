module.exports = (io, socket) => {
  // Initiate video call
  socket.on('initiate-call', (data) => {
    const { participants, callType = 'video' } = data;
    
    participants.forEach(participantId => {
      if (participantId !== socket.userId) {
        io.to(`user:${participantId}`).emit('incoming-call', {
          callerId: socket.userId,
          callType,
          participants
        });
      }
    });
  });

  // Answer call
  socket.on('answer-call', (data) => {
    const { callerId, answer } = data;
    
    io.to(`user:${callerId}`).emit('call-answered', {
      answererId: socket.userId,
      answer
    });
  });

  // End call
  socket.on('end-call', (data) => {
    const { participants } = data;
    
    participants.forEach(participantId => {
      if (participantId !== socket.userId) {
        io.to(`user:${participantId}`).emit('call-ended', {
          endedBy: socket.userId
        });
      }
    });
  });

  // Call signaling (WebRTC)
  socket.on('call-signal', (data) => {
    const { targetId, signal } = data;
    
    io.to(`user:${targetId}`).emit('call-signal', {
      fromId: socket.userId,
      signal
    });
  });
}; 