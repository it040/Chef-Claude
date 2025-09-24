const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but enforces uniqueness when present
  },
  avatar: {
    type: String,
    default: null
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  savedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  preferences: {
    dietary: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'halal', 'kosher']
    }],
    allergies: [{
      type: String,
      enum: ['nuts', 'shellfish', 'eggs', 'soy', 'wheat', 'dairy', 'fish', 'sesame']
    }],
    cuisine: [{
      type: String,
      enum: ['italian', 'mexican', 'chinese', 'indian', 'japanese', 'thai', 'french', 'mediterranean', 'american', 'other']
    }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    maxPrepTime: {
      type: Number,
      default: 60 // minutes
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries (removed duplicate indexes)
// userSchema.index({ email: 1 }); // Already indexed with unique: true
// userSchema.index({ googleId: 1 }); // Already indexed with unique: true

// Virtual for user's recipe count
userSchema.virtual('recipeCount').get(function() {
  return Array.isArray(this.savedRecipes) ? this.savedRecipes.length : 0;
});

// Method to add recipe to favorites
userSchema.methods.addToFavorites = function(recipeId) {
  if (!this.favorites.includes(recipeId)) {
    this.favorites.push(recipeId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove recipe from favorites
userSchema.methods.removeFromFavorites = function(recipeId) {
  this.favorites = this.favorites.filter(id => !id.equals(recipeId));
  return this.save();
};

// Method to save recipe
userSchema.methods.saveRecipe = function(recipeId) {
  if (!this.savedRecipes.includes(recipeId)) {
    this.savedRecipes.push(recipeId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to unsave recipe
userSchema.methods.unsaveRecipe = function(recipeId) {
  this.savedRecipes = this.savedRecipes.filter(id => !id.equals(recipeId));
  return this.save();
};

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

// Transform JSON output
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.googleId;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
