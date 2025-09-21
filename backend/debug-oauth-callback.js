const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS setup for debugging
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debug route to test what's happening in OAuth callback
app.get('/api/auth/google/callback', async (req, res) => {
  console.log('🔍 OAuth Callback Debug:');
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  
  const { code, error, error_description } = req.query;
  
  if (error) {
    console.error('❌ OAuth Error:', error, error_description);
    return res.json({
      success: false,
      error: error,
      description: error_description,
      message: 'OAuth authorization failed'
    });
  }
  
  if (!code) {
    console.error('❌ No authorization code received');
    return res.json({
      success: false,
      error: 'no_code',
      message: 'No authorization code received from Google'
    });
  }
  
  console.log('✅ Authorization code received:', code.substring(0, 20) + '...');
  
  // Simulate successful OAuth (for debugging)
  res.json({
    success: true,
    message: 'OAuth callback received successfully',
    code_received: true,
    code_length: code.length,
    next_step: 'Exchange code for access token'
  });
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Debug OAuth server running',
    timestamp: new Date().toISOString()
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🔧 Debug OAuth server running on port ${PORT}`);
  console.log(`📋 Test OAuth callback: http://localhost:${PORT}/api/auth/google/callback`);
  console.log('\n🎯 To test:');
  console.log('1. Stop your main backend server');
  console.log('2. Run this debug server');
  console.log('3. Try Google OAuth login again');
  console.log('4. Check the console output for debug info');
});