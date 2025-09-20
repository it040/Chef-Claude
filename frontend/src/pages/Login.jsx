import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Restaurant, Google } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
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
          p: 6, 
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
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
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
            fontWeight: 500,
            color: 'text.primary',
            mb: 2
          }}
        >
          Welcome Back!
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 4, lineHeight: 1.6 }}
        >
          Sign in to save your favorite recipes, create your own collections, 
          and personalize your culinary experience with Chef Claude.
        </Typography>

        {/* Benefits */}
        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            What you'll get:
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
            <li>Save and organize your favorite recipes</li>
            <li>Personalized recipe recommendations</li>
            <li>Dietary preferences and allergy tracking</li>
            <li>Recipe collections and meal planning</li>
            <li>Community features and recipe sharing</li>
          </Box>
        </Box>

        {/* Google Sign In Button */}
        <Button
          component="a"
          href={googleAuthUrl}
          onClick={handleGoogleClick}
          variant="contained"
          size="large"
          startIcon={<Google />}
          sx={{
            bgcolor: '#4285f4',
            color: 'white',
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            mb: 3,
            '&:hover': {
              bgcolor: '#357ae8',
            },
          }}
        >
          Continue with Google
        </Button>

        {/* Privacy Note */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            We respect your privacy. We only access your basic profile information 
            (name and email) to provide you with the best cooking experience.
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
