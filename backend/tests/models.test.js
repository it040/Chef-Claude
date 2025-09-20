
const mongoose = require('mongoose');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');

// Test database connection
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-claude-test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Model', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('should create a user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      googleId: 'google123',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.googleId).toBe(userData.googleId);
    expect(savedUser.createdAt).toBeDefined();
  });

  test('should not create user without required fields', async () => {
    const userData = {
      email: 'test@example.com',
      // missing name
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  test('should add recipe to favorites', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      googleId: 'google123',
    });
    await user.save();

    const recipeId = new mongoose.Types.ObjectId();
    await user.addToFavorites(recipeId);

    expect(user.favorites).toContainEqual(recipeId);
  });
});

describe('Recipe Model', () => {
  beforeEach(async () => {
    await Recipe.deleteMany({});
  });

  test('should create a recipe with valid data', async () => {
    const recipeData = {
      title: 'Test Recipe',
      description: 'A test recipe',
      ingredients: [
        { name: 'chicken', quantity: '2', unit: 'pieces' },
        { name: 'rice', quantity: '1', unit: 'cup' }
      ],
      steps: ['Step 1', 'Step 2'],
      servings: 4,
      prepTime: 15,
      cookTime: 30,
      totalTime: 45,
      difficulty: 'medium',
      authorId: new mongoose.Types.ObjectId(),
    };

    const recipe = new Recipe(recipeData);
    const savedRecipe = await recipe.save();

    expect(savedRecipe._id).toBeDefined();
    expect(savedRecipe.title).toBe(recipeData.title);
    expect(savedRecipe.ingredients).toHaveLength(2);
    expect(savedRecipe.steps).toHaveLength(2);
    expect(savedRecipe.likeCount).toBe(0);
  });

  test('should not create recipe without required fields', async () => {
    const recipeData = {
      title: 'Test Recipe',
      // missing ingredients, steps, etc.
    };

    const recipe = new Recipe(recipeData);
    await expect(recipe.save()).rejects.toThrow();
  });

  test('should calculate total time from prep and cook time', async () => {
    const recipe = new Recipe({
      title: 'Test Recipe',
      ingredients: [{ name: 'test', quantity: '1', unit: 'piece' }],
      steps: ['Step 1'],
      servings: 2,
      prepTime: 10,
      cookTime: 20,
      totalTime: 0, // Should be calculated
      difficulty: 'easy',
      authorId: new mongoose.Types.ObjectId(),
    });

    await recipe.save();
    expect(recipe.totalTime).toBe(30);
  });
});

describe('Comment Model', () => {
  beforeEach(async () => {
    await Comment.deleteMany({});
  });

  test('should create a comment with valid data', async () => {
    const commentData = {
      recipeId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      text: 'This recipe is amazing!',
      rating: 5,
    };

    const comment = new Comment(commentData);
    const savedComment = await comment.save();

    expect(savedComment._id).toBeDefined();
    expect(savedComment.text).toBe(commentData.text);
    expect(savedComment.rating).toBe(commentData.rating);
    expect(savedComment.isEdited).toBe(false);
  });

  test('should track edits', async () => {
    const comment = new Comment({
      recipeId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      text: 'Original comment',
    });
    await comment.save();

    comment.text = 'Updated comment';
    await comment.save();

    expect(comment.isEdited).toBe(true);
    expect(comment.editedAt).toBeDefined();
  });
});
