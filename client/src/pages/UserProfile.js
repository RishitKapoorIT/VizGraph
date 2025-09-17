import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSave, FiArrowLeft, FiEdit3, FiCamera, FiShield } from 'react-icons/fi';
import ThemeToggle from '../components/ThemeToggle';
import { getUserProfile, updateProfile } from '../services/api';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        setSaving(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        setSaving(false);
        return;
      }
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        setSaving(false);
        return;
      }
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await updateProfile(updateData);
      const updatedUser = response.data;
      
      setUser(updatedUser.user);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition-all duration-200 shadow-lg border border-slate-200 dark:border-slate-700/50 hover:shadow-xl text-slate-700 dark:text-slate-300 w-fit backdrop-blur-sm"
            >
              <FiArrowLeft />
              <span className="text-sm md:text-base">Back to Dashboard</span>
            </button>
            
            <ThemeToggle />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-blue-800 dark:from-white dark:via-blue-200 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              User Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-lg">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                  <FiUser className="text-blue-600 dark:text-blue-400" size={32} />
                </div>
                <button className="absolute -bottom-1 -right-1 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors">
                  <FiCamera size={14} />
                </button>
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                  {user?.name || 'User'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">{user?.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FiShield className={`${user?.role === 'admin' ? 'text-green-500' : 'text-blue-500'}`} size={16} />
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    user?.role === 'admin' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>
                    {user?.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                {success}
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Basic Information</h3>
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <FiEdit3 size={16} />
                      <span className="text-sm">Edit</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              {editing && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Change Password</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Leave blank to keep current password</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {editing && (
                <div className="flex flex-col md:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
                  >
                    <FiSave size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setError('');
                      setSuccess('');
                    }}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;