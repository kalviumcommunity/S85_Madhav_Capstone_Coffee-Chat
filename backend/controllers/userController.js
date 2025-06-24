const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//for google
const admin = require('../firebaseAdmin'); // Firebase setup



const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Hide passwords
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};


//signup
const registerUser = async (req, res) => {
  try {
    const { name, email, password, location, profileImage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      location,
      profileImage,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        location: newUser.location,
        profileImage: newUser.profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};


//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
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
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};



//google
const googleLogin = async (req, res) => {
  const { token, mode } = req.body;

  try {
    if (!token) return res.status(400).json({ message: "Token not provided" });

    const decoded = await admin.auth().verifyIdToken(token);
    const { email, name, picture } = decoded;

    if (!email) return res.status(400).json({ message: "No email in token" });

    let user = await User.findOne({ email });

    if (mode === "signup") {
      if (user) {
        return res.status(400).json({ message: "User already exists. Please login." });
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
        return res.status(404).json({ message: "User not found. Please sign up first." });
      }
    } else {
      return res.status(400).json({ message: "Invalid mode" });
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
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
    res.status(401).json({ message: "Google login failed", error: err.message });
  }
};






///get user profile using password

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};


module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
};
