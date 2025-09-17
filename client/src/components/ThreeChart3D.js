import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useSelector } from 'react-redux';

const ThreeChart3D = React.forwardRef(({ data, chartType = 'bar', title = '3D Chart' }, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = useSelector((state) => state.theme.isDark);

  // Expose a method to handle downloads
  React.useImperativeHandle(ref, () => ({
    downloadChart: () => {
      if (rendererRef.current && cameraRef.current) {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        const link = document.createElement('a');
        link.download = `${title.replace(/ /g, '_') || '3d-chart'}.png`;
        
        // Temporarily set background to white for the screenshot
        const originalBackground = sceneRef.current.background;
        sceneRef.current.background = new THREE.Color(0xffffff);
        renderer.render(sceneRef.current, camera); // Re-render with white background
        
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();

        // Restore original background
        sceneRef.current.background = originalBackground;
        renderer.render(sceneRef.current, camera); // Re-render with original background
      }
    }
  }));

  // Create 3D Bar Chart
  const createBarChart = useCallback((scene, data, maxValue) => {
    const colors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7,
      0xdda0dd, 0x98d8c8, 0xf7dc6f, 0xbb8fce, 0x85c1e9
    ];

    data.forEach((item, index) => {
      const value = Math.abs(item.value || item.y || 0);
      const height = (value / maxValue) * 5;
      const x = (index - data.length / 2) * 2;
      const z = item.z || 0;
      
      // Bar geometry
      const geometry = new THREE.BoxGeometry(1.5, height, 1.5);
      const material = new THREE.MeshLambertMaterial({ 
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.8
      });
      
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(x, height / 2, z);
      bar.castShadow = true;
      bar.receiveShadow = true;
      
      scene.add(bar);

      // Add text label (simplified for now) - theme-aware color
      const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
      const labelColor = isDark ? 0xffffff : 0x374151;
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        color: labelColor,
        transparent: true,
        opacity: 0.9
      });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(x, height + 1, z);
      label.lookAt(new THREE.Vector3(x, height + 1, 10));
      scene.add(label);
    });
  }, [isDark]);

  // Create 3D Scatter Chart
  const createScatterChart = useCallback((scene, data, maxValue) => {
    const colors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7,
      0xdda0dd, 0x98d8c8, 0xf7dc6f, 0xbb8fce, 0x85c1e9
    ];

    data.forEach((item, index) => {
      const x = ((item.x || index) - data.length / 2) * 0.5;
      const y = ((item.y || item.value || 0) / maxValue) * 5;
      const z = ((item.z || Math.random()) - 0.5) * 5;
      
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshLambertMaterial({ 
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.8
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      
      scene.add(sphere);
    });
  }, []);

  // Create 3D Pie Chart
  const createPieChart = useCallback((scene, data) => {
    const colors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7,
      0xdda0dd, 0x98d8c8, 0xf7dc6f, 0xbb8fce, 0x85c1e9
    ];

    const total = data.reduce((sum, item) => sum + Math.abs(item.value || item.y || 0), 0);
    let currentAngle = 0;

    data.forEach((item, index) => {
      const value = Math.abs(item.value || item.y || 0);
      const angle = (value / total) * Math.PI * 2;
      
      const geometry = new THREE.CylinderGeometry(3, 3, 1, 32, 1, false, currentAngle, angle);
      const material = new THREE.MeshLambertMaterial({ 
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.8
      });
      
      const slice = new THREE.Mesh(geometry, material);
      slice.position.set(0, 0, 0);
      slice.castShadow = true;
      
      scene.add(slice);
      currentAngle += angle;
    });
  }, []);

  // Create 3D Doughnut Chart
  const createDoughnutChart = useCallback((scene, data) => {
    const colors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7,
      0xdda0dd, 0x98d8c8, 0xf7dc6f, 0xbb8fce, 0x85c1e9
    ];

    const total = data.reduce((sum, item) => sum + Math.abs(item.value || item.y || 0), 0);
    let currentAngle = 0;

    data.forEach((item, index) => {
      const value = Math.abs(item.value || item.y || 0);
      const angle = (value / total) * Math.PI * 2;
      
      // Create ring shape using RingGeometry extruded
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 3, currentAngle, currentAngle + angle, false);
      shape.absarc(0, 0, 1.5, currentAngle + angle, currentAngle, true);
      
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 1,
        bevelEnabled: false
      });
      
      const material = new THREE.MeshLambertMaterial({ 
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.8
      });
      
      const slice = new THREE.Mesh(geometry, material);
      slice.position.set(0, 0, 0);
      slice.rotation.x = -Math.PI / 2;
      slice.castShadow = true;
      
      scene.add(slice);
      currentAngle += angle;
    });
  }, []);

  useEffect(() => {
    if (!mountRef.current || !data) return;

    setIsLoading(true);
    const currentMount = mountRef.current; // Store ref for cleanup

    // Scene setup with theme-aware background
    const scene = new THREE.Scene();
    const backgroundColor = isDark ? 0x1a1a2e : 0xf8fafc;
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 10, 0x444444, 0x444444);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Process data
    const processedData = Array.isArray(data) ? data : [];
    const maxValue = Math.max(...processedData.map(d => Math.abs(d.value || d.y || 0)), 1);

    // Create charts based on type
    switch (chartType) {
      case 'bar':
        createBarChart(scene, processedData, maxValue);
        break;
      case 'scatter':
        createScatterChart(scene, processedData, maxValue);
        break;
      case 'pie':
        createPieChart(scene, processedData);
        break;
      case 'doughnut':
        createDoughnutChart(scene, processedData);
        break;
      default:
        createBarChart(scene, processedData, maxValue);
    }

    // Mount renderer
    currentMount.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      if (currentMount && renderer && camera) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    animate();
    setIsLoading(false);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [data, chartType, isDark, createBarChart, createScatterChart, createPieChart, createDoughnutChart]);

  return (
    <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-75 z-10">
          <div className="text-gray-900 dark:text-white text-lg">Loading 3D Chart...</div>
        </div>
      )}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-gray-900 dark:text-white text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Drag to rotate • Scroll to zoom</p>
      </div>
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
});

export default ThreeChart3D;
