// Fix admin password to match .env file
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

const fixAdminPassword = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vizgraph';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get admin password from .env
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'password';
    console.log('🔑 Setting admin password to:', adminPassword);

    // Hash the password
    const hashedPassword = await bcryptjs.hash(adminPassword, 12);

    // Update admin password
    const result = await User.updateOne(
      { email: 'admin@admin.com' },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Admin password updated successfully!');
      
      // Test the password
      const adminUser = await User.findOne({ email: 'admin@admin.com' }).select('+password');
      const isMatch = await bcryptjs.compare(adminPassword, adminUser.password);
      console.log('🧪 Password test result:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
      
    } else {
      console.log('❌ Admin user not found');
    }

    console.log('\n🎯 WORKING CREDENTIALS:');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Password:', adminPassword);
    console.log('📧 Email: rishisinghhone@gmail.com');
    console.log('🔑 Password: defaultpassword');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
    process.exit(0);
  }
};

// Run the script
fixAdminPassword();