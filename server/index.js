import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { extname } from 'path';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import multer from 'multer';
import xlsx from 'xlsx';
import fetch from 'node-fetch';
import { createCanvas } from 'canvas';
import winston from 'winston';
import compression from 'compression';
import { v4 as uuidv4 } from 'uuid';
import 'chart.js/auto'; // server-side Chart.js registration
/* global Chart */

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vizgraph-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Request ID middleware
const requestId = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  logger.info(`${req.method} ${req.url}`, { requestId: req.id, ip: req.ip });
  next();
};

// Create app
const app = express();

// Basic middlewares (simplified for internship project)
app.use(requestId);
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for easier development
  hsts: false // Disabled for local development
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simplified sanitization (removed express-mongo-sanitize which causes issues)
app.use((req, res, next) => {
  // Basic XSS protection without modifying request properties
  if (req.body && typeof req.body === 'object') {
    req.body = JSON.parse(JSON.stringify(req.body).replace(/<script[^>]*>.*?<\/script>/gi, ''));
  }
  next();
});

// Simplified rate limiting for development
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { 
      success: false,
      message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Simple handler without complex logging
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  });
};

// Very relaxed rate limits for development
const generalLimiter = createRateLimiter(15 * 60 * 1000, 1000, 'Too many requests, please try again later.');
const authLimiter = createRateLimiter(15 * 60 * 1000, 50, 'Too many authentication attempts, please try again later.');
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 100, 'Too many file uploads, please try again later.');

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/upload', uploadLimiter);

