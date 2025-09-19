// Debug login response to see what's actually being returned
import axios from 'axios';

const debugLoginResponse = async () => {
  try {
    console.log('🔍 DEBUGGING LOGIN RESPONSE FORMAT\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    console.log('✅ Login API Response:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Full Response Data:', JSON.stringify(response.data, null, 2));
    
    // Check specific properties
    console.log('\n🔍 Response Analysis:');
    console.log('response.data exists:', !!response.data);
    console.log('response.data.token exists:', !!response.data.token);
    console.log('response.data.user exists:', !!response.data.user);
    console.log('response.data.success exists:', !!response.data.success);
    console.log('response.data.data exists:', !!response.data.data);
    
    if (response.data.data) {
      console.log('\n📦 Nested Data Object:');
      console.log('response.data.data.token exists:', !!response.data.data.token);
      console.log('response.data.data.user exists:', !!response.data.data.user);
    }
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
  }
};

debugLoginResponse();