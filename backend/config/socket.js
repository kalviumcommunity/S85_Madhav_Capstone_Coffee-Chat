const socketIo = require('socket.io');
const admin = require('firebase-admin');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    upgrade: true,
    rememberUpgrade: true,
    timeout: 20000,
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e8, // 100MB
    allowEIO3: true
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ email: decodedToken.email }).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Update user's last seen
    User.findByIdAndUpdate(socket.user._id, { 
      lastSeen: new Date(),
      isOnline: true
    });

    // Store user's active chats
    socket.activeChats = new Set();

    // Join user to their groups
    socket.on('join-groups', async () => {
      try {
        const user = await User.findById(socket.user._id).populate('groups');
        if (user.groups) {
          user.groups.forEach(group => {
            socket.join(`group-${group._id}`);
            socket.activeChats.add(`group-${group._id}`);
          });
        }
      } catch (error) {
        console.error('Error joining groups:', error);
      }
    });

    // Join specific group chat
    socket.on('join-group-chat', (groupId) => {
      socket.join(`group-${groupId}`);
      socket.activeChats.add(`group-${groupId}`);
      console.log(`User ${socket.user.name} joined group chat: ${groupId}`);
    });

    // Join specific event chat
    socket.on('join-event-chat', (eventId) => {
      socket.join(`event-${eventId}`);
      socket.activeChats.add(`event-${eventId}`);
      console.log(`User ${socket.user.name} joined event chat: ${eventId}`);
    });

    // Handle group chat messages with enhanced error handling
    socket.on('group-message', async (data) => {
      try {
        const { groupId, content, messageType = 'text', mediaUrl, fileName, fileSize, tempId } = data;

        // Validate input
        if (!content && !mediaUrl) {
          socket.emit('message-error', { 
            error: 'Message content is required',
            tempId 
          });
          return;
        }

        const message = new ChatMessage({
          sender: socket.user._id,
          content: content || '',
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
          message: { ...message.toObject(), tempId },
          groupId
        });

        // Confirm message sent to sender
        socket.emit('message-sent', { 
          tempId,
          messageId: message._id 
        });

        // Mark message as read by sender
        message.readBy.push({
          user: socket.user._id,
          readAt: new Date()
        });
        await message.save();

        console.log(`Group message sent by ${socket.user.name} in group ${groupId}`);

      } catch (error) {
        console.error('Error sending group message:', error);
        socket.emit('message-error', { 
          error: 'Failed to send message',
          tempId: data.tempId 
        });
      }
    });

    // Handle event chat messages with enhanced error handling
    socket.on('event-message', async (data) => {
      try {
        const { eventId, content, messageType = 'text', mediaUrl, fileName, fileSize, tempId } = data;

        // Validate input
        if (!content && !mediaUrl) {
          socket.emit('message-error', { 
            error: 'Message content is required',
            tempId 
          });
          return;
        }

        const message = new ChatMessage({
          sender: socket.user._id,
          content: content || '',
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
          message: { ...message.toObject(), tempId },
          eventId
        });

        // Confirm message sent to sender
        socket.emit('message-sent', { 
          tempId,
          messageId: message._id 
        });

        // Mark message as read by sender
        message.readBy.push({
          user: socket.user._id,
          readAt: new Date()
        });
        await message.save();

        console.log(`Event message sent by ${socket.user.name} in event ${eventId}`);

      } catch (error) {
        console.error('Error sending event message:', error);
        socket.emit('message-error', { 
          error: 'Failed to send message',
          tempId: data.tempId 
        });
      }
    });

    // Mark messages as read with batch processing
    socket.on('mark-read', async (data) => {
      try {
        const { chatType, chatId, messageIds } = data;

        if (!messageIds || messageIds.length === 0) return;

        // Batch update for better performance
        const result = await ChatMessage.updateMany(
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

        if (result.modifiedCount > 0) {
          // Notify other users that messages were read
          socket.to(`${chatType}-${chatId}`).emit('messages-read', {
            userId: socket.user._id,
            messageIds,
            readCount: result.modifiedCount
          });
        }

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Enhanced typing indicators with debouncing
    const typingUsers = new Map();

    socket.on('typing-start', (data) => {
      const { chatType, chatId } = data;
      const roomKey = `${chatType}-${chatId}`;
      
      // Store typing user
      if (!typingUsers.has(roomKey)) {
        typingUsers.set(roomKey, new Map());
      }
      typingUsers.get(roomKey).set(socket.user._id, {
        userId: socket.user._id,
        userName: socket.user.name,
        timestamp: Date.now()
      });

      // Emit to other users in the room
      socket.to(roomKey).emit('user-typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      const { chatType, chatId } = data;
      const roomKey = `${chatType}-${chatId}`;
      
      // Remove typing user
      if (typingUsers.has(roomKey)) {
        typingUsers.get(roomKey).delete(socket.user._id);
        
        // Clean up empty room
        if (typingUsers.get(roomKey).size === 0) {
          typingUsers.delete(roomKey);
        }
      }

      // Emit to other users in the room
      socket.to(roomKey).emit('user-typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping: false
      });
    });

    // Clean up typing indicators periodically
    setInterval(() => {
      const now = Date.now();
      const timeout = 5000; // 5 seconds

      typingUsers.forEach((users, roomKey) => {
        users.forEach((userData, userId) => {
          if (now - userData.timestamp > timeout) {
            users.delete(userId);
            
            // Emit typing stop
            io.to(roomKey).emit('user-typing', {
              userId: userData.userId,
              userName: userData.userName,
              isTyping: false
            });
          }
        });

        // Clean up empty room
        if (users.size === 0) {
          typingUsers.delete(roomKey);
        }
      });
    }, 3000);

    // Handle message editing
    socket.on('edit-message', async (data) => {
      try {
        const { messageId, content, chatType, chatId } = data;

        const message = await ChatMessage.findById(messageId);
        
        if (!message) {
          socket.emit('message-error', { error: 'Message not found' });
          return;
        }

        if (message.sender.toString() !== socket.user._id.toString()) {
          socket.emit('message-error', { error: 'Not authorized to edit this message' });
          return;
        }

        message.content = content;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();
        await message.populate('sender', 'name profileImage');

        // Emit to all users in the chat
        io.to(`${chatType}-${chatId}`).emit('message-edited', {
          message,
          chatType,
          chatId
        });

      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('message-error', { error: 'Failed to edit message' });
      }
    });

    // Handle message deletion
    socket.on('delete-message', async (data) => {
      try {
        const { messageId, chatType, chatId } = data;

        const message = await ChatMessage.findById(messageId);
        
        if (!message) {
          socket.emit('message-error', { error: 'Message not found' });
          return;
        }

        if (message.sender.toString() !== socket.user._id.toString()) {
          socket.emit('message-error', { error: 'Not authorized to delete this message' });
          return;
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        await message.save();

        // Emit to all users in the chat
        io.to(`${chatType}-${chatId}`).emit('message-deleted', {
          messageId,
          chatType,
          chatId
        });

      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('message-error', { error: 'Failed to delete message' });
      }
    });

    // Handle message reactions
    socket.on('add-reaction', async (data) => {
      try {
        const { messageId, emoji, chatType, chatId } = data;

        const message = await ChatMessage.findById(messageId);
        
        if (!message) {
          socket.emit('message-error', { error: 'Message not found' });
          return;
        }

        // Remove existing reaction from this user
        message.reactions = message.reactions.filter(
          reaction => reaction.user.toString() !== socket.user._id.toString()
        );

        // Add new reaction
        message.reactions.push({
          user: socket.user._id,
          emoji,
          createdAt: new Date()
        });

        await message.save();
        await message.populate('sender', 'name profileImage');

        // Emit to all users in the chat
        io.to(`${chatType}-${chatId}`).emit('reaction-added', {
          message,
          chatType,
          chatId
        });

      } catch (error) {
        console.error('Error adding reaction:', error);
        socket.emit('message-error', { error: 'Failed to add reaction' });
      }
    });

    // Handle message reaction removal
    socket.on('remove-reaction', async (data) => {
      try {
        const { messageId, chatType, chatId } = data;

        const message = await ChatMessage.findById(messageId);
        
        if (!message) {
          socket.emit('message-error', { error: 'Message not found' });
          return;
        }

        // Remove reaction from this user
        message.reactions = message.reactions.filter(
          reaction => reaction.user.toString() !== socket.user._id.toString()
        );

        await message.save();
        await message.populate('sender', 'name profileImage');

        // Emit to all users in the chat
        io.to(`${chatType}-${chatId}`).emit('reaction-removed', {
          message,
          chatType,
          chatId
        });

      } catch (error) {
        console.error('Error removing reaction:', error);
        socket.emit('message-error', { error: 'Failed to remove reaction' });
      }
    });

    // Handle user presence
    socket.on('user-presence', (data) => {
      const { isActive, chatType, chatId } = data;
      
      if (isActive) {
        socket.to(`${chatType}-${chatId}`).emit('user-active', {
          userId: socket.user._id,
          userName: socket.user.name
        });
      } else {
        socket.to(`${chatType}-${chatId}`).emit('user-inactive', {
          userId: socket.user._id,
          userName: socket.user.name
        });
      }
    });

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id}) - Reason: ${reason}`);
      
      // Update user's last seen and online status
      User.findByIdAndUpdate(socket.user._id, { 
        lastSeen: new Date(),
        isOnline: false
      });

      // Clean up typing indicators
      socket.activeChats.forEach(chatRoom => {
        if (typingUsers.has(chatRoom)) {
          typingUsers.get(chatRoom).delete(socket.user._id);
          
          // Emit typing stop
          io.to(chatRoom).emit('user-typing', {
            userId: socket.user._id,
            userName: socket.user.name,
            isTyping: false
          });
        }
      });

      // Notify other users about disconnection
      socket.activeChats.forEach(chatRoom => {
        socket.to(chatRoom).emit('user-disconnected', {
          userId: socket.user._id,
          userName: socket.user.name
        });
      });
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