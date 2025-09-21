require('dotenv').config();
const mongoose = require('mongoose');

async function testServerComponents() {
  console.log('🧪 Testing Server Components...\n');
  
  // Test 1: Environment variables
  console.log('1. Testing Environment Configuration:');
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
  console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
  console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set');
  console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
  
  // Test 2: MongoDB Connection
  console.log('\n2. Testing MongoDB Connection:');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ MongoDB connected successfully');
    await mongoose.disconnect();
    console.log('   ✅ MongoDB disconnected successfully');
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message);
  }
  
  // Test 3: Test imports
  console.log('\n3. Testing Module Imports:');
  try {
    const geminiService = require('./utils/geminiService');
    console.log('   ✅ GeminiService loaded');
    
    const User = require('./models/User');
    const Recipe = require('./models/Recipe');
    const Comment = require('./models/Comment');
    console.log('   ✅ Models loaded');
    
    const authRoutes = require('./routes/auth');
    const recipeRoutes = require('./routes/recipes');
    const userRoutes = require('./routes/users');
    console.log('   ✅ Routes loaded');
    
    const { authenticateToken, generateToken } = require('./middleware/auth');
    console.log('   ✅ Middleware loaded');
    
  } catch (importError) {
    console.log('   ❌ Import failed:', importError.message);
  }
  
  console.log('\n✅ Server component tests completed');
  console.log('\n📝 To start the server manually, run: npm run dev');
  console.log('📝 To test the API endpoints, run: node test-api.js (while server is running)');
}

testServerComponents()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });