// Force IPv4 DNS resolution for MongoDB Atlas SRV connections
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();

// Production CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://mayukh.bv'].filter(Boolean)
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from client folder
app.use(express.static(path.join(__dirname, '../client')));

// Serve admin pages from server directory
app.use('/admin', express.static(__dirname));

// MongoDB Connection with retry logic
const connectDB = async (retries = 5) => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mayukh';

  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set; defaulting to local MongoDB');
  } else {
    console.log('Connecting to MongoDB Atlas...');
  }

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(mongoUri, {
        family: 4,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        maxPoolSize: 10,
      });
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      
      // Show helpful hints for common errors
      if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
        console.log('Hint: Check your MONGODB_URI format and network connection');
      }
      if (error.message.includes('authentication failed')) {
        console.log('Hint: Check your MongoDB username and password');
      }
      if (error.message.includes('whitelist')) {
        console.log('Hint: Add your IP to MongoDB Atlas Network Access whitelist');
      }
      
      if (i < retries - 1) {
        console.log(`Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  console.error('MongoDB connection failed after all retries');
  console.error('Please check your MONGODB_URI in .env file');
  process.exit(1);
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Health check route
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState];
  res.json({ 
    status: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});