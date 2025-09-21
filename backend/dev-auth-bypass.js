// Development Authentication Bypass
// Use this temporarily while fixing OAuth

const express = require('express');
const { generateToken } = require('./middleware/auth');
const User = require('./models/User');

const router = express.Router();

// Development only - bypass OAuth
router.get('/dev-login', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Development route only' });
  }

  try {
    // Create or find a test user
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        lastLogin: new Date()
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('🧪 Development authentication successful for:', user.email);

    // Return user data
    res.json({
      success: true,
      message: 'Development login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token
    });

  } catch (error) {
    console.error('Dev auth error:', error);
    res.status(500).json({ error: 'Development auth failed' });
  }
});

module.exports = router;