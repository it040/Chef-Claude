import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar,
  Skeleton,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  AccessTime,
  People,
  Favorite,
  Bookmark,
  BookmarkBorder,
  Share,
  Comment,
  Restaurant,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { recipeAPI } from '../services/api';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch recipe details
  const { 
    data: recipeData, 
    isLoading: loadingRecipe,
    error: recipeError 
  } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeAPI.getRecipe(id),
    enabled: !!id,
  });

  const recipe = recipeData?.recipe;

  // Save recipe mutation
  const saveRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.saveRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      queryClient.invalidateQueries({ queryKey: ['user', 'saved'] });
      setSnackbar({ open: true, message: 'Recipe saved', severity: 'success' });
    },
    onError: (err) => setSnackbar({ open: true, message: err?.message || 'Failed to save recipe', severity: 'error' }),
  });

  // Like recipe mutation
  const likeRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
    },
    onError: (err) => setSnackbar({ open: true, message: err?.message || 'Failed to update like', severity: 'error' }),
  });

  const handleSaveRecipe = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    saveRecipeMutation.mutate(id);
  };

  const handleLikeRecipe = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    likeRecipeMutation.mutate(id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe?.title,
          text: `Check out this amazing recipe: ${recipe?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({ open: true, message: 'Link copied to clipboard', severity: 'success' });
    }
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

  if (loadingRecipe) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="30%" height={44} />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={56} width="80%" />
            <Skeleton variant="text" height={24} width="60%" />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="rounded" height={32} width={100} />
              <Skeleton variant="rounded" height={32} width={120} />
              <Skeleton variant="rounded" height={32} width={90} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Skeleton variant="rounded" height={36} width={140} />
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={32} width={160} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="text" height={24} width={`${80 - i * 5}%`} />
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={32} width={160} />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="text" height={24} width={`${90 - i * 7}%`} />
            ))}
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (recipeError || !recipe) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Recipe not found or failed to load.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  const isLiked = recipe.likes?.includes(user?._id);
  const isSaved = user?.savedRecipes?.includes(recipe._id);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, textTransform: 'none' }}
      >
        Back
      </Button>

      {/* Recipe Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={4}>
          {/* Recipe Image */}
          {recipe.imageUrl && (
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={recipe.imageUrl}
                alt={recipe.title}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 2,
                }}
              />
            </Grid>
          )}

          {/* Recipe Info */}
          <Grid item xs={12} md={recipe.imageUrl ? 6 : 12}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              {recipe.title}
            </Typography>
            
            {recipe.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {recipe.description}
              </Typography>
            )}

            {/* Recipe Meta */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={<AccessTime />}
                label={formatTime(recipe.totalTime)}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<People />}
                label={`${recipe.servings} servings`}
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={recipe.difficulty}
                color={getDifficultyColor(recipe.difficulty)}
                variant="outlined"
              />
              {recipe.cuisine && (
                <Chip
                  label={recipe.cuisine}
                  color="default"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Author Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={recipe.authorId?.avatar}
                alt={recipe.authorId?.name}
                sx={{ mr: 2, width: 40, height: 40 }}
              >
                {recipe.authorId?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created by {recipe.authorId?.name || 'Chef Claude'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Restaurant />}
                onClick={handleSaveRecipe}
                disabled={saveRecipeMutation.isPending || isSaved}
                sx={{ textTransform: 'none' }}
              >
                {isSaved ? 'Saved' : 'Save Recipe'}
              </Button>
              
              <IconButton
                onClick={handleLikeRecipe}
                disabled={likeRecipeMutation.isPending}
                color={isLiked ? 'error' : 'default'}
              >
                <Favorite />
              </IconButton>
              
              <IconButton onClick={handleShare}>
                <Share />
              </IconButton>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {recipe.likeCount || 0} likes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recipe.commentCount || 0} comments
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Ingredients */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Ingredients
            </Typography>
            <List>
              {recipe.ingredients.map((ingredient, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Instructions
            </Typography>
            <List>
              {recipe.steps.map((step, index) => (
                <ListItem key={index} sx={{ py: 1, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mr: 2,
                      mt: 0.5,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <ListItemText
                    primary={step}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Nutrition Info */}
      {recipe.nutrition && (
        <Paper elevation={1} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Nutrition (per serving)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="h6" color="primary">
                {recipe.nutrition.calories}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calories
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h6" color="primary">
                {recipe.nutrition.protein}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Protein
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h6" color="primary">
                {recipe.nutrition.carbs}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Carbs
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h6" color="primary">
                {recipe.nutrition.fat}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fat
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {recipe.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                color="default"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RecipeDetail;
