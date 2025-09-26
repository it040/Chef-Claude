const express = require('express');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's saved recipes
router.get('/me/recipes', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, difficulty, maxTime, author, cuisine, tags } = req.query;

    // Fetch saved recipe IDs first (no populate)
    const userDoc = await User.findById(req.user._id).select('savedRecipes').lean();
    const savedIds = Array.isArray(userDoc?.savedRecipes) ? userDoc.savedRecipes : [];

    if (savedIds.length === 0) {
      return res.json({
        success: true,
        recipes: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 1,
        },
      });
    }

    // Build match filter
    const match = { _id: { $in: savedIds }, $or: [ { isPublic: true }, { authorId: req.user._id } ] };
    if (difficulty) match.difficulty = difficulty;
    if (cuisine) match.cuisine = cuisine;
    if (tags) {
      const tagList = String(tags)
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      if (tagList.length) match.tags = { $in: tagList };
    }
    if (maxTime) match.totalTime = { $lte: parseInt(maxTime) };

    // Optional author filter: find matching author IDs by name
    let authorIds = null;
    if (author && author.trim().length > 0) {
      const authors = await User.find({ name: { $regex: author.trim(), $options: 'i' } }).select('_id').lean();
      authorIds = authors.map(a => a._id);
      if (authorIds.length === 0) {
        // No matching authors -> no results
        return res.json({
          success: true,
          recipes: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 1,
          },
        });
      }
      match.authorId = { $in: authorIds };
    }

    const useText = typeof search === 'string' && search.trim().length > 0;
    if (useText) match.$text = { $search: search.trim() };

    // Count total with filters
    const total = await Recipe.countDocuments(match);

    // Query recipes with filters and pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const cursor = Recipe.find(match)
      .populate('authorId', 'name avatar')
      .limit(parseInt(limit))
      .skip(skip);

    if (useText) {
      cursor.select({ score: { $meta: 'textScore' } });
      cursor.sort({ score: { $meta: 'textScore' }, createdAt: -1 });
    } else {
      cursor.sort({ createdAt: -1 });
    }

    const recipes = await cursor.exec();

    res.json({
      success: true,
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.max(1, Math.ceil(total / parseInt(limit))),
      },
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user recipes',
    });
  }
});

// Get user's favorite recipes (exclude others' private)
router.get('/me/favorites', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Fetch favorite recipe IDs
    const userDoc = await User.findById(req.user._id).select('favorites').lean();
    const favIds = Array.isArray(userDoc?.favorites) ? userDoc.favorites : [];

    if (favIds.length === 0) {
      return res.json({ success: true, recipes: [], pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 1 } });
    }

    // Only include public recipes OR ones authored by the current user
    const match = { _id: { $in: favIds }, $or: [ { isPublic: true }, { authorId: req.user._id } ] };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const recipes = await Recipe.find(match)
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Recipe.countDocuments(match);

    res.json({
      success: true,
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.max(1, Math.ceil(total / parseInt(limit)))
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
