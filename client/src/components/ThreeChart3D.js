import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useTheme } from '../contexts/ThemeContext';

const ThreeChart3D = ({ data, chartType = 'bar', title = '3D Chart', axisLabels = { x: 'X', y: 'Y', z: 'Z' }, onExportReady }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();
  const { x: axisX, y: axisY, z: axisZ } = axisLabels || {};

  // Utility to create canvas-based text sprite
  const makeTextSprite = React.useCallback((message, color = '#94a3b8') => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 36;
    context.font = `${fontSize}px sans-serif`;
    const metrics = context.measureText(message);
    const padding = 20;
    canvas.width = Math.max(1, Math.ceil(metrics.width + padding * 2));
    canvas.height = Math.max(1, Math.ceil(fontSize + padding * 2));
    // set again after resize
    context.font = `${fontSize}px sans-serif`;
    context.fillStyle = color;
    context.textBaseline = 'top';
    context.fillText(message, padding, padding);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    const scaleFactor = 0.02;
    sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1);
    return sprite;
  }, []);

  // Create 3D Bar Chart (memoized)
  const createBarChart = React.useCallback((scene, data, scales, topLabelColor = '#1f2937') => {
    const colors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7,
      0xdda0dd, 0x98d8c8, 0xf7dc6f, 0xbb8fce, 0x85c1e9
    ];

    data.forEach((item, index) => {
      const value = Math.abs(Number(item.value || item.y || 0));
      const height = Math.max(scales.yScale(value), 0.02);
      const x = scales.xScale(index);
      const z = scales.zScale(Number(item.z || 0));
      
      const geometry = new THREE.BoxGeometry(0.9, height, 0.9);
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

      const lbl = makeTextSprite(String(value), topLabelColor);
      lbl.position.set(x, height + 0.2, z);
      scene.add(lbl);
    });
  }, [makeTextSprite]);

  // Create 3D Scatter Chart (memoized)
  const createScatterChart = React.useCallback((scene, data, scales) => {
    const colors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7,
      0xdda0dd, 0x98d8c8, 0xf7dc6f, 0xbb8fce, 0x85c1e9
    ];

    data.forEach((item, index) => {
      const x = scales.xScale(index);
      const y = Math.max(scales.yScale(Number(item.y || item.value || 0)), 0.02);
      const z = scales.zScale(Number(item.z || 0));
      
      const geometry = new THREE.SphereGeometry(0.25, 16, 16);
      const material = new THREE.MeshLambertMaterial({ 
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.85
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      scene.add(sphere);
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

    // Grid and axes
    const gridSize = 20; // overall grid size
    const divisions = 10; // grid divisions
    const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x555555, 0x444444);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Build custom axes with ticks and text sprites
    const axisColorX = 0xff5555;
    const axisColorY = 0x55ff55;
    const axisColorZ = 0x5555ff;

    const axisLength = gridSize / 2; // extends from center to edge
    const tickCount = 5;
    const tickSize = 0.1;

    const createAxis = (dirVec, color) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        dirVec.clone().multiplyScalar(axisLength)
      ]);
      const material = new THREE.LineBasicMaterial({ color });
      const line = new THREE.Line(geometry, material);
      scene.add(line);

      // ticks
      for (let i = 1; i <= tickCount; i++) {
        const t = (i / tickCount) * axisLength;
        const base = dirVec.clone().normalize().multiplyScalar(t);
        let a1, a2;
        if (Math.abs(dirVec.x) > 0) {
          a1 = new THREE.Vector3(base.x, base.y + tickSize, base.z);
          a2 = new THREE.Vector3(base.x, base.y - tickSize, base.z);
        } else if (Math.abs(dirVec.y) > 0) {
          a1 = new THREE.Vector3(base.x + tickSize, base.y, base.z);
          a2 = new THREE.Vector3(base.x - tickSize, base.y, base.z);
        } else {
          a1 = new THREE.Vector3(base.x + tickSize, base.y, base.z);
          a2 = new THREE.Vector3(base.x - tickSize, base.y, base.z);
        }
        const tickGeo = new THREE.BufferGeometry().setFromPoints([a1, a2]);
        const tickLine = new THREE.Line(tickGeo, new THREE.LineBasicMaterial({ color }));
        scene.add(tickLine);
      }
    };

    createAxis(new THREE.Vector3(1, 0, 0), axisColorX); // X
    createAxis(new THREE.Vector3(0, 1, 0), axisColorY); // Y
    createAxis(new THREE.Vector3(0, 0, 1), axisColorZ); // Z

    // Axis label sprites
    const labelColor = isDark ? '#e5e7eb' : '#334155';
    const xLabel = makeTextSprite(axisX || 'X', labelColor);
    xLabel.position.set(axisLength + 0.5, 0.1, 0);
    scene.add(xLabel);
    const yLabel = makeTextSprite(axisY || 'Y', labelColor);
    yLabel.position.set(0, axisLength + 0.5, 0);
    scene.add(yLabel);
    const zLabel = makeTextSprite(axisZ || 'Z', labelColor);
    zLabel.position.set(0, 0.1, axisLength + 0.5);
    scene.add(zLabel);

    // Process data and build scales
    const processedData = Array.isArray(data) ? data : [];
    const maxY = Math.max(...processedData.map(d => Number(d.y) || Number(d.value) || 0), 1);
    const minY = Math.min(...processedData.map(d => Number(d.y) || Number(d.value) || 0), 0);

    const uniqueX = processedData.map((d, i) => (typeof d.x === 'number' ? d.x : i));
    const maxXIndex = Math.max(uniqueX.length - 1, 1);
  const maxZ = Math.max(...processedData.map(d => Number(d.z) || 0));
  const minZ = Math.min(...processedData.map(d => Number(d.z) || 0));

    const xScale = (i) => {
      const pos = (i / Math.max(maxXIndex, 1)) * (gridSize * 0.8) - (gridSize * 0.4);
      return pos;
    };
    const yScale = (v) => {
      const range = maxY - minY || 1;
      const norm = (v - minY) / range;
      return norm * (gridSize * 0.4);
    };
    const zScale = (v) => {
      if (!isFinite(maxZ) || !isFinite(minZ) || maxZ === minZ) return 0; // center when no Z variation
      const range = maxZ - minZ;
      const norm = (v - minZ) / range;
      return norm * (gridSize * 0.8) - (gridSize * 0.4);
    };

    // Create charts based on type
    switch (chartType) {
      case 'bar':
        createBarChart(scene, processedData, { xScale, yScale, zScale }, isDark ? '#e5e7eb' : '#1f2937');
        break;
      case 'scatter':
        createScatterChart(scene, processedData, { xScale, yScale, zScale });
        break;
      case 'pie':
        createPieChart(scene, processedData);
        break;
      case 'doughnut':
        createDoughnutChart(scene, processedData);
        break;
      default:
        createBarChart(scene, processedData, { xScale, yScale, zScale }, isDark ? '#e5e7eb' : '#1f2937');
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
    // Axis tick labels (values)
    const yTickColor = labelColor;
    const yTicks = 5;
    const yRange = maxY - minY || 1;
    for (let i = 0; i <= yTicks; i++) {
      const val = minY + (i / yTicks) * yRange;
      const sprite = makeTextSprite(String(Math.round(val * 100) / 100), yTickColor);
      sprite.position.set(-0.5, yScale(val), 0);
      scene.add(sprite);
    }

    // X category labels (sampled)
    const labels = processedData.map(d => d.label);
    if (labels.length) {
      const step = Math.max(1, Math.ceil(labels.length / 5));
      for (let i = 0; i < labels.length; i += step) {
        const txt = String(labels[i]).length > 10 ? String(labels[i]).slice(0, 10) + '…' : String(labels[i]);
        const sprite = makeTextSprite(txt, labelColor);
        sprite.position.set(xScale(i), 0.05, 0.3);
        scene.add(sprite);
      }
    }

    // Z tick labels if Z varies
    if (isFinite(maxZ) && isFinite(minZ) && maxZ !== minZ) {
      const zTicks = 5;
      const zRange = maxZ - minZ;
      for (let i = 0; i <= zTicks; i++) {
        const val = minZ + (i / zTicks) * zRange;
        const sprite = makeTextSprite(String(Math.round(val * 100) / 100), labelColor);
        sprite.position.set(0.3, 0.05, zScale(val));
        scene.add(sprite);
      }
    }

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
  }, [data, chartType, isDark, axisX, axisY, axisZ, createBarChart, createScatterChart, makeTextSprite]);

  // Expose export function to parent when ready
  useEffect(() => {
    if (!onExportReady) return;
    const exporter = (opts = {}) => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) return null;

      // optional higher-res capture
      const origPixelRatio = renderer.getPixelRatio();
      const origSize = renderer.getSize(new THREE.Vector2());
      try {
        if (opts.pixelRatio && typeof opts.pixelRatio === 'number') {
          renderer.setPixelRatio(opts.pixelRatio);
          renderer.setSize(origSize.x, origSize.y, false);
        }
        renderer.render(scene, camera);
        const type = opts.type || 'image/png';
        return renderer.domElement.toDataURL(type);
      } finally {
        if (opts.pixelRatio && typeof opts.pixelRatio === 'number') {
          renderer.setPixelRatio(origPixelRatio);
          renderer.setSize(origSize.x, origSize.y, false);
          renderer.render(scene, camera);
        }
      }
    };
    onExportReady(exporter);
    return () => onExportReady(null);
  }, [onExportReady]);

  

  // Create 3D Pie Chart
  const createPieChart = (scene, data) => {
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
  };

  // Create 3D Doughnut Chart
  const createDoughnutChart = (scene, data) => {
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
  };

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
};

export default ThreeChart3D;
