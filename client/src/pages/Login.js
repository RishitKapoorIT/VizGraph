

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FiLogIn, FiMail, FiLock, FiHome } from 'react-icons/fi';
import ThemeToggle from '../components/ThemeToggle';
// Make sure this path is correct for your project structure
import { loginUser, googleAuth, setupAdmin } from '../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleSetupAdmin = async () => {
    try {
      setSetupMessage('Setting up admin user...');
      const response = await setupAdmin();
      setSetupMessage(response.data.message);
    } catch (error) {
      setSetupMessage(error.response?.data?.message || 'Admin setup failed');
    }
  };

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
      setIsLoading(false);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordMessage('Please enter a valid email address.');
      return;
    }

    try {
      setForgotPasswordMessage('Sending password reset instructions...');
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordMessage(data.message);
      } else {
        setForgotPasswordMessage(data.msg || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setForgotPasswordMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-transparent text-gray-900 dark:text-white overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent dark:from-blue-800/20 dark:to-transparent rounded-lg rotate-12 animate-pulse delay-700"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-transparent dark:from-purple-800/20 dark:to-transparent rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-br from-green-200/30 to-transparent dark:from-green-800/20 dark:to-transparent rounded-lg rotate-45 animate-pulse delay-1200"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Navigation - Positioned at top */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
        >
          <FiHome size={18} />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md p-8 space-y-6 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Welcome to VizGraph</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Sign in to continue</p>
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
          <div className="flex-grow bg-gray-300 dark:bg-gray-600 h-px"></div>
          <span className="mx-4 text-gray-500 dark:text-gray-400">OR</span>
          <div className="flex-grow bg-gray-300 dark:bg-gray-600 h-px"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email" name="email" value={email} onChange={handleChange}
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
          </div>
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password" name="password" value={password} onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
          </div>
          {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
          <div>
            <button
              type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed text-white"
            >
              <FiLogIn />
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
          
          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors underline"
            >
              Forgot your password?
            </button>
          </div>
        </form>
        
        {/* Admin Setup Section */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🚀 First Time Setup</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Click this button once to create the initial admin account (admin@admin.com / password)
          </p>
          <button
            onClick={handleSetupAdmin}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            Setup Admin User
          </button>
          {setupMessage && (
            <p className={`mt-2 text-center text-xs p-2 rounded ${
              setupMessage.includes('successfully') || setupMessage.includes('Admin user already exists')
                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50' 
                : 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50'
            }`}>
              {setupMessage}
            </p>
          )}
        </div>
        
        <p className="text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Sign Up</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                  setForgotPasswordMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <div className="relative">
                  <FiMail className="absolute top-3 left-3 text-gray-400" />
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>
              </div>
              
              {forgotPasswordMessage && (
                <div className={`p-3 rounded-md text-sm ${
                  forgotPasswordMessage.includes('Failed') 
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                }`}>
                  {forgotPasswordMessage}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordMessage('');
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
// Note: Ensure that the loginUser and googleAuth functions are correctly implemented in your services/api.js file
// and that they handle the API requests to your backend for user authentication.