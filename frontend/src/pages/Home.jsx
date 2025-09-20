import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send,
  AccessTime,
  Restaurant,
  People,
  Favorite,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { recipeAPI } from '../services/api';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ingredients, setIngredients] = useState('');
  const [preferences, setPreferences] = useState({
    difficulty: 'medium',
    maxTime: 60,
    cuisine: '',
    dietary: [],
    allergies: [],
  });

  // Fetch recent recipes
  const { data: recentRecipes, isLoading: loadingRecent } = useQuery({
    queryKey: ['recipes', 'recent'],
    queryFn: () => recipeAPI.getRecipes({ limit: 6 }),
    enabled: true,
  });

  // Generate recipe mutation
  const generateRecipeMutation = useMutation({
    mutationFn: (data) => recipeAPI.generateRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setIngredients('');
    },
  });

  // Save recipe mutation
  const saveRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.saveRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'saved'] });
    },
  });

  const handleGenerateRecipe = () => {
    if (!ingredients.trim()) return;

    const ingredientList = ingredients
      .split(',')
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    generateRecipeMutation.mutate({
      ingredients: ingredientList,
      preferences,
      dietary: preferences.dietary,
      allergies: preferences.allergies,
      cuisine: preferences.cuisine || undefined,
      difficulty: preferences.difficulty,
      maxTime: preferences.maxTime,
    });
  };

  const handleSaveRecipe = (recipeId) => {
    saveRecipeMutation.mutate(recipeId);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Welcome to Chef Claude
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Your AI-powered culinary companion. Tell me what ingredients you have, 
          and I'll create amazing recipes just for you!
        </Typography>
      </Box>

      {/* Recipe Generation Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          mb: 6, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          🍳 Generate Your Recipe
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="What ingredients do you have?"
              placeholder="e.g., chicken breast, rice, broccoli, garlic, olive oil..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Difficulty"
                value={preferences.difficulty}
                onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                SelectProps={{ native: true }}
                size="small"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </TextField>
              
              <TextField
                type="number"
                label="Max Time (minutes)"
                value={preferences.maxTime}
                onChange={(e) => setPreferences({ ...preferences, maxTime: parseInt(e.target.value) })}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>

        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Sign in to save your generated recipes and access more features!
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateRecipe}
            disabled={!ingredients.trim() || generateRecipeMutation.isPending}
            startIcon={
              generateRecipeMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Send />
              )
            }
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              textTransform: 'none',
            }}
          >
            {generateRecipeMutation.isPending ? 'Generating...' : 'Generate Recipe'}
          </Button>
          {!isAuthenticated && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3,
                textTransform: 'none',
              }}
            >
              Sign In
            </Button>
          )}
        </Box>

        {generateRecipeMutation.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {generateRecipeMutation.error.message || 'Failed to generate recipe. Please try again.'}
          </Alert>
        )}
      </Paper>

      {/* Generated Recipe Display */}
      {generateRecipeMutation.data && (
        <Paper elevation={3} sx={{ p: 4, mb: 6, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            🎉 Your Generated Recipe
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {generateRecipeMutation.data.recipe.title}
              </Typography>
              
              {generateRecipeMutation.data.recipe.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {generateRecipeMutation.data.recipe.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  icon={<AccessTime />}
                  label={formatTime(generateRecipeMutation.data.recipe.totalTime)}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<People />}
                  label={`${generateRecipeMutation.data.recipe.servings} servings`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  label={generateRecipeMutation.data.recipe.difficulty}
                  color={getDifficultyColor(generateRecipeMutation.data.recipe.difficulty)}
                  variant="outlined"
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Ingredients:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                {generateRecipeMutation.data.recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    <Typography variant="body2">
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </Typography>
                  </li>
                ))}
              </Box>

              {isAuthenticated && (
                <Button
                  variant="outlined"
                  startIcon={<BookmarkBorder />}
                  onClick={() => handleSaveRecipe(generateRecipeMutation.data.recipe._id)}
                  disabled={saveRecipeMutation.isPending}
                  sx={{ textTransform: 'none' }}
                >
                  Save Recipe
                </Button>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Instructions:
              </Typography>
              <Box component="ol" sx={{ pl: 2 }}>
                {generateRecipeMutation.data.recipe.steps.map((step, index) => (
                  <li key={index}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {step}
                    </Typography>
                  </li>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Recent Recipes Section */}
      {recentRecipes?.recipes?.length > 0 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            🔥 Recent Recipes
          </Typography>
          
          <Grid container spacing={3}>
            {recentRecipes.recipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                  onClick={() => window.location.href = `/recipe/${recipe._id}`}
                >
                  {recipe.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={recipe.imageUrl}
                      alt={recipe.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {recipe.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={formatTime(recipe.totalTime)}
                        icon={<AccessTime />}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={recipe.difficulty}
                        color={getDifficultyColor(recipe.difficulty)}
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" noWrap>
                      by {recipe.authorId?.name || 'Chef Claude'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Home;
