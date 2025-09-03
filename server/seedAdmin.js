import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});

    const adminEmail = 'admin@admin.com';
    
    // First, delete any existing user with this email to ensure a clean slate
    await User.deleteOne({ email: adminEmail });
    console.log('Removed existing admin user if any.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('QW12rk', salt);

    const adminUser = new User({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedAdmin();
