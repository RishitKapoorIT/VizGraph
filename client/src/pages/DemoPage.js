import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiArrowRight, FiUpload, FiBarChart2, FiEye, FiDownload } from 'react-icons/fi';
import ThemeToggle from '../components/ThemeToggle';
import FloatingGraphsBackground from '../components/FloatingGraphsBackground';
import { demoChartConfigs, createDemoFile } from '../services/demoData';

const DemoPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: "Step 1: Upload Your Data",
      description: "Start by uploading your Excel or CSV file. We'll use sample sales data for this demo.",
      icon: FiUpload,
      action: "Try uploading the demo file",
      color: "blue"
    },
    {
      title: "Step 2: Choose Chart Type", 
      description: "Select from multiple chart types including bar charts, line graphs, pie charts, and 3D visualizations.",
      icon: FiBarChart2,
      action: "Pick your visualization style",
      color: "purple"
    },
    {
      title: "Step 3: Customize & Analyze",
      description: "Configure your axes, colors, and settings to create the perfect visualization for your data.",
      icon: FiEye,
      action: "View interactive charts",
      color: "green"
    },
    {
      title: "Step 4: Export & Share",
      description: "Download your charts or save your analysis to share with your team.",
      icon: FiDownload,
      action: "Export your work",
      color: "orange"
    }
  ];

  const startDemo = () => {
    setIsPlaying(true);
    // Auto-advance through steps
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= demoSteps.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const downloadDemoFile = () => {
    const demoFile = createDemoFile('sales');
    const url = URL.createObjectURL(demoFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = demoFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tryWithDemoData = () => {
    const demoFile = createDemoFile('sales');
    // Navigate to chart studio with demo data
    navigate('/chart-studio', { 
      state: { 
        demoFile: demoFile,
        isDemoMode: true 
      } 
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 overflow-hidden">
      {/* Floating Background */}
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
      
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiBarChart2 className="text-white" size={18} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">VizGraph Demo</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            See VizGraph in
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Action
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Watch how easy it is to transform your data into beautiful visualizations, or try it yourself with our sample data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={startDemo}
              disabled={isPlaying}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
            >
              <FiPlay />
              {isPlaying ? 'Demo Playing...' : 'Watch Demo'}
            </button>
            
            <button
              onClick={tryWithDemoData}
              className="group flex items-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-blue-50 dark:hover:bg-gray-800"
            >
              Try with Sample Data
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Demo Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {demoSteps.map((step, index) => (
            <div
              key={index}
              className={`relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-500 ${
                currentStep >= index && isPlaying
                  ? 'border-blue-400 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Progress indicator */}
              {currentStep >= index && isPlaying && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl"></div>
              )}
              
              <div className={`w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 transition-transform ${
                currentStep >= index && isPlaying ? 'scale-110' : ''
              }`}>
                <step.icon className="text-white" size={24} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {step.description}
              </p>
              
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {step.action}
              </p>
            </div>
          ))}
        </div>

        {/* Sample Charts Preview */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Sample Visualizations You Can Create
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demoChartConfigs.map((config, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {config.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {config.description}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                    {config.settings.chartType}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {config.settings.xAxis} vs {config.settings.yAxis}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Sample Data */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Want to Try with Your Own Data?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Download our sample dataset to see the expected format, or use your own Excel/CSV files.
          </p>
          <button
            onClick={downloadDemoFile}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            <FiDownload />
            Download Sample Data (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
