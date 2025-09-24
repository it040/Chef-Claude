require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'file://'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sessions disabled: using stateless JWT auth for frontend API and OAuth callback

// Initialize Passport for OAuth strategies (stateless)
app.use(passport.initialize());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
// Development bypass (remove in production)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/auth', require('./dev-auth-bypass'));
}
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: '🍳 Chef Claude API is running perfectly!'
  });
});

// Test endpoint for quick Gemini testing
app.post('/api/test-gemini', async (req, res) => {
  try {
    const geminiService = require('./utils/geminiService');
    const testInput = {
      ingredients: req.body.ingredients || ['chicken', 'rice', 'broccoli'],
      preferences: {},
      dietary: [],
      allergies: [],
      cuisine: req.body.cuisine || 'Asian',
      difficulty: req.body.difficulty || 'medium',
      maxTime: req.body.maxTime || 45
    };

    console.log('🧪 Testing Gemini with:', testInput);
    const recipe = await geminiService.generateRecipe(testInput);
    console.log('✅ Gemini test successful!');

    res.json({
      success: true,
      message: 'Gemini AI test successful! 🎉',
      recipe: recipe
    });

  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Gemini test failed: ' + error.message
    });
  }
});

// Serve a beautiful test page at root
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍳 Chef Claude - AI Recipe Generator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; padding: 20px; 
        }
        .container { 
            max-width: 900px; margin: 0 auto; background: white; 
            border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); 
        }
        .header { text-align: center; margin-bottom: 40px; }
        h1 { color: #ff6b35; font-size: 3.5em; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 1.3em; line-height: 1.6; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
        .feature { background: #f8f9fa; padding: 25px; border-radius: 15px; text-align: center; }
        .feature h3 { color: #ff6b35; margin-bottom: 10px; }
        .test-section { background: #e8f5e8; padding: 30px; border-radius: 15px; margin: 30px 0; }
        .btn { 
            background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; border: none; 
            padding: 15px 30px; border-radius: 10px; font-size: 16px; font-weight: 600; 
            cursor: pointer; margin: 10px; transition: transform 0.2s; 
        }
        .btn:hover { transform: translateY(-2px); }
        input, textarea { 
            width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #e0e0e0; 
            border-radius: 8px; font-size: 16px; 
        }
        input:focus, textarea:focus { border-color: #ff6b35; outline: none; }
        .status { padding: 15px; border-radius: 8px; margin: 15px 0; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍳 Chef Claude</h1>
            <p class="subtitle">AI-Powered Recipe Generator with Google Gemini</p>
            <p class="subtitle">Your culinary companion that creates amazing recipes from your ingredients!</p>
        </div>

        <div class="feature-grid">
            <div class="feature">
                <h3>🤖 AI-Powered</h3>
                <p>Uses Google Gemini AI to create personalized recipes based on your ingredients and preferences.</p>
            </div>
            <div class="feature">
                <h3>🔐 Secure Login</h3>
                <p>Google OAuth integration for secure authentication and personalized recipe collections.</p>
            </div>
            <div class="feature">
                <h3>💾 Save Recipes</h3>
                <p>Save your favorite generated recipes and build your personal cookbook collection.</p>
            </div>
        </div>

        <div class="test-section">
            <h3 style="color: #2e7d32; margin-bottom: 20px;">🧪 Quick Test - Generate a Recipe!</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <input type="text" id="ingredients" placeholder="Ingredients (comma separated)" value="chicken, rice, vegetables">
                <input type="text" id="cuisine" placeholder="Cuisine type" value="Italian">
            </div>
            <button class="btn" onclick="testGemini()">🚀 Generate Recipe with AI</button>
            <div id="test-status"></div>
            <div id="test-result"></div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <h3 style="color: #333; margin-bottom: 20px;">🎯 API Endpoints Ready:</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: left;">
                <p><strong>✅ Health Check:</strong> <code>GET /api/health</code></p>
                <p><strong>✅ Google OAuth:</strong> <code>GET /api/auth/google</code></p>
                <p><strong>✅ Recipe Generation:</strong> <code>POST /api/recipes/generate</code></p>
                <p><strong>✅ User Management:</strong> <code>/api/auth/*</code></p>
                <p><strong>✅ Recipe CRUD:</strong> <code>/api/recipes/*</code></p>
            </div>
        </div>
    </div>

    <script>
        function showStatus(message, type) {
            document.getElementById('test-status').innerHTML = '<div class="status ' + type + '">' + message + '</div>';
        }

        async function testGemini() {
            const ingredients = document.getElementById('ingredients').value.trim();
            const cuisine = document.getElementById('cuisine').value.trim();
            
            if (!ingredients) {
                showStatus('❌ Please enter some ingredients!', 'error');
                return;
            }

            showStatus('🔄 Generating your AI recipe... This may take 10-20 seconds.', 'info');
            
            try {
                const response = await fetch('/api/test-gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ingredients: ingredients.split(',').map(i => i.trim()),
                        cuisine: cuisine,
                        difficulty: 'medium',
                        maxTime: 45
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    showStatus('✅ Recipe generated successfully with Google Gemini AI!', 'success');
                    displayRecipe(data.recipe);
                } else {
                    showStatus('❌ Error: ' + data.message, 'error');
                }
            } catch (error) {
                showStatus('❌ Network error: ' + error.message, 'error');
            }
        }

        function displayRecipe(recipe) {
            const html = '<div style="background: white; border: 2px solid #ff6b35; padding: 25px; border-radius: 15px; margin-top: 20px;">' +
                '<h3 style="color: #ff6b35; margin-bottom: 15px;">🍽️ ' + recipe.title + '</h3>' +
                (recipe.description ? '<p style="color: #666; margin-bottom: 15px;">' + recipe.description + '</p>' : '') +
                '<div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">' +
                '<span style="background: #e8f5e8; padding: 5px 12px; border-radius: 20px;">⏱️ ' + recipe.totalTime + ' min</span>' +
                '<span style="background: #e3f2fd; padding: 5px 12px; border-radius: 20px;">👥 ' + recipe.servings + ' servings</span>' +
                '<span style="background: #fff3e0; padding: 5px 12px; border-radius: 20px;">📊 ' + recipe.difficulty + '</span>' +
                (recipe.cuisine ? '<span style="background: #fce4ec; padding: 5px 12px; border-radius: 20px;">🌍 ' + recipe.cuisine + '</span>' : '') +
                '</div>' +
                '<h4 style="color: #333; margin: 15px 0 10px 0;">🛒 Ingredients:</h4>' +
                '<ul style="margin-left: 20px;">' +
                recipe.ingredients.map(ing => '<li style="margin-bottom: 5px;">' + ing.quantity + ' ' + ing.unit + ' ' + ing.name + '</li>').join('') +
                '</ul>' +
                '<h4 style="color: #333; margin: 20px 0 10px 0;">👨‍🍳 Instructions:</h4>' +
                '<ol style="margin-left: 20px;">' +
                recipe.steps.map(step => '<li style="margin-bottom: 8px; line-height: 1.5;">' + step + '</li>').join('') +
                '</ol></div>';
            document.getElementById('test-result').innerHTML = html;
        }

        // Auto-test connection on load
        window.onload = async function() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                console.log('✅ Server health check passed:', data);
            } catch (error) {
                console.error('❌ Server health check failed:', error);
            }
        };
    </script>
</body>
</html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎉 Chef Claude Server Started Successfully!`);
  console.log(`🔗 Server running on: http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`\n🎯 Quick Test: Open http://localhost:${PORT} in your browser`);
  console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;