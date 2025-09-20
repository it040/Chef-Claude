const express = require('express');
const { body, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const geminiService = require('../utils/geminiService');

const router = express.Router();

// Validation middleware
const validateRecipeGeneration = [
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
  body('ingredients.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each ingredient must be 1-50 characters'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  body('dietary')
    .optional()
    .isArray()
    .withMessage('Dietary restrictions must be an array'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('cuisine')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Cuisine must be 30 characters or less'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('maxTime')
    .optional()
    .isInt({ min: 5, max: 300 })
    .withMessage('Max time must be between 5 and 300 minutes')
];

// Generate recipe using AI
router.post('/generate', authenticateToken, validateRecipeGeneration, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { ingredients, preferences, dietary, allergies, cuisine, difficulty, maxTime } = req.body;

    // Rate limiting check (basic implementation)
    // In production, use Redis-based rate limiting
    const userRecipeCount = await Recipe.countDocuments({
      authorId: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });

    if (userRecipeCount >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please wait before generating more recipes.'
      });
    }

    // Generate recipe using Gemini
    let recipeData;
    try {
      recipeData = await geminiService.generateRecipe({
        ingredients,
        preferences,
        dietary,
        allergies,
        cuisine,
        difficulty,
        maxTime
      });
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      
      // Use fallback recipe
      recipeData = geminiService.generateFallbackRecipe(ingredients);
    }

    // Create recipe in database
    const recipe = new Recipe({
      ...recipeData,
      authorId: req.user._id,
      source: 'generated'
    });

    await recipe.save();

    // Populate author information
    await recipe.populate('authorId', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Recipe generated successfully',
      recipe
    });

  } catch (error) {
    console.error('Generate recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recipe'
    });
  }
});

// Get all recipes with optional filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      difficulty,
      cuisine,
      maxTime,
      tags,
      authorId
    } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const recipes = await Recipe.searchRecipes(search, {
      difficulty,
      cuisine,
      maxTime: maxTime ? parseInt(maxTime) : undefined,
      tags: tags ? tags.split(',') : undefined,
      authorId,
      ...options
    });

    const total = await Recipe.countDocuments(
      search ? { $text: { $search: search } } : {}
    );

    res.json({
      success: true,
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipes'
    });
  }
});

// Get single recipe by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('authorId', 'name avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: 'name avatar'
        }
      });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      recipe
    });

  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipe'
    });
  }
});

// Save recipe to user's collection
router.post('/:id/save', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    await req.user.saveRecipe(recipe._id);

    res.json({
      success: true,
      message: 'Recipe saved successfully'
    });

  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save recipe'
    });
  }
});

// Remove recipe from user's collection
router.delete('/:id/save', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    await req.user.unsaveRecipe(recipe._id);

    res.json({
      success: true,
      message: 'Recipe removed from collection'
    });

  } catch (error) {
    console.error('Unsave recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove recipe'
    });
  }
});

// Like/unlike recipe
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    await recipe.toggleLike(req.user._id);

    res.json({
      success: true,
      message: recipe.likes.includes(req.user._id) ? 'Recipe liked' : 'Recipe unliked',
      likeCount: recipe.likes.length
    });

  } catch (error) {
    console.error('Like recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike recipe'
    });
  }
});

// Add comment to recipe
router.post('/:id/comments', authenticateToken, [
  body('text')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be 1-500 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const comment = new Comment({
      recipeId: recipe._id,
      userId: req.user._id,
      text: req.body.text,
      rating: req.body.rating
    });

    await comment.save();

    // Add comment to recipe
    recipe.comments.push(comment._id);
    await recipe.save();

    // Populate user info
    await comment.populate('userId', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// Update recipe (only by author)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check if user is the author
    if (recipe.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own recipes'
      });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('authorId', 'name avatar');

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });

  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recipe'
    });
  }
});

// Delete recipe (only by author)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check if user is the author
    if (recipe.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own recipes'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ recipeId: recipe._id });

    // Delete recipe
    await Recipe.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });

  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recipe'
    });
  }
});

module.exports = router;
