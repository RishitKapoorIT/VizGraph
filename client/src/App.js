
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useSelector } from 'react-redux';
import { tokenUtils } from './utils/auth';

// Import Components
import FloatingGraphsBackground from './components/FloatingGraphsBackground'; 

// Import Pages
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminDataManagement from './pages/AdminDataManagement';
import ChartStudio from './pages/ChartStudio';
import UserProfile from './pages/UserProfile';
import UserManagement from './components/UserManagement';

// Protected route component for authenticated users
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = tokenUtils.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Helper component to protect routes that are only for admins
const AdminRoute = ({ children }) => {
  const isAuthenticated = tokenUtils.isAuthenticated();
  const isAdmin = tokenUtils.isAdmin();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// This is your main App component
function App() {
  const isDark = useSelector(state => state.theme.isDark);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  // Use environment variable for Google Client ID
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <Router>
          {/* The floating background component sits here, behind all other content */}
          <FloatingGraphsBackground />

    {/* The main container for your pages */}
    <div className="min-h-screen relative z-10 bg-transparent transition-colors duration-300" style={{pointerEvents: 'auto'}}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              {/* User Dashboard Route - Protected */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* User Profile Route - Protected */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Chart Studio Route - Public with internal auth checks */}
              <Route 
                path="/chart-studio" 
                element={<ChartStudio />} 
              />
              
              {/* User Management Route - Admin Only */}
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } 
              />

              {/* Admin-Only Route */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              
              {/* Admin Data Management Route */}
              <Route 
                path="/admin/data" 
                element={
                  <AdminRoute>
                    <AdminDataManagement />
                  </AdminRoute>
                } 
              />
            </Routes>
        </div>
        </Router>
      </GoogleOAuthProvider>
  );
}

export default App;
