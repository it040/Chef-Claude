import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Favorite,
  Bookmark,
  Restaurant,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/api';

const Profile = () => {
  const { user, updatePreferences } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch user stats
  const { data: userStats, isLoading: loadingStats } = useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => userAPI.getUserStats(),
    enabled: !!user,
  });

  // Fetch saved recipes
  const { data: savedRecipes, isLoading: loadingSaved } = useQuery({
    queryKey: ['user', 'saved'],
    queryFn: () => userAPI.getSavedRecipes({ limit: 6 }),
    enabled: !!user,
  });

  const handleSavePreferences = async () => {
    const result = await updatePreferences(preferences);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setPreferences(user?.preferences || {});
    setIsEditing(false);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
    'keto', 'paleo', 'halal', 'kosher'
  ];

  const allergyOptions = [
    'nuts', 'shellfish', 'eggs', 'soy', 
    'wheat', 'dairy', 'fish', 'sesame'
  ];

  const cuisineOptions = [
    'italian', 'mexican', 'chinese', 'indian', 
    'japanese', 'thai', 'french', 'mediterranean', 'american'
  ];

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: '3rem',
                fontWeight: 600,
                mx: 'auto',
                mb: 2,
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} sm={9}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
            
            {/* Quick Stats */}
            {userStats && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                <Chip
                  icon={<Bookmark />}
                  label={`${userStats.stats.savedRecipes} Saved`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<Favorite />}
                  label={`${userStats.stats.favoriteRecipes} Favorites`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  icon={<Restaurant />}
                  label={`${userStats.stats.createdRecipes} Created`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Preferences Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Preferences
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={isEditing ? <Cancel /> : <Edit />}
                onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                sx={{ textTransform: 'none' }}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </Box>

            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Dietary Restrictions */}
                <FormControl fullWidth>
                  <InputLabel>Dietary Restrictions</InputLabel>
                  <Select
                    multiple
                    value={preferences.dietary || []}
                    onChange={(e) => setPreferences({ ...preferences, dietary: e.target.value })}
                    input={<OutlinedInput label="Dietary Restrictions" />}
                  >
                    {dietaryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Allergies */}
                <FormControl fullWidth>
                  <InputLabel>Allergies</InputLabel>
                  <Select
                    multiple
                    value={preferences.allergies || []}
                    onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
                    input={<OutlinedInput label="Allergies" />}
                  >
                    {allergyOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Preferred Cuisine */}
                <FormControl fullWidth>
                  <InputLabel>Preferred Cuisine</InputLabel>
                  <Select
                    value={preferences.cuisine || []}
                    onChange={(e) => setPreferences({ ...preferences, cuisine: e.target.value })}
                    label="Preferred Cuisine"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {cuisineOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Difficulty Preference */}
                <FormControl fullWidth>
                  <InputLabel>Difficulty Preference</InputLabel>
                  <Select
                    value={preferences.difficulty || 'medium'}
                    onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                    label="Difficulty Preference"
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>

                {/* Max Prep Time */}
                <TextField
                  fullWidth
                  type="number"
                  label="Max Prep Time (minutes)"
                  value={preferences.maxPrepTime || 60}
                  onChange={(e) => setPreferences({ ...preferences, maxPrepTime: parseInt(e.target.value) })}
                  inputProps={{ min: 5, max: 300 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSavePreferences}
                    sx={{ textTransform: 'none' }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                {user.preferences?.dietary?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Dietary Restrictions:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {user.preferences.dietary.map((diet) => (
                        <Chip key={diet} label={diet} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {user.preferences?.allergies?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Allergies:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {user.preferences.allergies.map((allergy) => (
                        <Chip key={allergy} label={allergy} size="small" color="warning" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preferred Cuisine:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.preferences?.cuisine?.[0] ? 
                      user.preferences.cuisine[0].charAt(0).toUpperCase() + user.preferences.cuisine[0].slice(1) : 
                      'Any'
                    }
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Difficulty Preference:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.preferences?.difficulty?.charAt(0).toUpperCase() + user.preferences?.difficulty?.slice(1) || 'Medium'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Max Prep Time:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(user.preferences?.maxPrepTime || 60)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Saved Recipes */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Recent Saved Recipes
            </Typography>

            {loadingSaved ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : savedRecipes?.recipes?.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {savedRecipes.recipes.slice(0, 3).map((recipe) => (
                  <Card 
                    key={recipe._id} 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => window.location.href = `/recipe/${recipe._id}`}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="h6" noWrap gutterBottom>
                        {recipe.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.href = '/saved'}
                  sx={{ mt: 2, textTransform: 'none' }}
                >
                  View All Saved Recipes
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No saved recipes yet
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => window.location.href = '/'}
                  sx={{ textTransform: 'none' }}
                >
                  Generate Your First Recipe
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
