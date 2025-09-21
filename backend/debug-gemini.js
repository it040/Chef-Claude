require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function debugGemini() {
  console.log('🔍 Debugging Gemini API Response...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const systemPrompt = `You are Chef Claude, an expert culinary AI assistant. Your task is to generate detailed, accurate, and delicious recipes based on user ingredients and preferences.

IMPORTANT: You must respond ONLY with valid JSON in the exact format specified below. Do not include any additional text, explanations, or formatting.

Required JSON Schema:
{
  "title": "Recipe title (max 100 characters)",
  "description": "Brief recipe description (max 500 characters)",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "amount as string (e.g., '2', '1/2', '1.5')",
      "unit": "unit from predefined list: cup, tbsp, tsp, oz, lb, g, kg, ml, l, piece, clove, slice, pinch, dash, handful, bunch, can, package, other"
    }
  ],
  "steps": [
    "Step 1 description",
    "Step 2 description",
    "Step 3 description"
  ],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "difficulty": "easy|medium|hard",
  "cuisine": "cuisine type (optional)",
  "tags": ["tag1", "tag2", "tag3"],
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 15,
    "fiber": 5,
    "sugar": 8
  }
}

Please create a simple chicken and rice recipe using the ingredients provided. Return ONLY valid JSON.`;

  const userPrompt = `Generate a recipe based on the following information:

Available Ingredients: chicken breast, rice, broccoli
User Preferences: None
Dietary Restrictions: None
Allergies: None
Cuisine Preference: Asian
Difficulty Level: medium
Max Cooking Time: 45 minutes

Please create a delicious recipe that uses the available ingredients and respects the user's preferences. Return only the JSON response as specified.`;

  try {
    console.log('📤 Sending prompt to Gemini...');
    const result = await model.generateContent(systemPrompt + '\n\n' + userPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📥 Raw Gemini Response:');
    console.log('====================================');
    console.log(text);
    console.log('====================================\n');
    
    // Clean the response text
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.log('🧹 Cleaned Response:');
    console.log('====================================');
    console.log(cleanText);
    console.log('====================================\n');
    
    // Try to parse JSON
    try {
      const parsedData = JSON.parse(cleanText);
      console.log('✅ JSON parsed successfully!');
      console.log('📋 Parsed Recipe:');
      console.log(JSON.stringify(parsedData, null, 2));
      
      // Check required fields
      const requiredFields = ['title', 'ingredients', 'steps', 'servings', 'prepTime', 'cookTime', 'totalTime'];
      const missingFields = requiredFields.filter(field => !parsedData[field]);
      
      if (missingFields.length > 0) {
        console.log('\n❌ Missing required fields:', missingFields);
      } else {
        console.log('\n✅ All required fields present!');
      }
      
    } catch (parseError) {
      console.log('❌ JSON Parse Error:', parseError.message);
      console.log('   This indicates the AI is not returning valid JSON');
    }
    
  } catch (error) {
    console.error('💥 Gemini API Error:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

debugGemini()
  .then(() => {
    console.log('\n🏁 Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });