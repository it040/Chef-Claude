const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('dotenv').config();

console.log('🔐 Testing Google OAuth Configuration...\n');

// Check environment variables
console.log('📋 Environment Check:');
console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`   GOOGLE_CALLBACK_URL: ${process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'}`);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('\n❌ OAuth credentials missing! You need to:');
  console.log('1. Go to https://console.cloud.google.com');
  console.log('2. Create/select a project');
  console.log('3. Enable Google+ API');
  console.log('4. Create OAuth 2.0 credentials');
  console.log('5. Add authorized redirect URI: http://localhost:5000/api/auth/google/callback');
  process.exit(1);
}

const app = express();
const PORT = 5001; // Use different port for testing

// Session middleware
app.use(session({
  secret: 'oauth-test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:${PORT}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
  console.log('\n🎉 OAuth Success! User Profile:');
  console.log(`   Name: ${profile.displayName}`);
  console.log(`   Email: ${profile.emails[0]?.value}`);
  console.log(`   Google ID: ${profile.id}`);
  console.log(`   Avatar: ${profile.photos[0]?.value}`);
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>✅ OAuth Test Successful!</h1>
      <h2>Welcome, ${req.user.displayName}!</h2>
      <p><strong>Email:</strong> ${req.user.emails[0]?.value}</p>
      <p><strong>Google ID:</strong> ${req.user.id}</p>
      <img src="${req.user.photos[0]?.value}" alt="Avatar" width="100" height="100" style="border-radius: 50%;">
      <br><br>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h1>🔐 OAuth Test Page</h1>
      <p>Click the button below to test Google OAuth:</p>
      <a href="/auth/google" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #4285f4;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-weight: bold;
      ">🚀 Login with Google</a>
      <br><br>
      <p><small>This will test if your Google OAuth credentials are working.</small></p>
    `);
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res) => {
    console.log('\n✅ OAuth callback successful!');
    res.redirect('/');
  }
);

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
    <p>Authentication failed. Please check your credentials.</p>
    <a href="/">Try Again</a>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 OAuth Test Server Started!');
  console.log(`📱 Open browser: http://localhost:${PORT}`);
  console.log('🔐 Click "Login with Google" to test OAuth');
  console.log('\n🎯 What this test does:');
  console.log('   1. Checks if your Google credentials are set');
  console.log('   2. Tests OAuth flow');
  console.log('   3. Shows user profile if successful');
  console.log('\nPress Ctrl+C to stop the test server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping OAuth test server...');
  console.log('✅ OAuth test completed!');
  process.exit(0);
});