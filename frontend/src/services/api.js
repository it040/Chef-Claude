import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid. Clear local state and let app routing handle navigation.
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } catch {}
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  // Get current user profile
  getProfile: () => api.get('/auth/me'),
  
  // Update user preferences and privacy settings
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Delete account
  deleteAccount: () => api.delete('/auth/account'),
};

// Contact API
export const contactAPI = {
  send: (data) => api.post('/contact', data),
};

// Recipe API
export const recipeAPI = {
  // Generate AI recipe
  generateRecipe: (data) => api.post('/recipes/generate', data),
  
  // Get all recipes with filters
  getRecipes: (params = {}) => api.get('/recipes', { params }),
  
  // Get single recipe
  getRecipe: (id) => api.get(`/recipes/${id}`),
  
  // Save recipe to user collection
  saveRecipe: (id) => api.post(`/recipes/${id}/save`),
  
  // Remove recipe from collection
  unsaveRecipe: (id) => api.delete(`/recipes/${id}/save`),
  
  // Like/unlike recipe
  toggleLike: (id) => api.post(`/recipes/${id}/like`),
  
  // Add comment to recipe
  addComment: (id, commentData) => api.post(`/recipes/${id}/comments`, commentData),
  
  // Update recipe (author only)
  updateRecipe: (id, data) => api.put(`/recipes/${id}`, data),
  
  // Delete recipe (author only)
  deleteRecipe: (id) => api.delete(`/recipes/${id}`),

  // Archive toggle
  archive: (id) => api.post(`/recipes/${id}/archive`),
  unarchive: (id) => api.delete(`/recipes/${id}/archive`),
};

// User API
export const userAPI = {
  // Get user's saved recipes
  getSavedRecipes: (params = {}) => api.get('/users/me/recipes', { params }),
  
  // Get user's favorite recipes
  getFavoriteRecipes: (params = {}) => api.get('/users/me/favorites', { params }),
  
  // Get user's created recipes
  getCreatedRecipes: (params = {}) => api.get('/users/me/created', { params }),
  
  // Get user statistics
  getUserStats: () => api.get('/users/me/stats'),
  
  // Get public user profile
  getUserProfile: (id) => api.get(`/users/${id}/profile`),
  
  // Get user's public recipes
  getUserRecipes: (id, params = {}) => api.get(`/users/${id}/recipes`, { params }),
  
  // Update user profile
  updateProfile: (data) => api.put('/users/me/profile', data),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