// CORS Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, 'https://vizgraph.netlify.app'].filter(Boolean)
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vizgraph';
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    };
    
    await mongoose.connect(mongoURI, options);
    logger.info('✅ MongoDB Connected Successfully', { 
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });
    
    // Database event listeners
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', { error: error.message });
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
  } catch (error) {
    logger.error('❌ MongoDB Connection Error:', { 
      error: error.message,
      retries: retries - 1
    });
    
    if (retries > 1) {
      logger.info(`Retrying database connection in 5 seconds... (${retries - 1} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    
    logger.error('Failed to connect to database after all retries');
    process.exit(1);
  }
};

// Schemas with enhanced validation and indexing
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: { 
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: { type: String },
  role: { 
    type: String, 
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either user or admin'
    }, 
    default: 'user' 
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  profilePicture: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Profile picture must be a valid image URL'
    }
  },
  isActive: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, {
  timestamps: true
});

// User schema indexes (declared separately to avoid duplicates)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// User schema methods
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1, loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hour lock
  }
  
  return this.updateOne(updates);
};

const analysisSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Analysis name is required'],
    trim: true,
    minlength: [1, 'Analysis name cannot be empty'],
    maxlength: [100, 'Analysis name cannot exceed 100 characters']
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required']
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    required: [true, 'Analysis data is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Data must be a non-empty array'
    }
  },
  settings: {
    chartType: { 
      type: String, 
      required: [true, 'Chart type is required'],
      enum: {
        values: ['bar', 'line', 'pie', 'doughnut', 'scatter', 'bubble', 'radar', 'polarArea'],
        message: 'Invalid chart type'
      }
    },
    xAxis: { type: String, trim: true },
    yAxis: { type: String, trim: true },
    zAxis: { type: String, trim: true },
    title: { 
      type: String, 
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    theme: { 
      type: String, 
      enum: ['light', 'dark'], 
      default: 'light' 
    },
    colors: [String],
    showLegend: { type: Boolean, default: true },
    showGrid: { type: Boolean, default: true }
  },
  tags: [{ 
    type: String, 
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPublic: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Analysis schema indexes
analysisSchema.index({ userId: 1, updatedAt: -1 });
analysisSchema.index({ userId: 1, name: 1 });
analysisSchema.index({ 'settings.chartType': 1 });
analysisSchema.index({ tags: 1 });
analysisSchema.index({ isPublic: 1, createdAt: -1 });
analysisSchema.index({ views: -1 });

// Pre-save middleware to update updatedAt
analysisSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const fileSchema = new mongoose.Schema({
  filename: { 
    type: String, 
    required: [true, 'Filename is required'],
    trim: true,
    maxlength: [255, 'Filename cannot exceed 255 characters']
  },
  originalName: { 
    type: String, 
    required: [true, 'Original filename is required'],
    trim: true,
    maxlength: [255, 'Original filename cannot exceed 255 characters']
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'],
    index: true
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    required: [true, 'File data is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'File data must be a non-empty array'
    }
  },
  size: { 
    type: Number,
    min: [1, 'File size must be greater than 0'],
    max: [20 * 1024 * 1024, 'File size cannot exceed 20MB']
  },
  mimeType: { 
    type: String,
    validate: {
      validator: function(v) {
        const allowedTypes = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        return allowedTypes.includes(v);
      },
      message: 'Invalid file type. Only CSV and Excel files are allowed.'
    }
  },
  checksum: { type: String },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  metadata: {
    rowCount: Number,
    columnCount: Number,
    columns: [String],
    dataTypes: mongoose.Schema.Types.Mixed
  },
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// File schema indexes
fileSchema.index({ userId: 1, uploadedAt: -1 });
fileSchema.index({ filename: 1 });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ size: 1 });
fileSchema.index({ checksum: 1 }, { sparse: true });
fileSchema.index({ processingStatus: 1 });

const User = mongoose.model('User', userSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);
const File = mongoose.model('File', fileSchema);

// Enhanced JWT helper with better security
const generateToken = (user, expiresIn = '24h') => {
  const payload = {
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    },
    iat: Math.floor(Date.now() / 1000),
    jti: uuidv4() // JWT ID for token blacklisting
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { 
      expiresIn // Removed issuer/audience for simplicity
    }
  );
};

// JWT blacklist (in production, use Redis)
const tokenBlacklist = new Set();

const blacklistToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.jti) {
      tokenBlacklist.add(decoded.jti);
      // In production, store in Redis with TTL
      logger.info('Token blacklisted', { jti: decoded.jti });
    }
  } catch (error) {
    logger.error('Error blacklisting token', { error: error.message });
  }
};

const isTokenBlacklisted = (jti) => {
  return tokenBlacklist.has(jti);
};

// Enhanced auth middleware with better security
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Access attempt without token', { 
        requestId: req.id, 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ 
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    let decoded;
    try {
      // Simplified token verification for demo project
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      logger.warn('Invalid token attempt', { 
        requestId: req.id, 
        ip: req.ip,
        error: jwtError.message
      });
      return res.status(403).json({ 
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Check if token is blacklisted
    if (decoded.jti && isTokenBlacklisted(decoded.jti)) {
      logger.warn('Blacklisted token attempt', { 
        requestId: req.id, 
        jti: decoded.jti,
        ip: req.ip
      });
      return res.status(403).json({ 
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    const userId = decoded?.user?.id || decoded?.userId;
    if (!userId) {
      logger.error('Invalid token payload', { requestId: req.id, decoded });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload',
        code: 'INVALID_PAYLOAD'
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      logger.warn('Token for deleted user', { 
        requestId: req.id, 
        userId
      });
      return res.status(401).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    logger.error('Auth middleware error', { 
      requestId: req.id, 
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      success: false,
      message: 'Internal authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn('Unauthorized admin access attempt', { 
      requestId: req.id, 
      userId: req.user?._id,
      userRole: req.user?.role,
      ip: req.ip
    });
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

// Email transporter helper
const createEmailTransporter = () => {
  if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return null;
};

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Enhanced multer setup with better security and validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1, // Only allow one file at a time
    fieldSize: 1024 * 1024 // 1MB field size limit
  },
  fileFilter: (req, file, cb) => {
    try {
      const originalName = (file.originalname || '').toLowerCase();
      const mimeType = (file.mimetype || '').toLowerCase();
      
      // Check file extension
      const allowedExtensions = ['.csv', '.xls', '.xlsx'];
      const fileExtension = extname(originalName);
      
      // Check MIME type
      const allowedMimeTypes = [
        'text/csv',
        'application/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      // Validate file name (prevent directory traversal)
      if (originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
        logger.warn('Suspicious filename detected', { 
          filename: originalName,
          ip: req.ip,
          requestId: req.id
        });
        return cb(new Error('Invalid filename detected'));
      }
      
      // Check extension and MIME type
      if (!allowedExtensions.includes(fileExtension)) {
        return cb(new Error(`Invalid file extension. Only ${allowedExtensions.join(', ')} files are allowed.`));
      }
      
      if (!allowedMimeTypes.some(type => mimeType.includes(type.split('/')[1]))) {
        return cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
      }
      
      // Additional security: Check for null bytes
      if (originalName.includes('\0')) {
        return cb(new Error('Invalid filename'));
      }
      
      logger.info('File validation passed', {
        filename: originalName,
        mimeType,
        size: file.size,
        requestId: req.id
      });
      
      cb(null, true);
    } catch (error) {
      logger.error('File filter error', { 
        error: error.message,
        requestId: req.id
      });
      cb(new Error('File validation failed'));
    }
  }
});

// Standardized API Response Helpers
const createResponse = (success, message, data = null, code = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (code) response.code = code;
  if (data !== null) response.data = data;
  if (meta) response.meta = meta;
  
  return response;
};

const sendSuccess = (res, message, data = null, statusCode = 200, meta = null) => {
  return res.status(statusCode).json(createResponse(true, message, data, null, meta));
};

const sendError = (res, message, statusCode = 400, code = null, data = null) => {
  return res.status(statusCode).json(createResponse(false, message, data, code));
};

// Enhanced validation handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', { 
      requestId: req.id, 
      errors: errors.array(),
      body: req.body
    });
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', {
      errors: errors.array()
    });
  }
  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        requestId: req.id,
        duration: `${duration}ms`,
        endpoint: req.originalUrl
      });
    }
  });
  
  next();
};

app.use(performanceMonitor);

// Simple AI-like summary generator (for small projects)
const generateLocalAISummary = (data, chartConfig) => {
  try {
    const count = Array.isArray(data) ? data.length : 0;
    const numeric = [], categorical = [];
    if (count > 0) {
      const first = data[0] || {};
      Object.keys(first).forEach(k => {
        const vals = data.map(r => r && r[k] ? r[k] : '').filter(v => v !== null && v !== undefined && v !== '');
        const num = vals.filter(v => !isNaN(parseFloat(v)) && isFinite(v));
        if (num.length >= Math.floor(vals.length * 0.8)) numeric.push(k); else categorical.push(k);
      });
    }

    const out = [];
    const { chartType = 'chart', xAxis = '', yAxis = '' } = chartConfig || {};

    if (yAxis && numeric.includes(yAxis)) {
      const yvals = data.map(r => r && r[yAxis] ? parseFloat(r[yAxis]) : 0).filter(v => !isNaN(v));
      if (yvals.length) {
        const min = Math.min(...yvals), max = Math.max(...yvals);
        const avg = yvals.reduce((s, v) => s + v, 0) / yvals.length;
        out.push(`The ${yAxis} values range from ${min.toFixed(2)} to ${max.toFixed(2)} with an average of ${avg.toFixed(2)}.`);
        if (yvals.length > 2) out.push(`The overall trend shows ${yAxis} is ${yvals[yvals.length - 1] > yvals[0] ? 'increasing' : 'decreasing'} across the dataset.`);
      }
    }

    switch ((chartType || '').toLowerCase()) {
      case 'bar':
      case 'line':
        out.push(`This ${chartType} chart shows the relationship between ${xAxis} and ${yAxis}.`);
        break;
      case 'pie':
      case 'doughnut':
        out.push(`This ${chartType} chart shows proportions across ${xAxis} categories.`);
        break;
      case 'scatter':
        out.push(`The scatter plot may reveal correlations between ${xAxis} and ${yAxis}.`);
        break;
      default:
        out.push('This visualization helps identify patterns in the data.');
    }

    if (count < 10) out.push('With a smaller dataset, individual points are significant.');
    else if (count > 50) out.push('The large dataset provides more reliable statistical insights.');

    if (xAxis && categorical.includes(xAxis)) {
      const uniqueValues = [...new Set(data.map(r => r && r[xAxis] ? r[xAxis] : ''))];
      out.push(`The data spans ${uniqueValues.length} distinct ${xAxis} categories.`);
    }

    return out.join(' ') || `This ${chartType} chart visualizes ${count} data points and highlights patterns between ${xAxis} and ${yAxis}.`;
  } catch (err) {
    console.warn('Local summary error:', err);
    return 'This chart provides a visual representation of your data, highlighting trends and patterns.';
  }
};

// ------------------------- Routes -------------------------

// Enhanced health and monitoring endpoints
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'checking',
        memory: 'healthy',
        disk: 'healthy'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    };

    // Check database connection
    try {
      await mongoose.connection.db.admin().ping();
      health.services.database = 'healthy';
    } catch (dbError) {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
      // logger.error('Database health check failed', { error: dbError.message });
    }

    // Check memory usage
    const memoryUsagePercent = (health.memory.used / health.memory.total) * 100;
    if (memoryUsagePercent > 90) {
      health.services.memory = 'critical';
      health.status = 'degraded';
    } else if (memoryUsagePercent > 75) {
      health.services.memory = 'warning';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    // logger.error('Health check error', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  sendSuccess(res, 'Server is running', {
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Metrics endpoint (admin only)
app.get('/api/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [userCount, analysisCount, fileCount] = await Promise.all([
      User.countDocuments(),
      Analysis.countDocuments(),
      File.countDocuments()
    ]);

    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version
      },
      database: {
        connectionState: mongoose.connection.readyState,
        collections: {
          users: userCount,
          analyses: analysisCount,
          files: fileCount
        }
      },
      application: {
        environment: process.env.NODE_ENV,
        logLevel: logger.level
      }
    };

    sendSuccess(res, 'Metrics retrieved successfully', metrics);
  } catch (error) {
    logger.error('Metrics error', { error: error.message, requestId: req.id });
    sendError(res, 'Failed to retrieve metrics', 500, 'METRICS_ERROR');
  }
});

// Enhanced auth endpoints with better security and response format
app.post('/api/auth/register',
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must be 2-50 characters and contain only letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.warn('Registration attempt with existing email', { 
          requestId: req.id, 
          email,
          ip: req.ip
        });
        return sendError(res, 'User already exists with this email', 409, 'USER_EXISTS');
      }

      // Simplified password hashing for development
      const saltRounds = 10; // Reduced from 14 for faster development
      const hashedPassword = await bcryptjs.hash(password, saltRounds);
      
      const user = new User({ 
        name, 
        email, 
        password: hashedPassword,
        lastLogin: new Date()
      });
      
      await user.save();
      
      const token = generateToken(user);
      
      logger.info('User registered successfully', { 
        requestId: req.id, 
        userId: user._id,
        email: user.email
      });
      
      sendSuccess(res, 'User created successfully', {
        token,
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        }
      }, 201);
    } catch (error) {
      logger.error('Registration error', { 
        requestId: req.id, 
        error: error.message,
        stack: error.stack
      });
      
      if (error.code === 11000) {
        return sendError(res, 'User already exists with this email', 409, 'DUPLICATE_EMAIL');
      }
      
      sendError(res, 'Server error during registration', 500, 'REGISTRATION_ERROR');
    }
  }
);

app.post('/api/auth/login',
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        logger.warn('Login attempt with non-existent email', { 
          requestId: req.id, 
          email,
          ip: req.ip
        });
        return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Simplified login - no account locking for development
      if (!user.password) {
        logger.warn('Login attempt on OAuth-only account', { 
          requestId: req.id, 
          userId: user._id,
          ip: req.ip
        });
        return sendError(res, 'Please sign in with Google', 400, 'OAUTH_ONLY');
      }

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        logger.warn('Failed login attempt', { 
          requestId: req.id, 
          userId: user._id,
          ip: req.ip
        });
        return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      user.lastLogin = new Date();
      await user.save();
      
      const token = generateToken(user);

      logger.info('User logged in successfully', { 
        requestId: req.id, 
        userId: user._id,
        email: user.email
      });

      sendSuccess(res, 'Login successful', {
        token,
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      logger.error('Login error', { 
        requestId: req.id, 
        error: error.message,
        stack: error.stack
      });
      sendError(res, 'Server error during login', 500, 'LOGIN_ERROR');
    }
  }
);

// Add logout endpoint after login
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Blacklist the current token
    if (req.token) {
      blacklistToken(req.token);
    }
    
    logger.info('User logged out', { 
      requestId: req.id, 
      userId: req.user._id
    });
    
    sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error', { 
      requestId: req.id, 
      error: error.message,
      userId: req.user?._id
    });
    sendError(res, 'Server error during logout', 500, 'LOGOUT_ERROR');
  }
});

app.post('/api/auth/forgot-password',
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

      const resetToken = jwt.sign({ userId: user._id, email: user.email }, (process.env.JWT_SECRET || 'your-secret-key') + user.password, { expiresIn: '1h' });

      const transporter = createEmailTransporter();
      if (!transporter) {
        logger.error('Email service not configured');
        return res.status(500).json({ message: 'Email service not available' });
      }

      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'VizGraph - Password Reset Request',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your VizGraph account.</p>
          <p>Click the link below to reset your password (valid for 1 hour):</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>The VizGraph Team</p>
        </div>`
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error during password reset request' });
    }
  }
);

