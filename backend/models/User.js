// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  location: String,
  profileImage: String, // URL to image stored (e.g., on S3 or Cloudinary)
  provider: {
  type: String,
  enum: ['local', 'google'],
  default: 'local'
},// 'google' or 'local'
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);