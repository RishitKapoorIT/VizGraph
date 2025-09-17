// Simple utility to clear authentication and redirect to login
export const clearAuthAndRedirect = () => {
  try {
    // Clear all authentication-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    
    // Clear any other auth-related session storage
    sessionStorage.clear();
    
    console.log('Authentication cleared successfully');
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error clearing authentication:', error);
    // Still try to redirect even if clearing fails
    window.location.href = '/login';
  }
};

// Function to check and handle auth errors
export const handleAuthError = (error) => {
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    console.log('Authentication error detected, clearing auth and redirecting');
    clearAuthAndRedirect();
    return true;
  }
  return false;
};

export default clearAuthAndRedirect;