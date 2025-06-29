const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// Firebase authentication middleware
const authenticateFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ email: decodedToken.email }).select('-password');
    
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Get chat messages for a group or event
router.get('/messages/:chatType/:chatId', authenticateFirebase, async (req, res) => {
  try {
    const { chatType, chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({
      chatType,
      chatId,
      isDeleted: false
    })
    .populate('sender', 'name profileImage')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

    const count = await ChatMessage.countDocuments({
      chatType,
      chatId,
      isDeleted: false
    });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalMessages: count
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark messages as read
router.post('/mark-read', authenticateFirebase, async (req, res) => {
  try {
    const { chatType, chatId, messageIds } = req.body;

    await ChatMessage.updateMany(
      {
        _id: { $in: messageIds },
        chatType,
        chatId,
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Delete a message (only sender can delete)
router.delete('/messages/:messageId', authenticateFirebase, async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Edit a message (only sender can edit)
router.put('/messages/:messageId', authenticateFirebase, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await ChatMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate('sender', 'name profileImage');

    res.json({ message });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Add reaction to message
router.post('/messages/:messageId/reactions', authenticateFirebase, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await ChatMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      reaction => reaction.user.toString() !== req.user._id.toString()
    );

    // Add new reaction
    message.reactions.push({
      user: req.user._id,
      emoji,
      createdAt: new Date()
    });

    await message.save();
    await message.populate('sender', 'name profileImage');

    res.json({ message });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Remove reaction from message
router.delete('/messages/:messageId/reactions', authenticateFirebase, async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Remove reaction from this user
    message.reactions = message.reactions.filter(
      reaction => reaction.user.toString() !== req.user._id.toString()
    );

    await message.save();
    await message.populate('sender', 'name profileImage');

    res.json({ message });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

module.exports = router; 