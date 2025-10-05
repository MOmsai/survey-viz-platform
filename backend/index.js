const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const analyzeRoutes = require('./routes/analyze');

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://survey-viz-platform.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Local: Connect once
if (!process.env.VERCEL) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB connected locally'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Serverless: Per-request connection
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected (serverless)');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analyze', analyzeRoutes);

app.get('/', (req, res) => {
  res.send('Survey Viz Platform Backend');
});

// Local server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;