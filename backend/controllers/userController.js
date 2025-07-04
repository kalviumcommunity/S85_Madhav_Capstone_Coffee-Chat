const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const cloudinary = require('../config/cloudinary');

//for google
const admin = require('../firebaseAdmin'); // Firebase setup

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Hide passwords
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

const path = require('path');

//signup
const registerUser = async (req, res) => {
  try {
    const { name, email, password, location, profileImage } = req.body;

    // Validation: Ensure required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      location,
      profileImage: profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png',
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        location: newUser.location,
        profileImage: newUser.profileImage,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Error creating user' });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login error' });
  }
};

//google
const googleLogin = async (req, res) => {
  const { token, mode } = req.body;

  try {
    if (!token) return res.status(400).json({ error: "Token not provided" });

    const decoded = await admin.auth().verifyIdToken(token);
    const { email, name, picture } = decoded;

    if (!email) return res.status(400).json({ error: "No email in token" });

    let user = await User.findOne({ email });

    if (mode === "signup") {
      if (user) {
        return res.status(400).json({ error: "User already exists. Please login." });
      }

      user = new User({
        name,
        email,
        profileImage: picture,
        password: undefined,
        provider: "google",
      });

      await user.save();
    } else if (mode === "login") {
      if (!user) {
        // Auto-create user if not found
        user = new User({
          name,
          email,
          profileImage: picture,
          password: undefined,
          provider: "google",
        });
        await user.save();
      }
    } else {
      return res.status(400).json({ error: "Invalid mode" });
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: "7d" }
    );

    res.json({
      message: 'Google auth successful',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("❌ Google Auth Error:", err.message);
    res.status(401).json({ error: "Google login failed" });
  }
};

//get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, location, bio } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile-images',
      width: 300,
      crop: 'scale'
    });

    // Update user profile image
    user.profileImage = result.secure_url;
    await user.save();

    res.json({ profileImage: result.secure_url });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user bookmarks
const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('bookmarkedGroups')
      .populate('bookmarkedEvents')
      .select('bookmarkedGroups bookmarkedEvents');

    res.json({
      groups: user.bookmarkedGroups || [],
      events: user.bookmarkedEvents || []
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add bookmark
const addBookmark = async (req, res) => {
  try {
    const { type, id } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'group') {
      if (!user.bookmarkedGroups.includes(id)) {
        user.bookmarkedGroups.push(id);
      }
    } else if (type === 'event') {
      if (!user.bookmarkedEvents.includes(id)) {
        user.bookmarkedEvents.push(id);
      }
    } else {
      return res.status(400).json({ error: 'Invalid bookmark type' });
    }

    await user.save();
    res.json({ message: 'Bookmark added successfully' });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove bookmark
const removeBookmark = async (req, res) => {
  try {
    const { type, id } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'group') {
      user.bookmarkedGroups = user.bookmarkedGroups.filter(
        bookmarkId => bookmarkId.toString() !== id
      );
    } else if (type === 'event') {
      user.bookmarkedEvents = user.bookmarkedEvents.filter(
        bookmarkId => bookmarkId.toString() !== id
      );
    } else {
      return res.status(400).json({ error: 'Invalid bookmark type' });
    }

    await user.save();
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
  updateProfile,
  uploadProfileImage,
  getBookmarks,
  addBookmark,
  removeBookmark
};
