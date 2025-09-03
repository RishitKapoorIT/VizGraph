// Demo data and utilities for showing users how the application works

export const demoData = {
  // Sample sales data
  salesData: [
    { Month: 'January', Sales: 45000, Profit: 12000, Region: 'North' },
    { Month: 'February', Sales: 52000, Profit: 15000, Region: 'North' },
    { Month: 'March', Sales: 48000, Profit: 13500, Region: 'North' },
    { Month: 'April', Sales: 61000, Profit: 18000, Region: 'South' },
    { Month: 'May', Sales: 55000, Profit: 16500, Region: 'South' },
    { Month: 'June', Sales: 67000, Profit: 20000, Region: 'South' },
    { Month: 'July', Sales: 59000, Profit: 17500, Region: 'East' },
    { Month: 'August', Sales: 62000, Profit: 18500, Region: 'East' },
    { Month: 'September', Sales: 58000, Profit: 17000, Region: 'West' },
    { Month: 'October', Sales: 64000, Profit: 19000, Region: 'West' },
    { Month: 'November', Sales: 69000, Profit: 21000, Region: 'West' },
    { Month: 'December', Sales: 72000, Profit: 22500, Region: 'West' }
  ],

  // Sample product performance data
  productData: [
    { Product: 'Laptop', Units: 1200, Revenue: 960000, Category: 'Electronics' },
    { Product: 'Smartphone', Units: 2800, Revenue: 1400000, Category: 'Electronics' },
    { Product: 'Tablet', Units: 800, Revenue: 320000, Category: 'Electronics' },
    { Product: 'Headphones', Units: 1500, Revenue: 150000, Category: 'Accessories' },
    { Product: 'Mouse', Units: 2200, Revenue: 66000, Category: 'Accessories' },
    { Product: 'Keyboard', Units: 1800, Revenue: 144000, Category: 'Accessories' }
  ]
};

export const demoChartConfigs = [
  {
    name: 'Monthly Sales Trend',
    data: demoData.salesData,
    settings: {
      chartType: 'line',
      xAxis: 'Month',
      yAxis: 'Sales'
    },
    description: 'Track sales performance across different months'
  },
  {
    name: 'Profit Analysis',
    data: demoData.salesData,
    settings: {
      chartType: 'bar',
      xAxis: 'Month',
      yAxis: 'Profit'
    },
    description: 'Analyze profit trends throughout the year'
  },
  {
    name: 'Product Revenue Distribution',
    data: demoData.productData,
    settings: {
      chartType: 'pie',
      xAxis: 'Product',
      yAxis: 'Revenue'
    },
    description: 'See which products generate the most revenue'
  },
  {
    name: 'Sales vs Profit (3D)',
    data: demoData.salesData,
    settings: {
      chartType: 'scatter3d',
      xAxis: 'Sales',
      yAxis: 'Profit'
    },
    description: 'Interactive 3D visualization of sales and profit correlation'
  }
];

// Helper function to convert data to CSV format for demo
export const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

// Create demo file blob
export const createDemoFile = (dataType = 'sales') => {
  const data = dataType === 'sales' ? demoData.salesData : demoData.productData;
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const fileName = dataType === 'sales' ? 'demo-sales-data.csv' : 'demo-product-data.csv';
  
  // Create a File object from the blob
  return new File([blob], fileName, { type: 'text/csv' });
};
