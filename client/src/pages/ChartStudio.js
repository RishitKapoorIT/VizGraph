import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  
  // Customization state
  const [colorTheme, setColorTheme] = useState('blue');
  const [showGrid, setShowGrid] = useState(true);

  // Analysis state
  const [analysisName, setAnalysisName] = useState('My Analysis');
  const [fileId, setFileId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  // Sanitize AI summary text to remove Markdown (#, *, _, **)
  const sanitizeSummaryText = (text) => {
    if (!text || typeof text !== 'string') return '';
    let t = text
      // Remove heading markers at start of line (e.g., ## Title)
      .replace(/^\s*#+\s*/gm, '')
      // Remove bold/italic markers
      .replace(/\*\*|__|\*|_/g, '')
      // Remove triple backtick fences
      .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''));
    // Trim right spaces per line and overall
    t = t.split('\n').map(l => l.replace(/\s+$/,'')).join('\n').trim();
    return t;
  };

  const chartRef = useRef(null);
  const threeExporterRef = useRef(null);

  // Sample data for demonstration
  const sampleData = useMemo(() => ([
    { Month: 'January', Sales: 4500, Revenue: 45000, Customers: 120 },
    { Month: 'February', Sales: 5200, Revenue: 52000, Customers: 140 },
    { Month: 'March', Sales: 4800, Revenue: 48000, Customers: 135 },
    { Month: 'April', Sales: 6100, Revenue: 61000, Customers: 160 },
    { Month: 'May', Sales: 7200, Revenue: 72000, Customers: 180 },
    { Month: 'June', Sales: 6800, Revenue: 68000, Customers: 170 }
  ]), []);

  // Load sample data function
  const loadSampleData = useCallback(() => {
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
  }, [sampleData]);

  // Load analysis data if editing
  useEffect(() => {
    if (editingAnalysis) {
      setIsEditing(true);
      setAnalysisName(editingAnalysis.name);
      setXAxis(editingAnalysis.settings.xAxis);
      setYAxis(editingAnalysis.settings.yAxis);
      setZAxis(editingAnalysis.settings.zAxis || '');
      setChartType(editingAnalysis.settings.chartType);
      setColorTheme(editingAnalysis.settings.colorTheme || 'blue');
      setShowGrid(editingAnalysis.settings.showGrid !== false);
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
    } else if (isDemoMode) {
      // Demo mode: avoid backend calls and just load built-in sample data
      loadSampleData();
    }
  }, [editingAnalysis, isDemoMode, demoFile, loadSampleData]);

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

    const getColors = (theme, count) => {
      const themes = {
        blue: { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)', point: 'rgba(59, 130, 246, 1)' },
        purple: { bg: 'rgba(147, 51, 234, 0.6)', border: 'rgba(147, 51, 234, 1)', point: 'rgba(147, 51, 234, 1)' },
        green: { bg: 'rgba(34, 197, 94, 0.6)', border: 'rgba(34, 197, 94, 1)', point: 'rgba(34, 197, 94, 1)' },
        orange: { bg: 'rgba(249, 115, 22, 0.6)', border: 'rgba(249, 115, 22, 1)', point: 'rgba(249, 115, 22, 1)' },
        red: { bg: 'rgba(239, 68, 68, 0.6)', border: 'rgba(239, 68, 68, 1)', point: 'rgba(239, 68, 68, 1)' }
      };
      
      if (theme === 'colorful' || isPieType) {
        return {
          bg: Array.from({ length: count }).map((_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`),
          border: Array.from({ length: count }).map(() => isDark ? '#1f2937' : '#ffffff'),
          point: Array.from({ length: count }).map((_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`)
        };
      }
      return themes[theme] || themes.blue;
    };
    
    const colors = getColors(colorTheme, data.length);

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
            backgroundColor: colors.bg,
            borderColor: colors.border,
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
          backgroundColor: chartType === 'radar' ? (Array.isArray(colors.bg) ? colors.bg[0] : colors.bg).replace('0.6', '0.2') : colors.bg,
          borderColor: colors.border,
          borderWidth: 1,
          ...(chartType === 'radar' && { 
            fill: true,
            pointBackgroundColor: Array.isArray(colors.point) ? colors.point[0] : colors.point,
            pointBorderColor: isDark ? '#1f2937' : '#ffffff',
            pointHoverBackgroundColor: isDark ? '#1f2937' : '#ffffff',
            pointHoverBorderColor: Array.isArray(colors.point) ? colors.point[0] : colors.point
          })
        },
      ],
    };
  }, [data, xAxis, yAxis, chartType, colorTheme, isDark]);

  const handleDownloadPNG = () => {
    const is3D = ['bar3d', 'scatter3d', 'pie3d', 'doughnut3d', 'surface3d'].includes(chartType);
    if (!is3D && chartRef.current) {
      const link = document.createElement('a');
      link.download = `${analysisName || 'chart'}.png`;
      link.href = chartRef.current.toBase64Image();
      link.click();
      return;
    }
    if (is3D && typeof threeExporterRef.current === 'function') {
      const dataUrl = threeExporterRef.current({ pixelRatio: 2, type: 'image/png' }) || threeExporterRef.current();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `${analysisName || 'chart'}.png`;
        link.href = dataUrl;
        link.click();
      }
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
        chartType,
        colorTheme,
        showGrid
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
      sanitizeSummaryText(aiSummary),
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
  setAiSummary(sanitizeSummaryText(response.data.summary));
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
      bubble: 'Bubble Chart',
      bar3d: '3D Bar Chart',
      scatter3d: '3D Scatter Plot',
      pie3d: '3D Pie Chart',
      doughnut3d: '3D Doughnut Chart',
      surface3d: '3D Surface Chart'
    };
    const base = chartNames[chartType] || 'Chart';
    if (['bar3d','scatter3d','pie3d','doughnut3d','surface3d'].includes(chartType) && zAxis) {
      return `${base} - ${yAxis} by ${xAxis}${zAxis ? ` (Z: ${zAxis})` : ''}`;
    }
    return `${base} - ${yAxis} by ${xAxis}`;
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
              display: showGrid,
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
              display: showGrid,
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          },
          y: {
            grid: {
              display: showGrid,
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          }
        } : !['pie', 'doughnut', 'polarArea'].includes(chartType) ? {
          x: {
            grid: {
              display: showGrid,
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          },
          y: {
            grid: {
              display: showGrid,
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
          return <Chart3D type="bar" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} onExportReady={(fn) => (threeExporterRef.current = fn)} />;
        case 'scatter3d':
          return <Chart3D type="scatter" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} onExportReady={(fn) => (threeExporterRef.current = fn)} />;
        case 'pie3d':
          return <Chart3D type="pie" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} onExportReady={(fn) => (threeExporterRef.current = fn)} />;
        case 'doughnut3d':
          return <Chart3D type="doughnut" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} onExportReady={(fn) => (threeExporterRef.current = fn)} />;
        case 'surface3d':
          return <Chart3D type="surface" data={data} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} title={getChartTitle()} onExportReady={(fn) => (threeExporterRef.current = fn)} />;
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

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-blue-800 dark:text-blue-300 font-semibold">Demo mode</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">This is a sample experience. Sign up to generate AI summaries and save your analyses.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">Sign up</button>
                <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Log in</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
      {!data ? (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] animate-gradient">Visualization</span>
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
          
          {uploading && !isDemoMode && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Processing your file...</p>
              </div>
            </div>
          )}
          {error && !isDemoMode && (
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
          <div className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
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
            
            {/* Customization Options */}
            <div className="mb-6 bg-white/50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Customization</h4>
              
              <div className="mb-4">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {['blue', 'purple', 'green', 'orange', 'red', 'colorful'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => setColorTheme(theme)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${colorTheme === theme ? 'scale-110 border-gray-900 dark:border-white shadow-md' : 'border-transparent hover:scale-105 shadow-sm'}`}
                      style={{
                        background: theme === 'colorful' ? 'linear-gradient(to right, #3b82f6, #a855f7, #ef4444)' : 
                          theme === 'blue' ? '#3b82f6' : 
                          theme === 'purple' ? '#a855f7' : 
                          theme === 'green' ? '#22c55e' : 
                          theme === 'orange' ? '#f97316' : '#ef4444'
                      }}
                      title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Grid Lines</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={showGrid} onChange={() => setShowGrid(!showGrid)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Chart Types */}
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
                onClick={isDemoMode ? () => navigate('/register') : handleSaveAnalysis} 
                disabled={isDemoMode}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${isDemoMode ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] text-white shadow-lg'}`}
              >
                {!isDemoMode && <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>}
                <FiSave className="relative z-10" /> <span className="relative z-10">{isEditing ? 'Update Analysis' : 'Save Analysis'}{isDemoMode ? ' (Sign up required)' : ''}</span>
              </button>
              
              <button 
                onClick={isDemoMode ? () => navigate('/register') : handleGenerateAISummary}
                disabled={isDemoMode || !data || isGeneratingSummary}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${isDemoMode ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-[1.02] text-white shadow-lg'}`}
              >
                {(!isDemoMode && !isGeneratingSummary && data) && <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>}
                {isGeneratingSummary ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white relative z-10"></div>
                    <span className="relative z-10">Generating...</span>
                  </>
                ) : (
                  <>
                    <FiZap className="relative z-10" /> <span className="relative z-10">Generate AI Summary</span>
                  </>
                )}
              </button>
              {isDemoMode && (
                <div className="text-xs text-gray-600 dark:text-gray-300 text-center -mt-2">
                  Sign up to enable saving and AI summaries
                </div>
              )}
              
              {/* Download Options */}
              <div className="mt-8 bg-white/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <FiDownload className="text-blue-500" /> Export Your Work
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleDownloadPNG}
                    disabled={!chartData}
                    className="flex flex-col items-center justify-center gap-1 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300 group"
                  >
                    <FiDownload className="text-green-500 group-hover:scale-110 transition-transform" size={20} /> 
                    <span className="text-xs font-semibold mt-1">Image (PNG)</span>
                  </button>
                  
                  <button 
                    onClick={handleDownloadCSV}
                    disabled={!data || data.length === 0}
                    className="flex flex-col items-center justify-center gap-1 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300 group"
                  >
                    <FiDownload className="text-blue-500 group-hover:scale-110 transition-transform" size={20} /> 
                    <span className="text-xs font-semibold mt-1">Data (CSV)</span>
                  </button>
                  
                  <button 
                    onClick={handleDownloadJSON}
                    disabled={!data || !analysisName}
                    className="flex flex-col items-center justify-center gap-1 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300 group"
                  >
                    <FiDownload className="text-indigo-500 group-hover:scale-110 transition-transform" size={20} /> 
                    <span className="text-xs font-semibold mt-1">Save (JSON)</span>
                  </button>
                  
                  <button 
                    onClick={handleDownloadSummary}
                    disabled={!aiSummary}
                    className="flex flex-col items-center justify-center gap-1 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300 group"
                  >
                    <FiDownload className="text-purple-500 group-hover:scale-110 transition-transform" size={20} /> 
                    <span className="text-xs font-semibold mt-1">AI Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div className="lg:col-span-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 min-h-[600px] flex flex-col">            
            {/* Chart Container */}
            <div className="w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/80 dark:to-gray-800/80 rounded-xl flex items-center justify-center mb-6 shadow-inner border border-gray-200/50 dark:border-gray-700/50">
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
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-purple-200/50 dark:border-purple-500/30 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-md">
                    <FiZap className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">AI Insights</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {aiSummary}
                  </p>
                </div>
              </div>
            )}

            {/* AI Summary Error Display */}
            {summaryError && !isDemoMode && (
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
