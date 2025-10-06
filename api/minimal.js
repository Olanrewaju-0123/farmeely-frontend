// Minimal backend to test basic functionality
const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API docs endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    title: 'Farmeely API Documentation',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      apiDocs: '/api-docs'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Farmeely Backend API',
    status: 'running',
    endpoints: ['/health', '/api-docs']
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

module.exports = app;
