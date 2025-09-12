import React, { useState, useEffect, useRef } from 'react';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiGitMerge, FiShare2, FiActivity } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import './FloatingGraphsBackground.css';

// Base set of icons
const baseIcons = [
  { icon: FiBarChart2, size: '6rem' },
  { icon: FiTrendingUp, size: '5rem' },
  { icon: FiPieChart, size: '7rem' },
  { icon: FiGitMerge, size: '4rem' },
  { icon: FiShare2, size: '6rem' },
  { icon: FiActivity, size: '4.5rem' },
  { icon: FiBarChart2, size: '8rem' },
  { icon: FiPieChart, size: '5.5rem' },
];

// Increased quantity of icons for a fuller background
const icons = [...baseIcons, ...baseIcons, ...baseIcons.slice(0, 4)]; // Total of 20 icons

const FloatingGraphsBackground = () => {
  const [iconsState, setIconsState] = useState([]);
  const draggedIconRef = useRef(null);
  const mouseOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const { isDark } = useTheme();

  // Initialize icons on mount
  useEffect(() => {
    setIconsState(
      icons.map((item, index) => ({
        ...item,
        id: index,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        baseY: Math.random() * window.innerHeight,
        angle: Math.random() * 2 * Math.PI,
      }))
    );
  }, []);

  // Animation loop for floating effect
  useEffect(() => {
    const animate = () => {
      setIconsState(currentIcons =>
        currentIcons.map(icon => {
          if (draggedIconRef.current === icon.id) {
            return icon; // Don't apply floating animation if being dragged
          }
          // Faster floating animation
          const newAngle = icon.angle + 0.02;
          const newY = icon.baseY + Math.sin(newAngle) * 20;
          return { ...icon, y: newY, angle: newAngle };
        })
      );
      requestAnimationFrame(animate);
    };
    const animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    draggedIconRef.current = id;
    const icon = iconsState.find(i => i.id === id);
    if (icon) {
      mouseOffsetRef.current = { x: e.clientX - icon.x, y: e.clientY - icon.y };
    }
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = React.useCallback((e) => {
    if (draggedIconRef.current === null) return;

    const newX = e.clientX - mouseOffsetRef.current.x;
    const newY = e.clientY - mouseOffsetRef.current.y;

    setIconsState(currentIcons => {
      let updatedIcons = currentIcons.map(icon => 
        icon.id === draggedIconRef.current ? { ...icon, x: newX, y: newY } : icon
      );

      const draggedIcon = updatedIcons.find(i => i.id === draggedIconRef.current);
      if (!draggedIcon) return updatedIcons;

      // Collision detection and repulsion
      updatedIcons = updatedIcons.map(icon => {
        if (icon.id === draggedIconRef.current) return icon;

        const dx = draggedIcon.x - icon.x;
        const dy = draggedIcon.y - icon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const size1 = parseFloat(draggedIcon.size.replace('rem', '')) * 16;
        const size2 = parseFloat(icon.size.replace('rem', '')) * 16;
        const minDistance = (size1 + size2) / 2;

        if (distance < minDistance) {
          const overlap = minDistance - distance;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * overlap;
          const pushY = Math.sin(angle) * overlap;
          return { ...icon, x: icon.x - pushX, y: icon.y - pushY };
        }
        return icon;
      });

      return updatedIcons;
    });
  }, []);

  const handleMouseUp = () => {
    draggedIconRef.current = null;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'default';
    }
  };

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('mousemove', handleMouseMove);
      currentContainer.addEventListener('mouseup', handleMouseUp);
      currentContainer.addEventListener('mouseleave', handleMouseUp);
    }
    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('mousemove', handleMouseMove);
        currentContainer.removeEventListener('mouseup', handleMouseUp);
        currentContainer.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [handleMouseMove]); // Re-bind if the handler changes

  return (
    <div 
      className={`background-container ${isDark ? 'dark' : 'light'}`} 
      ref={containerRef}
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
      }}
    >
      {iconsState.map(item => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.id}
            className="floating-icon"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              fontSize: item.size,
              cursor: 'grab',
              color: isDark 
                ? 'rgba(148, 163, 184, 0.08)' 
                : 'rgba(71, 85, 105, 0.08)',
              filter: isDark 
                ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.1))'
                : 'drop-shadow(0 0 10px rgba(15, 23, 42, 0.05))'
            }}
            onMouseDown={e => handleMouseDown(e, item.id)}
          >
            <IconComponent />
          </div>
        );
      })}
    </div>
  );
};

export default FloatingGraphsBackground;