app.post('/api/auth/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 6, max: 100 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token, password } = req.body;
      const unverified = jwt.decode(token);
      if (!unverified || !unverified.userId) return res.status(400).json({ message: 'Invalid reset token' });
      const user = await User.findById(unverified.userId);
      if (!user) return res.status(400).json({ message: 'Invalid reset token' });

      let decoded;
      try {
        decoded = jwt.verify(token, (process.env.JWT_SECRET || 'your-secret-key') + user.password);
        if (decoded.userId !== user._id.toString()) return res.status(400).json({ message: 'Invalid reset token' });
      } catch (e) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      const saltRounds = 12;
      const hashedPassword = await bcryptjs.hash(password, saltRounds);
      await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword, lastLogin: new Date() });
      res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error during password reset' });
    }
  }
);

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Google token is required' });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch (verifyError) {
      logger.error('Google token verification failed:', verifyError);
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name, sub: googleId, picture } = payload;
    if (!email || !name) return res.status(400).json({ message: 'Invalid Google token payload' });

    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    if (user) {
      user.googleId = googleId;
      user.profilePicture = picture;
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({ name, email, googleId, profilePicture: picture, lastLogin: new Date() });
      await user.save();
    }

    const jwtToken = generateToken(user);
    res.json({ message: 'Google authentication successful', token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    logger.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

app.get('/api/auth/user', authenticateToken, async (req, res) => {
  try {
    const u = req.user;
    res.json({
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        profilePicture: u.profilePicture,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced data fetch endpoint
app.get('/api/data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [recentAnalyses, totalAnalyses, totalFiles, recentFiles] = await Promise.all([
      Analysis.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('name settings.chartType updatedAt views'),
      Analysis.countDocuments({ userId }),
      File.countDocuments({ userId }),
      File.find({ userId })
        .sort({ uploadedAt: -1 })
        .limit(3)
        .select('filename originalName uploadedAt size')
    ]);
    
    const stats = {
      totalAnalyses,
      totalFiles,
      recentAnalysesCount: recentAnalyses.length,
      recentFilesCount: recentFiles.length
    };
    
    logger.info('User data fetched', { 
      requestId: req.id, 
      userId,
      stats
    });
    
    sendSuccess(res, 'Data fetched successfully', {
      recentAnalyses,
      recentFiles,
      stats
    });
  } catch (error) {
    logger.error('Get protected data error', { 
      requestId: req.id, 
      error: error.message,
      userId: req.user?._id
    });
    sendError(res, 'Failed to fetch data', 500, 'DATA_FETCH_ERROR');
  }
});

// AI Summary: primary via Hugging Face (if configured), fallback to local generator
app.post('/api/analysis/summarize', authenticateToken, async (req, res) => {
  try {
    const { data, chartConfig } = req.body;
    if (!data || !chartConfig) return res.status(400).json({ message: 'Data and chart configuration are required.' });
    if (!Array.isArray(data) || data.length === 0) return res.status(400).json({ message: 'Data must be a non-empty array.' });

    const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HUGGING_FACE_API_KEY;
    if (hfKey) {
      try {
        const hfModel = process.env.HUGGINGFACE_MODEL || process.env.HF_MODEL || 'facebook/bart-large-cnn';
        const hfUrl = `https://api-inference.huggingface.co/models/${hfModel}`;
        const prompt = `Question: What are the key trends and insights in the following dataset? The data is for a ${chartConfig.chartType} chart with ${chartConfig.xAxis} on the x-axis and ${chartConfig.yAxis} on the y-axis. Data: ${JSON.stringify(data.slice(0, 10))}\n\nAnswer:`;

        const hfResponse = await fetch(hfUrl, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } })
        });

        if (hfResponse.ok) {
          const hfJson = await hfResponse.json();
          let summary = '';
          if (Array.isArray(hfJson) && hfJson.length > 0) summary = hfJson[0].summary_text || hfJson[0].generated_text || '';
          else if (hfJson.summary_text || hfJson.generated_text) summary = hfJson.summary_text || hfJson.generated_text;
          else if (typeof hfJson === 'string') summary = hfJson;
          else summary = (JSON.stringify(hfJson) || '').slice(0, 2000);

          if (summary && summary.trim()) return res.json({ summary: summary.trim() });
        } else {
          const errBody = await hfResponse.text();
          console.warn('Hugging Face returned non-OK', hfResponse.status, errBody);
        }
      } catch (hfErr) {
        logger.error('Hugging Face error:', hfErr);
      }
    }

    // Fallback to local summary
    const summary = generateLocalAISummary(data, chartConfig);
    if (!summary || typeof summary !== 'string') return res.status(500).json({ message: 'Failed to generate AI summary.' });
    return res.json({ summary });
  } catch (error) {
    logger.error('AI summary error:', error);
    return res.status(500).json({ message: 'Failed to generate AI summary.' });
  }
});

