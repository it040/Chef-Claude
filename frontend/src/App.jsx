import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { PromptProvider } from './context/PromptContext';
import Navbar from './components/Navbar';
import PromptSidebar from './components/PromptSidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import SavedRecipes from './pages/SavedRecipes';
import RecipeDetail from './pages/RecipeDetail';
import Recent from './pages/Recent';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Box from '@mui/material/Box';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';

// Dynamic Material-UI theme (supports light/dark)
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#ff6b35',
      light: '#ff8a65',
      dark: '#e64a19',
    },
    secondary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    background: mode === 'dark'
      ? { default: '#0f1115', paper: '#161a22' }
      : { default: '#fafafa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': { boxShadow: mode === 'dark' ? '0 6px 20px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.15)' },
        },
      },
    },
  },
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

function AppShell({ mode, onToggleTheme }) {
  const [promptOpen, setPromptOpen] = React.useState(false);
  const drawerWidth = 280;
  const { isAuthenticated } = useAuth();

  return (
    <div className="App" style={{ display: 'flex' }}>
      {isAuthenticated && (
        <PromptSidebar open={promptOpen} onClose={() => setPromptOpen(false)} />
      )}
      <Box component="div" sx={{ flexGrow: 1, width: '100%' }}>
        <Navbar mode={mode} onToggleTheme={onToggleTheme} onOpenPrompts={() => setPromptOpen(true)} />
        <Box component="main" sx={{ mt: '64px', px: 0, ml: { md: isAuthenticated ? `${drawerWidth}px` : 0 } }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            
            {/* Protected routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/saved" 
              element={
                <ProtectedRoute>
                  <SavedRecipes />
                </ProtectedRoute>
              } 
            />

            {/* Public pages */}
            <Route path="/recent" element={<Recent />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </div>
  );
}

function App() {
  const [mode, setMode] = React.useState(() => localStorage.getItem('chef_theme_mode') || 'light');
  const theme = React.useMemo(() => getTheme(mode), [mode]);
  const toggleTheme = () => {
    setMode((m) => {
      const next = m === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('chef_theme_mode', next); } catch {}
      return next;
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <PromptProvider>
            <Router>
              <AppShell mode={mode} onToggleTheme={toggleTheme} />
            </Router>
          </PromptProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;