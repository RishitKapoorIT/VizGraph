// Quick login test and user setup script
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
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

const setupUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vizgraph';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check existing users
    console.log('\n📋 EXISTING USERS:');
    const allUsers = await User.find({}).select('name email role');
    allUsers.forEach(user => {
      console.log(`👤 ${user.name} - ${user.email} (${user.role})`);
    });

    // Test admin login credentials
    console.log('\n🔍 TESTING ADMIN CREDENTIALS:');
    const adminUser = await User.findOne({ email: 'admin@admin.com' }).select('+password');
    if (adminUser) {
      const testPassword = 'password';
      const isMatch = await bcryptjs.compare(testPassword, adminUser.password);
      console.log(`📧 admin@admin.com - Password 'password' works: ${isMatch ? '✅' : '❌'}`);
    } else {
      console.log('❌ Admin user not found');
    }

    // Check if Gmail user exists
    console.log('\n📮 CHECKING GMAIL USER:');
    const gmailUser = await User.findOne({ email: 'rishisinghhone@gmail.com' });
    if (gmailUser) {
      console.log('✅ Gmail user exists:', gmailUser.name);
    } else {
      console.log('❌ Gmail user does not exist. Creating...');
      
      // Create Gmail user
      const hashedPassword = await bcryptjs.hash('defaultpassword', 12);
      const newUser = new User({
        name: 'Rishi Singh',
        email: 'rishisinghhone@gmail.com',
        password: hashedPassword,
        role: 'user'
      });
      
      await newUser.save();
      console.log('✅ Gmail user created successfully!');
      console.log('📧 Email: rishisinghhone@gmail.com');
      console.log('🔑 Password: defaultpassword');
    }

    console.log('\n🎯 SUMMARY OF WORKING CREDENTIALS:');
    console.log('1. Admin: admin@admin.com / password');
    console.log('2. Gmail: rishisinghhone@gmail.com / defaultpassword');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
    process.exit(0);
  }
};

// Run the script
setupUsers();