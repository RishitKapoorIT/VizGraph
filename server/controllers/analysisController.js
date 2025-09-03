import { generateDataSummary } from '../services/aiService.js';

/**
 * Generate AI summary for uploaded data
 * POST /api/analysis/summarize
 */
export const generateSummary = async (req, res) => {
  try {
    const { data, chartConfig } = req.body;

    // Validate input
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data provided. Please ensure data is a non-empty array.'
      });
    }

    

    // Generate AI summary
    const summary = await generateDataSummary(data, chartConfig);

    res.json({
      success: true,
      summary: summary,
      metadata: {
        recordCount: data.length,
        columnsAnalyzed: Object.keys(data[0] || {}),
        chartType: chartConfig?.chartType || null,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
};

/**
 * Get analysis statistics
 * GET /api/analysis/stats
 */
export const getAnalysisStats = async (req, res) => {
  try {
    // This would typically query your database for analysis statistics
    // For now, return mock data - you can implement database queries later
    
    const stats = {
      totalAnalyses: 0, // You can query your Analysis model
      totalDataPoints: 0,
      mostUsedChartType: 'bar',
      averageDataSize: 0,
      recentAnalyses: []
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis statistics'
    });
  }
};

export default {
  generateSummary,
  getAnalysisStats
};