import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FiUserPlus, FiUser, FiMail, FiLock, FiHome } from 'react-icons/fi';
import ThemeToggle from '../components/ThemeToggle';
// Make sure this path is correct for your project structure
import { registerUser, googleAuth } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError('Please fill in all fields.');
    }
    setIsLoading(true);
    setError('');
    try {
      await registerUser(formData);
      setIsLoading(false);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const googleToken = credentialResponse.credential;
    try {
      // Send the Google token to your backend
      // The backend will handle both login and registration with this single endpoint
      const res = await googleAuth({ token: googleToken });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-Up failed.');
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError('Google Sign-Up was unsuccessful. Please try again.');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-transparent text-slate-800 dark:text-slate-200 overflow-hidden">
      
      {/* Navigation - Positioned at top */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:bg-slate-700/80"
        >
          <FiHome size={18} />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/50">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Your VizGraph Account</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Get started with data visualization</p>
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
          <div className="flex-grow bg-slate-300 dark:bg-slate-600 h-px"></div>
          <span className="mx-4 text-slate-600 dark:text-slate-400">OR</span>
          <div className="flex-grow bg-slate-300 dark:bg-slate-600 h-px"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <FiUser className="absolute top-3 left-3 text-slate-400" />
            <input
              type="text" name="name" value={name} onChange={handleChange}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
              required
            />
          </div>
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-slate-400" />
            <input
              type="email" name="email" value={email} onChange={handleChange}
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
              required
            />
          </div>
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-slate-400" />
            <input
              type="password" name="password" value={password} onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
              required
            />
          </div>
          {error && <p className="text-center text-red-500 bg-red-900/50 p-3 rounded-md">{error}</p>}
          <div>
            <button
              type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
              <FiUserPlus />
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        <p className="text-center text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;