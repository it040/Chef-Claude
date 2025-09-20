const express = require('express');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's saved recipes
router.get('/me/recipes', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.user._id).populate({
      path: 'savedRecipes',
      options: {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        sort: { createdAt: -1 }
      },
      populate: {
        path: 'authorId',
        select: 'name avatar'
      }
    });

    const totalRecipes = await Recipe.countDocuments({
      _id: { $in: user.savedRecipes }
    });

    res.json({
      success: true,
      recipes: user.savedRecipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRecipes,
        pages: Math.ceil(totalRecipes / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user recipes'
    });
  }
});

// Get user's favorite recipes
router.get('/me/favorites', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      options: {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        sort: { createdAt: -1 }
      },
      populate: {
        path: 'authorId',
        select: 'name avatar'
      }
    });

    const totalFavorites = await Recipe.countDocuments({
      _id: { $in: user.favorites }
    });

    res.json({
      success: true,
      recipes: user.favorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFavorites,
        pages: Math.ceil(totalFavorites / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user favorites'
    });
  }
});

// Get user's created recipes
router.get('/me/created', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const recipes = await Recipe.find({ authorId: req.user._id })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Recipe.countDocuments({ authorId: req.user._id });

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
    console.error('Get user created recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch created recipes'
    });
  }
});

// Get user statistics
router.get('/me/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [
      savedCount,
      favoritesCount,
      createdCount,
      likedRecipes,
      commentedRecipes
    ] = await Promise.all([
      Recipe.countDocuments({ _id: { $in: req.user.savedRecipes } }),
      Recipe.countDocuments({ _id: { $in: req.user.favorites } }),
      Recipe.countDocuments({ authorId: userId }),
      Recipe.countDocuments({ likes: userId }),
      Recipe.countDocuments({ comments: { $in: await require('../models/Comment').find({ userId }).select('_id') } })
    ]);

    res.json({
      success: true,
      stats: {
        savedRecipes: savedCount,
        favoriteRecipes: favoritesCount,
        createdRecipes: createdCount,
        likedRecipes,
        commentedRecipes,
        totalActivity: savedCount + favoritesCount + createdCount + likedRecipes + commentedRecipes
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Get public user profile
router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar preferences createdAt')
      .populate({
        path: 'savedRecipes',
        match: { isPublic: true },
        options: { limit: 6, sort: { createdAt: -1 } },
        populate: {
          path: 'authorId',
          select: 'name avatar'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's public recipe count
    const publicRecipeCount = await Recipe.countDocuments({
      authorId: user._id,
      isPublic: true
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
        recipeCount: publicRecipeCount,
        recentRecipes: user.savedRecipes,
        memberSince: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// Get user's public recipes
router.get('/:id/recipes', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const recipes = await Recipe.find({ 
      authorId: req.params.id,
      isPublic: true 
    })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Recipe.countDocuments({ 
      authorId: req.params.id,
      isPublic: true 
    });

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
    console.error('Get user public recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user recipes'
    });
  }
});

// Update user profile
router.put('/me/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    
    if (name) updates.name = name.trim();
    if (avatar) updates.avatar = avatar;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;
