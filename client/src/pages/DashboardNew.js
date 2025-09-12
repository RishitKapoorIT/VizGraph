import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiShield, FiBarChart, FiActivity, FiPieChart } from 'react-icons/fi';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble } from 'react-chartjs-2';
import Chart3D from '../components/Chart3D';
import ThemeToggle from '../components/ThemeToggle';
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
import { getAnalyses, deleteAnalysis } from '../services/api';

// Helper function to check if user is admin
const isUserAdmin = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user?.role === 'admin';
  } catch (error) {
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
    const sampleData = [
      { label: 'Sample A', value: Math.floor(Math.random() * 50) + 10 },
      { label: 'Sample B', value: Math.floor(Math.random() * 50) + 10 },
      { label: 'Sample C', value: Math.floor(Math.random() * 50) + 10 },
      { label: 'Sample D', value: Math.floor(Math.random() * 50) + 10 }
    ];

    const isPieType = ['pie', 'doughnut', 'polarArea', 'pie3d', 'doughnut3d'].includes(analysis.settings.chartType);
    const isScatterBubble = ['scatter', 'bubble', 'scatter3d'].includes(analysis.settings.chartType);

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
          : 'rgba(59, 130, 246, 0.6)',
        borderColor: isPieType 
          ? ['#1D4ED8', '#059669', '#D97706', '#DC2626']
          : 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
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
    scales: !['pie', 'doughnut', 'polarArea', 'radar', 'bar3d', 'scatter3d', 'pie3d', 'doughnut3d'].includes(analysis.settings.chartType) ? {
      x: { display: false },
      y: { display: false }
    } : {},
    elements: {
      point: { radius: 1 },
      line: { borderWidth: 1 },
      bar: { borderWidth: 0 }
    },
    animation: false
  };

  const renderChart = () => {
    const is3D = ['bar3d', 'scatter3d', 'pie3d', 'doughnut3d'].includes(analysis.settings.chartType);
    
    if (is3D) {
      return <Chart3D data={chartData.datasets[0].data} chartType={analysis.settings.chartType.replace('3d', '')} />;
    }

    switch (analysis.settings.chartType) {
      case 'bar': return <Bar data={chartData} options={options} />;
      case 'line': return <Line data={chartData} options={options} />;
      case 'pie': return <Pie data={chartData} options={options} />;
      case 'doughnut': return <Doughnut data={chartData} options={options} />;
      case 'polarArea': return <PolarArea data={chartData} options={options} />;
      case 'radar': return <Radar data={chartData} options={options} />;
      case 'scatter': return <Scatter data={chartData} options={options} />;
      case 'bubble': return <Bubble data={chartData} options={options} />;
      default: return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className="w-full h-32 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
      {renderChart()}
    </div>
  );
};

// Analysis card component
const AnalysisCard = ({ analysis, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="mb-3">
      <ChartPreview analysis={analysis} />
    </div>
    
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 truncate">
        {analysis.name}
      </h3>
      
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(analysis.createdAt).toLocaleDateString()}
        </p>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded capitalize">
          {analysis.settings.chartType}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(analysis)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md transition-colors"
        >
          <FiEdit size={12} />
          Edit
        </button>
        <button
          onClick={() => onDelete(analysis._id)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md transition-colors"
        >
          <FiTrash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  </div>
);

function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdmin(isUserAdmin());
  }, []);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await getAnalyses();
        setAnalyses(res.data);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  const handleCreateNew = () => {
    navigate('/chart-studio'); 
  };

  const handleAdminDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleEdit = (analysis) => {
    navigate('/chart-studio', { state: { analysis } });
  };

  const handleDelete = async (analysisId) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await deleteAnalysis(analysisId);
        setAnalyses(analyses.filter(analysis => analysis._id !== analysisId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete analysis.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your data visualizations
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <FiPlus size={16} /> 
                New Analysis
              </button>
              
              {isAdmin && (
                <button 
                  onClick={handleAdminDashboard}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FiShield size={16} />
                  Admin
                </button>
              )}
              
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiBarChart size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Analyses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyses.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiActivity size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyses.filter(a => new Date(a.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiPieChart size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chart Types</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(analyses.map(a => a.settings.chartType)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading your analyses...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Analyses</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
              </div>
            </div>
            
            {analyses.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <FiBarChart size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No analyses yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first data visualization to get started</p>
                <button 
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FiPlus size={16} />
                  Create Your First Analysis
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {analyses.map(analysis => (
                  <AnalysisCard
                    key={analysis._id}
                    analysis={analysis}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
