const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
require('dotenv').config();

console.log('🧪 Testing MongoDB Connection and Models...\n');

async function testMongoDB() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!\n');

    // Clear existing test data
    console.log('🧹 Cleaning existing test data...');
    await User.deleteMany({ email: { $in: ['john@test.com', 'jane@test.com', 'chef@test.com'] } });
    await Recipe.deleteMany({ title: { $regex: /Test Recipe|Sample Recipe/ } });
    console.log('✅ Test data cleaned\n');

    // Create Test Users
    console.log('👤 Creating test users...');
    
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@test.com',
        googleId: 'google123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        preferences: {
          dietary: ['vegetarian'],
          allergies: ['nuts'],
          cuisine: ['italian', 'mexican'],
          difficulty: 'medium',
          maxPrepTime: 45
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@test.com',
        googleId: 'google456',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a3e7c6?w=150',
        preferences: {
          dietary: ['gluten-free'],
          allergies: ['dairy'],
          cuisine: ['indian'],
          difficulty: 'easy',
          maxPrepTime: 30
        }
      },
      {
        name: 'Chef Claude',
        email: 'chef@test.com',
        googleId: 'google789',
        avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150',
        preferences: {
          dietary: [],
          allergies: [],
          cuisine: ['french', 'mediterranean'],
          difficulty: 'hard',
          maxPrepTime: 120
        }
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`   ✅ Created user: ${user.name} (${user.email})`);
    }
    
    console.log(`\n📊 Created ${createdUsers.length} test users\n`);

    // Create Test Recipes
    console.log('🍳 Creating test recipes...');
    
    const testRecipes = [
      {
        title: 'Test Recipe - Spaghetti Carbonara',
        description: 'A classic Italian pasta dish with eggs, cheese, and pancetta.',
        ingredients: [
          { name: 'Spaghetti', quantity: '400', unit: 'g' },
          { name: 'Pancetta', quantity: '200', unit: 'g' },
          { name: 'Eggs', quantity: '4', unit: 'piece' },
          { name: 'Parmesan Cheese', quantity: '100', unit: 'g' },
          { name: 'Black Pepper', quantity: '1', unit: 'tsp' }
        ],
        steps: [
          'Cook spaghetti in salted water until al dente',
          'Meanwhile, cook pancetta until crispy',
          'Beat eggs with grated parmesan and black pepper',
          'Drain pasta and mix with pancetta',
          'Add egg mixture and toss quickly to create creamy sauce',
          'Serve immediately with extra parmesan'
        ],
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        totalTime: 30,
        difficulty: 'medium',
        cuisine: 'italian',
        authorId: createdUsers[0]._id,
        tags: ['pasta', 'italian', 'dinner'],
        isPublic: true
      },
      {
        title: 'Sample Recipe - Chicken Tikka Masala',
        description: 'Creamy and flavorful Indian curry with tender chicken.',
        ingredients: [
          { name: 'Chicken Breast', quantity: '500', unit: 'g' },
          { name: 'Yogurt', quantity: '200', unit: 'ml' },
          { name: 'Tomato Sauce', quantity: '400', unit: 'ml' },
          { name: 'Heavy Cream', quantity: '200', unit: 'ml' },
          { name: 'Garam Masala', quantity: '2', unit: 'tsp' },
          { name: 'Ginger Garlic Paste', quantity: '2', unit: 'tbsp' }
        ],
        steps: [
          'Marinate chicken in yogurt and spices for 2 hours',
          'Grill chicken until cooked through',
          'Make sauce with tomatoes, cream, and spices',
          'Add grilled chicken to sauce',
          'Simmer for 10 minutes',
          'Serve with rice or naan'
        ],
        servings: 4,
        prepTime: 30,
        cookTime: 25,
        totalTime: 55,
        difficulty: 'medium',
        cuisine: 'indian',
        authorId: createdUsers[1]._id,
        tags: ['chicken', 'curry', 'indian', 'dinner'],
        isPublic: true
      },
      {
        title: 'Test Recipe - French Onion Soup',
        description: 'Classic French soup with caramelized onions and cheese.',
        ingredients: [
          { name: 'Yellow Onions', quantity: '6', unit: 'piece' },
          { name: 'Beef Stock', quantity: '1', unit: 'l' },
          { name: 'White Wine', quantity: '200', unit: 'ml' },
          { name: 'Gruyere Cheese', quantity: '200', unit: 'g' },
          { name: 'French Bread', quantity: '4', unit: 'slice' },
          { name: 'Butter', quantity: '4', unit: 'tbsp' }
        ],
        steps: [
          'Slice onions thinly and caramelize in butter for 45 minutes',
          'Add wine and cook until reduced',
          'Add beef stock and simmer for 30 minutes',
          'Toast bread slices',
          'Top soup with bread and cheese',
          'Broil until cheese is golden and bubbly'
        ],
        servings: 4,
        prepTime: 15,
        cookTime: 90,
        totalTime: 105,
        difficulty: 'hard',
        cuisine: 'french',
        authorId: createdUsers[2]._id,
        tags: ['soup', 'french', 'comfort-food'],
        isPublic: true
      }
    ];

    const createdRecipes = [];
    for (const recipeData of testRecipes) {
      const recipe = new Recipe(recipeData);
      await recipe.save();
      createdRecipes.push(recipe);
      console.log(`   ✅ Created recipe: ${recipe.title} by ${createdUsers.find(u => u._id.equals(recipe.authorId)).name}`);
    }
    
    console.log(`\n📊 Created ${createdRecipes.length} test recipes\n`);

    // Update users with saved recipes (simulate user-recipe relationships)
    console.log('🔗 Creating user-recipe relationships...');
    
    // John saves Jane's and Chef's recipes
    await createdUsers[0].saveRecipe(createdRecipes[1]._id); // Tikka Masala
    await createdUsers[0].saveRecipe(createdRecipes[2]._id); // French Onion Soup
    await createdUsers[0].addToFavorites(createdRecipes[1]._id);
    
    // Jane saves John's and Chef's recipes
    await createdUsers[1].saveRecipe(createdRecipes[0]._id); // Carbonara
    await createdUsers[1].saveRecipe(createdRecipes[2]._id); // French Onion Soup
    await createdUsers[1].addToFavorites(createdRecipes[2]._id);
    
    // Chef saves John's recipe
    await createdUsers[2].saveRecipe(createdRecipes[0]._id); // Carbonara
    await createdUsers[2].addToFavorites(createdRecipes[0]._id);

    // Add some likes to recipes
    await createdRecipes[0].addLike(createdUsers[1]._id);
    await createdRecipes[0].addLike(createdUsers[2]._id);
    await createdRecipes[1].addLike(createdUsers[0]._id);
    await createdRecipes[2].addLike(createdUsers[0]._id);
    await createdRecipes[2].addLike(createdUsers[1]._id);
    
    console.log('   ✅ John saved 2 recipes and liked 1');
    console.log('   ✅ Jane saved 2 recipes and liked 1'); 
    console.log('   ✅ Chef saved 1 recipe and liked 1');
    console.log('   ✅ Added likes to all recipes\n');

    // Verify the data
    console.log('🔍 Verifying created data...\n');
    
    console.log('📊 DATABASE SUMMARY:');
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    
    console.log(`   👥 Total Users: ${totalUsers}`);
    console.log(`   🍳 Total Recipes: ${totalRecipes}\n`);
    
    console.log('👤 USER DETAILS:');
    for (const user of createdUsers) {
      const userWithRecipes = await User.findById(user._id).populate('savedRecipes').populate('favorites');
      console.log(`   📝 ${userWithRecipes.name}:`);
      console.log(`      📧 Email: ${userWithRecipes.email}`);
      console.log(`      💾 Saved Recipes: ${userWithRecipes.savedRecipes.length}`);
      console.log(`      ❤️  Favorite Recipes: ${userWithRecipes.favorites.length}`);
      console.log(`      🍴 Dietary: ${userWithRecipes.preferences.dietary.join(', ') || 'None'}`);
      console.log(`      ⚠️  Allergies: ${userWithRecipes.preferences.allergies.join(', ') || 'None'}\n`);
    }
    
    console.log('🍳 RECIPE DETAILS:');
    for (const recipe of createdRecipes) {
      const recipeWithAuthor = await Recipe.findById(recipe._id).populate('authorId', 'name');
      console.log(`   📝 ${recipeWithAuthor.title}:`);
      console.log(`      👨‍🍳 Author: ${recipeWithAuthor.authorId.name}`);
      console.log(`      ⏱️  Total Time: ${recipeWithAuthor.totalTime} minutes`);
      console.log(`      😊 Difficulty: ${recipeWithAuthor.difficulty}`);
      console.log(`      👍 Likes: ${recipeWithAuthor.likes.length}`);
      console.log(`      🏷️  Tags: ${recipeWithAuthor.tags.join(', ')}\n`);
    }

    console.log('✅ MongoDB Test Completed Successfully!\n');
    console.log('🎯 NEXT STEPS:');
    console.log('   1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
    console.log('   2. Navigate to your cluster');
    console.log('   3. Click "Browse Collections"');
    console.log('   4. You should see collections: users, recipes, comments');
    console.log('   5. Check the data we just created!\n');

  } catch (error) {
    console.error('❌ MongoDB Test Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 MongoDB connection closed');
  }
}

// Run the test
testMongoDB();