import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
} from '@mui/material';
import {
  Search,
  AccessTime,
  People,
  Favorite,
  Bookmark,
  BookmarkBorder,
  FilterList,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { userAPI, recipeAPI } from '../services/api';
import { Alert as MuiAlert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SavedRecipes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch saved recipes
  const { 
    data: savedRecipes, 
    isLoading: loadingSaved,
    error: savedError 
  } = useQuery({
    queryKey: ['user', 'saved', { page, search: searchTerm, difficulty: difficultyFilter, time: timeFilter }],
    queryFn: () => userAPI.getSavedRecipes({ 
      page, 
      limit: 12,
      search: searchTerm || undefined,
      difficulty: difficultyFilter || undefined,
      maxTime: timeFilter || undefined,
    }),
    enabled: !!user,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Unsaved recipe mutation
  const unsaveRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.unsaveRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
      setSnackbar({ open: true, message: 'Removed from saved', severity: 'success' });
    },
    onError: (err) => setSnackbar({ open: true, message: err?.message || 'Failed to remove', severity: 'error' }),
  });

  // Like recipe mutation
  const likeRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'saved'] });
    },
    onError: (err) => setSnackbar({ open: true, message: err?.message || 'Failed to update like', severity: 'error' }),
  });

  const handleUnsaveRecipe = (recipeId) => {
    unsaveRecipeMutation.mutate(recipeId);
  };

  const handleLikeRecipe = (recipeId) => {
    likeRecipeMutation.mutate(recipeId);
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'difficulty') {
      setDifficultyFilter(value);
    } else if (filterType === 'time') {
      setTimeFilter(value);
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
    setTimeFilter('');
    setPage(1);
  };

  if (savedError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load saved recipes. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          My Saved Recipes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your personal collection of favorite recipes
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Max Time</InputLabel>
              <Select
                value={timeFilter}
                onChange={(e) => handleFilterChange('time', e.target.value)}
                label="Max Time"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="30">30 minutes</MenuItem>
                <MenuItem value="60">1 hour</MenuItem>
                <MenuItem value="120">2 hours</MenuItem>
                <MenuItem value="300">5+ hours</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterList />}
              fullWidth
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recipe Grid */}
      {loadingSaved ? (
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={28} width="80%" />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Skeleton variant="rounded" height={28} width={100} />
                    <Skeleton variant="rounded" height={28} width={80} />
                    <Skeleton variant="rounded" height={28} width={90} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : savedRecipes?.recipes?.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {savedRecipes.recipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  {recipe.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={recipe.imageUrl}
                      alt={recipe.title}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/recipe/${recipe._id}`)}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => navigate(`/recipe/${recipe._id}`)}
                    >
                      {recipe.title}
                    </Typography>
                    
                    {recipe.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 2, flexGrow: 1 }}
                      >
                        {recipe.description.length > 100 
                          ? `${recipe.description.substring(0, 100)}...` 
                          : recipe.description
                        }
                      </Typography>
                    )}
                    
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
                        label={`${recipe.servings} servings`}
                        icon={<People />}
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={recipe.difficulty}
                        color={getDifficultyColor(recipe.difficulty)}
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        by {recipe.authorId?.name || 'Chef Claude'}
                      </Typography>
                      
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleLikeRecipe(recipe._id)}
                          disabled={likeRecipeMutation.isPending}
                        >
                          <Favorite 
                            color={recipe.likes?.includes(user?._id) ? 'error' : 'inherit'} 
                          />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleUnsaveRecipe(recipe._id)}
                          disabled={unsaveRecipeMutation.isPending}
                        >
                          <Bookmark color="primary" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {savedRecipes.pagination && savedRecipes.pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
              <Button
                variant="outlined"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                sx={{ textTransform: 'none' }}
              >
                Previous
              </Button>
              
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                Page {page} of {savedRecipes.pagination.pages}
              </Typography>
              
              <Button
                variant="outlined"
                disabled={page === savedRecipes.pagination.pages}
                onClick={() => setPage(page + 1)}
                sx={{ textTransform: 'none' }}
              >
                Next
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom color="text.secondary">
            No saved recipes found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || difficultyFilter || timeFilter 
              ? 'Try adjusting your search criteria or clear the filters.'
              : 'Start saving recipes you love to build your personal collection!'
            }
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            Generate Your First Recipe
          </Button>
        </Box>
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

export default SavedRecipes;
