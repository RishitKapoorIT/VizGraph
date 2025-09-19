

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiShield, FiUser } from 'react-icons/fi';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble } from 'react-chartjs-2';
import Chart3D from '../components/Chart3D';
import ThemeToggle from '../components/ThemeToggle';
import FloatingGraphsBackground from '../components/FloatingGraphsBackground';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getAnalyses, deleteAnalysis } from '../services/api'; // Updated API function

// Helper function to check if user is admin
const isUserAdmin = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Decode JWT token (simple base64 decode for payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user?.role === 'admin';
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Chart preview component
const ChartPreview = ({ analysis }) => {
  const chartData = useMemo(() => {
    // Generate sample data for preview (better for performance and UX)
    const sampleData = [
      { label: 'Sample A', value: Math.floor(Math.random() * 50) + 10 },
      { label: 'Sample B', value: Math.floor(Math.random() * 50) + 10 },
      { label: 'Sample C', value: Math.floor(Math.random() * 50) + 10 },
      { label: 'Sample D', value: Math.floor(Math.random() * 50) + 10 }
    ];

    const isPieType = ['pie', 'doughnut', 'polarArea', 'pie3d', 'doughnut3d'].includes(analysis.settings.chartType);
    const isScatterBubble = ['scatter', 'bubble', 'scatter3d'].includes(analysis.settings.chartType);
    const is3DChart = ['bar3d', 'scatter3d', 'surface3d', 'pie3d', 'doughnut3d'].includes(analysis.settings.chartType);

    if (isScatterBubble) {
      return {
        datasets: [{
          data: sampleData.map((item, index) => ({
            x: index * 10 + Math.random() * 10,
            y: item.value,
            ...(analysis.settings.chartType === 'bubble' && { r: Math.random() * 10 + 5 })
          })),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }]
      };
    }
    
    return {
      labels: sampleData.map(item => item.label),
      datasets: [{
        data: sampleData.map(item => item.value),
        backgroundColor: isPieType 
          ? ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
          : analysis.settings.chartType === 'radar'
          ? 'rgba(59, 130, 246, 0.2)'
          : 'rgba(59, 130, 246, 0.6)',
        borderColor: isPieType 
          ? ['#1D4ED8', '#059669', '#D97706', '#DC2626']
          : 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        ...(analysis.settings.chartType === 'radar' && { 
          fill: true,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
        })
      }]
    };
  }, [analysis.settings.chartType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      ...(analysis.settings.chartType === 'radar' ? {
        r: { 
          display: false,
          beginAtZero: true
        }
      } : ['scatter', 'bubble', 'scatter3d'].includes(analysis.settings.chartType) ? {
        x: { 
          display: false,
          type: 'linear'
        },
        y: { 
          display: false
        }
      } : !['pie', 'doughnut', 'polarArea', 'bar3d', 'scatter3d', 'surface3d', 'pie3d', 'doughnut3d'].includes(analysis.settings.chartType) ? {
        x: { 
          display: false,
          grid: { display: false }
        },
        y: { 
          display: false,
          grid: { display: false }
        }
      } : {})
    },
    elements: {
      point: { radius: 1 },
      line: { borderWidth: 1 },
      bar: { borderWidth: 0 }
    },
    animation: false,
    interaction: {
      intersect: false,
      mode: 'nearest'
    }
  };

  const renderChart = () => {
    switch (analysis.settings.chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      case 'polarArea':
        return <PolarArea data={chartData} options={options} />;
      case 'radar':
        return <Radar data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      case 'bubble':
        return <Bubble data={chartData} options={options} />;
      case 'bar3d':
        return <Chart3D type="bar3d" data={chartData} options={options} />;
      case 'scatter3d':
        return <Chart3D type="scatter3d" data={chartData} options={options} />;
      case 'pie3d':
        return <Chart3D type="pie3d" data={chartData} options={options} />;
      case 'doughnut3d':
        return <Chart3D type="doughnut3d" data={chartData} options={options} />;
      case 'surface3d':
        return <Chart3D type="surface3d" data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className="w-full h-32 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-lg p-3 backdrop-blur-sm border border-gray-600/30">
      {renderChart()}
    </div>
  );
};

// Reusable card component for the dashboard
const AnalysisCard = ({ analysis, onEdit, onDelete }) => (
  <div className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-gray-700/50 hover:border-blue-500/50">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    {/* Chart preview with enhanced styling */}
    <div className="relative z-10 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-300 dark:border-gray-600/30">
      <ChartPreview analysis={analysis} />
    </div>
    
    {/* Content */}
    <div className="relative z-10">
      <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
        {analysis.name}
      </h3>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(analysis.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 capitalize">
          {analysis.settings.chartType.includes('3d') ? '🎯 ' : ''}
          {analysis.settings.chartType} Chart
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(analysis)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-blue-500/20 rounded-lg transition-all duration-200 hover:scale-110"
            title="Edit Analysis"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(analysis._id)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110"
            title="Delete Analysis"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'recent', 'chartTypes'
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    setIsAdmin(isUserAdmin());
  }, []);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await getAnalyses();
        setAnalyses(res.data);
        setFilteredAnalyses(res.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch analyses.");
        setIsLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchAnalyses();
  }, [navigate]);

  // Filter analyses based on active filter
  useEffect(() => {
    switch (activeFilter) {
      case 'recent':
        setFilteredAnalyses(analyses.filter(a => 
          new Date(a.createdAt) > new Date(Date.now() - 7*24*60*60*1000)
        ));
        break;
      case 'chartTypes':
        // Group by chart type and show unique ones
        const uniqueTypes = {};
        analyses.forEach(a => {
          if (!uniqueTypes[a.settings.chartType]) {
            uniqueTypes[a.settings.chartType] = a;
          }
        });
        setFilteredAnalyses(Object.values(uniqueTypes));
        break;
      case 'all':
      default:
        setFilteredAnalyses(analyses);
        break;
    }
  }, [analyses, activeFilter]);

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'recent':
        return 'Recent Analyses (This Week)';
      case 'chartTypes':
        return 'Unique Chart Types';
      case 'all':
      default:
        return 'Your Analyses';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  const handleCreateNew = () => {
    navigate('/chart-studio'); 
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleAdminDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleEdit = (analysis) => {
    // Navigate to ChartStudio with the analysis data
    navigate('/chart-studio', { state: { analysis } });
  };

  const handleDelete = async (analysisId) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await deleteAnalysis(analysisId);
        // Refresh the analyses list
        setAnalyses(analyses.filter(analysis => analysis._id !== analysisId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete analysis.');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 overflow-hidden">
      {/* Floating Graphs Background */}
      <FloatingGraphsBackground />
      
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
      
      <div className="relative z-10 p-8 text-gray-900 dark:text-white">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-200 dark:to-blue-400 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your data visualizations and analytics
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <button 
              onClick={handleCreateNew}
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
            >
              <FiPlus className="group-hover:rotate-90 transition-transform duration-300" /> 
              Create New Analysis
            </button>
            
            <button 
              onClick={handleProfile}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
            >
              <FiUser /> 
              Profile
            </button>
            
            {isAdmin && (
              <button 
                onClick={handleAdminDashboard}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105"
              >
                <FiShield /> 
                Admin Panel
              </button>
            )}
            
            <button 
              onClick={handleLogout} 
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Analyses Card */}
            <button
              onClick={() => handleFilterClick('all')}
              className={`bg-gradient-to-br from-blue-500/20 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-left ${
                activeFilter === 'all' ? 'border-blue-400 ring-2 ring-blue-400/50' : 'border-blue-500/30 dark:border-blue-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FiPlus className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyses.length}</p>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">Total Analyses</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-75">Click to view all</div>
            </button>
            
            {/* This Week Card */}
            <button
              onClick={() => handleFilterClick('recent')}
              className={`bg-gradient-to-br from-green-500/20 to-green-600/20 dark:from-green-500/20 dark:to-green-600/20 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 text-left ${
                activeFilter === 'recent' ? 'border-green-400 ring-2 ring-green-400/50' : 'border-green-500/30 dark:border-green-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FiEdit className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyses.filter(a => new Date(a.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
                  </p>
                  <p className="text-green-600 dark:text-green-300 text-sm">This Week</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 opacity-75">Click to filter recent</div>
            </button>
            
            {/* Chart Types Card */}
            <button
              onClick={() => handleFilterClick('chartTypes')}
              className={`bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 text-left ${
                activeFilter === 'chartTypes' ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-purple-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <FiTrash2 className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(analyses.map(a => a.settings.chartType)).size}
                  </p>
                  <p className="text-purple-600 dark:text-purple-300 text-sm">Chart Types Used</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 opacity-75">Click to view types</div>
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your analyses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-300 text-lg">{error}</p>
          </div>
        )}

        {/* Analyses Grid */}
        {!isLoading && !error && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{getFilterTitle()}</h2>
              <div className="h-px bg-gradient-to-r from-blue-500 to-purple-500 flex-1"></div>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => handleFilterClick('all')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50"
                >
                  Clear Filter
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAnalyses.length > 0 ? (
                filteredAnalyses.map(a => (
                  <AnalysisCard 
                    key={a._id} 
                    analysis={a} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-16">
                    {analyses.length === 0 ? (
                      // No analyses at all
                      <>
                        <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <FiPlus className="text-gray-500" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No analyses yet</h3>
                        <p className="text-gray-500 mb-6">Create your first data visualization to get started</p>
                        <button 
                          onClick={handleCreateNew}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                        >
                          <FiPlus /> Create Your First Analysis
                        </button>
                      </>
                    ) : (
                      // No analyses match current filter
                      <>
                        <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <FiEdit className="text-gray-500" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No matches found</h3>
                        <p className="text-gray-500 mb-6">No analyses match the current filter criteria</p>
                        <button 
                          onClick={() => handleFilterClick('all')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl font-semibold transition-all duration-300"
                        >
                          View All Analyses
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
// Note: Ensure that the getAnalyses function is correctly implemented in your services/api.js file
// and that it returns the expected data structure for analyses.