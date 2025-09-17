import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Define a minimal User schema for this script
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

// Use existing model or create a new one to avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

const fixAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the .env file');
    }
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@admin.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD is not set in the .env file');
    }

    // Find the admin user
    let adminUser = await User.findOne({ email: adminEmail });

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash(adminPassword, saltRounds);

    if (adminUser) {
      // If admin exists, update the password
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('✅ Admin user found and password has been updated successfully.');
    } else {
      // If admin does not exist, create a new one
      adminUser = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      await adminUser.save();
      console.log('✅ No existing admin found. A new admin user has been created.');
    }

    console.log('--- Admin Details ---');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('---------------------');

  } catch (error) {
    console.error('❌ Error fixing admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Run the script
fixAdmin();
