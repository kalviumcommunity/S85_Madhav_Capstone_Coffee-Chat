require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');
const { initializeSocket } = require('./config/socket');

// Import routes
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const eventRoutes = require('./routes/eventRoutes');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Test route
app.get("/", async (req, res) => {
  res.json("This is my Coffee Chat website");
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/chat', chatRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Initialize Socket.IO
initializeSocket(server);
