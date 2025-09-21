require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5001; // Different port to avoid conflicts

// CORS setup
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// Import models
const User = require('./models/User');

// Simple mock auth - creates a test user automatically
app.post('/api/auth/mock-login', async (req, res) => {
  try {
    let user = await User.findOne({ email: 'test@chefclaude.app' });
    
    if (!user) {
      user = new User({
        name: 'Test Chef',
        email: 'test@chefclaude.app',
        googleId: 'mock-test-user',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        lastLogin: new Date()
      });
      await user.save();
    }

    const { generateToken } = require('./middleware/auth');
    const token = generateToken(user._id);

    res.json({
      success: true,
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mock user profile endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const { verifyToken } = require('./middleware/auth');
    const decoded = verifyToken(authHeader.split(' ')[1]);
    const user = await User.findById(decoded.userId);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences || {},
        savedRecipes: [],
        favorites: []
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Import and use recipe routes
const recipeRoutes = require('./routes/recipes');
app.use('/api/recipes', recipeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Test server without OAuth working!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TEST SERVER (No OAuth) running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`🎯 To test login: POST /api/auth/mock-login`);
  console.log(`\n🔧 Change your frontend API URL to: http://localhost:${PORT}`);
});