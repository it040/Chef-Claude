require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testRecipeGenerationAPI() {
  console.log('🧪 Testing Recipe Generation API Endpoint...\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check:');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('   ✅ Health check passed:', healthResponse.data.status);
    console.log();
    
    // Test 2: Recipe Generation (without auth - should work but may have limitations)
    console.log('2. Testing Recipe Generation (no auth):');
    const recipeData = {
      ingredients: ['chicken breast', 'rice', 'broccoli'],
      preferences: {},
      dietary: [],
      allergies: [],
      cuisine: 'Asian',
      difficulty: 'medium',
      maxTime: 45
    };
    
    console.log('   Request data:', JSON.stringify(recipeData, null, 2));
    
    try {
      const recipeResponse = await axios.post(`${API_BASE}/recipes/generate`, recipeData);
      console.log('   ✅ Recipe generated successfully!');
      console.log('   Recipe title:', recipeResponse.data.recipe?.title);
      console.log('   Recipe servings:', recipeResponse.data.recipe?.servings);
      console.log('   Recipe ingredients:', recipeResponse.data.recipe?.ingredients?.length);
      console.log('   Recipe steps:', recipeResponse.data.recipe?.steps?.length);
      console.log();
      console.log('📋 Full Recipe Response:');
      console.log(JSON.stringify(recipeResponse.data, null, 2));
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('   ℹ️  Authentication required for recipe generation');
        console.log('   Status:', authError.response.status);
        console.log('   Message:', authError.response.data?.message);
      } else {
        throw authError;
      }
    }
    
  } catch (error) {
    console.error('❌ API Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message);
      console.error('   Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   ❌ Cannot connect to server. Make sure the backend is running on port 5000');
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Test with a simple user registration/login flow
async function testWithAuth() {
  console.log('\n3. Testing with Authentication:');
  
  try {
    // Try to register a test user
    const testUser = {
      name: 'Test User',
      email: 'test@chefclaude.com',
      password: 'testpassword123'
    };
    
    console.log('   Registering test user...');
    let authToken = null;
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('   ✅ User registered successfully');
      authToken = registerResponse.data.token;
    } catch (regError) {
      if (regError.response?.status === 409) {
        // User already exists, try to login
        console.log('   User already exists, trying login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('   ✅ User logged in successfully');
        authToken = loginResponse.data.token;
      } else {
        throw regError;
      }
    }
    
    if (authToken) {
      console.log('   Auth token received:', authToken ? '✅' : '❌');
      
      // Test recipe generation with auth
      console.log('   Testing recipe generation with auth...');
      const recipeData = {
        ingredients: ['salmon', 'asparagus', 'lemon'],
        preferences: {},
        dietary: [],
        allergies: [],
        cuisine: 'Mediterranean',
        difficulty: 'easy',
        maxTime: 30
      };
      
      const headers = { Authorization: `Bearer ${authToken}` };
      const recipeResponse = await axios.post(`${API_BASE}/recipes/generate`, recipeData, { headers });
      
      console.log('   ✅ Authenticated recipe generation successful!');
      console.log('   Recipe title:', recipeResponse.data.recipe?.title);
      console.log('   Recipe saved to database:', recipeResponse.data.recipe?._id ? '✅' : '❌');
    }
    
  } catch (authTestError) {
    console.error('   ❌ Auth test failed:', authTestError.response?.data || authTestError.message);
  }
}

// Run all tests
testRecipeGenerationAPI()
  .then(() => testWithAuth())
  .then(() => {
    console.log('\n🏁 All API tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });