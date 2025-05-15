// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: String,
  profileImage: String, // URL to image stored (e.g., on S3 or Cloudinary)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
