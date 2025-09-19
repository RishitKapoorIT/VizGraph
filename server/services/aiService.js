import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
});

/**
 * Generate AI summary for data analysis
 * @param {Array} data - The data array to analyze
 * @param {Object} chartConfig - Chart configuration (xAxis, yAxis, chartType)
 * @returns {Promise<string>} - AI generated summary
 */
export const generateDataSummary = async (data, chartConfig = {}) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data provided for analysis');
    }

    // Prepare data sample for analysis (limit to first 10 rows for API efficiency)
    const dataSample = data.slice(0, 10);
    const dataKeys = Object.keys(data[0] || {});
    const dataSize = data.length;

    // Create analysis prompt
    const prompt = `
Analyze this dataset and provide a comprehensive summary:

Dataset Overview:
- Total Records: ${dataSize}
- Columns: ${dataKeys.join(', ')}
- Chart Type: ${chartConfig.chartType || 'Not specified'}
- X-Axis: ${chartConfig.xAxis || 'Not specified'}
- Y-Axis: ${chartConfig.yAxis || 'Not specified'}

Sample Data (first ${dataSample.length} rows):
${JSON.stringify(dataSample, null, 2)}

Please provide:
1. **Key Insights**: 3-4 main findings from the data
2. **Data Trends**: Notable patterns, correlations, or anomalies
3. **Statistical Overview**: Basic statistics (ranges, averages if applicable)
4. **Recommendations**: Suggested actions or further analysis based on the data

Keep the summary concise but informative, focusing on actionable insights.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a data analyst expert. Provide clear, concise, and actionable insights from datasets."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('AI Service Error:', error);
    
    // Provide fallback analysis if AI service fails
    if (error.code === 'invalid_api_key' || error.status === 401) {
      return generateFallbackSummary(data, chartConfig);
    }
    
    throw new Error('Failed to generate AI summary: ' + error.message);
  }
};

/**
 * Fallback summary generation when AI service is unavailable
 * @param {Array} data - The data array to analyze
 * @param {Object} chartConfig - Chart configuration
 * @returns {string} - Basic statistical summary
 */
const generateFallbackSummary = (data, chartConfig) => {
  const dataKeys = Object.keys(data[0] || {});
  const dataSize = data.length;

  // Calculate basic statistics for numeric columns
  const numericColumns = {};
  dataKeys.forEach(key => {
    const values = data.map(row => row[key]).filter(val => !isNaN(val) && val !== '');
    if (values.length > 0) {
      const numericValues = values.map(Number);
      numericColumns[key] = {
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        avg: (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2)
      };
    }
  });

  let summary = `## Dataset Summary\n\n`;
  summary += `**Overview**: This dataset contains ${dataSize} records with ${dataKeys.length} columns: ${dataKeys.join(', ')}.\n\n`;
  
  if (chartConfig.chartType) {
    summary += `**Visualization**: Currently displayed as a ${chartConfig.chartType} chart`;
    if (chartConfig.xAxis && chartConfig.yAxis) {
      summary += ` showing ${chartConfig.yAxis} across ${chartConfig.xAxis}`;
    }
    summary += `.\n\n`;
  }

  if (Object.keys(numericColumns).length > 0) {
    summary += `**Key Statistics**:\n`;
    Object.entries(numericColumns).forEach(([column, stats]) => {
      summary += `- ${column}: Range ${stats.min} to ${stats.max} (Average: ${stats.avg})\n`;
    });
    summary += `\n`;
  }

  summary += `**Recommendations**:\n`;
  summary += `- Consider exploring different chart types to reveal patterns\n`;
  summary += `- Look for correlations between numeric variables\n`;
  summary += `- Filter or segment the data for deeper insights\n`;

  return summary;
};

export default { generateDataSummary };