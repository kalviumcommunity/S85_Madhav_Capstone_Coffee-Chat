const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const upload = require('../middleware/upload');

const { getAllUsers, registerUser, loginUser, googleLogin, getProfile, updateProfile, uploadProfileImage, getBookmarks, addBookmark, removeBookmark } = require('../controllers/userController');

// Get all users
router.get('/', getAllUsers);

// Register new user (signup)
router.post('/register', upload.single('profileImage'), registerUser);
router.post('/signup', upload.single('profileImage'), registerUser); // Keep both for compatibility

router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/logout', authenticateJWT, (req, res) => {
  // Server-side logout - just return success
  // The actual token invalidation happens on the client side
  res.json({ message: 'Logout successful' });
});
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.post('/upload-profile-image', authenticateJWT, upload.single('profileImage'), uploadProfileImage);
router.get('/bookmarks', authenticateJWT, getBookmarks);
router.post('/bookmarks/:type/:id', authenticateJWT, addBookmark);
router.delete('/bookmarks/:type/:id', authenticateJWT, removeBookmark);

// Get user notifications
router.get('/notifications', authenticateJWT, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.userId).select('notifications');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.notifications || []);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
