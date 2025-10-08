const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const analyzeRoutes = require('./routes/analyze');

dotenv.config();

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://survey-viz-platform.vercel.app',
  'https://survey-viz-platform-pnwj.vercel.app' // Add preview URL if used
];

// Configure CORS with dynamic origin
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) { // Not connected
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err; // Let the server handle the error
    }
  }
};

// Local development server
if (process.env.NODE_ENV !== 'production') {
  connectDB().catch(err => console.error('Failed to connect on startup:', err));
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
  // Serverless environment (e.g., Render, Vercel)
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      res.status(500).json({ error: 'Database connection failed' });
    }
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analyze', analyzeRoutes);

app.get('/', (req, res) => {
  res.send('Survey Viz Platform Backend');
});

module.exports = app;
