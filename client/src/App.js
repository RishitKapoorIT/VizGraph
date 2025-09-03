
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// Import Components
import FloatingGraphsBackground from './components/FloatingGraphsBackground'; 
import { ThemeProvider } from './contexts/ThemeContext';

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

// Helper component to protect routes that are only for admins
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const user = jwtDecode(token);
      // Check if the decoded token has a user object with the 'admin' role
      if (user.user?.role === 'admin') {
        return children; // If they are an admin, show the component
      }
    } catch (error) {
      console.error("Invalid token:", error);
      // If token is invalid, clear it and redirect
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
  }
  // If not an admin or not logged in, redirect them away
  return <Navigate to="/dashboard" />;
};

// This is your main App component
function App() {
  // IMPORTANT: You've already set your actual Google Client ID
  const googleClientId = "676684150870-3e1jfjhl1ccimctf9vs6jd95pp7u0hbe.apps.googleusercontent.com";

  return (
    <ThemeProvider>
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
              
              {/* User Dashboard Route */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* User Profile Route */}
              <Route path="/profile" element={<UserProfile />} />
              
              {/* User Management Route - Admin Only */}
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } 
              />
              
              {/* Chart Studio Route */}
              <Route path="/chart-studio" element={<ChartStudio />} />

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
    </ThemeProvider>
  );
}

export default App;
