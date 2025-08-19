// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
// import Register from "./pages/Register";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import React from 'react';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import './App.css'; // Ensure you have a CSS file for styling

// function App() {
//   return (
//     <Router>
//       <div className="p-6">
//         <nav className="mb-6">
//           <Link to="/register" className="mr-4 text-blue-600 hover:underline">Register</Link>
//           <Link to="/login" className="mr-4 text-blue-600 hover:underline">Login</Link>
//           <Link to="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
//         </nav>

//         <Routes>
//           {/* Default route */}
//           <Route path="/" element={<Navigate to="/login" />} />

//           {/* Pages */}
//           <Route path="/register" element={<Register />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//         </Routes>
//   </div>
//     </Router>
//   );
// }

// const App = () => {
//   return (
//     <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
//       {/* The rest of your app's components and routing */}
//     </GoogleOAuthProvider>
//   );
// };

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// Import Components
import FloatingGraphsBackground from './components/FloatingGraphsBackground'; 

// Import Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

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
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        {/* The floating background component sits here, behind all other content */}
        <FloatingGraphsBackground />

  {/* The main container for your pages */}
  <div className="min-h-screen relative z-10">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* User Dashboard Route */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin-Only Route */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
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
