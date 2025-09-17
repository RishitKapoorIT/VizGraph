import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllFiles, 
  deleteFile, 
  getAllAnalyses, 
  deleteAnalysisAdmin, 
  getDashboardStats 
} from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { 
  FiFile, 
  FiBarChart, 
  FiTrash2, 
  FiUser, 
  FiCalendar, 
  FiArrowLeft,
  FiDatabase,
  FiTrendingUp,
  FiPieChart,
  FiRefreshCw
} from 'react-icons/fi';

// Format date utility
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// File Card Component
const FileCard = ({ file, onDelete }) => (
  <div className="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <FiFile className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white truncate">
            {file.filename}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <FiUser size={12} />
            {file.user?.name || 'Unknown'} ({file.user?.email})
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(file._id, file.filename)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
        title="Delete File"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <FiDatabase className="text-slate-600 dark:text-slate-400" size={12} />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Data Points</span>
        </div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {file.data?.length || 0}
        </p>
      </div>
      
      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <FiCalendar className="text-slate-600 dark:text-slate-400" size={12} />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Uploaded</span>
        </div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
          {formatDate(file.createdAt)}
        </p>
      </div>
    </div>
  </div>
);

// Analysis Card Component
const AnalysisCard = ({ analysis, onDelete }) => (
  <div className="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <FiBarChart className="text-purple-600 dark:text-purple-400" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white truncate">
            {analysis.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <FiUser size={12} />
            {analysis.user?.name || 'Unknown'} ({analysis.user?.email})
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(analysis._id, analysis.name)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
        title="Delete Analysis"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
    
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <FiPieChart className="text-slate-600 dark:text-slate-400" size={12} />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Chart Type</span>
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">
          {analysis.settings?.chartType || 'Unknown'}
        </p>
      </div>
      
      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <FiCalendar className="text-slate-600 dark:text-slate-400" size={12} />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Created</span>
        </div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
          {formatDate(analysis.createdAt)}
        </p>
      </div>
    </div>
    
    <div className="text-xs text-slate-500 dark:text-slate-400">
      File: {analysis.fileData?.filename || 'Unknown'}
    </div>
  </div>
);

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className={`group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-${color}-200 dark:border-${color}-800/50 hover:border-${color}-400 dark:hover:border-${color}-500 transition-all duration-300 overflow-hidden`}>
    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${color}-400 to-${color}-500`}></div>
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50 via-transparent to-${color}-50 dark:from-${color}-900/10 dark:via-transparent dark:to-${color}-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    <div className="relative z-10 flex items-center gap-4">
      <div className={`p-4 bg-gradient-to-br from-${color}-100 to-${color}-100 dark:from-${color}-900/30 dark:to-${color}-900/30 rounded-xl`}>
        <Icon className={`text-${color}-600 dark:text-${color}-400`} size={24} />
      </div>
      <div>
        <p className={`text-3xl font-bold text-${color}-900 dark:text-${color}-100`}>{value}</p>
        <p className={`text-${color}-600 dark:text-${color}-300 text-sm font-medium`}>{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

function AdminDataManagement() {
  const [files, setFiles] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [filesRes, analysesRes, statsRes] = await Promise.all([
        getAllFiles(),
        getAllAnalyses(),
        getDashboardStats()
      ]);
      
      setFiles(filesRes.data);
      setAnalyses(analysesRes.data);
      setDashboardStats(statsRes.data);
      setError('');
      setRetryCount(0);
    } catch (err) {
      console.error('Admin data fetch error:', err);
      const errorMsg = err.response?.status === 403 
        ? 'Access denied. Admin privileges required.'
        : err.response?.status === 401
        ? 'Authentication required. Please log in again.'
        : err.response?.status === 404
        ? 'Admin endpoints not found. Server may need restart.'
        : 'Failed to fetch data management information. Server may be down.';
      setError(errorMsg);
      if (err.response?.status === 403) {
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const retryFetch = async () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      await fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteFile = async (fileId, filename) => {
    if (window.confirm(`Are you sure you want to delete "${filename}" and all related analyses? This action cannot be undone.`)) {
      try {
        await deleteFile(fileId);
        setFiles(files.filter(file => file._id !== fileId));
        // Also remove analyses that used this file
        setAnalyses(analyses.filter(analysis => analysis.fileData?._id !== fileId));
        // Refresh stats
        fetchData();
      } catch (err) {
        setError('Failed to delete file.');
        console.error('Error deleting file:', err);
      }
    }
  };

  const handleDeleteAnalysis = async (analysisId, analysisName) => {
    if (window.confirm(`Are you sure you want to delete the analysis "${analysisName}"? This action cannot be undone.`)) {
      try {
        await deleteAnalysisAdmin(analysisId);
        setAnalyses(analyses.filter(analysis => analysis._id !== analysisId));
        // Refresh stats
        fetchData();
      } catch (err) {
        setError('Failed to delete analysis.');
        console.error('Error deleting analysis:', err);
      }
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      
      <div className="relative z-10 p-8 text-slate-800 dark:text-white">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-8 flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl text-slate-700 dark:text-slate-300"
              >
                <FiArrowLeft />
                Back to Admin
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                <FiRefreshCw />
                Refresh Data
              </button>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-600 to-purple-800 dark:from-white dark:via-purple-200 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Data Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Manage platform data, files, and analyses
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white dark:bg-slate-800 rounded-xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
            {[
              { id: 'overview', label: 'Overview', icon: FiTrendingUp },
              { id: 'files', label: 'Files', icon: FiFile },
              { id: 'analyses', label: 'Analyses', icon: FiBarChart }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-8 text-center mb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <FiDatabase className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-red-300 text-xl font-semibold mb-2">Data Fetch Error</h3>
                <p className="text-red-200 text-lg mb-4">{error}</p>
                {retryCount < 3 && (
                  <button
                    onClick={retryFetch}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                    disabled={isLoading}
                  >
                    <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Retrying...' : `Retry (${3 - retryCount} attempts left)`}
                  </button>
                )}
                {retryCount >= 3 && (
                  <p className="text-red-300 text-sm">
                    Max retry attempts reached. Please check your connection and refresh the page.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Loading data management information...</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Data Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <FiFile className="text-blue-600 dark:text-blue-400" size={24} />
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Files</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{files.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <FiBarChart className="text-purple-600 dark:text-purple-400" size={24} />
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Analyses</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{analyses.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <FiTrendingUp className="text-green-600 dark:text-green-400" size={24} />
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">This Week</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{files.filter(f => {
                          const fileDate = new Date(f.createdAt);
                          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                          return fileDate > weekAgo;
                        }).length || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                        <FiUser className="text-orange-600 dark:text-orange-400" size={24} />
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Active Users</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{new Set(files.map(f => f.user?.email).filter(Boolean)).size || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Platform Analytics Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Data Usage Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-800/50 rounded-2xl p-6 border border-blue-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <FiDatabase className="text-blue-600 dark:text-blue-400" />
                      Data Usage Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">CSV Files Uploaded</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{files.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Charts Generated</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{analyses.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Most Popular Chart</span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {analyses.length > 0 ? (
                            Object.entries(
                              analyses.reduce((acc, a) => {
                                acc[a.chartType] = (acc[a.chartType] || 0) + 1;
                                return acc;
                              }, {})
                            ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                          ) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Avg. Files per User</span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {files.length > 0 && new Set(files.map(f => f.user?.email).filter(Boolean)).size > 0
                            ? Math.round(files.length / new Set(files.map(f => f.user?.email).filter(Boolean)).size * 10) / 10
                            : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity Timeline */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800/50 dark:to-slate-800/50 rounded-2xl p-6 border border-purple-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <FiTrendingUp className="text-purple-600 dark:text-purple-400" />
                      Activity Summary
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">Files This Week</span>
                          <span className="text-sm font-medium text-slate-800 dark:text-white">
                            {files.filter(f => {
                              const fileDate = new Date(f.createdAt);
                              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                              return fileDate > weekAgo;
                            }).length} uploads
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${files.length > 0 ? (files.filter(f => {
                                const fileDate = new Date(f.createdAt);
                                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                return fileDate > weekAgo;
                              }).length / files.length) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">Charts This Week</span>
                          <span className="text-sm font-medium text-slate-800 dark:text-white">
                            {analyses.filter(a => {
                              const analysisDate = new Date(a.createdAt);
                              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                              return analysisDate > weekAgo;
                            }).length} created
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${analyses.length > 0 ? (analyses.filter(a => {
                                const analysisDate = new Date(a.createdAt);
                                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                return analysisDate > weekAgo;
                              }).length / analyses.length) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Platform activity shows {files.length > 0 || analyses.length > 0 ? 'healthy' : 'low'} user engagement
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Data Management Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setActiveTab('files')}
                      className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <FiFile className="text-blue-600 dark:text-blue-400" size={20} />
                      <div className="text-left">
                        <p className="font-medium text-slate-800 dark:text-white">Manage Files</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">View and delete uploaded files</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('analyses')}
                      className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <FiBarChart className="text-purple-600 dark:text-purple-400" size={20} />
                      <div className="text-left">
                        <p className="font-medium text-slate-800 dark:text-white">Manage Analyses</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">View and delete chart analyses</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => window.location.reload()}
                      className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <FiRefreshCw className="text-green-600 dark:text-green-400" size={20} />
                      <div className="text-left">
                        <p className="font-medium text-slate-800 dark:text-white">Refresh Data</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Update all statistics</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              {/* Platform Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                  title="Total Files" 
                  value={dashboardStats.overview?.totalFiles || 0}
                  icon={FiFile}
                  color="blue"
                  subtitle="Uploaded by users"
                />
                <StatsCard 
                  title="Total Analyses" 
                  value={dashboardStats.overview?.totalAnalyses || 0}
                  icon={FiBarChart}
                  color="purple"
                  subtitle="Created charts"
                />
                <StatsCard 
                  title="Active Users" 
                  value={dashboardStats.overview?.activeUsers || 0}
                  icon={FiUser}
                  color="green"
                  subtitle="Users with analyses"
                />
                <StatsCard 
                  title="Chart Types" 
                  value={dashboardStats.chartTypeStats?.length || 0}
                  icon={FiPieChart}
                  color="orange"
                  subtitle="Different types used"
                />
              </div>

              {/* Chart Type Distribution */}
              {dashboardStats.chartTypeStats && dashboardStats.chartTypeStats.length > 0 && (
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Chart Type Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dashboardStats.chartTypeStats.map((stat, index) => (
                      <div key={stat._id} className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stat.count}</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{stat._id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Users */}
              {dashboardStats.topUsers && dashboardStats.topUsers.length > 0 && (
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Most Active Users</h3>
                  <div className="space-y-3">
                    {dashboardStats.topUsers.map((user, index) => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{user.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{user.analysisCount}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">analyses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Files Tab */}
            {activeTab === 'files' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">File Management</h2>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">{files.length} files</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {files.length > 0 ? (
                    files.map(file => (
                      <FileCard 
                        key={file._id} 
                        file={file} 
                        onDelete={handleDeleteFile}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiFile className="text-slate-500" size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-500 mb-2">No files found</h3>
                      <p className="text-slate-400">No files have been uploaded to the platform yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analyses Tab */}
            {activeTab === 'analyses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Analysis Management</h2>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">{analyses.length} analyses</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyses.length > 0 ? (
                    analyses.map(analysis => (
                      <AnalysisCard 
                        key={analysis._id} 
                        analysis={analysis} 
                        onDelete={handleDeleteAnalysis}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiBarChart className="text-slate-500" size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-500 mb-2">No analyses found</h3>
                      <p className="text-slate-400">No analyses have been created on the platform yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDataManagement;