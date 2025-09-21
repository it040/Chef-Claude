const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const User = require('./models/User');
require('dotenv').config();

console.log('🔍 Testing OAuth + MongoDB Integration...\n');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

const app = express();
const PORT = 5001; // Use port 5001 which is already configured

// Session middleware
app.use(session({
  secret: 'oauth-db-test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth Strategy (same as production)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:${PORT}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('\n🔄 Processing OAuth callback...');
    console.log(`   Google ID: ${profile.id}`);
    console.log(`   Name: ${profile.displayName}`);
    console.log(`   Email: ${profile.emails[0]?.value}`);

    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      console.log('👤 Existing user found, updating last login...');
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ User updated successfully');
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      console.log('📧 User with same email found, linking Google account...');
      user.googleId = profile.id;
      user.avatar = profile.photos[0]?.value || user.avatar;
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ Google account linked successfully');
      return done(null, user);
    }

    // Create new user
    console.log('🆕 Creating new user...');
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value,
      lastLogin: new Date()
    });

    await user.save();
    console.log('✅ New user created successfully');
    console.log(`   User ID: ${user._id}`);
    
    return done(null, user);
  } catch (error) {
    console.error('❌ OAuth database error:', error.message);
    return done(error, null);
  }
}));

// Serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>✅ OAuth + Database Test Successful!</h1>
      <h2>Welcome, ${req.user.name}!</h2>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #f0f8f0; border-radius: 8px;">
        <h3>📊 Database Record:</h3>
        <p><strong>MongoDB ID:</strong> ${req.user._id}</p>
        <p><strong>Google ID:</strong> ${req.user.googleId}</p>
        <p><strong>Name:</strong> ${req.user.name}</p>
        <p><strong>Email:</strong> ${req.user.email}</p>
        <p><strong>Avatar:</strong> <img src="${req.user.avatar}" width="40" height="40" style="border-radius: 50%; vertical-align: middle;"></p>
        <p><strong>Created At:</strong> ${req.user.createdAt}</p>
        <p><strong>Last Login:</strong> ${req.user.lastLogin}</p>
        <p><strong>Saved Recipes:</strong> ${req.user.savedRecipes.length}</p>
        <p><strong>Favorites:</strong> ${req.user.favorites.length}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <a href="/check-db" style="margin-right: 10px; padding: 8px 16px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px;">📊 Check All Users in DB</a>
        <a href="/logout" style="padding: 8px 16px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">🚪 Logout</a>
      </div>
    `);
  } else {
    res.send(`
      <h1>🔐 OAuth + MongoDB Integration Test</h1>
      <p>This test will verify that OAuth user data is properly stored in MongoDB.</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 8px;">
        <h3>🎯 What this test does:</h3>
        <ul>
          <li>✅ Authenticates with Google OAuth</li>
          <li>✅ Stores/updates user data in MongoDB</li>
          <li>✅ Shows the database record</li>
          <li>✅ Displays all users in database</li>
        </ul>
      </div>
      
      <a href="/auth/google" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #4285f4;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-weight: bold;
        font-size: 16px;
      ">🚀 Test OAuth + Database</a>
      
      <div style="margin: 20px 0;">
        <a href="/check-db" style="padding: 8px 16px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px;">📊 View All Users in Database</a>
      </div>
    `);
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res) => {
    console.log('\n✅ OAuth callback successful! Redirecting to homepage...');
    res.redirect('/');
  }
);

// Check database endpoint
app.get('/check-db', async (req, res) => {
  try {
    const users = await User.find({}).select('-__v').sort({ createdAt: -1 });
    const totalUsers = users.length;
    const oauthUsers = users.filter(u => u.googleId).length;
    
    let html = `
      <h1>📊 Database Status</h1>
      <div style="margin: 20px 0; padding: 15px; background-color: #e8f5e8; border-radius: 8px;">
        <h3>📈 Statistics:</h3>
        <p><strong>Total Users:</strong> ${totalUsers}</p>
        <p><strong>OAuth Users:</strong> ${oauthUsers}</p>
        <p><strong>Regular Users:</strong> ${totalUsers - oauthUsers}</p>
      </div>
      
      <h3>👥 All Users:</h3>
    `;
    
    if (users.length === 0) {
      html += '<p>No users found in database.</p>';
    } else {
      html += '<div style="display: flex; flex-wrap: wrap; gap: 15px;">';
      users.forEach(user => {
        html += `
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; min-width: 300px; background-color: #f9f9f9;">
            <h4>${user.name}</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>MongoDB ID:</strong> ${user._id}</p>
            ${user.googleId ? `<p><strong>Google ID:</strong> ${user.googleId}</p>` : '<p><em>No Google ID (regular signup)</em></p>'}
            ${user.avatar ? `<p><strong>Avatar:</strong> <img src="${user.avatar}" width="30" height="30" style="border-radius: 50%; vertical-align: middle;"></p>` : ''}
            <p><strong>Created:</strong> ${user.createdAt.toLocaleDateString()}</p>
            <p><strong>Last Login:</strong> ${user.lastLogin.toLocaleDateString()}</p>
            <p><strong>Recipes:</strong> ${user.savedRecipes.length} saved, ${user.favorites.length} favorites</p>
          </div>
        `;
      });
      html += '</div>';
    }
    
    html += `
      <div style="margin: 20px 0;">
        <a href="/" style="padding: 8px 16px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">🏠 Back to Home</a>
      </div>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).send(`<h1>❌ Database Error</h1><p>${error.message}</p><a href="/">Back to Home</a>`);
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error('Logout error:', err);
    console.log('\n👋 User logged out');
    res.redirect('/');
  });
});

app.get('/error', (req, res) => {
  res.send(`
    <h1>❌ OAuth Error</h1>
    <p>Authentication failed. Please check your credentials and try again.</p>
    <a href="/">Try Again</a>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 OAuth + Database Test Server Started!`);
  console.log(`📱 Open browser: http://localhost:${PORT}`);
  console.log(`\n🎯 Test Steps:`);
  console.log(`   1. Click "Test OAuth + Database"`);
  console.log(`   2. Complete Google OAuth`);
  console.log(`   3. Verify user data is stored in MongoDB`);
  console.log(`   4. Check "View All Users in Database"`);
  console.log(`\nPress Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping OAuth + Database test server...');
  mongoose.connection.close();
  console.log('✅ Database connection closed');
  console.log('✅ Test completed!');
  process.exit(0);
});