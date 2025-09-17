// Test script to verify login functionality
// Run this in Node.js to test the backend directly

const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing login functionality...');
    
    const loginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    
    console.log('📝 Attempting login with:', loginData.email);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
    
    console.log('✅ Login successful!');
    console.log('🔑 Token received:', !!response.data.token);
    console.log('👤 User data:', response.data.user);
    
    if (response.data.token) {
      console.log('🎯 Token length:', response.data.token.length);
      
      // Test protected endpoint
      console.log('\n🔒 Testing protected endpoint...');
      const analysesResponse = await axios.get('http://localhost:5000/api/analyses', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Protected endpoint accessible!');
      console.log('📊 Analyses count:', analysesResponse.data.length);
    }
    
  } catch (error) {
    console.error('❌ Login test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Code:', error.response.data.code);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the test
testLogin();