import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useTheme,
} from '@mui/material';
import {
  Restaurant,
  AccountCircle,
  Favorite,
  ExitToApp,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onToggleTheme, mode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    // Navigate to dedicated login page
    navigate('/login');
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSavedClick = () => {
    handleMenuClose();
    navigate('/saved');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="fixed" 
      elevation={1}
      sx={{ 
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            mr: 4 
          }}
          onClick={() => navigate('/')}
        >
          <Restaurant 
            sx={{ 
              color: 'primary.main', 
              mr: 1,
              fontSize: 32 
            }} 
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.5rem'
            }}
          >
            Chef Claude
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <IconButton aria-label="toggle theme" onClick={onToggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ 
              mr: 2,
              color: isActive('/') ? 'primary.main' : 'text.primary',
              fontWeight: isActive('/') ? 600 : 400,
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/recent')}
            sx={{ 
              mr: 2,
              color: isActive('/recent') ? 'primary.main' : 'text.primary',
              fontWeight: isActive('/recent') ? 600 : 400,
            }}
          >
            Recent
          </Button>
          {isAuthenticated && (
            <Button
              color="inherit"
              onClick={() => navigate('/saved')}
              sx={{ 
                mr: 2,
                color: isActive('/saved') ? 'primary.main' : 'text.primary',
                fontWeight: isActive('/saved') ? 600 : 400,
              }}
            >
              Saved Recipes
            </Button>
          )}
        </Box>

        {/* User Menu */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <MenuItem onClick={handleProfileClick}>
                <AccountCircle sx={{ mr: 2 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={handleLogin}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
