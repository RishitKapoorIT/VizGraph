// import React, { useState } from "react";
// import { loginUser } from "../services/api";
// import { useNavigate } from "react-router-dom";

// function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       const res = await loginUser({ username, password });
//       localStorage.setItem("token", res.data.token); // Save JWT
//       alert(res.data.message);
//       navigate("/dashboard"); // go to dashboard
//     } catch (err) {
//       alert(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Login</h2>
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       /><br /><br />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       /><br /><br />
//       <button onClick={handleLogin}>Login</button>
//     </div>
//   );
// }

// export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
// Make sure this path is correct for your project structure
import { loginUser, googleAuth } from '../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await loginUser(formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const googleToken = credentialResponse.credential;
    try {
      // Send the Google token to your backend
      const res = await googleAuth({ token: googleToken });
      // Your backend should verify the token and return your own app token
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed.');
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError('Google Sign-In was unsuccessful. Please try again.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/80 rounded-lg shadow-lg backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome Back to VizGraph</h2>
          <p className="mt-2 text-gray-400">Sign in to continue</p>
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center">
           <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
            />
        </div>

        <div className="flex items-center">
          <div className="flex-grow bg-gray-600 h-px"></div>
          <span className="mx-4 text-gray-400">OR</span>
          <div className="flex-grow bg-gray-600 h-px"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email" name="email" value={email} onChange={handleChange}
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password" name="password" value={password} onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-center text-red-500 bg-red-900/50 p-3 rounded-md">{error}</p>}
          <div>
            <button
              type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
              <FiLogIn />
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-400 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
// Note: Ensure that the loginUser and googleAuth functions are correctly implemented in your services/api.js file
// and that they handle the API requests to your backend for user authentication.