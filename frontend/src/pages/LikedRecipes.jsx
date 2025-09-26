import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
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
import Grid from '../components/GridShim';
import {
  Search,
  AccessTime,
  People,
  Favorite,
  FavoriteBorder,
  FilterList,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recipeAPI, userAPI } from '../services/api';

const LikedRecipes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', 'favorites', { page, search: searchTerm, difficulty: difficultyFilter, time: timeFilter, cuisine: cuisineFilter }],
    queryFn: () => userAPI.getFavoriteRecipes({
      page,
      limit: 12,
      search: searchTerm || undefined,
      difficulty: difficultyFilter || undefined,
      maxTime: timeFilter || undefined,
      cuisine: cuisineFilter || undefined,
    }),
    keepPreviousData: true,
  });

  const likeRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
      setSnackbar({ open: true, message: 'Updated like', severity: 'success' });
    },
    onError: (err) => setSnackbar({ open: true, message: err?.message || 'Failed to update like', severity: 'error' }),
  });

  const handleLike = (id) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    likeRecipeMutation.mutate(id);
  };

  const recipes = data?.recipes || [];
  const totalPages = data?.pagination?.pages || 1;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Liked Recipes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          All recipes you have liked
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
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
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
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
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
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
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Cuisine</InputLabel>
              <Select
                value={cuisineFilter}
                onChange={(e) => { setCuisineFilter(e.target.value); setPage(1); }}
                label="Cuisine"
              >
                <MenuItem value="">Any</MenuItem>
                {['italian', 'mexican', 'chinese', 'indian', 'japanese', 'thai', 'french', 'mediterranean', 'american']
                  .map((c) => (
                    <MenuItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => { setSearchTerm(''); setDifficultyFilter(''); setTimeFilter(''); setCuisineFilter(''); setPage(1); }}
              fullWidth
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load liked recipes. Please try again.
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
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {recipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom noWrap sx={{ cursor: 'pointer' }} onClick={() => navigate(`/recipe/${recipe._id}`)}>
                    {recipe.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip size="small" label={formatTime(recipe.totalTime)} icon={<AccessTime />} color="primary" variant="outlined" />
                    <Chip size="small" label={`${recipe.servings} servings`} icon={<People />} color="secondary" variant="outlined" />
                    <Chip size="small" label={recipe.difficulty} variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="caption" color="text.secondary">
                      by {recipe.authorId?.name || 'Chef Claude'}
                    </Typography>
                    <IconButton size="small" onClick={() => handleLike(recipe._id)} disabled={likeRecipeMutation.isPending}>
                      <Favorite color={recipe.likes?.includes(user?._id) ? 'error' : 'inherit'} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
          <Button variant="outlined" disabled={page === 1} onClick={() => setPage(page - 1)} sx={{ textTransform: 'none' }}>
            Previous
          </Button>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            Page {page} of {totalPages}
          </Typography>
          <Button variant="outlined" disabled={page === totalPages} onClick={() => setPage(page + 1)} sx={{ textTransform: 'none' }}>
            Next
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

export default LikedRecipes;
