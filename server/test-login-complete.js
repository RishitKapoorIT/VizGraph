// Comprehensive login test to verify the fix worked
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  profilePicture: { type: String }
});

const User = mongoose.model('User', userSchema);

const testLoginSystem = async () => {
  try {
    console.log('🧪 COMPREHENSIVE LOGIN SYSTEM TEST');
    console.log('=====================================\n');

    // 1. Test Database Connection
    console.log('1️⃣ Testing Database Connection...');
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vizgraph';
    await mongoose.connect(mongoURI);
    console.log('✅ Database connected successfully\n');

    // 2. Verify User Accounts
    console.log('2️⃣ Verifying User Accounts...');
    const adminUser = await User.findOne({ email: 'admin@admin.com' }).select('+password');
    const gmailUser = await User.findOne({ email: 'rishisinghhone@gmail.com' }).select('+password');

    if (adminUser) {
      const adminPasswordTest = await bcryptjs.compare('password', adminUser.password);
      console.log(`✅ Admin account exists: admin@admin.com`);
      console.log(`${adminPasswordTest ? '✅' : '❌'} Admin password 'password' works: ${adminPasswordTest}`);
    } else {
      console.log('❌ Admin account not found');
    }

    if (gmailUser) {
      const gmailPasswordTest = await bcryptjs.compare('defaultpassword', gmailUser.password);
      console.log(`✅ Gmail account exists: rishisinghhone@gmail.com`);
      console.log(`${gmailPasswordTest ? '✅' : '❌'} Gmail password 'defaultpassword' works: ${gmailPasswordTest}`);
    } else {
      console.log('❌ Gmail account not found');
    }
    console.log('');

    // 3. Test Backend API Login Endpoint
    console.log('3️⃣ Testing Backend Login API...');
    
    // Test Admin Login
    try {
      const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@admin.com',
        password: 'password'
      });
      
      console.log('✅ Admin login API call successful');
      console.log(`🔑 Token received: ${!!adminLoginResponse.data.token}`);
      console.log(`👤 User role: ${adminLoginResponse.data.user?.role}`);
      console.log(`📧 User email: ${adminLoginResponse.data.user?.email}`);
    } catch (adminError) {
      console.log('❌ Admin login API call failed');
      console.log(`   Status: ${adminError.response?.status}`);
      console.log(`   Message: ${adminError.response?.data?.message}`);
      console.log(`   Code: ${adminError.response?.data?.code}`);
    }

    // Test Gmail Login
    try {
      const gmailLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'rishisinghhone@gmail.com',
        password: 'defaultpassword'
      });
      
      console.log('✅ Gmail login API call successful');
      console.log(`🔑 Token received: ${!!gmailLoginResponse.data.token}`);
      console.log(`👤 User role: ${gmailLoginResponse.data.user?.role}`);
      console.log(`📧 User email: ${gmailLoginResponse.data.user?.email}`);
    } catch (gmailError) {
      console.log('❌ Gmail login API call failed');
      console.log(`   Status: ${gmailError.response?.status}`);
      console.log(`   Message: ${gmailError.response?.data?.message}`);
      console.log(`   Code: ${gmailError.response?.data?.code}`);
    }
    console.log('');

    // 4. Check Server Status
    console.log('4️⃣ Checking Server Status...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Server is running and healthy');
      console.log(`📊 Status: ${healthResponse.data.status}`);
      console.log(`⏱️ Uptime: ${Math.round(healthResponse.data.uptime)} seconds`);
    } catch (healthError) {
      console.log('❌ Server health check failed');
      console.log(`   Error: ${healthError.message}`);
    }

    console.log('\n🎯 FINAL TEST SUMMARY:');
    console.log('======================');
    console.log('If you see ✅ for both login API calls above, the login system is working!');
    console.log('You can now use these credentials in the browser:');
    console.log('');
    console.log('🔐 Admin Login:');
    console.log('   Email: admin@admin.com');
    console.log('   Password: password');
    console.log('');
    console.log('🔐 User Login:');
    console.log('   Email: rishisinghhone@gmail.com');
    console.log('   Password: defaultpassword');
    console.log('');
    console.log('🌐 Login URL: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📡 Database connection closed');
    }
    process.exit(0);
  }
};

// Run the comprehensive test
testLoginSystem();