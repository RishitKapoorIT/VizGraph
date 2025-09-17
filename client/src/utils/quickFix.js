// Quick fix for Chart Studio authentication issues
export const quickAuthFix = () => {
  console.log('=== QUICK AUTH FIX ===');
  
  // Check current token
  const token = localStorage.getItem('token');
  console.log('Current token exists:', !!token);
  
  if (!token) {
    console.log('No token found - attempting quick login');
    
    // Quick login function
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('✅ Token obtained and stored');
        window.location.reload();
      } else {
        console.error('❌ Login failed:', data);
        // Enable demo mode as fallback
        enableDemoMode();
      }
    })
    .catch(err => {
      console.error('❌ Login error:', err);
      // Enable demo mode as fallback
      enableDemoMode();
    });
  } else {
    console.log('Token exists, testing API call...');
    
    // Test API call
    fetch('/api/analysis', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      console.log('API test status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('API test response:', data);
      if (data.success !== false) {
        console.log('✅ Token is working');
      } else {
        console.log('❌ Token invalid, enabling demo mode...');
        enableDemoMode();
      }
    })
    .catch(err => {
      console.error('❌ API test failed, enabling demo mode:', err);
      enableDemoMode();
    });
  }
};

// Enable demo mode for easier testing
export const enableDemoMode = () => {
  console.log('🎭 Enabling demo mode...');
  localStorage.setItem('demoMode', 'true');
  localStorage.setItem('skipAuthRedirect', 'true');
  localStorage.setItem('token', 'demo-token-' + Date.now());
  console.log('✅ Demo mode enabled - authentication bypassed');
  window.location.reload();
};

// Disable demo mode
export const disableDemoMode = () => {
  console.log('🔒 Disabling demo mode...');
  localStorage.removeItem('demoMode');
  localStorage.removeItem('skipAuthRedirect');
  localStorage.removeItem('token');
  console.log('✅ Demo mode disabled');
  window.location.href = '/login';
};

// Make it globally available
window.quickAuthFix = quickAuthFix;
window.enableDemoMode = enableDemoMode;
window.disableDemoMode = disableDemoMode;

export default quickAuthFix;