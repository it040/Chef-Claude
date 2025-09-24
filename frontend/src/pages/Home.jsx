import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Stack,
  Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Send,
  AccessTime,
  Restaurant,
  EmojiEmotions,
  SentimentSatisfiedAlt,
  Whatshot,
  Lightbulb,
  Verified,
  EmojiFoodBeverage,
  Shield,
  LocalDining,
  Star,
  Spa,
  Email,
  Phone,
  Instagram,
  Twitter,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { recipeAPI, userAPI } from '../services/api';

const Home = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [ingredients, setIngredients] = useState('');
  const [preferences, setPreferences] = useState({
    difficulty: 'medium',
    maxTime: 60,
    cuisine: '',
    dietary: [],
    allergies: [],
  });

  // Prefill prompt from sidebar navigation
  useEffect(() => {
    const incoming = location.state?.prompt;
    if (typeof incoming === 'string') {
      setIngredients(incoming);
      // Clear the state to avoid re-filling on back/forward
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  // Fetch user's created recipes for sidebar (if authenticated)
  const { data: createdData, isLoading: loadingCreated } = useQuery({
    queryKey: ['user', 'created', { limit: 20 }],
    queryFn: () => userAPI.getCreatedRecipes({ limit: 20 }),
    enabled: isAuthenticated,
  });

  // Snackbar for small notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const generateRecipeMutation = useMutation({
    mutationFn: (data) => recipeAPI.generateRecipe(data),
    onSuccess: (resp) => {
      try {
        const id = resp?.recipe?._id || resp?.data?.recipe?._id;
        if (id) navigate(`/recipe/${id}`);
      } catch {}
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'created'] });
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

      {/* Main Section: Generator only (recipes & prompts live in sidebar) */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: isDark
                ? 'linear-gradient(135deg, #0f1115 0%, #161a22 60%)'
                : 'linear-gradient(135deg, #fff7f1 0%, #ffffff 60%)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, mb: 2 }}>
              🍳 Generate a Family-Friendly Recipe
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Tell us what you have at home and we’ll craft a simple, tasty recipe. Perfect for busy moms and weeknight dinners.
            </Typography>

            {/* Ingredients fill the whole box */}
            <Box sx={{ mb: 3 }}>
              <TextField
                id="ingredient-input"
                fullWidth
                multiline
                rows={5}
                label="What ingredients do you have?"
                placeholder="e.g., chicken breast, rice, broccoli, garlic, olive oil"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                variant="filled"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Restaurant />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiFilledInput-root': {
                    backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06),
                    borderRadius: 2,
                  },
                }}
                helperText="Tip: Separate items with commas. We’ll figure out amounts and steps."
              />
            </Box>

            {/* Preferences: difficulty + time + cuisine */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>Difficulty</Typography>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  value={preferences.difficulty}
                  onChange={(_, val) => val && setPreferences({ ...preferences, difficulty: val })}
                  size="small"
                >
                  <ToggleButton value="easy" sx={{ px: 2 }}>
                    <EmojiEmotions sx={{ mr: 1 }} fontSize="small" /> Easy
                  </ToggleButton>
                  <ToggleButton value="medium" sx={{ px: 2 }}>
                    <SentimentSatisfiedAlt sx={{ mr: 1 }} fontSize="small" /> Medium
                  </ToggleButton>
                  <ToggleButton value="hard" sx={{ px: 2 }}>
                    <Whatshot sx={{ mr: 1 }} fontSize="small" /> Hard
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>Max Time (minutes)</Typography>
                <Slider
                  value={preferences.maxTime}
                  onChange={(_, val) => setPreferences({ ...preferences, maxTime: Array.isArray(val) ? val[0] : val })}
                  min={10}
                  max={120}
                  step={5}
                  marks={[{ value: 15, label: '15' }, { value: 30, label: '30' }, { value: 45, label: '45' }, { value: 60, label: '60' }, { value: 90, label: '90' }]}
                  valueLabelDisplay="auto"
                  sx={{ mx: 1 }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>Cuisine (optional)</Typography>
                <TextField
                  fullWidth
                  placeholder="e.g., Italian"
                  value={preferences.cuisine}
                  onChange={(e) => setPreferences({ ...preferences, cuisine: e.target.value })}
                  size="small"
                />
              </Box>
            </Stack>

            {/* Quick ideas */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {[
                'one-pot pasta, tomatoes, garlic',
                'budget-friendly: eggs, rice, veggies',
                'quick: chicken, tortillas, cheese',
                'vegetarian: tofu, soy sauce, greens',
              ].map((suggestion) => (
                <Chip key={suggestion} label={suggestion} onClick={() => setIngredients(suggestion)} variant="outlined" sx={{ cursor: 'pointer' }} />
              ))}
            </Stack>

            {/* Dietary preferences */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Dietary preferences</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['vegetarian','vegan','gluten-free','dairy-free','keto','paleo'].map((opt) => {
                  const active = preferences.dietary?.includes(opt);
                  return (
                    <Chip
                      key={opt}
                      label={opt}
                      color={active ? 'primary' : 'default'}
                      variant={active ? 'filled' : 'outlined'}
                      onClick={() => {
                        const set = new Set(preferences.dietary || []);
                        if (set.has(opt)) set.delete(opt); else set.add(opt);
                        setPreferences({ ...preferences, dietary: Array.from(set) });
                      }}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  );
                })}
              </Stack>
            </Box>

            {/* Allergy chips */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Allergies</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['nuts','shellfish','eggs','soy','wheat','dairy','fish','sesame'].map((opt) => {
                  const active = preferences.allergies?.includes(opt);
                  return (
                    <Chip
                      key={opt}
                      label={opt}
                      color={active ? 'secondary' : 'default'}
                      variant={active ? 'filled' : 'outlined'}
                      onClick={() => {
                        const set = new Set(preferences.allergies || []);
                        if (set.has(opt)) set.delete(opt); else set.add(opt);
                        setPreferences({ ...preferences, allergies: Array.from(set) });
                      }}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  );
                })}
              </Stack>
            </Box>

            {/* Tips banner */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Lightbulb color="primary" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Tips</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adding a base like rice or pasta for fuller meals. Include a protein and a veggie for balance.
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {!isAuthenticated && (
              <Alert severity="info" sx={{ mt: 1 }}>
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
                  px: 5,
                  py: 1.8,
                  fontSize: '1.15rem',
                  borderRadius: 999,
                  textTransform: 'none',
                }}
              >
                {generateRecipeMutation.isPending ? 'Cooking up ideas…' : 'Generate Recipe'}
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 5,
                    py: 1.8,
                    fontSize: '1.05rem',
                    borderRadius: 999,
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
        </Grid>
      </Grid>

      {/* Privacy & Contact */}
      <Box sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Shield color="primary" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Your privacy matters</Typography>
                  <Typography variant="body2" color="text.secondary">
                    We only use your inputs to generate recipes. No selling of data. You control your preferences and can delete your account anytime from Profile.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Chip icon={<Email />} label="deepvaishnav207@gmail.com" variant="outlined" clickable onClick={() => navigate('/contact')} />
                <Chip icon={<Phone />} label="+91 7043041707" variant="outlined" />
                <Chip icon={<Shield />} label="Privacy Policy" variant="outlined" clickable onClick={() => navigate('/privacy')} />
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Public-only Marketing Sections */}
      {!isAuthenticated && (
        <>
          {/* About Us */}
          <Box sx={{ py: { xs: 5, md: 8 } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 6 },
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Grid container spacing={4} alignItems="center">
                {/* Left content */}
                <Grid item xs={12} md={7}>
                  <Stack spacing={2}>
                    <Chip label="Made for families" color="primary" size="small" sx={{ alignSelf: 'flex-start' }} />
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 900,
                        lineHeight: 1.1,
                        background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      About Chef Claude
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Turn what’s already in your kitchen into wholesome meals your family will love. Chef Claude keeps it simple with clear steps, kid‑friendly flavors, and smart swaps.
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip icon={<Verified />} label="Trusted results" variant="outlined" />
                      <Chip icon={<EmojiFoodBeverage />} label="Family‑friendly" variant="outlined" />
                      <Chip icon={<Spa />} label="Less food waste" variant="outlined" />
                    </Stack>
                  </Stack>
                </Grid>

                {/* Right illustration */}
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: { xs: 220, md: 260 },
                      width: '100%',
                      minWidth: { xs: 280, md: 320 },
                      maxWidth: 540,
                      mx: { xs: 'auto', md: 'auto' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: (theme) =>
                        theme.palette.mode === 'dark'
                          ? `radial-gradient(800px 200px at 50% 20%, rgba(255,255,255,0.05), transparent), linear-gradient(135deg, #0f1115, #161a22)`
                          : `radial-gradient(800px 200px at 50% 20%, rgba(255,107,53,0.12), transparent), linear-gradient(135deg, #fff5ee, #fff)`,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {/* Three sibling boxes: first has 3 photos, others single photos */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, width: '100%', height: '100%', p: 1.5 }}>
                      {/* Box 1: row of three inside */}
                      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex' }}>
                          <Box component="img" src="/about-dish-1.svg" alt="fresh salad" sx={{ flex: 1, width: '33.33%', height: '100%', objectFit: 'cover' }} />
                          <Box component="img" src="/about-dish-2.svg" alt="noodle bowl" sx={{ flex: 1, width: '33.33%', height: '100%', objectFit: 'cover' }} />
                          <Box component="img" src="/about-dish-1.svg" alt="fresh salad" sx={{ flex: 1, width: '33.33%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                        </Box>
                      </Box>
                      {/* Box 2: single image */}
                      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                        <Box component="img" src="/about-dish-2.svg" alt="bowl" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      {/* Box 3: single image */}
                      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                        <Box component="img" src="/about-dish-1.svg" alt="salad" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Our Quality */}
          <Box sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
              Why families choose us
            </Typography>
            <Grid container spacing={3}>
              {[{
                icon: <Shield color="primary" />, title: 'Safe & Private',
                desc: 'Your data stays secure. We only use what you provide for better recipes.'
              },{
                icon: <Verified color="primary" />, title: 'Reliable Steps',
                desc: 'Clear, tested instructions that even beginners can follow.'
              },{
                icon: <EmojiFoodBeverage color="primary" />, title: 'Kid‑approved',
                desc: 'We favor balanced, gentle flavors with easy swaps.'
              },{
                icon: <LocalDining color="primary" />, title: 'Smart meal ideas',
                desc: 'Use what you have: quick one‑pots, lunchbox‑ready, and leftovers‑friendly.'
              }].map((f, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Box sx={{ mb: 1 }}>{f.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Reviews placeholder */}
          <Box sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              What moms say
            </Typography>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Reviews coming soon — we’ll add real stories from our users here.
              </Typography>
            </Paper>
          </Box>

          {/* Footer / Contact */}
          <Box component="footer" sx={{ py: 5 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Contact us</Typography>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Email fontSize="small" />
                    <Typography variant="body2">deepvaishnav207@gmail.com</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Phone fontSize="small" />
                    <Typography variant="body2">+91 7043041707</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Follow</Typography>
                  <Stack direction="row" spacing={2}>
                    <Chip icon={<Instagram />} label="Instagram" variant="outlined" clickable />
                    <Chip icon={<Twitter />} label="Twitter" variant="outlined" clickable />
                  </Stack>
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
                © {new Date().getFullYear()} Chef Claude. All rights reserved.
              </Typography>
            </Paper>
          </Box>
        </>
      )}


      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default Home;
