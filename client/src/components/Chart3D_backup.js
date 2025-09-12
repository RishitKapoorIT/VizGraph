import React, { useRef, useMemo, useEffect } from 'react';

// Simple 3D Bar Component using CSS transforms
const Bar3D = ({ data, position, color, height, label }) => {
  const barRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (barRef.current) {
        const currentRotation = parseFloat(barRef.current.style.transform.replace(/[^\d.-]/g, '')) || 0;
        barRef.current.style.transform = `rotateY(${currentRotation + 1}deg)`;
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        left: position[0] * 60 + 'px',
        position: 'absolute',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        ref={barRef}
        className="rounded-t-md shadow-lg"
        style={{
          width: '40px',
          height: height * 10 + 'px',
          backgroundColor: color,
          transformStyle: 'preserve-3d',
          transform: 'rotateY(0deg)',
          boxShadow: `
            8px 0 0 ${color}ee,
            0 8px 0 ${color}cc,
            8px 8px 0 ${color}aa,
            12px 4px 20px rgba(0,0,0,0.5)
          `,
          border: `2px solid ${color}ff`,
        }}
      >
        <div
          className="absolute top-0 left-0 rounded-t-md border-2"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: `${color}dd`,
            transform: 'rotateX(90deg) translateZ(20px)',
            border: `2px solid ${color}ff`,
          }}
        />
      </div>
      <div className="mt-2 text-xs text-white text-center max-w-16 truncate">
        {label}
      </div>
    </div>
  );
};

// Simple 3D Scatter Plot Component
const Scatter3D = ({ data, position, color, size = 20 }) => {
  const sphereRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (sphereRef.current) {
        const currentRotation = parseFloat(sphereRef.current.style.transform.replace(/[^\d.-]/g, '')) || 0;
        sphereRef.current.style.transform = `rotateY(${currentRotation + 2}deg) rotateX(${Math.sin(currentRotation * 0.01) * 10}deg)`;
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={sphereRef}
      className="absolute rounded-full shadow-lg animate-pulse border-4 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
      style={{
        width: size + 'px',
        height: size + 'px',
        backgroundColor: color,
        left: position[0] + 'px',
        top: position[1] + 'px',
        transformStyle: 'preserve-3d',
        boxShadow: `
          8px 8px 0 ${color}ee,
          -6px -6px 0 ${color}cc inset,
          0 0 25px ${color}aa,
          0 0 50px ${color}66
        `,
        border: `4px solid ${color}ff`,
        zIndex: 10,
      }}
      title={`${data.label}: ${data.value}`}
    >
      <div className="text-white text-xs font-bold text-center">
        {data.value.toFixed(0)}
      </div>
    </div>
  );
};

// Simple 3D Surface using CSS Grid with real data
const Surface3D = ({ data }) => {
  const surfaceRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (surfaceRef.current) {
        const currentRotation = parseFloat(surfaceRef.current.style.transform.replace(/[^\d.-]/g, '')) || 0;
        surfaceRef.current.style.transform = `rotateX(60deg) rotateY(${currentRotation + 0.5}deg)`;
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const gridItems = useMemo(() => {
    if (!data || data.length === 0) {
      // Fallback pattern if no data
      const items = [];
      for (let i = 0; i < 100; i++) {
        const height = Math.sin(i * 0.1) * Math.cos(i * 0.05) * 20 + 30;
        const hue = (i * 3.6) % 360;
        items.push(
          <div
            key={i}
            className="relative border border-white/20"
            style={{
              height: height + 'px',
              backgroundColor: `hsl(${hue}, 80%, 65%)`,
              boxShadow: `
                0 4px 8px rgba(0,0,0,0.4),
                0 0 10px hsla(${hue}, 80%, 65%, 0.6),
                inset 0 1px 0 hsla(${hue}, 80%, 85%, 0.8)
              `,
              border: `1px solid hsla(${hue}, 80%, 85%, 0.3)`,
            }}
          />
        );
      }
      return items;
    }

    // Use real data to create height map
    const items = [];
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    for (let i = 0; i < 64; i++) { // 8x8 grid
      const dataIndex = i % data.length;
      const dataPoint = data[dataIndex];
      const normalizedHeight = ((dataPoint.value - minValue) / range) * 40 + 10;
      const hue = ((dataPoint.value - minValue) / range) * 240 + 120; // Blue to red spectrum
      
      items.push(
        <div
          key={i}
          className="relative border border-white/30 rounded-sm"
          style={{
            height: normalizedHeight + 'px',
            backgroundColor: `hsl(${hue}, 85%, 65%)`,
            boxShadow: `
              0 4px 8px rgba(0,0,0,0.4),
              0 0 10px hsla(${hue}, 85%, 65%, 0.6),
              inset 0 1px 0 hsla(${hue}, 85%, 85%, 0.8)
            `,
            border: `1px solid hsla(${hue}, 85%, 85%, 0.4)`,
          }}
          title={`Value: ${dataPoint.value.toFixed(2)}, Label: ${dataPoint.label}`}
        />
      );
    }
    return items;
  }, [data]);

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={surfaceRef}
        className="grid grid-cols-8 gap-1 p-4"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(60deg) rotateY(0deg)',
        }}
      >
        {gridItems}
      </div>
    </div>
  );
};

