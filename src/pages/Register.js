// import React, { useState } from "react";
// import { registerUser } from "../services/api";
// import { useNavigate } from "react-router-dom";

// function Register() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleRegister = async () => {
//     try {
//       const res = await registerUser({ username, password });
//       alert(res.data.message);
//       navigate("/login"); // redirect after success
//     } catch (err) {
//       alert(err.response?.data?.message || "Registration failed");
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Register</h2>
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
//       <button onClick={handleRegister}>Register</button>
//     </div>
//   );
// }

// export default Register;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FiUserPlus, FiUser, FiMail, FiLock } from 'react-icons/fi';
// Make sure this path is correct for your project structure
import { registerUser, googleAuth } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      return setError('Please fill in all fields.');
    }
    setIsLoading(true);
    setError('');
    try {
      await registerUser(formData);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create Your VizGraph Account</h2>
          <p className="mt-2 text-gray-400">Get started with data visualization</p>
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
            <FiUser className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text" name="username" value={username} onChange={handleChange}
              placeholder="Username"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
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
              <FiUserPlus />
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
