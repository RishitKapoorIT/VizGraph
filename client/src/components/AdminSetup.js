import React, { useState } from 'react';
import { FiUser, FiShield, FiCheck } from 'react-icons/fi';

const AdminSetup = ({ onSetupComplete }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const setupAdmin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@admin.com',
          password: 'admin123',
          name: 'Administrator'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSetupComplete();
        }, 2000);
      } else {
        setError(data.msg || 'Failed to setup admin user');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <FiCheck className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Admin Setup Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Admin user created successfully. You can now log in with:
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm"><strong>Email:</strong> admin@admin.com</p>
            <p className="text-sm"><strong>Password:</strong> admin123</p>
          </div>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Please change the password after first login!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <FiShield className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Admin Setup Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No admin user found. Set up an administrator account to access the admin panel.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <FiUser size={16} />
              Default Admin Credentials
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Email:</strong> admin@admin.com</p>
              <p><strong>Password:</strong> admin123</p>
              <p><strong>Name:</strong> Administrator</p>
            </div>
          </div>

          <button
            onClick={setupAdmin}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Setting up...
              </>
            ) : (
              <>
                <FiShield />
                Create Admin User
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Make sure to change the default password after first login for security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;