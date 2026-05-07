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
// Sanitize AI output to remove Markdown decorations like # and *
const sanitizeSummary = (text) => {
  if (!text || typeof text !== 'string') return '';
  // Remove leading markdown headings (e.g., ## Title)
  const noHashes = text.replace(/^\s*#+\s*/gm, '');
  // Remove bold/italic markers **, *, __, _
  const noAsterisks = noHashes.replace(/\*\*?|__|_/g, '');
  // Trim excess spaces on each line
  return noAsterisks
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
};

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
Analyze this dataset and provide a comprehensive summary as plain text (no Markdown, no # or * characters).

Dataset Overview:
- Total Records: ${dataSize}
- Columns: ${dataKeys.join(', ')}
- Chart Type: ${chartConfig.chartType || 'Not specified'}
- X-Axis: ${chartConfig.xAxis || 'Not specified'}
- Y-Axis: ${chartConfig.yAxis || 'Not specified'}

Sample Data (first ${dataSample.length} rows):
${JSON.stringify(dataSample, null, 2)}

Please provide, in plain text with short paragraphs and hyphen bullets only:
1) Key insights (3-4 findings)
2) Data trends (patterns or correlations)
3) Statistical overview (ranges, averages if relevant)
4) Recommendations (next steps)

Important formatting rules:
- Do not use Markdown headings, bold, or italics.
- Do not include any #, *, **, __, or _ characters in the output.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a data analyst expert. Output must be plain text only, without any Markdown or special formatting characters like #, *, **, __, _."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;
    return sanitizeSummary(raw);

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

  let summary = `Dataset Summary\n\n`;
  summary += `Overview: This dataset contains ${dataSize} records with ${dataKeys.length} columns: ${dataKeys.join(', ')}.\n\n`;
  
  if (chartConfig.chartType) {
    summary += `Visualization: Currently displayed as a ${chartConfig.chartType} chart`;
    if (chartConfig.xAxis && chartConfig.yAxis) {
      summary += ` showing ${chartConfig.yAxis} across ${chartConfig.xAxis}`;
    }
    summary += `.\n\n`;
  }

  if (Object.keys(numericColumns).length > 0) {
    summary += `Key Statistics:\n`;
    Object.entries(numericColumns).forEach(([column, stats]) => {
      summary += `- ${column}: Range ${stats.min} to ${stats.max} (Average: ${stats.avg})\n`;
    });
    summary += `\n`;
  }

  summary += `Recommendations:\n`;
  summary += `- Consider exploring different chart types to reveal patterns\n`;
  summary += `- Look for correlations between numeric variables\n`;
  summary += `- Filter or segment the data for deeper insights\n`;

  return sanitizeSummary(summary);
};

export default { generateDataSummary };