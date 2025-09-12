import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble } from 'react-chartjs-2';
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
  Filler,
} from 'chart.js';
import UploadZone from '../components/UploadZone';
import Chart3D from '../components/Chart3D';
import ThemeToggle from '../components/ThemeToggle';
import FloatingGraphsBackground from '../components/FloatingGraphsBackground';
import { useTheme } from '../contexts/ThemeContext';
import { uploadFile, saveAnalysis, updateAnalysis, getFileData, generateAISummary } from '../services/api';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiDownload, FiSave, FiArrowLeft, FiCircle, FiTarget, FiGrid, FiHexagon, FiZap, FiBox, FiGlobe } from 'react-icons/fi';

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
  Legend,
  Filler
);

const ChartStudio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { analysis: editingAnalysis, demoFile, isDemoMode } = location.state || {};

  // File and upload state
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Chart configuration state
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [zAxis, setZAxis] = useState('');
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'pie', 'doughnut', 'polarArea', 'radar', 'scatter', 'bubble', 'bar3d', 'scatter3d', 'pie3d', 'doughnut3d', 'surface3d'

  // Analysis state
  const [analysisName, setAnalysisName] = useState('My Analysis');
  const [fileId, setFileId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const chartRef = useRef(null);

  // Sample data for demonstration
  const sampleData = [
    { Month: 'January', Sales: 4500, Revenue: 45000, Customers: 120 },
    { Month: 'February', Sales: 5200, Revenue: 52000, Customers: 140 },
    { Month: 'March', Sales: 4800, Revenue: 48000, Customers: 135 },
    { Month: 'April', Sales: 6100, Revenue: 61000, Customers: 160 },
    { Month: 'May', Sales: 7200, Revenue: 72000, Customers: 180 },
    { Month: 'June', Sales: 6800, Revenue: 68000, Customers: 170 }
  ];

  // Load sample data function
  const loadSampleData = () => {
    const newHeaders = Object.keys(sampleData[0]);
    const newXAxis = 'Month';
    const newYAxis = 'Sales';
    const newZAxis = 'Revenue';
    
    setData(sampleData);
    setHeaders(newHeaders);
    setXAxis(newXAxis);
    setYAxis(newYAxis);
    setZAxis(newZAxis);
    setError('');
  };

  // Load analysis data if editing
  useEffect(() => {
    if (editingAnalysis) {
      setIsEditing(true);
      setAnalysisName(editingAnalysis.name);
      setXAxis(editingAnalysis.settings.xAxis);
      setYAxis(editingAnalysis.settings.yAxis);
      setZAxis(editingAnalysis.settings.zAxis || '');
      setChartType(editingAnalysis.settings.chartType);
      setFileId(editingAnalysis.fileData);
      
      // Fetch the file data
      const loadFileData = async () => {
        try {
          const response = await getFileData(editingAnalysis.fileData);
          setData(response.data.data);
          setHeaders(Object.keys(response.data.data[0] || {}));
        } catch (error) {
          console.error('Error loading file data:', error);
          setError('Failed to load file data for editing');
        }
      };

      loadFileData();
    } else if (isDemoMode && demoFile) {
      // Handle demo mode - auto-load the demo file
      handleFileUpload(demoFile);
    }
  }, [editingAnalysis, isDemoMode, demoFile]);

  const handleFileUpload = async (fileToUpload) => {
    if (!fileToUpload) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setData(null); // Reset previous data

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await uploadFile(formData);
      const responseData = response.data.data;
      
      if (responseData && responseData.length > 0) {
        setData(responseData);
        setHeaders(Object.keys(responseData[0]));
        setXAxis(Object.keys(responseData[0])[0] || ''); // Default to first column
        setYAxis(Object.keys(responseData[0])[1] || ''); // Default to second column
        setZAxis(Object.keys(responseData[0])[2] || ''); // Default to third column
        setFileId(response.data.fileId); // Save the fileId
      } else {
        setError('No data found in the uploaded file.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!data || !xAxis || !yAxis) {
      return null;
    }

    const isPieType = ['pie', 'doughnut', 'polarArea'].includes(chartType);
    const isScatterBubble = ['scatter', 'bubble'].includes(chartType);

    // For scatter and bubble charts, we need different data structure
    if (isScatterBubble) {
      return {
        datasets: [
          {
            label: `${xAxis} vs ${yAxis}`,
            data: data.map(item => ({
              x: item[xAxis],
              y: item[yAxis],
              ...(chartType === 'bubble' && { r: Math.abs(item[yAxis]) / 10 || 5 })
            })),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      };
    }

    return {
      labels: data.map(item => item[xAxis]),
      datasets: [
        {
          label: yAxis,
          data: data.map(item => item[yAxis]),
          backgroundColor: isPieType 
            ? data.map((_, i) => `hsl(${(i * 360) / data.length}, 70%, 60%)`)
            : chartType === 'radar'
            ? 'rgba(54, 162, 235, 0.2)'
            : 'rgba(54, 162, 235, 0.6)',
          borderColor: isPieType 
            ? data.map(() => '#fff')
            : 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          ...(chartType === 'radar' && { 
            fill: true,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
          })
        },
      ],
    };
  }, [data, xAxis, yAxis, chartType]);

  const handleDownloadPNG = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `${analysisName || 'chart'}.png`;
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      setError('No data available to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.download = `${analysisName || 'data'}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadJSON = () => {
    if (!data || !analysisName) {
      setError('No analysis data available to export');
      return;
    }
    const is3DChart = ['bar3d', 'scatter3d', 'pie3d', 'doughnut3d', 'surface3d'].includes(chartType);
    const analysisExport = {
      analysisName,
      chartType,
      xAxis,
      yAxis,
      ...(is3DChart && { zAxis }),
      createdAt: new Date().toISOString(),
      dataPoints: data.length,
      data: data,
      settings: {
        xAxis,
        yAxis,
        ...(is3DChart && { zAxis }),
        chartType
      }
    };

    const jsonContent = JSON.stringify(analysisExport, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.download = `${analysisName || 'analysis'}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadSummary = () => {
    if (!aiSummary) {
      setError('No AI summary available. Please generate a summary first.');
      return;
    }

    const summaryContent = [
      `Analysis Summary: ${analysisName || 'Untitled Analysis'}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Chart Type: ${chartType}`,
      `X-Axis: ${xAxis}`,
      `Y-Axis: ${yAxis}`,
      `Data Points: ${data?.length || 0}`,
      '',
      'AI Generated Summary:',
      '=' + '='.repeat(50),
      aiSummary,
      '',
      'End of Summary'
    ].join('\n');

    const blob = new Blob([summaryContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.download = `${analysisName || 'analysis'}-summary.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleSaveAnalysis = async () => {
    if (!fileId) {
      setError('Cannot save analysis without a file.');
      return;
    }
    const is3DChart = ['bar3d', 'scatter3d', 'pie3d', 'doughnut3d', 'surface3d'].includes(chartType);
    const analysisData = {
      name: analysisName,
      fileDataId: fileId,
      settings: {
        xAxis,
        yAxis,
        ...(is3DChart && { zAxis }),
        chartType,
      },
    };

    try {
      if (isEditing && editingAnalysis) {
        // Update existing analysis
        await updateAnalysis(editingAnalysis._id, analysisData);
        alert('Analysis updated successfully!');
      } else {
        // Create new analysis
        await saveAnalysis(analysisData);
        alert('Analysis saved successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save analysis.');
    }
  };

  const handleGenerateAISummary = async () => {
    if (!data || data.length === 0) {
      setSummaryError('No data available for analysis. Please upload data first.');
      return;
    }

    setIsGeneratingSummary(true);
    setSummaryError('');
    setAiSummary('');

    try {
      const is3DChart = ['bar3d', 'scatter3d', 'pie3d', 'doughnut3d', 'surface3d'].includes(chartType);
      const chartConfig = {
        chartType,
        xAxis,
        yAxis,
        ...(is3DChart && { zAxis })
      };

      const response = await generateAISummary(data, chartConfig);
      setAiSummary(response.data.summary);
    } catch (err) {
      console.error('AI Summary Error:', err);
      setSummaryError(
        err.response?.data?.message || 
        'Failed to generate AI summary. Please try again or check your API configuration.'
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const getChartTitle = () => {
    const chartNames = {
      bar: 'Bar Chart',
      line: 'Line Chart', 
      pie: 'Pie Chart',
      doughnut: 'Doughnut Chart',
      polarArea: 'Polar Area Chart',
      radar: 'Radar Chart',
      scatter: 'Scatter Plot',
      bubble: 'Bubble Chart'
    };
    return `${chartNames[chartType]} - ${yAxis} by ${xAxis}`;
  };

  const renderChart = () => {
    if (!chartData && !['bar3d', 'scatter3d', 'pie3d', 'doughnut3d', 'surface3d'].includes(chartType)) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <p className="mb-2">No chart data available</p>
            <p className="text-sm">Please ensure X-Axis and Y-Axis are selected</p>
          </div>
        </div>
      );
    }

    // Theme-aware colors
    const textColor = isDark ? '#ffffff' : '#374151';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: textColor,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: getChartTitle(),
          color: textColor,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
      },
      scales: {
        ...(chartType === 'radar' ? {
          r: {
            angleLines: {
              display: true,
              color: gridColor
            },
            grid: {
              color: gridColor
            },
            pointLabels: {
              color: textColor
            },
            suggestedMin: 0,
            ticks: {
              color: textColor
            }
          }
        } : ['scatter', 'bubble'].includes(chartType) ? {
          x: {
            type: 'linear',
            position: 'bottom',
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          }
        } : !['pie', 'doughnut', 'polarArea'].includes(chartType) ? {
          x: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          }
        } : {})
      }
    };

    try {
      switch (chartType) {
        case 'bar':
          return <Bar ref={chartRef} data={chartData} options={options} />;
        case 'line':
          return <Line ref={chartRef} data={chartData} options={options} />;
        case 'pie':
          return <Pie ref={chartRef} data={chartData} options={options} />;
        case 'doughnut':
          return <Doughnut ref={chartRef} data={chartData} options={options} />;
        case 'polarArea':
          return <PolarArea ref={chartRef} data={chartData} options={options} />;
        case 'radar':
          return <Radar ref={chartRef} data={chartData} options={options} />;
        case 'scatter':
          return <Scatter ref={chartRef} data={chartData} options={options} />;
        case 'bubble':
          return <Bubble ref={chartRef} data={chartData} options={options} />;
        case 'bar3d':
          return <Chart3D type="bar" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} />;
        case 'scatter3d':
          return <Chart3D type="scatter" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} />;
        case 'pie3d':
          return <Chart3D type="pie" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} />;
        case 'doughnut3d':
          return <Chart3D type="doughnut" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} />;
        case 'surface3d':
          return <Chart3D type="surface" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} />;
        default:
          return (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>Unsupported chart type: {chartType}</p>
            </div>
          );
      }
    } catch (error) {
      console.error('Chart rendering error:', error);
      return (
        <div className="w-full h-full flex items-center justify-center text-red-500">
          <div className="text-center">
            <p className="mb-2">Error rendering chart</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 relative overflow-hidden">
      {/* Floating Graphs Background - with proper z-index for charts */}
      <div style={{ zIndex: -1 }}>
        <FloatingGraphsBackground />
      </div>
      
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
      
      {/* Simplified Header */}
      <div className="z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <FiArrowLeft size={16} />
                <span className="text-sm">Back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Chart' : 'Chart Studio'}
                </h1>
                {data && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.length} rows • {headers.length} columns
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
      {!data ? (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Create Your Visualization
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Upload your data file to get started with beautiful charts and graphs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={loadSampleData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
              >
                <FiZap className="w-5 h-5" />
                Try Sample Data
              </button>
              <span className="text-gray-500 dark:text-gray-400">or</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Upload your own file below</span>
            </div>
          </div>
          <UploadZone onFileUpload={handleFileUpload} />
          
          {/* Try Sample Data Button */}
          <div className="mt-8 text-center">
            <button
              onClick={loadSampleData}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105"
            >
              <FiBarChart2 className="text-xl" />
              Try Sample Data
            </button>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              See how charts work with our sample sales data
            </p>
          </div>
          
          {uploading && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Processing your file...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Chart Controls</h3>
            
            {/* X-Axis Selector */}
            <div className="mb-4">
              <label htmlFor="x-axis" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">X-Axis</label>
              <select 
                id="x-axis" 
                value={xAxis} 
                onChange={e => setXAxis(e.target.value)} 
                className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Y-Axis Selector */}
            <div className="mb-6">
              <label htmlFor="y-axis" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Y-Axis</label>
              <select 
                id="y-axis" 
                value={yAxis} 
                onChange={e => setYAxis(e.target.value)} 
                className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Z-Axis Selector (for 3D charts) */}
            {['bar3d', 'scatter3d', 'pie3d', 'doughnut3d', 'surface3d'].includes(chartType) && (
              <div className="mb-6">
                <label htmlFor="z-axis" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Z-Axis</label>
                <select
                  id="z-axis"
                  value={zAxis}
                  onChange={e => setZAxis(e.target.value)}
                  className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            )}

            {/* Chart Type Selector */}
            <div>
              <h4 className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Chart Type</h4>
              
              {/* Basic Charts */}
              <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Basic Charts</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setChartType('bar')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'bar' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Bar Chart"
                  >
                    <FiBarChart2 className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => setChartType('line')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'line' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Line Chart"
                  >
                    <FiTrendingUp className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => setChartType('pie')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'pie' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Pie Chart"
                  >
                    <FiPieChart className="mx-auto" />
                  </button>
                </div>
              </div>

              {/* Advanced Charts */}
              <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Advanced Charts</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setChartType('doughnut')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'doughnut' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Doughnut Chart"
                  >
                    <FiCircle className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => setChartType('polarArea')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'polarArea' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Polar Area Chart"
                  >
                    <FiTarget className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => setChartType('radar')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'radar' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Radar Chart"
                  >
                    <FiHexagon className="mx-auto" />
                  </button>
                </div>
              </div>

              {/* Scientific Charts */}
              <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Scientific Charts</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setChartType('scatter')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'scatter' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Scatter Plot"
                  >
                    <FiGrid className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => setChartType('bubble')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'bubble' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Bubble Chart"
                  >
                    <FiZap className="mx-auto" />
                  </button>
                </div>
              </div>

              {/* 3D Charts */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">3D Charts</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button 
                    onClick={() => setChartType('bar3d')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'bar3d' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="3D Bar Chart"
                  >
                    <FiBox className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => setChartType('scatter3d')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'scatter3d' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="3D Scatter Plot"
                  >
                    <FiGlobe className="mx-auto" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setChartType('pie3d')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'pie3d' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="3D Pie Chart"
                  >
                    <FiPieChart className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => setChartType('doughnut3d')} 
                    className={`p-3 rounded-lg transition-colors ${
                      chartType === 'doughnut3d' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    title="3D Doughnut Chart"
                  >
                    <FiCircle className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis Name */}
            <div className="mt-6">
              <label htmlFor="analysis-name" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Analysis Name</label>
              <input
                type="text"
                id="analysis-name"
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Save and Download Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              <button 
                onClick={handleSaveAnalysis} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
              >
                <FiSave /> {isEditing ? 'Update Analysis' : 'Save Analysis'}
              </button>
              
              <button 
                onClick={handleGenerateAISummary}
                disabled={!data || isGeneratingSummary}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors shadow-sm"
              >
                {isGeneratingSummary ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FiZap /> Generate AI Summary
                  </>
                )}
              </button>
              
              {/* Download Options */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Download Options</p>
                
                <button 
                  onClick={handleDownloadPNG}
                  disabled={!chartData}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  <FiDownload /> PNG Chart
                </button>
                
                <button 
                  onClick={handleDownloadCSV}
                  disabled={!data || data.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  <FiDownload /> CSV Data
                </button>
                
                <button 
                  onClick={handleDownloadJSON}
                  disabled={!data || !analysisName}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  <FiDownload /> JSON Analysis
                </button>
                
                <button 
                  onClick={handleDownloadSummary}
                  disabled={!aiSummary}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  <FiDownload /> AI Summary
                </button>
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px]">            
            {/* Chart Container */}
            <div className="w-full h-[500px] bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center mb-6">
              <div className="w-full h-full p-4">
                {chartData ? (
                  <div className="w-full h-full min-h-[400px] relative">
                    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                      {renderChart()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>No chart data available. Please select X and Y axes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary Display */}
            {aiSummary && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-4">
                  <FiZap className="text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Summary</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {aiSummary}
                  </p>
                </div>
              </div>
            )}

            {/* AI Summary Error Display */}
            {summaryError && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                <p className="text-red-700 dark:text-red-400 text-sm">{summaryError}</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ChartStudio;
