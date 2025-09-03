import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose"; 

// Load environment variables from .env file
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://vizgraph.netlify.app',
        'https://main--vizgraph.netlify.app',
        // Add your actual Netlify domain here
      ]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import analysisRoutes from './routes/analysis.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'VizGraph API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// CONFIG
const PORT = process.env.PORT || 5000;

// MONGO CONNECTION
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI exists:', !!process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
  // SSL/TLS options to fix compatibility issues
  ssl: true,
  tlsInsecure: false,
})
.then(() => {
  console.log("✅ MongoDB Connected successfully");
  console.log("Database:", mongoose.connection.name);
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  console.error("Full error:", err);
  process.exit(1); // Exit if can't connect to database
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// EXPORTS
export default app;
