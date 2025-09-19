# VizGraph - Advanced Data Visualization Platform

VizGraph is a modern, full-stack data visualization platform that allows users to upload, analyze, and create stunning visualizations from their data.

## 🚀 Features

- **Interactive Data Visualization**: Support for 2D and 3D charts including bar, line, pie, scatter, radar, and more
- **User Authentication**: Secure login with email/password and Google OAuth integration
- **File Upload & Management**: Easy CSV/JSON data upload and management
- **Analysis Saving**: Save and manage your data analyses
- **Admin Dashboard**: Comprehensive admin panel for user and data management
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode**: Toggle between light and dark themes

## 🛠️ Tech Stack

### Frontend
- **React 18** with React Router for navigation
- **Tailwind CSS** for styling
- **Chart.js** and **React-Three-Fiber** for visualizations
- **Axios** for API communication
- **Google OAuth** for authentication

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Google OAuth credentials** (optional, for Google Sign-In)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/RishitKapoorIT/VizGraph.git
cd VizGraph
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install:all
```

### 3. Set Up Environment Variables

#### Server Environment (.env in /server directory)

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/vizgraph
JWT_SECRET=your-super-secure-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=http://localhost:3000
```

#### Client Environment (.env in /client directory)

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Set Up Database

Make sure MongoDB is running, then create an admin user:

```bash
cd server
node createAdmin.js
```

This creates an admin user with:
- **Email**: admin@admin.com
- **Password**: admin123

### 5. Start the Application

#### Development Mode (Both Frontend and Backend)

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:3000

#### Or Start Individually

```bash
# Start backend only
npm run server:dev

# Start frontend only
npm run client:dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: Login with admin credentials and navigate to admin dashboard

## 📂 Project Structure

```
VizGraph/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   └── contexts/      # React contexts
│   ├── package.json
│   └── .env
├── server/                # Node.js backend
│   ├── index.js          # Main server file
│   ├── db.js             # Database connection
│   ├── createAdmin.js    # Admin user creation script
│   ├── seedData.js       # Sample data seeding script
│   ├── package.json
│   └── .env
├── package.json          # Root package.json
└── README.md
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the frontend for production
- `npm run start` - Start the backend in production mode
- `npm run install:all` - Install dependencies for all packages

### Server
- `npm run dev` - Start server with nodemon (auto-restart)
- `npm start` - Start server in production mode

### Client
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🗄️ Database Scripts

```bash
cd server

# Create admin user
node createAdmin.js

# Seed sample data
node seedData.js

# Fix database issues
node fixDatabase.js
```

## 🔐 Authentication

The app supports two authentication methods:

1. **Email/Password**: Traditional registration and login
2. **Google OAuth**: Sign in with Google account

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Update environment variables with your credentials

## 🚢 Deployment

### Frontend (Netlify)

1. Build the client: `cd client && npm run build`
2. Deploy the `client/build` folder to Netlify
3. Set environment variables in Netlify dashboard

### Backend (Render/Heroku)

1. Create a new web service
2. Connect your GitHub repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in your environment variables

## 🔧 Configuration Files

### Netlify Configuration (`netlify.toml`)
```toml
[build]
  base = "client"
  publish = "build"
  command = "npm run build"
```

### Render Configuration (`render.yaml`)
```yaml
services:
  - type: web
    name: vizgraph-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
```

## 🧪 Testing

```bash
# Run client tests
cd client
npm test

# Run server tests (if you add them)
cd server
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for MongoDB Atlas

2. **Google OAuth Issues**
   - Verify client ID and secret
   - Check authorized origins in Google Console
   - Ensure environment variables are set

3. **CORS Issues**
   - Check CORS configuration in server
   - Verify client URL in server environment

4. **Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Getting Help

- Check the [Issues](https://github.com/RishitKapoorIT/VizGraph/issues) page
- Create a new issue with detailed information
- Contact the maintainer

## 🎯 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced chart customization
- [ ] Data export functionality
- [ ] API integration for external data sources
- [ ] Mobile app development
- [ ] Advanced analytics and insights

---

Built with ❤️ by [RishitKapoorIT](https://github.com/RishitKapoorIT)