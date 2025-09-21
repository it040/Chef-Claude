require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware - Fix CORS for file:// protocol
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: false, // Disable credentials for file:// protocol
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.use(express.json());

// Test routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Chef Claude API is working!'
  });
});

app.post('/api/test-recipe', async (req, res) => {
  console.log('📥 Recipe generation request received:', req.body);
  
  try {
    // Simple test recipe (without Gemini for now)
    const testRecipe = {
      title: "Test Recipe - " + req.body.ingredients?.join(', ') || 'Unknown',
      description: "A test recipe generated for debugging",
      ingredients: [
        { name: "Test Ingredient", quantity: "1", unit: "cup" }
      ],
      steps: [
        "This is a test step 1",
        "This is a test step 2",
        "Serve and enjoy!"
      ],
      servings: 2,
      prepTime: 10,
      cookTime: 15,
      totalTime: 25,
      difficulty: "easy",
      cuisine: req.body.cuisine || "test",
      tags: ["test"],
      source: "test"
    };

    res.json({
      success: true,
      message: 'Test recipe generated successfully',
      recipe: testRecipe
    });

  } catch (error) {
    console.error('❌ Error in test recipe generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test recipe: ' + error.message
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📋 Test the API:`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Recipe: POST http://localhost:${PORT}/api/test-recipe`);
  console.log(`\n⏰ Server will run for 60 seconds for testing...`);
});

// Auto-stop after 60 seconds for testing
setTimeout(() => {
  console.log('\n🛑 Stopping test server after 60 seconds...');
  server.close(() => {
    console.log('✅ Test server stopped');
    process.exit(0);
  });
}, 60000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  server.close(() => {
    console.log('✅ Test server stopped');
    process.exit(0);
  });
});