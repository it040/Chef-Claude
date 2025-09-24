import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Restaurant, Google } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const googleAuthUrl = `${apiBase}/api/auth/google`;
  const handleGoogleClick = (e) => {
    try {
      window.location.assign(googleAuthUrl);
    } catch (_) {
      window.location.href = googleAuthUrl;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 4, md: 6 }, 
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 4 }}>
          <Restaurant 
            sx={{ 
              fontSize: 80, 
              color: 'primary.main',
              mb: 2 
            }} 
          />
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              background: (th) => `linear-gradient(45deg, ${th.palette.primary.main}, ${th.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Chef Claude
          </Typography>
        </Box>

        {/* Welcome Message */}
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 1.5
          }}
        >
          Welcome back!
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          Sign in to save favorite recipes, build collections, and get personalized suggestions.
        </Typography>

        {/* Professional Google Sign-In */}
        <Button
          component="a"
          href={googleAuthUrl}
          onClick={handleGoogleClick}
          variant="outlined"
          size="large"
          startIcon={<Google sx={{ color: '#4285F4' }} />}
          sx={{
            bgcolor: '#fff',
            color: '#3c4043',
            borderColor: '#dadce0',
            px: 3.5,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 28,
            textTransform: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: '#fff',
              borderColor: '#dadce0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            },
            ...(isDark && { boxShadow: '0 1px 2px rgba(0,0,0,0.6)' }),
          }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* Benefits */}
        <Box sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 1.5 }}>
            What you'll get:
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: 'text.secondary', m: 0 }}>
            <li>Save and organize your favorite recipes</li>
            <li>Personalized recommendations tailored to your tastes</li>
            <li>Dietary preferences and allergy tracking</li>
            <li>Recipe collections and meal planning</li>
            <li>Community features and recipe sharing</li>
          </Box>
        </Box>

        {/* Privacy Note */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            We respect your privacy. We only access your basic profile information (name and email) to improve your experience.
          </Typography>
        </Alert>

        {/* Back to Home */}
        <Button
          variant="text"
          onClick={() => navigate('/')}
          sx={{ 
            mt: 3,
            textTransform: 'none',
            color: 'text.secondary'
          }}
        >
          ← Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
