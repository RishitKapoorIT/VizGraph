import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { 
  FiUsers, 
  FiDatabase, 
  FiBarChart2, 
  FiSettings, 
  FiTrendingUp,
  FiFileText,
  FiShield,
  FiActivity,
  FiPieChart,
  FiUser,
  FiArrowRight,
// FiChevronRight,
  FiRefreshCw,
  FiAlertCircle,
  FiLogOut
} from 'react-icons/fi';
import { 
  getDashboardStats, 
  getAllUsers, 
  getAllFiles, 
  getAllAnalyses,
  getUserStats
} from '../services/api';
import AdminCard from '../components/AdminCard';
import QuickStatsCard from '../components/QuickStatsCard';
import ActivityFeedItem from '../components/ActivityFeedItem';

// Main Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    users: [],
    files: [],
    analyses: [],
    userStats: []
  });
  const [refreshing, setRefreshing] = useState(false);

  // Mock activity data (in real app, this would come from backend)
  const recentActivities = [
    {
      id: 1,
      title: 'New user registered',
      description: 'john.doe@example.com joined the platform',
      time: '2 minutes ago',
      icon: FiUser,
      color: 'blue'
    },
    {
      id: 2,
      title: 'File uploaded',
      description: 'sales-data.csv uploaded by Sarah Wilson',
      time: '15 minutes ago',
      icon: FiFileText,
      color: 'green'
    },
    {
      id: 3,
      title: 'Analysis created',
      description: 'Bar chart analysis created by Mike Johnson',
      time: '1 hour ago',
      icon: FiBarChart2,
      color: 'purple'
    },
    {
      id: 4,
      title: 'User role updated',
      description: 'Emma Davis promoted to moderator',
      time: '3 hours ago',
      icon: FiShield,
      color: 'orange'
    }
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, usersRes, filesRes, analysesRes, userStatsRes] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getAllFiles(),
        getAllAnalyses(),
        getUserStats()
      ]);

      setDashboardData({
        stats: statsRes.data,
        users: usersRes.data,
        files: filesRes.data,
        analyses: analysesRes.data,
        userStats: userStatsRes.data
      });
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.status === 403 
        ? 'Access denied. Admin privileges required.'
        : 'Failed to load dashboard data.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <FiShield className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">Manage users, data, and platform settings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
                Refresh
              </button>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-lg"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-red-600 dark:text-red-400" size={20} />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickStatsCard
            title="Total Users"
            value={dashboardData.stats.overview?.totalUsers || dashboardData.users.length || 0}
            icon={FiUsers}
            color="blue"
            subtitle="Registered users"
          />
          <QuickStatsCard
            title="Total Files"
            value={dashboardData.stats.overview?.totalFiles || dashboardData.files.length || 0}
            icon={FiFileText}
            color="green"
            subtitle="Uploaded files"
          />
          <QuickStatsCard
            title="Total Analyses"
            value={dashboardData.stats.overview?.totalAnalyses || dashboardData.analyses.length || 0}
            icon={FiBarChart2}
            color="purple"
            subtitle="Created charts"
          />
          <QuickStatsCard
            title="Active Users"
            value={dashboardData.stats.overview?.activeUsers || 0}
            icon={FiActivity}
            color="orange"
            subtitle="Users with content"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => handleNavigation('/admin/users')}
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-600/50 transition-colors border border-slate-200 dark:border-slate-600"
            >
              <FiUsers className="text-blue-600 dark:text-blue-400" size={24} />
              <span className="text-sm font-medium text-slate-800 dark:text-white">View Users</span>
            </button>
            
            <button 
              onClick={() => handleNavigation('/admin/data')}
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-700/50 rounded-xl hover:bg-green-50 dark:hover:bg-slate-600/50 transition-colors border border-slate-200 dark:border-slate-600"
            >
              <FiDatabase className="text-green-600 dark:text-green-400" size={24} />
              <span className="text-sm font-medium text-slate-800 dark:text-white">View Data</span>
            </button>
            
            <button 
              onClick={fetchDashboardData}
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-700/50 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-600/50 transition-colors border border-slate-200 dark:border-slate-600"
            >
              <FiRefreshCw className="text-purple-600 dark:text-purple-400" size={24} />
              <span className="text-sm font-medium text-slate-800 dark:text-white">Refresh Data</span>
            </button>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-600/50 transition-colors border border-slate-200 dark:border-slate-600"
            >
              <FiArrowRight className="text-orange-600 dark:text-orange-400" size={24} />
              <span className="text-sm font-medium text-slate-800 dark:text-white">User View</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Admin Functions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Administration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Management */}
              <AdminCard
                title="User Management"
                description="Manage user accounts, roles, and permissions"
                icon={FiUsers}
                color="blue"
                onClick={() => handleNavigation('/admin/users')}
                stats={[
                  { label: 'Total Users', value: dashboardData.users.length || 0 },
                  { label: 'Admins', value: dashboardData.users.filter(u => u.role === 'admin').length || 0 }
                ]}
                badge="Essential"
              />

              {/* Data Management */}
              <AdminCard
                title="Data Management"
                description="Monitor files, analyses, and platform data"
                icon={FiDatabase}
                color="green"
                onClick={() => handleNavigation('/admin/data')}
                stats={[
                  { label: 'Files', value: dashboardData.files.length || 0 },
                  { label: 'Analyses', value: dashboardData.analyses.length || 0 }
                ]}
              />

              {/* Analytics Overview */}
              <AdminCard
                title="Analytics Overview"
                description="View detailed platform analytics and insights"
                icon={FiTrendingUp}
                color="purple"
                onClick={() => handleNavigation('/admin/analytics')}
                stats={[
                  { label: 'Chart Types', value: dashboardData.stats.chartTypeStats?.length || 0 },
                  { label: 'This Week', value: dashboardData.analyses.filter(a => {
                    const analysisDate = new Date(a.createdAt);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return analysisDate > weekAgo;
                  }).length || 0 }
                ]}
              />

              {/* System Settings */}
              <AdminCard
                title="System Settings"
                description="Configure platform settings and preferences"
                icon={FiSettings}
                color="orange"
                onClick={() => console.log('System settings - Coming soon')}
                badge="Coming Soon"
                disabled={true}
              />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h2>
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Live Feed</h3>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Live</span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <ActivityFeedItem key={activity.id} activity={activity} index={index} />
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => handleNavigation('/admin/activity')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <span>View All Activity</span>
                  <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Type Distribution */}
          {dashboardData.stats.chartTypeStats && dashboardData.stats.chartTypeStats.length > 0 && (
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Chart Type Distribution</h3>
                <FiPieChart className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              
              <div className="space-y-3">
                {dashboardData.stats.chartTypeStats.slice(0, 5).map((stat, index) => (
                  <div key={stat._id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-blue-500 to-blue-600' :
                        index === 1 ? 'from-purple-500 to-purple-600' :
                        index === 2 ? 'from-green-500 to-green-600' :
                        index === 3 ? 'from-orange-500 to-orange-600' :
                        'from-red-500 to-red-600'
                      }`}></div>
                      <span className="font-medium text-slate-800 dark:text-white capitalize">{stat._id}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{stat.count}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => handleNavigation('/admin/data')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  <span>View Detailed Analytics</span>
                  <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Top Users */}
          {dashboardData.stats.topUsers && dashboardData.stats.topUsers.length > 0 && (
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Most Active Users</h3>
                <FiTrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
              
              <div className="space-y-3">
                {dashboardData.stats.topUsers.slice(0, 5).map((user, index) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{user.analysisCount}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">analyses</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => handleNavigation('/admin/users')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <span>Manage All Users</span>
                  <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default AdminDashboard;