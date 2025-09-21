require('dotenv').config();
const geminiService = require('./utils/geminiService');

async function testGeminiService() {
  console.log('🧪 Testing Gemini Service...\n');
  
  // Check if API key is configured
  console.log('1. Checking API Key Configuration:');
  console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log();
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file');
    return;
  }
  
  // Test recipe generation
  console.log('2. Testing Recipe Generation:');
  try {
    const testInput = {
      ingredients: ['chicken breast', 'rice', 'broccoli'],
      preferences: {},
      dietary: [],
      allergies: [],
      cuisine: 'Asian',
      difficulty: 'medium',
      maxTime: 45
    };
    
    console.log('   Input:', JSON.stringify(testInput, null, 2));
    console.log('   Generating recipe...');
    
    const recipe = await geminiService.generateRecipe(testInput);
    
    console.log('✅ Recipe generated successfully!');
    console.log('   Title:', recipe.title);
    console.log('   Servings:', recipe.servings);
    console.log('   Total Time:', recipe.totalTime, 'minutes');
    console.log('   Difficulty:', recipe.difficulty);
    console.log('   Ingredients count:', recipe.ingredients.length);
    console.log('   Steps count:', recipe.steps.length);
    console.log();
    
    console.log('📋 Full Recipe:');
    console.log(JSON.stringify(recipe, null, 2));
    
  } catch (error) {
    console.log('❌ Recipe generation failed:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    
    // Test fallback recipe
    console.log('\n3. Testing Fallback Recipe:');
    try {
      const fallbackRecipe = geminiService.generateFallbackRecipe(['chicken', 'rice']);
      console.log('✅ Fallback recipe generated successfully!');
      console.log('   Title:', fallbackRecipe.title);
    } catch (fallbackError) {
      console.log('❌ Fallback recipe also failed:', fallbackError.message);
    }
  }
}

// Run the test
testGeminiService()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed with error:', error);
    process.exit(1);
  });