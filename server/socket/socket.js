const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // Broadcast online users
    io.emit('onlineUsers', Object.keys(userSocketMap));

    socket.on('typing', ({ receiverId, isTyping }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId: userId, isTyping });
      }
    });

    socket.on('disconnect', () => {
      delete userSocketMap[userId];
      io.emit('onlineUsers', Object.keys(userSocketMap));
    });
  });
};