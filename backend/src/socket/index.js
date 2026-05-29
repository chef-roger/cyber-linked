const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cyberlink-secret-change-in-production';
const onlineUsers = new Map(); // userId -> socketId

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`⚡ User connected: ${socket.userId}`);
    onlineUsers.set(socket.userId, socket.id);

    await User.findByIdAndUpdate(socket.userId, { status: 'online' });
    io.emit('user:status', { userId: socket.userId, status: 'online' });

    // Send a message
    socket.on('message:send', async ({ receiverId, content }) => {
      try {
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content,
        });
        await message.populate('sender', 'username avatar');
        await message.populate('receiver', 'username avatar');

        // Emit to sender
        socket.emit('message:received', message);

        // Emit to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:received', message);
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', { userId: socket.userId });
      }
    });

    socket.on('typing:stop', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', { userId: socket.userId });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`💤 User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, { status: 'offline' });
      io.emit('user:status', { userId: socket.userId, status: 'offline' });
    });
  });
};

module.exports = { setupSocket };
