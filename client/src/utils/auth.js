import { jwtDecode } from 'jwt-decode';

// Token utility functions with proper error handling
export const tokenUtils = {
  // Get token from localStorage
  getToken: () => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  },

  // Set token in localStorage
  setToken: (token) => {
    try {
      localStorage.setItem('token', token);
      return true;
    } catch (error) {
      console.error('Error setting token in localStorage:', error);
      return false;
    }
  },

  // Remove token from localStorage
  removeToken: () => {
    try {
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
      return false;
    }
  },

  // Safely decode JWT token with validation
  decodeToken: (token = null) => {
    try {
      const tokenToUse = token || tokenUtils.getToken();
      
      if (!tokenToUse) {
        return null;
      }

      // Basic token format validation
      const parts = tokenToUse.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format');
        return null;
      }

      const decoded = jwtDecode(tokenToUse);
      
      // Check if token is expired
      if (decoded.exp && (decoded.exp * 1000) < Date.now()) {
        console.warn('Token is expired');
        tokenUtils.removeToken();
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const decoded = tokenUtils.decodeToken();
    return decoded !== null;
  },

  // Get current user info from token
  getCurrentUser: () => {
    const decoded = tokenUtils.decodeToken();
    return decoded ? decoded.user : null;
  },

  // Check if current user is admin
  isAdmin: () => {
    const user = tokenUtils.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Check if token is close to expiring (within 1 hour)
  isTokenExpiringSoon: () => {
    const decoded = tokenUtils.decodeToken();
    if (!decoded || !decoded.exp) return false;
    
    const expirationTime = decoded.exp * 1000;
    const oneHourFromNow = Date.now() + (60 * 60 * 1000);
    
    return expirationTime < oneHourFromNow;
  },

  // Get time until token expires (in minutes)
  getTimeUntilExpiry: () => {
    const decoded = tokenUtils.decodeToken();
    if (!decoded || !decoded.exp) return null;
    
    const expirationTime = decoded.exp * 1000;
    const now = Date.now();
    
    if (expirationTime <= now) return 0;
    
    return Math.floor((expirationTime - now) / (1000 * 60));
  }
};

// Auth context helper functions
export const authHelpers = {
  // Handle logout with cleanup
  logout: () => {
    tokenUtils.removeToken();
    // You can add more cleanup here if needed
    window.location.href = '/login';
  },

  // Handle login success
  handleLoginSuccess: (token, redirectPath = '/dashboard') => {
    if (tokenUtils.setToken(token)) {
      window.location.href = redirectPath;
    } else {
      console.error('Failed to store authentication token');
    }
  },

  // Check auth and redirect if not authenticated
  requireAuth: (redirectPath = '/login') => {
    if (!tokenUtils.isAuthenticated()) {
      window.location.href = redirectPath;
      return false;
    }
    return true;
  },

  // Check admin and redirect if not admin
  requireAdmin: (redirectPath = '/dashboard') => {
    if (!tokenUtils.isAdmin()) {
      window.location.href = redirectPath;
      return false;
    }
    return true;
  }
};

export default tokenUtils;