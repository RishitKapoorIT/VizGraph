// Quick test login utility - place this in browser console
window.testLogin = async () => {
  try {
    console.log('Testing login...');
    
    // Clear any existing tokens
    localStorage.removeItem('token');
    
    // Test login API directly
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('Token stored successfully');
      
      // Test token immediately
      const testResponse = await fetch('/api/analysis', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      console.log('Test API call status:', testResponse.status);
      const testData = await testResponse.json();
      console.log('Test API response:', testData);
      
      if (testResponse.ok) {
        console.log('✅ Login and API test successful!');
        window.location.reload();
      } else {
        console.error('❌ API test failed');
      }
    } else {
      console.error('❌ No token received');
    }
  } catch (error) {
    console.error('❌ Test login failed:', error);
  }
};

console.log('Test utility loaded. Run window.testLogin() to test authentication.');