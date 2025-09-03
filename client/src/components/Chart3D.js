import React from 'react';
import ThreeChart3D from './ThreeChart3D';

const Chart3D = ({ data, type, xAxis, yAxis, zAxis, title }) => {
  // Convert data to format expected by ThreeChart3D
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || !xAxis || !yAxis) return [];
    
    return data.map((item, index) => ({
      x: item[xAxis] || index,
      y: item[yAxis] || 0,
      z: zAxis ? item[zAxis] || 0 : (type === 'scatter' ? Math.random() * 2 - 1 : 0),
      value: item[yAxis] || 0,
      label: item[xAxis] || `Item ${index + 1}`
    }));
  }, [data, xAxis, yAxis, zAxis, type]);

  return (
    <div className="w-full h-full">
      <ThreeChart3D 
        data={processedData}
        chartType={type}
        title={title || '3D Chart'}
      />
    </div>
  );
};

export default Chart3D;