// 3D Pie Chart Component
const Pie3D = ({ data }) => {
  const pieRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (pieRef.current) {
        const currentRotation = parseFloat(pieRef.current.style.transform.replace(/[^\d.-]/g, '')) || 0;
        pieRef.current.style.transform = `rotateX(15deg) rotateY(${currentRotation + 1}deg)`;
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  const slices = useMemo(() => {
    let currentAngle = 0;
    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const slice = {
        ...item,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        angle
      };
      currentAngle += angle;
      return slice;
    });
  }, [data, total]);

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={pieRef}
        className="relative w-64 h-64 rounded-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(15deg) rotateY(0deg)',
          background: `conic-gradient(${slices.map(slice => 
            `${slice.color} ${slice.startAngle}deg ${slice.endAngle}deg`
          ).join(', ')})`,
          boxShadow: `
            0 20px 40px rgba(0,0,0,0.4),
            0 0 0 8px rgba(255,255,255,0.1),
            inset 0 0 20px rgba(0,0,0,0.2)
          `,
        }}
      >
        {/* 3D depth effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${slices.map(slice => 
              `${slice.color}cc ${slice.startAngle}deg ${slice.endAngle}deg`
            ).join(', ')})`,
            transform: 'translateZ(-8px) translateY(8px)',
            filter: 'brightness(0.7)',
          }}
        />
        
        {/* Labels */}
        {slices.map((slice, index) => {
          const labelAngle = slice.startAngle + slice.angle / 2;
          const x = Math.cos((labelAngle - 90) * Math.PI / 180) * 100;
          const y = Math.sin((labelAngle - 90) * Math.PI / 180) * 100;
          
          return (
            <div
              key={index}
              className="absolute text-white text-xs font-bold text-center pointer-events-none"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              <div>{slice.label}</div>
              <div className="text-[10px]">{slice.percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3D Doughnut Chart Component
const Doughnut3D = ({ data }) => {
  const doughnutRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (doughnutRef.current) {
        const currentRotation = parseFloat(doughnutRef.current.style.transform.replace(/[^\d.-]/g, '')) || 0;
        doughnutRef.current.style.transform = `rotateX(20deg) rotateY(${currentRotation + 1}deg)`;
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  const slices = useMemo(() => {
    let currentAngle = 0;
    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const slice = {
        ...item,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        angle
      };
      currentAngle += angle;
      return slice;
    });
  }, [data, total]);

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={doughnutRef}
        className="relative w-64 h-64 rounded-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(20deg) rotateY(0deg)',
          background: `conic-gradient(${slices.map(slice => 
            `${slice.color} ${slice.startAngle}deg ${slice.endAngle}deg`
          ).join(', ')})`,
          boxShadow: `
            0 20px 40px rgba(0,0,0,0.4),
            0 0 0 8px rgba(255,255,255,0.1)
          `,
        }}
      >
        {/* Inner hole for doughnut effect */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gray-800"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 0 0 4px rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center justify-center w-full h-full text-white text-center">
            <div>
              <div className="text-lg font-bold">{total.toFixed(0)}</div>
              <div className="text-xs">Total</div>
            </div>
          </div>
        </div>
        
        {/* 3D depth effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${slices.map(slice => 
              `${slice.color}aa ${slice.startAngle}deg ${slice.endAngle}deg`
            ).join(', ')})`,
            transform: 'translateZ(-10px) translateY(10px)',
            filter: 'brightness(0.6)',
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gray-900"
            style={{
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.9)',
            }}
          />
        </div>
        
        {/* Labels */}
        {slices.map((slice, index) => {
          const labelAngle = slice.startAngle + slice.angle / 2;
          const x = Math.cos((labelAngle - 90) * Math.PI / 180) * 120;
          const y = Math.sin((labelAngle - 90) * Math.PI / 180) * 120;
          
          return (
            <div
              key={index}
              className="absolute text-white text-xs font-bold text-center pointer-events-none"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              <div>{slice.label}</div>
              <div className="text-[10px]">{slice.percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main 3D Chart Component
const Chart3D = ({ type, data, options = {} }) => {
  const processedData = useMemo(() => {
    if (!data || !data.datasets || !data.datasets[0]) return [];
    
    const dataset = data.datasets[0];
    const labels = data.labels || [];
    
    return dataset.data.map((value, index) => ({
      label: labels[index] || `Item ${index + 1}`,
      value: Math.max(value, 1), // Ensure positive values for height
      color: dataset.backgroundColor?.[index] || `hsl(${index * 45 + 200}, 85%, 65%)`
    }));
  }, [data]);

  const renderChart = () => {
    switch (type) {
      case 'bar3d':
        return (
          <div className="relative h-full flex items-end justify-center pb-8" style={{ perspective: '1000px' }}>
            <div className="absolute top-4 left-4 text-white text-sm">
              <div className="font-bold">3D Bar Chart</div>
              <div className="text-xs text-gray-300">Values: {processedData.map(d => d.value.toFixed(1)).join(', ')}</div>
            </div>
            <div className="relative flex items-end gap-2" style={{ transformStyle: 'preserve-3d' }}>
              {processedData.slice(0, 8).map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Bar3D
                    data={item}
                    position={[index * 1.2 - processedData.length / 2, 0, 0]}
                    color={item.color}
                    height={Math.max(item.value / 3, 5)} // Better scaling with minimum height
                    label={item.label}
                  />
                  <div className="text-white text-xs mt-2 text-center max-w-16">
                    {item.value.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'scatter3d':
        return (
          <div className="relative h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
            <div className="text-center mb-4 text-white">
              <div className="text-lg font-bold mb-2">3D Scatter Plot</div>
              <div className="text-sm text-gray-300">Data Points: {processedData.length}</div>
            </div>
            {processedData.slice(0, 15).map((item, index) => (
              <Scatter3D
                key={index}
                data={item}
                position={[
                  50 + (index % 5) * 80, // Grid X positioning
                  100 + Math.floor(index / 5) * 60, // Grid Y positioning
                ]}
                color={item.color}
                size={Math.max(item.value / 3 + 15, 20)} // Larger, more visible sizes
              />
            ))}
            {/* Data labels */}
            <div className="absolute bottom-4 left-4 text-white text-xs">
              <div>Largest: {Math.max(...processedData.map(d => d.value)).toFixed(1)}</div>
              <div>Smallest: {Math.min(...processedData.map(d => d.value)).toFixed(1)}</div>
            </div>
          </div>
        );
      
      case 'pie3d':
        return (
          <div className="relative h-full flex flex-col" style={{ perspective: '1000px' }}>
            <div className="text-center text-white mb-4">
              <div className="font-bold">3D Pie Chart</div>
              <div className="text-xs text-gray-300">Total: {processedData.reduce((sum, d) => sum + d.value, 0).toFixed(1)}</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Pie3D data={processedData} />
            </div>
          </div>
        );
      
      case 'doughnut3d':
        return (
          <div className="relative h-full flex flex-col" style={{ perspective: '1000px' }}>
            <div className="text-center text-white mb-4">
              <div className="font-bold">3D Doughnut Chart</div>
              <div className="text-xs text-gray-300">Data Points: {processedData.length}</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Doughnut3D data={processedData} />
            </div>
          </div>
        );
      
      case 'surface3d':
        return (
          <div className="relative h-full flex flex-col" style={{ perspective: '1000px' }}>
            <div className="text-center text-white mb-4">
              <div className="font-bold">3D Surface Plot</div>
              <div className="text-xs text-gray-300">Based on your data: {processedData.length} points</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Surface3D data={processedData} />
            </div>
            <div className="text-center text-white text-xs">
              <div>Data Range: {Math.min(...processedData.map(d => d.value)).toFixed(1)} - {Math.max(...processedData.map(d => d.value)).toFixed(1)}</div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <div>3D Chart</div>
              <div className="text-sm text-gray-400 mt-2">Interactive 3D Visualization</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-96 bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-lg overflow-hidden relative border border-purple-500/30">
      <div className="absolute top-4 right-4 text-xs text-white bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 rounded-full shadow-lg">
        ✨ 3D Mode
      </div>
      <div className="w-full h-full p-4">
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart3D;
