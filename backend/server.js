require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Test route
app.get("/", async (req, res) => {
  res.json("This is my Coffee Chat website");
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);

// Start Server
const PORT = process.env.PORT;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
