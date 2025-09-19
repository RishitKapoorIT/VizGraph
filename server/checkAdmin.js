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

const checkAndFixAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vizgraph';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('👤 Found admin user:', admin.email);
    
    // Test if the current password is 'admin123'
    const isCorrectPassword = await bcryptjs.compare('admin123', admin.password);
    console.log('🔍 Current password is "admin123":', isCorrectPassword);
    
    if (!isCorrectPassword) {
      // Update the password to admin123
      const saltRounds = 12;
      const hashedPassword = await bcryptjs.hash('admin123', saltRounds);
      
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('✅ Password updated to "admin123"');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Password is already correct');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: admin123');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Run the script
checkAndFixAdmin();