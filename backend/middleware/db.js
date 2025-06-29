const mongoose = require("mongoose");
require("dotenv").config({ path: './config/.env' });

const connectDatabase = async () => {
  try {
    // Use MONGODB_URI from config/.env
    const mongoUri = process.env.MONGODB_URI;
    
    console.log(`🔗 Attempting to connect to MongoDB...`);
    
    const data = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`✅ MongoDB connected: ${data.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("\n💡 To fix this issue:");
    console.log("1. Check your config/.env file");
    console.log("2. Verify your MONGODB_URI is correct");
    console.log("3. Make sure your MongoDB Atlas cluster is accessible");
    process.exit(1);
  }
};

module.exports = connectDatabase;