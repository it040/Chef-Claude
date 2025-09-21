const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use a current, supported model
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // System prompt for recipe generation
    this.systemPrompt = `You are Chef Claude, an expert culinary AI assistant. Your task is to generate detailed, accurate, and delicious recipes based on user ingredients and preferences.

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

Guidelines:
- Always include all required fields
- Use realistic cooking times and quantities
- Provide clear, actionable cooking steps
- Include relevant tags (e.g., dietary restrictions, cooking methods, meal types)
- Ensure nutritional information is realistic
- If user provides specific dietary requirements, respect them
- Make recipes practical and achievable for home cooks`;

    this.userPromptTemplate = `Generate a recipe based on the following information:

Available Ingredients: {ingredients}
User Preferences: {preferences}
Dietary Restrictions: {dietary}
Allergies: {allergies}
Cuisine Preference: {cuisine}
Difficulty Level: {difficulty}
Max Cooking Time: {maxTime} minutes

Please create a delicious recipe that uses the available ingredients and respects the user's preferences. Return only the JSON response as specified.`;
  }

  async generateRecipe(userInput) {
    try {
      const prompt = this.buildPrompt(userInput);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text (remove markdown formatting if present)
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse JSON response
      let recipeData;
      try {
        recipeData = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response:', text);
        throw new Error('Invalid JSON response from AI');
      }
      
      // Clean and format the data first
      const formattedData = this.formatRecipeData(recipeData);
      
      // Then validate the formatted data
      this.validateRecipeData(formattedData);
      
      return formattedData;
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      if (error.message.includes('Invalid JSON')) {
        throw new Error('AI returned invalid recipe format. Please try again.');
      }
      
      throw new Error('Failed to generate recipe. Please try again.');
    }
  }

  buildPrompt(userInput) {
    const {
      ingredients = [],
      preferences = {},
      dietary = [],
      allergies = [],
      cuisine = '',
      difficulty = 'medium',
      maxTime = 60
    } = userInput;

    const ingredientList = Array.isArray(ingredients) 
      ? ingredients.join(', ') 
      : ingredients;

    const preferenceText = Object.entries(preferences)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return this.userPromptTemplate
      .replace('{ingredients}', ingredientList)
      .replace('{preferences}', preferenceText || 'None specified')
      .replace('{dietary}', dietary.join(', ') || 'None')
      .replace('{allergies}', allergies.join(', ') || 'None')
      .replace('{cuisine}', cuisine || 'Any')
      .replace('{difficulty}', difficulty)
      .replace('{maxTime}', maxTime);
  }

  validateRecipeData(data) {
    const requiredFields = ['title', 'ingredients', 'steps', 'servings', 'prepTime', 'cookTime', 'totalTime'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate ingredients array
    if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      throw new Error('Ingredients must be a non-empty array');
    }

    // Validate steps array
    if (!Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error('Steps must be a non-empty array');
    }

    // Validate numeric fields
    const numericFields = ['servings', 'prepTime', 'cookTime', 'totalTime'];
    for (const field of numericFields) {
      if (typeof data[field] !== 'number' || data[field] < 0) {
        throw new Error(`Invalid value for ${field}: must be a positive number`);
      }
    }

    // Validate difficulty
    if (data.difficulty && !['easy', 'medium', 'hard'].includes(data.difficulty)) {
      data.difficulty = 'medium'; // Default fallback
    }
  }

  formatRecipeData(data) {
    // Handle different field name variations from Gemini API
    const title = data.title || data.recipeName || 'Generated Recipe';
    const steps = data.steps || data.instructions || [];
    
    // Clean and format ingredients (handle different field name variations)
    const cleanIngredients = (data.ingredients || []).map(ingredient => ({
      name: ingredient.name || ingredient.item || '',
      quantity: ingredient.quantity || ingredient.amount || '1',
      unit: ingredient.unit || 'piece'
    }));

    // Convert numeric fields from strings if needed
    const parseNumber = (value, defaultValue) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
        return isNaN(parsed) ? defaultValue : parsed;
      }
      return defaultValue;
    };

    const servings = parseNumber(data.servings, 4);
    const prepTime = parseNumber(data.prepTime, 15);
    const cookTime = parseNumber(data.cookTime, 30);
    const totalTime = parseNumber(data.totalTime, prepTime + cookTime);

    // Ensure all required fields are present with defaults
    return {
      title: title.trim(),
      description: data.description?.trim() || '',
      ingredients: cleanIngredients,
      steps: steps,
      servings: servings,
      prepTime: prepTime,
      cookTime: cookTime,
      totalTime: totalTime,
      difficulty: (data.difficulty || 'medium').toLowerCase(),
      cuisine: data.cuisine?.trim() || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      nutrition: data.nutrition || null,
      source: 'generated'
    };
  }

  // Fallback method to generate a simple recipe if AI fails
  generateFallbackRecipe(ingredients) {
    const ingredientList = Array.isArray(ingredients) 
      ? ingredients.join(', ') 
      : ingredients;

    return {
      title: `Simple Recipe with ${ingredientList}`,
      description: `A quick and easy recipe using your available ingredients: ${ingredientList}`,
      ingredients: [
        { name: ingredientList, quantity: '1', unit: 'handful' },
        { name: 'salt', quantity: '1', unit: 'pinch' },
        { name: 'pepper', quantity: '1', unit: 'pinch' },
        { name: 'olive oil', quantity: '2', unit: 'tbsp' }
      ],
      steps: [
        'Heat olive oil in a pan over medium heat',
        `Add ${ingredientList} and season with salt and pepper`,
        'Cook for 5-10 minutes until tender',
        'Serve hot and enjoy!'
      ],
      servings: 2,
      prepTime: 5,
      cookTime: 10,
      totalTime: 15,
      difficulty: 'easy',
      cuisine: '',
      tags: ['quick', 'simple'],
      nutrition: {
        calories: 150,
        protein: 5,
        carbs: 10,
        fat: 12,
        fiber: 2,
        sugar: 3
      },
      source: 'generated'
    };
  }
}

module.exports = new GeminiService();
