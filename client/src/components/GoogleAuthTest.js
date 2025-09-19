// Google Auth Test Component
// This helps debug Google OAuth issues

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../services/api';

const GoogleAuthTest = () => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    setStatus('Processing Google token...');
    
    try {
      console.log('Google credential response:', credentialResponse);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      const googleToken = credentialResponse.credential;
      setStatus('Sending token to backend...');
      
      // Send the Google token to your backend
      const res = await googleAuth({ token: googleToken });
      console.log('Backend response:', res);
      
      const token = res.data.data?.token || res.data.token;
      if (token) {
        setStatus('Success! Token received from backend.');
        console.log('JWT Token:', token);
        // Don't automatically save to localStorage in test mode
      } else {
        throw new Error('No JWT token received from backend');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Google Sign-In failed';
      setError(errorMessage);
      setStatus('Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failure:', error);
    setError('Google Sign-In was unsuccessful. Please try again.');
    setStatus('Google login failed.');
  };

  const testEnvironmentVariables = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    console.log('Google Client ID:', clientId);
    setStatus(`Google Client ID: ${clientId ? 'Set' : 'Missing'}`);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
        Google Auth Test
      </h3>
      
      <div className="space-y-4">
        <button
          onClick={testEnvironmentVariables}
          className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
        >
          Test Environment Variables
        </button>
        
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            useOneTap={false}
            auto_select={false}
          />
        </div>
        
        {loading && (
          <div className="text-blue-600 text-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Processing...
          </div>
        )}
        
        {status && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3">
            <p className="text-blue-800 dark:text-blue-200 text-sm">{status}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-3">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
        
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>Client ID: {process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'Configured' : 'Missing'}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthTest;