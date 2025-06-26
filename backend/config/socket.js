const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    // Update user's last seen
    User.findByIdAndUpdate(socket.user._id, { lastSeen: new Date() });

    // Join user to their groups
    socket.on('join-groups', async () => {
      try {
        const user = await User.findById(socket.user._id).populate('groups');
        if (user.groups) {
          user.groups.forEach(group => {
            socket.join(`group-${group._id}`);
          });
        }
      } catch (error) {
        console.error('Error joining groups:', error);
      }
    });

    // Join specific group chat
    socket.on('join-group-chat', (groupId) => {
      socket.join(`group-${groupId}`);
      console.log(`User ${socket.user.name} joined group chat: ${groupId}`);
    });

    // Join specific event chat
    socket.on('join-event-chat', (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`User ${socket.user.name} joined event chat: ${eventId}`);
    });

    // Handle group chat messages
    socket.on('group-message', async (data) => {
      try {
        const { groupId, content, messageType = 'text', mediaUrl, fileName, fileSize } = data;

        const message = new ChatMessage({
          sender: socket.user._id,
          content,
          messageType,
          mediaUrl,
          fileName,
          fileSize,
          chatType: 'group',
          chatId: groupId
        });

        await message.save();
        await message.populate('sender', 'name profileImage');

        // Emit to all users in the group
        io.to(`group-${groupId}`).emit('new-group-message', {
          message,
          groupId
        });

        // Mark message as read by sender
        message.readBy.push({
          user: socket.user._id,
          readAt: new Date()
        });
        await message.save();

      } catch (error) {
        console.error('Error sending group message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle event chat messages
    socket.on('event-message', async (data) => {
      try {
        const { eventId, content, messageType = 'text', mediaUrl, fileName, fileSize } = data;

        const message = new ChatMessage({
          sender: socket.user._id,
          content,
          messageType,
          mediaUrl,
          fileName,
          fileSize,
          chatType: 'event',
          chatId: eventId
        });

        await message.save();
        await message.populate('sender', 'name profileImage');

        // Emit to all users in the event
        io.to(`event-${eventId}`).emit('new-event-message', {
          message,
          eventId
        });

        // Mark message as read by sender
        message.readBy.push({
          user: socket.user._id,
          readAt: new Date()
        });
        await message.save();

      } catch (error) {
        console.error('Error sending event message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark-read', async (data) => {
      try {
        const { chatType, chatId, messageIds } = data;

        await ChatMessage.updateMany(
          {
            _id: { $in: messageIds },
            chatType,
            chatId,
            'readBy.user': { $ne: socket.user._id }
          },
          {
            $push: {
              readBy: {
                user: socket.user._id,
                readAt: new Date()
              }
            }
          }
        );

        // Notify other users that messages were read
        socket.to(`${chatType}-${chatId}`).emit('messages-read', {
          userId: socket.user._id,
          messageIds
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Typing indicators
    socket.on('typing-start', (data) => {
      const { chatType, chatId } = data;
      socket.to(`${chatType}-${chatId}`).emit('user-typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      const { chatType, chatId } = data;
      socket.to(`${chatType}-${chatId}`).emit('user-typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping: false
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
      User.findByIdAndUpdate(socket.user._id, { lastSeen: new Date() });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO }; 