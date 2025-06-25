const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');

const { getAllUsers, registerUser,loginUser,googleLogin,getProfile } = require('../controllers/userController');

// Get all users
router.get('/', getAllUsers);

// Register new user (signup)
router.post('/signup', registerUser);

router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/profile', authenticateJWT, getProfile);


module.exports = router;
