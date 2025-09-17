# VizGraph Server

Advanced data visualization API server built with Node.js, Express, and MongoDB.

## Features

### 🔐 Enhanced Security
- **JWT Authentication** with token blacklisting and refresh
- **Account Locking** after failed login attempts
- **Rate Limiting** with different tiers for different endpoints
- **Input Sanitization** against XSS and NoSQL injection
- **Helmet** security headers
- **API Key Authentication** for external integrations
- **Enhanced Password Requirements** with bcrypt salt rounds of 14

### 📊 Data Management
- **File Upload Security** with comprehensive validation
- **Excel & CSV Processing** with enhanced error handling
- **AI-Powered Summaries** using Hugging Face API
- **Data Validation** with comprehensive schema validation
- **File Metadata Extraction** and analysis

### 🔍 Monitoring & Logging
- **Structured Logging** with Winston
- **Request ID Tracking** for debugging
- **Performance Monitoring** with slow request detection
- **Health Check Endpoints** with service status
- **Comprehensive Error Handling** with detailed logging
- **Metrics Endpoint** for system monitoring

### 🗄️ Database Optimization
- **Connection Pooling** with retry logic
- **Database Indexes** for optimal query performance
- **Schema Validation** with comprehensive rules
- **Connection Health Monitoring**

### 🚀 Performance
- **Response Compression** with gzip
- **Optimized Queries** with proper indexing
- **Graceful Shutdown** handling
- **Memory Usage Monitoring**

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vizgraph/server
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

### Required
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key (minimum 32 characters)
- `CLIENT_URL` - Frontend application URL

### Optional
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `EMAIL_SERVICE` - Email service for password reset
- `HUGGINGFACE_API_KEY` - For AI summaries
- `API_KEYS` - Comma-separated API keys for external access

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout with token blacklisting
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/user` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Data Management
- `GET /api/data` - Get user dashboard data
- `POST /api/upload` - Upload and process files
- `POST /api/analysis/summarize` - Generate AI summaries

### Analysis CRUD
- `GET /api/analysis` - List user analyses
- `GET /api/analysis/:id` - Get specific analysis
- `POST /api/analysis` - Create new analysis
- `PUT /api/analysis/:id` - Update analysis
- `DELETE /api/analysis/:id` - Delete analysis
- `GET /api/analysis/stats` - Get analysis statistics

### Admin Endpoints
- `POST /api/admin/setup` - Create admin user
- `GET /api/admin/users` - List all users
- `GET /api/admin/user-stats` - Get user statistics
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id` - Update user

### Monitoring
- `GET /api/health` - Health check with service status
- `GET /api/status` - Basic server status
- `GET /api/metrics` - System metrics (admin only)

## Response Format

All API responses follow a standardized format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z",
  "code": "SUCCESS_CODE"
}
```

## Error Codes

- `NO_TOKEN` - No authentication token provided
- `INVALID_TOKEN` - Invalid or malformed token
- `TOKEN_EXPIRED` - Token has expired
- `TOKEN_REVOKED` - Token has been blacklisted
- `ACCOUNT_LOCKED` - Account locked due to failed attempts
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Security Features

### Account Protection
- Maximum 5 login attempts before 2-hour account lock
- Secure password requirements (8+ chars, mixed case, numbers, symbols)
- BCrypt with 14 salt rounds for password hashing

### Request Security
- Rate limiting: 200 requests/15min for general endpoints
- Rate limiting: 10 requests/15min for auth endpoints
- Rate limiting: 20 requests/hour for file uploads
- XSS protection and input sanitization
- NoSQL injection prevention

### File Upload Security
- File type validation (CSV, Excel only)
- File size limits (20MB max)
- Filename sanitization
- MIME type verification
- Directory traversal prevention

## Development

### Code Quality
```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Security audit
npm run security-check
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

### Docker
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

## Logging

Logs are written to:
- `logs/error.log` - Error level logs
- `logs/combined.log` - All logs
- Console output in development

Log levels: error, warn, info, debug

## Performance Monitoring

The server includes built-in performance monitoring:
- Request duration tracking
- Memory usage monitoring
- Slow request detection (>1000ms)
- Database connection health

## Contributing

1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Ensure security best practices

## License

MIT License - see LICENSE file for details