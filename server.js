const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const documentRoutes = require('./routes/documentRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: req.headers
  });
  next();
});

// Serve uploaded files (for local storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Debug route to check configuration
app.get('/api/debug', (req, res) => {
  const USE_S3 = process.env.AWS_ACCESS_KEY_ID && 
                 process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key' &&
                 process.env.AWS_SECRET_ACCESS_KEY &&
                 process.env.AWS_SECRET_ACCESS_KEY !== 'your_aws_secret_key';

  res.json({
    success: true,
    storageMode: USE_S3 ? 'AWS S3' : 'Local Storage',
    hasAWSAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasAWSSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    hasBucket: !!process.env.AWS_S3_BUCKET,
    bucketName: process.env.AWS_S3_BUCKET || 'Not set'
  });
});

// Root route for debugging
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lawyer App Backend API is running',
    availableRoutes: [
      'GET /api/health',
      'POST /api/v1/auth/login',
      'GET /api/documents',
      'POST /api/documents'
    ],
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// For Vercel serverless functions
if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  module.exports = app;
} else {
  // Start server for local development
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