// Analyses CRUD
app.get('/api/analysis', authenticateToken, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(analyses);
  } catch (error) {
    logger.error('Get analyses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/analysis/:id', authenticateToken, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json(analysis);
  } catch (error) {
    logger.error('Get analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/analysis', authenticateToken, async (req, res) => {
  try {
    const { name, data, settings } = req.body;
    if (!name || !data || !settings) return res.status(400).json({ message: 'Name, data, and settings are required' });

    const analysis = new Analysis({ name, data, settings, userId: req.user._id });
    await analysis.save();
    res.status(201).json({ message: 'Analysis saved successfully', analysis });
  } catch (error) {
    logger.error('Save analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/analysis/:id', authenticateToken, async (req, res) => {
  try {
    const { name, data, settings } = req.body;
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    if (name) analysis.name = name;
    if (data) analysis.data = data;
    if (settings) analysis.settings = { ...analysis.settings, ...settings };
    analysis.updatedAt = new Date();
    await analysis.save();
    res.json({ message: 'Analysis updated successfully', analysis });
  } catch (error) {
    logger.error('Update analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/analysis/:id', authenticateToken, async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    logger.error('Delete analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// File Upload
// Demo upload endpoint (no auth required)
app.post('/api/upload/demo', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    let workbook, sheetData, headers, jsonData;
    try {
      const mimetype = (req.file.mimetype || '').toLowerCase();
      const nameLower = (req.file.originalname || '').toLowerCase();
      if (mimetype.includes('csv') || nameLower.endsWith('.csv')) {
        const csvString = req.file.buffer.toString('utf-8');
        workbook = xlsx.read(csvString, { type: 'string' });
      } else {
        workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      }

      if (!workbook.SheetNames.length) {
        return res.status(400).json({ message: 'No sheets found in the uploaded file.' });
      }

      const firstSheetName = workbook.SheetNames[0];
      sheetData = workbook.Sheets[firstSheetName];
      jsonData = xlsx.utils.sheet_to_json(sheetData, { header: 1 });

      if (!jsonData.length) {
        return res.status(400).json({ message: 'No data found in the uploaded file.' });
      }

      headers = jsonData[0];
      const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));

      if (!dataRows.length) {
        return res.status(400).json({ message: 'No valid data rows found after the header.' });
      }

      const parsedData = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          const value = row[index];
          obj[header] = isNaN(value) || value === '' ? value : Number(value);
        });
        return obj;
      });

      // Create a temporary file record for demo
      const demoFile = {
        id: 'demo_' + Date.now(),
        originalname: req.file.originalname,
        data: parsedData,
        uploadedAt: new Date(),
        isDemo: true
      };

      res.json({
        success: true,
        message: 'File uploaded and processed successfully for demo.',
        file: demoFile,
        data: parsedData
      });
    } catch (parseError) {
      logger.error('File parsing error', { error: parseError.message });
      return res.status(400).json({ 
        message: 'Error parsing file. Please ensure it\'s a valid Excel or CSV file.',
        error: parseError.message
      });
    }
  } catch (error) {
    logger.error('Demo upload error', { error: error.message });
    res.status(500).json({ 
      message: 'Server error during demo file upload.',
      error: error.message
    });
  }
});

app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    let workbook, sheetData, headers, jsonData;
    try {
      const mimetype = (req.file.mimetype || '').toLowerCase();
      const nameLower = (req.file.originalname || '').toLowerCase();
      if (mimetype.includes('csv') || nameLower.endsWith('.csv')) {
        const csvString = req.file.buffer.toString('utf-8');
        workbook = xlsx.read(csvString, { type: 'string' });
      } else {
        workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      }

      const sheetName = workbook.SheetNames[0];
        if (!sheetName) return res.status(400).json({ message: 'No worksheets found in the uploaded file.' });

        const worksheet = workbook.Sheets[sheetName] || {};
        sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!sheetData || sheetData.length === 0) return res.status(400).json({ message: 'No data found in the uploaded file. Please ensure your file contains data.' });
        if (sheetData.length < 2) return res.status(400).json({ message: 'The uploaded file must contain a header row and at least one data row.' });

        headers = sheetData[0];
        if (!headers || headers.length === 0 || headers.every(h => !h || h.toString().trim() === '')) {
          return res.status(400).json({ message: 'No valid column headers found. Please ensure the first row contains column names.' });
        }

        jsonData = sheetData.slice(1)
          .filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))
          .map(row => {
            const rowData = {};
            headers.forEach((header, index) => {
              if (header) {
                const headerKey = String(header).trim();
                const cellValue = row[index] !== undefined ? row[index] : '';
                rowData[headerKey] = cellValue;
              }
            });
            return rowData;
          });
      if (!jsonData || jsonData.length === 0) return res.status(400).json({ message: 'No valid data rows found in the uploaded file.' });

      const hasValidData = jsonData.some(row => Object.values(row).some(value => value !== null && value !== undefined && String(value).trim() !== ''));
      if (!hasValidData) return res.status(400).json({ message: 'No valid data found. All data rows appear to be empty.' });
    } catch (parseError) {
      logger.error('File parsing error:', parseError);
      return res.status(400).json({ message: 'Unable to parse the uploaded file. Please ensure it is a valid Excel (.xlsx, .xls) or CSV file with proper formatting.' });
    }

    const file = new File({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      userId: req.user._id,
      data: jsonData,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    await file.save();

    res.status(201).json({
      message: 'File uploaded and parsed successfully',
      file: {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        uploadedAt: file.uploadedAt,
        data: jsonData
      }
    });
  } catch (error) {
    logger.error('File upload error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype
    });

    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message && (error.message.includes('Unsupported file') || error.message.includes('ZIP'))) {
      return res.status(400).json({ message: 'Invalid file format. Please upload a valid Excel (.xlsx, .xls) or CSV file.' });
    }

    res.status(500).json({ message: 'Server error during file upload. Please try again or contact support if the issue persists.' });
  }
});

