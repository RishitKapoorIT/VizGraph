import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import FileData from './models/FileData.js';
import Analysis from './models/Analysis.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});

    // Clear existing data
    // await User.deleteMany({});
    // await FileData.deleteMany({});
    // await Analysis.deleteMany({});

    console.log('Cleared existing data.');

    // Create users
    const salt = await bcrypt.genSalt(10);
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', salt),
        role: 'admin'
      },
      {
        name: 'Test User 1',
        email: 'user1@example.com',
        password: await bcrypt.hash('password123', salt),
      },
      {
        name: 'Test User 2',
        email: 'user2@example.com',
        password: await bcrypt.hash('password123', salt),
      }
    ]);

    console.log(`${users.length} users created.`);

    // Create files
    const files = await FileData.create([
      { user: users[1]._id, filename: 'sales_data.csv', s3Key: 'key1', fileUrl: 'url1', data: [] },
      { user: users[2]._id, filename: 'market_research.xlsx', s3Key: 'key2', fileUrl: 'url2', data: [] },
      { user: users[2]._id, filename: 'customer_feedback.csv', s3Key: 'key3', fileUrl: 'url3', data: [] },
    ]);

    console.log(`${files.length} files created.`);

    // Create analyses
    const analyses = await Analysis.create([
      {
        user: users[1]._id,
        fileData: files[0]._id,
        title: 'Sales Analysis',
        settings: { chartType: 'bar', xAxis: 'Month', yAxis: 'Sales' }
      },
      {
        user: users[2]._id,
        fileData: files[1]._id,
        title: 'Market Analysis',
        settings: { chartType: 'pie', xAxis: 'Region', yAxis: 'MarketShare' }
      },
      {
        user: users[2]._id,
        fileData: files[2]._id,
        title: 'Feedback Analysis',
        settings: { chartType: 'line', xAxis: 'Date', yAxis: 'Rating' }
      },
      {
        user: users[2]._id,
        fileData: files[2]._id,
        title: 'Feedback Summary',
        settings: { chartType: 'bar', xAxis: 'Category', yAxis: 'Count' }
      }
    ]);

    console.log(`${analyses.length} analyses created.`);

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedData();
