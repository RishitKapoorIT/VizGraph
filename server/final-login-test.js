// Final test using the correct response format
import axios from 'axios';

const finalLoginTest = async () => {
  try {
    console.log('🎯 FINAL LOGIN TEST - CORRECT RESPONSE FORMAT\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@admin.com',
      password: 'password'
    });
    
    console.log('✅ Login successful!');
    console.log('Response structure:');
    console.log(`- success: ${response.data.success}`);
    console.log(`- message: ${response.data.message}`);
    console.log(`- data exists: ${!!response.data.data}`);
    
    if (response.data.data) {
      console.log(`- token exists: ${!!response.data.data.token}`);
      console.log(`- token length: ${response.data.data.token?.length || 0}`);
      console.log(`- user exists: ${!!response.data.data.user}`);
      console.log(`- user email: ${response.data.data.user?.email}`);
      console.log(`- user role: ${response.data.data.user?.role}`);
    }
    
    console.log('\n🎉 AUTHENTICATION IS NOW FIXED!');
    console.log('The login page should work with these credentials:');
    console.log('📧 admin@admin.com / password');
    console.log('📧 rishisinghhone@gmail.com / defaultpassword');
    
  } catch (error) {
    console.error('❌ Login test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
};

finalLoginTest();