// Chart image generation (server-side)
app.post('/api/chart/download', authenticateToken, async (req, res) => {
  try {
    const { chartConfig, data } = req.body;
    if (!chartConfig || !data) return res.status(400).json({ message: 'Chart configuration and data are required.' });

    const width = 1200, height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Chart.js uses global registration in chart.js/auto import above
    // eslint-disable-next-line no-unused-vars
    // Create chart instance (Chart reads canvas context)
    // We don't keep a reference — Chart will draw synchronously for server-generated images
    // NOTE: Chart.js can leak if not cleaned — for simple usage this is acceptable; consider using chartjs-node-canvas for production
    // but this implementation avoids adding another dependency
    // eslint-disable-next-line no-new
    new Chart(ctx, {
      type: chartConfig.type || 'bar',
      data: data,
      options: {
        ...(chartConfig.options || {}),
        responsive: false,
        animation: false
      }
    });

    const buffer = canvas.toBuffer('image/png');
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="chart.png"`
    });
    res.send(buffer);
  } catch (error) {
    logger.error('Chart download error:', error);
    res.status(500).json({ message: 'Failed to generate chart image.' });
  }
});

// Admin setup with simple credentials for internship project
app.post('/api/admin/setup', async (req, res) => {
  try {
    // If an admin already exists, report the REAL email back
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return sendSuccess(res, 'Admin user already exists', {
        email: existingAdmin.email,
        note: 'An admin account already exists. Use this email to login. If you forgot the password, use the Forgot Password flow.'
      });
    }

    // Allow overriding via request body; default to the values shown in the client AdminSetup
    const {
      email = 'admin@admin.com',
      password = 'admin123',
      name = 'Admin User'
    } = req.body || {};

    const saltRounds = 10; // keep it fast for development
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    logger.info('Admin user created', {
      email: admin.email,
      requestId: req.id
    });

    // For development convenience, return the credentials used
    sendSuccess(
      res,
      'Admin user created successfully',
      {
        email,
        password,
        note: 'Use these credentials to login, then change the password.'
      },
      201
    );
  } catch (error) {
    logger.error('Admin setup error', {
      requestId: req.id,
      error: error.message
    });
    sendError(res, 'Server error during admin setup', 500, 'ADMIN_SETUP_ERROR');
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/user-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnalyses = await Analysis.countDocuments();
    const totalFiles = await File.countDocuments();
    const recentUsers = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    res.json({ totalUsers, totalAnalyses, totalFiles, recentUsers });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/files', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const files = await File.find().populate('userId', 'name email').sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    logger.error('Get files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/analyses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const analyses = await Analysis.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    logger.error('Get analyses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Cannot delete yourself' });

    await Analysis.deleteMany({ userId: user._id });
    await File.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    await user.save();
    res.json({ message: 'User updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/files/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/dashboard-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalFiles,
      totalAnalyses,
      activeUsers,
      chartTypeStats,
      topUsers
    ] = await Promise.all([
      User.countDocuments(),
      File.countDocuments(),
      Analysis.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }), // Active in last 30 days
      Analysis.aggregate([
        { $group: { _id: '$settings.chartType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Analysis.aggregate([
        { $group: { _id: '$userId', analysisCount: { $sum: 1 } } },
        { $sort: { analysisCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: '$user._id', name: '$user.name', email: '$user.email', analysisCount: 1 } }
      ])
    ]);

    res.json({
      overview: {
        totalUsers,
        totalFiles,
        totalAnalyses,
        activeUsers
      },
      chartTypeStats,
      topUsers
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/analyses/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    logger.error('Delete analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analysis stats for user
app.get('/api/analysis/stats', authenticateToken, async (req, res) => {
  try {
    const totalAnalyses = await Analysis.countDocuments({ userId: req.user._id });
    const recentAnalyses = await Analysis.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    res.json({ totalAnalyses, recentAnalyses });
  } catch (error) {
    logger.error('Get analysis stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced error handling middleware
app.use((err, req, res, _next) => {
  // Log the error with context
  logger.error('Unhandled error', {
    requestId: req.id,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.method !== 'GET' ? req.body : undefined,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', { errors });
  }

  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400, 'INVALID_ID');
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, `${field} already exists`, 409, 'DUPLICATE_KEY');
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 403, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 403, 'TOKEN_EXPIRED');
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File too large', 413, 'FILE_TOO_LARGE');
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  sendError(res, message, statusCode, 'INTERNAL_ERROR');
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
});

// Enhanced server startup with graceful shutdown
const PORT = process.env.PORT || 5000;
let server;

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close((err) => {
      if (err) {
        logger.error('Error during server shutdown', { error: err.message });
        process.exit(1);
      }
      
      logger.info('HTTP server closed');
      
      // Close database connection
      mongoose.connection.close(false, () => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });
    
    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise
  });
  
  // Close server gracefully
  gracefulShutdown('unhandledRejection');
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  
  // Close server gracefully
  gracefulShutdown('uncaughtException');
});

const startServer = async () => {
  try {
    // Ensure logs directory exists
    const fs = await import('fs');
    const path = await import('path');
    const logsDir = path.resolve('logs');
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    await connectDB();
    
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform
      });
      logger.info(`📍 API Base URL: http://localhost:${PORT}/api`);
      // logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error', { error: error.message });
      }
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

startServer();  