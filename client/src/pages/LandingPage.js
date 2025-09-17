import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiBarChart2, FiTrendingUp, FiZap, FiArrowRight } from 'react-icons/fi';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FiUpload,
      title: "Easy Data Upload",
      description: "Drag and drop your Excel, CSV files or paste data directly"
    },
    {
      icon: FiBarChart2,
      title: "Multiple Chart Types",
      description: "Bar charts, line graphs, pie charts, and advanced 3D visualizations"
    },
    {
      icon: FiZap,
      title: "Instant Analysis",
      description: "Get insights immediately with our powerful analytics engine"
    },
    {
      icon: FiTrendingUp,
      title: "Interactive Dashboards",
      description: "Create beautiful, interactive dashboards for your data"
    }
  ];

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden">
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-white/90 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiBarChart2 className="text-white" size={18} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">VizGraph</h1>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Transform Your Data into
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Beautiful Visualizations
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto">
              Upload your Excel or CSV files and create stunning charts, graphs, and interactive dashboards in seconds. 
              No complex setup required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/register')}
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Creating
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate('/demo')}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-blue-50 dark:hover:bg-gray-800"
              >
                View Demo
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Everything you need for data visualization
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to make data analysis and visualization simple and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-105 dark:shadow-black/40"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-white" size={24} />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 mx-6 rounded-3xl mb-12">
          <div className="max-w-4xl mx-auto px-8 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to visualize your data?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust VizGraph for their data visualization needs
            </p>
            <button
              onClick={() => navigate('/register')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started for Free
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;