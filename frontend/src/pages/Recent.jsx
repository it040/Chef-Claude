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
  Skeleton,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { AccessTime, People, Favorite, Bookmark, Search, FilterList } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recipeAPI } from '../services/api';

const Recent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  const { data: recipesData, isLoading, error } = useQuery({
    queryKey: ['recipes', 'recent', { page, search: searchTerm, difficulty: difficultyFilter, time: timeFilter, cuisine: cuisineFilter }],
    queryFn: () => recipeAPI.getRecipes({
      page,
      limit: 12,
      search: searchTerm || undefined,
      difficulty: difficultyFilter || undefined,
      maxTime: timeFilter || undefined,
      cuisine: cuisineFilter || undefined,
    }),
    keepPreviousData: true,
  });

  const saveRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.saveRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'saved'] });
      setSnackbar({ open: true, message: 'Recipe saved', severity: 'success' });
    },
    onError: (err) => {
      setSnackbar({ open: true, message: err?.message || 'Failed to save recipe', severity: 'error' });
    },
  });

  const likeRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', 'recent'] });
    },
    onError: (err) => {
      setSnackbar({ open: true, message: err?.message || 'Failed to update like', severity: 'error' });
    },
  });

  const handleSave = (id) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    saveRecipeMutation.mutate(id);
  };

  const handleLike = (id) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    likeRecipeMutation.mutate(id);
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

  const recipes = recipesData?.recipes || [];
  const totalPages = recipesData?.pagination?.pages || 1;
  const effectivePages = isAuthenticated ? totalPages : 1;

  // Keep page within bounds when auth state changes
  if (page > effectivePages) {
    setPage(1);
  }

  const clearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
    setTimeFilter('');
    setCuisineFilter('');
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Recent Recipes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover the latest recipes from all Chef Claude users
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            label="Search"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 320px', minWidth: 240 }}
          />

          <FormControl size="small" sx={{ flex: '0 1 180px', minWidth: 160 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
              label="Difficulty"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: '0 1 160px', minWidth: 160 }}>
            <InputLabel>Max Time</InputLabel>
            <Select
              value={timeFilter}
              onChange={(e) => { setTimeFilter(e.target.value); setPage(1); }}
              label="Max Time"
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="30">30 minutes</MenuItem>
              <MenuItem value="60">1 hour</MenuItem>
              <MenuItem value="120">2 hours</MenuItem>
              <MenuItem value="300">5+ hours</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: '0 1 200px', minWidth: 180 }}>
            <InputLabel>Cuisine</InputLabel>
            <Select
              value={cuisineFilter}
              onChange={(e) => { setCuisineFilter(e.target.value); setPage(1); }}
              label="Cuisine"
            >
              <MenuItem value="">Any</MenuItem>
              {['italian', 'mexican', 'chinese', 'indian', 'japanese', 'thai', 'french', 'mediterranean', 'american'].map((c) => (
                <MenuItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={() => { setSearchTerm(''); setDifficultyFilter(''); setTimeFilter(''); setCuisineFilter(''); setPage(1); }}
            startIcon={<FilterList />}
            sx={{ textTransform: 'none', flex: '0 0 auto' }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load recent recipes. Please try again.
        </Alert>
      )}

      {isLoading ? (
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
      ) : (
        <>
          <Grid container spacing={3}>
            {recipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {recipe.imageUrl ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={recipe.imageUrl}
                      alt={recipe.title}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/recipe/${recipe._id}`)}
                    />
                  ) : (
                    <Box sx={{ height: 200, bgcolor: 'action.hover', cursor: 'pointer' }} onClick={() => navigate(`/recipe/${recipe._id}`)} />
                  )}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom noWrap sx={{ cursor: 'pointer' }} onClick={() => navigate(`/recipe/${recipe._id}`)}>
                      {recipe.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip size="small" label={formatTime(recipe.totalTime)} icon={<AccessTime />} color="primary" variant="outlined" />
                      <Chip size="small" label={`${recipe.servings} servings`} icon={<People />} color="secondary" variant="outlined" />
                      <Chip size="small" label={recipe.difficulty} color={getDifficultyColor(recipe.difficulty)} variant="outlined" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="caption" color="text.secondary">
                        by {recipe.authorId?.name || 'Chef Claude'}
                      </Typography>
                      <Box>
                        <IconButton size="small" onClick={() => handleLike(recipe._id)} disabled={likeRecipeMutation.isPending}>
                          <Favorite color={recipe.likes?.includes(user?._id) ? 'error' : 'inherit'} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleSave(recipe._id)} disabled={saveRecipeMutation.isPending}>
                          <Bookmark color="primary" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {effectivePages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
              <Button variant="outlined" disabled={page === 1} onClick={() => setPage(page - 1)} sx={{ textTransform: 'none' }}>
                Previous
              </Button>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                Page {page} of {effectivePages}
              </Typography>
              <Button
                variant="outlined"
                disabled={page === effectivePages}
                onClick={() => (isAuthenticated ? setPage(page + 1) : navigate('/login'))}
                sx={{ textTransform: 'none' }}
              >
                Next
              </Button>
            </Box>
          )}
        </>
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

export default Recent;