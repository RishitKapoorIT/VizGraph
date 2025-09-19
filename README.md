# VizGraph - Advanced Data Visualization Platform

VizGraph is a comprehensive web application for data visualization and analysis. Upload CSV files, create interactive charts, and get AI-powered insights from your data.

## 🚀 Features

### Core Features
- **File Upload**: Support for CSV files with drag-and-drop interface
- **Interactive Charts**: Multiple chart types including line, bar, pie, scatter, and radar charts
- **3D Visualizations**: Advanced 3D charts using Three.js
- **Dynamic Analysis**: Real-time chart updates with axis selection
- **Responsive Design**: Mobile-friendly interface with dark/light theme support

### Advanced Features
- **AI Summary**: OpenAI-powered analysis of your data trends and insights
- **Export Options**: Download charts as PNG, export data as CSV/JSON, save AI summaries
- **User Authentication**: Secure login with Google OAuth integration
- **Admin Panel**: Complete user and data management system
- **Data Management**: View, search, filter, and manage uploaded files and analyses

### Technical Features
- **Real-time Updates**: Live chart rendering and data updates
- **Secure Authentication**: JWT-based auth with role-based access control
- **Cloud Storage**: MongoDB Atlas for scalable data storage
- **Modern UI**: Tailwind CSS with floating animations and smooth transitions

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Chart.js 4** - Interactive 2D charts
- **Three.js** - 3D visualizations
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### External Services
- **MongoDB Atlas** - Cloud database
- **Google OAuth** - Social authentication
- **OpenAI API** - AI-powered insights
- **Render** - Backend hosting
- **Netlify** - Frontend hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)
- OpenAI API key (optional, for AI features)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vizgraph.git
   cd vizgraph
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create .env file
   cp ../.env.example .env
   # Edit .env with your credentials
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   
   # Create .env file for frontend
   echo "REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id" > .env
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev
   
   # Terminal 2: Frontend
   cd client
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy
1. **Backend**: Deploy to Render using `render.yaml`
2. **Frontend**: Deploy to Netlify using `netlify.toml`
3. **Database**: Use MongoDB Atlas
4. **Set Environment Variables** in each platform

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=sk-your_openai_api_key (optional)
NODE_ENV=production
```

### Frontend (client/.env)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🎯 Usage

### For Users
1. **Sign Up/Login**: Create an account or use Google OAuth
2. **Upload Data**: Drag and drop CSV files or click to upload
3. **Analyze**: Select chart type and axes for visualization
4. **Export**: Download charts, data, or AI summaries
5. **Manage**: View your uploaded files and analyses

### For Admins
1. **Access Admin Panel**: Navigate to `/admin/dashboard` (admin role required)
2. **User Management**: View, edit, delete users and change roles
3. **Data Management**: Monitor and manage all files and analyses
4. **Dashboard Stats**: View platform usage statistics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login

### File Management
- `POST /api/upload` - Upload CSV file
- `GET /api/upload/:id` - Get file by ID

### Analysis
- `POST /api/analysis` - Save analysis
- `GET /api/analysis/:id` - Get analysis by ID
- `POST /api/analysis/ai-summary/:id` - Get AI summary
- `GET /api/analysis/stats` - Get analysis statistics

### Admin (Requires admin role)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/dashboard-stats` - Get dashboard statistics

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Test backend endpoints
cd server
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for excellent charting library
- Three.js for 3D visualization capabilities  
- OpenAI for AI-powered insights
- Tailwind CSS for beautiful styling
- React ecosystem for robust frontend framework

## 📧 Support

For support, email support@vizgraph.com or create an issue on GitHub.

## 🗺️ Roadmap

- [ ] Real-time collaboration features
- [ ] More chart types (heatmaps, treemaps)
- [ ] Advanced data preprocessing
- [ ] Custom dashboard builder
- [ ] API for third-party integrations
- [ ] Mobile app development

---

**VizGraph** - Transform your data into insights 📊✨