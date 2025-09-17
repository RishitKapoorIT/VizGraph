// Debug utility to check authentication state
export const debugAuth = () => {
  const token = localStorage.getItem('token');
  console.log('=== AUTH DEBUG ===');
  console.log('Token exists:', !!token);
  console.log('Token length:', token ? token.length : 0);
  
  if (token) {
    try {
      // Basic JWT structure check
      const parts = token.split('.');
      console.log('Token parts:', parts.length);
      
      if (parts.length === 3) {
        // Decode payload without verification
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Current time:', new Date());
        console.log('Token expired:', payload.exp * 1000 < Date.now());
      }
    } catch (e) {
      console.error('Token decode error:', e);
    }
  }
  
  console.log('Current path:', window.location.pathname);
  console.log('==================');
};

// Add to window for easy access in browser console
window.debugAuth = debugAuth;

export default debugAuth;