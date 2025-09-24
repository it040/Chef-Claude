const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos[0]?.value || user.avatar;
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value,
      lastLogin: new Date()
    });

    await user.save();
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth routes
router.get('/google', 
  // Use stateless OAuth (no server session). We issue a JWT cookie after callback.
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  // Short-circuit: if Google did not send `code`, go back to login to avoid loops
  (req, res, next) => {
    if (!req.query || !req.query.code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_code`);
    }
    next();
  },
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_user`);
      }

      // Generate JWT token
      const token = generateToken(req.user._id);

      // Set httpOnly cookie for API auth
      res.cookie('authToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend callback
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=callback_error`);
    }
  }
);

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedRecipes', 'title imageUrl prepTime cookTime difficulty')
      .populate('favorites', 'title imageUrl prepTime cookTime difficulty')
      .select('-__v');

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        savedRecipes: user.savedRecipes,
        favorites: user.favorites,
        recipeCount: user.savedRecipes.length,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user profile' 
    });
  }
});

// Update user preferences and settings
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { dietary, allergies, cuisine, difficulty, maxPrepTime, emailOptIn, publicByDefault } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update preferences
    if (dietary !== undefined) user.preferences.dietary = dietary;
    if (allergies !== undefined) user.preferences.allergies = allergies;
    if (cuisine !== undefined) user.preferences.cuisine = cuisine;
    if (difficulty !== undefined) user.preferences.difficulty = difficulty;
    if (maxPrepTime !== undefined) user.preferences.maxPrepTime = maxPrepTime;

    // Update settings
    if (emailOptIn !== undefined) user.settings.emailOptIn = !!emailOptIn;
    if (publicByDefault !== undefined) user.settings.publicByDefault = !!publicByDefault;

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences,
      settings: user.settings,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update preferences' 
    });
  }
});

// Logout: clear auth cookie and destroy session
router.post('/logout', (req, res) => {
  try {
    // Clear JWT cookie used by frontend API calls
    res.clearCookie('authToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    // Passport session cleanup (for Google OAuth)
    if (typeof req.logout === 'function') {
      try { req.logout(() => {}); } catch (_) {}
    }
    if (req.session) {
      req.session.destroy(() => {});
    }

    // Prevent caches from serving an authenticated response after logout
    res.set('Cache-Control', 'no-store');

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Failed to logout' });
  }
});

// Delete account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete user and all associated data
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete account' 
    });
  }
});

// Email/password register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ name, email: email.toLowerCase(), passwordHash, lastLogin: new Date() });
      const token = generateToken(user._id);
      res.cookie('authToken', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*60*60*1000 });
      return res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (e) {
      if (e && e.code === 11000) {
        // Auto-login for existing user
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (!existing) return res.status(409).json({ success: false, message: 'Email already registered' });
        const token = generateToken(existing._id);
        res.cookie('authToken', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*60*60*1000 });
        return res.json({ success: true, token, user: { _id: existing._id, name: existing.name, email: existing.email, avatar: existing.avatar } });
      }
      throw e;
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.cookie('authToken', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*60*60*1000 });
    return res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

module.exports = router;
