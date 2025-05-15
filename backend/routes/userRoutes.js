const express = require('express');
const router = express.Router();
const { getAllUsers, registerUser } = require('../controllers/userController');

// Get all users
router.get('/', getAllUsers);

// Register new user (signup)
router.post('/signup', registerUser);

module.exports = router;
