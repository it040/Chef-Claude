const express = require('express');
const path = require('path');
const cors = require('cors');

// Create two apps - one for API, one for serving HTML
const apiApp = express();
const frontendApp = express();

const API_PORT = 5000;
const FRONTEND_PORT = 3000;

// API Server Setup
apiApp.use(cors({
  origin: `http://localhost:${FRONTEND_PORT}`,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

apiApp.use(express.json());

// API Routes
apiApp.get('/api/health', (req, res) => {
  console.log('📊 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Chef Claude API is working perfectly! 🍳'
  });
});

apiApp.post('/api/test-recipe', async (req, res) => {
  console.log('📥 Recipe generation request received:', req.body);
  
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const testRecipe = {
      title: `Delicious ${req.body.ingredients?.join(' & ') || 'Mystery'} Recipe`,
      description: "A wonderful test recipe created for debugging purposes",
      ingredients: req.body.ingredients?.map((ing, index) => ({
        name: ing,
        quantity: (index + 1).toString(),
        unit: ['cup', 'piece', 'tbsp', 'oz'][index % 4]
      })) || [
        { name: "Test Ingredient", quantity: "1", unit: "cup" }
      ],
      steps: [
        "Gather all your ingredients and prepare your cooking area",
        "Follow this test step to verify the system is working",
        "Cook with love and enjoy your meal!",
        "Share your creation with friends and family"
      ],
      servings: 4,
      prepTime: 15,
      cookTime: 25,
      totalTime: 40,
      difficulty: req.body.difficulty || "easy",
      cuisine: req.body.cuisine || "international",
      tags: ["test", "debug", req.body.cuisine?.toLowerCase()].filter(Boolean),
      source: "test-system"
    };

    console.log('✅ Test recipe generated successfully');

    res.json({
      success: true,
      message: 'Test recipe generated successfully! 🎉',
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

// Frontend Server Setup - Serve HTML directly
frontendApp.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chef Claude - Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        h1 { color: #ff6b35; text-align: center; }
        .test-section { margin: 20px 0; padding: 20px; border: 2px solid #e0e0e0; border-radius: 8px; }
        button { background: #ff6b35; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #e55a2b; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        input { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍳 Chef Claude - Test Page</h1>
        
        <div class="test-section">
            <h3>1. Server Connection Test</h3>
            <button onclick="testHealth()">Test API Health</button>
            <div id="health-status"></div>
        </div>

        <div class="test-section">
            <h3>2. Recipe Generation Test</h3>
            <input type="text" id="ingredients" placeholder="Enter ingredients (comma separated)" value="chicken, rice, broccoli">
            <input type="text" id="cuisine" placeholder="Cuisine type" value="Asian">
            <button onclick="testRecipe()">Generate Test Recipe</button>
            <div id="recipe-status"></div>
            <div id="recipe-result"></div>
        </div>
    </div>

    <script>
        function showStatus(elementId, message, type) {
            document.getElementById(elementId).innerHTML = '<div class="status ' + type + '">' + message + '</div>';
        }

        async function testHealth() {
            showStatus('health-status', '🔄 Testing connection...', 'info');
            try {
                const response = await fetch('http://localhost:5000/api/health');
                const data = await response.json();
                showStatus('health-status', '✅ Connected! Status: ' + data.status + '<br>Message: ' + data.message, 'success');
            } catch (error) {
                showStatus('health-status', '❌ Connection failed: ' + error.message, 'error');
            }
        }

        async function testRecipe() {
            const ingredients = document.getElementById('ingredients').value;
            const cuisine = document.getElementById('cuisine').value;
            
            showStatus('recipe-status', '🔄 Generating recipe...', 'info');
            try {
                const response = await fetch('http://localhost:5000/api/test-recipe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ingredients: ingredients.split(',').map(i => i.trim()),
                        cuisine: cuisine,
                        difficulty: 'medium'
                    })
                });
                const data = await response.json();
                
                if (data.success) {
                    showStatus('recipe-status', '✅ Recipe generated successfully!', 'success');
                    displayRecipe(data.recipe);
                } else {
                    showStatus('recipe-status', '❌ Failed: ' + data.message, 'error');
                }
            } catch (error) {
                showStatus('recipe-status', '❌ Error: ' + error.message, 'error');
            }
        }

        function displayRecipe(recipe) {
            const html = '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">' +
                '<h4 style="color: #ff6b35;">' + recipe.title + '</h4>' +
                '<p><strong>Time:</strong> ' + recipe.totalTime + ' min | <strong>Servings:</strong> ' + recipe.servings + '</p>' +
                '<h5>Ingredients:</h5><ul>' +
                recipe.ingredients.map(ing => '<li>' + ing.quantity + ' ' + ing.unit + ' ' + ing.name + '</li>').join('') +
                '</ul><h5>Steps:</h5><ol>' +
                recipe.steps.map(step => '<li>' + step + '</li>').join('') +
                '</ol></div>';
            document.getElementById('recipe-result').innerHTML = html;
        }

        // Auto-test on load
        window.onload = function() {
            setTimeout(testHealth, 500);
        };
    </script>
</body>
</html>
  `);
});

// Start both servers
const apiServer = apiApp.listen(API_PORT, () => {
  console.log(`🔗 API Server running on http://localhost:${API_PORT}`);
});

const frontendServer = frontendApp.listen(FRONTEND_PORT, () => {
  console.log(`🌐 Frontend Server running on http://localhost:${FRONTEND_PORT}`);
  console.log(`\n🎯 TESTING INSTRUCTIONS:`);
  console.log(`1. Open your browser and go to: http://localhost:${FRONTEND_PORT}`);
  console.log(`2. The debug test page will load automatically`);
  console.log(`3. Click the test buttons to verify everything works`);
  console.log(`\n⏰ Both servers will run for 2 minutes for testing...`);
});

// Auto-stop after 2 minutes
setTimeout(() => {
  console.log('\n🛑 Stopping test servers after 2 minutes...');
  apiServer.close(() => console.log('✅ API server stopped'));
  frontendServer.close(() => console.log('✅ Frontend server stopped'));
  setTimeout(() => process.exit(0), 1000);
}, 120000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test servers...');
  apiServer.close(() => console.log('✅ API server stopped'));
  frontendServer.close(() => console.log('✅ Frontend server stopped'));
  process.exit(0);
});