const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    enum: ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'clove', 'slice', 'pinch', 'dash', 'handful', 'bunch', 'can', 'package', 'other']
  }
}, { _id: false });

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: Number, // in grams
  carbs: Number,   // in grams
  fat: Number,     // in grams
  fiber: Number,   // in grams
  sugar: Number    // in grams
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  ingredients: [ingredientSchema],
  steps: [{
    type: String,
    required: true,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  servings: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  prepTime: {
    type: Number,
    required: true,
    min: 1 // in minutes
  },
  cookTime: {
    type: Number,
    required: true,
    min: 0 // in minutes
  },
  totalTime: {
    type: Number,
    required: true,
    min: 1 // in minutes
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  cuisine: {
    type: String,
    trim: true,
    lowercase: true
  },
  source: {
    type: String,
    enum: ['generated', 'user'],
    default: 'generated'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nutrition: nutritionSchema,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ authorId: 1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ likes: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ difficulty: 1 });

// Virtual for like count
recipeSchema.virtual('likeCount').get(function() {
  return Array.isArray(this.likes) ? this.likes.length : 0;
});

// Virtual for comment count
recipeSchema.virtual('commentCount').get(function() {
  return Array.isArray(this.comments) ? this.comments.length : 0;
});

// Method to add like
recipeSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
recipeSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => !id.equals(userId));
  return this.save();
};

// Method to toggle like
recipeSchema.methods.toggleLike = function(userId) {
  if (this.likes.includes(userId)) {
    return this.removeLike(userId);
  } else {
    return this.addLike(userId);
  }
};

// Static method to search recipes
recipeSchema.statics.searchRecipes = function(query, options = {}) {
  const {
    difficulty,
    cuisine,
    maxTime,
    tags,
    authorId,
    limit = 20,
    skip = 0
  } = options;

  let searchQuery = {};

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (difficulty) {
    searchQuery.difficulty = difficulty;
  }

  if (cuisine) {
    searchQuery.cuisine = cuisine;
  }

  if (maxTime) {
    searchQuery.totalTime = { $lte: maxTime };
  }

  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }

  if (authorId) {
    searchQuery.authorId = authorId;
  }

  const sort = query ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 };

  const cursor = this.find(searchQuery);
  if (query) {
    cursor.select({ score: { $meta: 'textScore' } });
  }

  return cursor
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('authorId', 'name avatar')
    .populate('comments');
};

// Pre-save middleware to update totalTime
recipeSchema.pre('save', function(next) {
  if (this.isModified('prepTime') || this.isModified('cookTime')) {
    this.totalTime = this.prepTime + this.cookTime;
  }
  next();
});

// Transform JSON output
recipeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
