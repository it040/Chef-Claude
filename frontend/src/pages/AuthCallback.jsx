import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Container } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const timer = setTimeout(async () => {
      await checkAuthStatus();
      navigate('/', { replace: true });
    }, 200);
    return () => clearTimeout(timer);
  }, [checkAuthStatus, navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    </Container>
  );
};

export default AuthCallback;


