import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Schemas
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

const analysisSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  settings: {
    chartType: { type: String, required: true },
    xAxis: { type: String },
    yAxis: { type: String },
    zAxis: { type: String },
    title: { type: String },
    theme: { type: String, default: 'light' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  size: { type: Number },
  mimeType: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);
const File = mongoose.model('File', fileSchema);

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vizgraph';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (be careful in production!)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Analysis.deleteMany({});
    await File.deleteMany({});

    // Create admin user
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash('password', saltRounds);

    const admin = new User({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created');

    // Create sample users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const userPassword = await bcryptjs.hash('password123', saltRounds);
      const user = new User({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: userPassword,
        role: 'user',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
      await user.save();
      users.push(user);
    }
    console.log('✅ Sample users created');

    // Create sample analyses
    const chartTypes = ['bar', 'line', 'pie', 'scatter', 'bar3d', 'line3d'];
    const sampleData = [
      { category: 'A', value: 10, date: '2024-01-01' },
      { category: 'B', value: 20, date: '2024-01-02' },
      { category: 'C', value: 15, date: '2024-01-03' },
      { category: 'D', value: 25, date: '2024-01-04' },
      { category: 'E', value: 18, date: '2024-01-05' }
    ];

    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomChartType = chartTypes[Math.floor(Math.random() * chartTypes.length)];
      
      const analysis = new Analysis({
        name: `Sample Analysis ${i + 1}`,
        userId: randomUser._id,
        data: sampleData,
        settings: {
          chartType: randomChartType,
          xAxis: 'category',
          yAxis: 'value',
          title: `${randomChartType.charAt(0).toUpperCase() + randomChartType.slice(1)} Chart ${i + 1}`,
          theme: Math.random() > 0.5 ? 'light' : 'dark'
        },
        createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) // Random date within last 15 days
      });
      
      await analysis.save();
    }
    console.log('✅ Sample analyses created');

    // Create sample files
    for (let i = 0; i < 5; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const file = new File({
        filename: `sample_data_${i + 1}.csv`,
        originalName: `Sample Data ${i + 1}.csv`,
        userId: randomUser._id,
        data: sampleData,
        size: JSON.stringify(sampleData).length,
        mimeType: 'text/csv',
        uploadedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000) // Random date within last 20 days
      });
      
      await file.save();
    }
    console.log('✅ Sample files created');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('👑 Admin: admin@admin.com / password');
    console.log('👤 Users: user1@example.com to user5@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Run the script
seedData();