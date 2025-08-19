import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { TrendItem } from '../types';
import * as THREE from 'three';
import TrendCrystal from './TrendCrystal';

interface SceneProps {
  trends: TrendItem[];
  onTrendSelect: (trend: TrendItem | null) => void;
  selectedTrend: TrendItem | null;
  handPosition?: { x: number; y: number; z: number };
  controlsActive?: boolean;
}

const Scene: React.FC<SceneProps> = ({ trends, onTrendSelect, selectedTrend, handPosition, controlsActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cameraRef = useRef<THREE.Camera | null>(null);

  const handleDragStart = () => {
    console.log('🎯 Scene: Drag started');
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    console.log('🎯 Scene: Drag ended');
    setIsDragging(false);
  };

  const positions = useMemo(() => {
    const maxNodes = parseInt((import.meta as any).env?.VITE_THREE_MAX_NODES || '200');
    const nodesToShow = Math.min(trends.length, maxNodes);
    const positions: [number, number, number][] = [];

    for (let i = 0; i < nodesToShow; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodesToShow);
      const theta = Math.sqrt(nodesToShow * Math.PI) * phi;
      const radius = 20 + Math.random() * 15; // Closer grouping: 20-35 for bigger images

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      positions.push([x, y, z]);
    }

    return positions;
  }, [trends.length]);

  useFrame((state) => {
    // Store camera reference
    if (!cameraRef.current) {
      cameraRef.current = state.camera;
    }
    
    // Handle hand controls when active
    if (handPosition && controlsActive && !isDragging && groupRef.current) {
      console.log('Scene: Applying hand controls:', { handPosition, controlsActive });
      // Map hand X position to horizontal rotation (left/right)
      const targetRotationY = handPosition.x * Math.PI * 2; // Full rotation range
      const currentRotationY = groupRef.current.rotation.y;
      const smoothedRotationY = THREE.MathUtils.lerp(currentRotationY, targetRotationY, 0.1);
      
      // Map hand Y position to vertical rotation (up/down)
      const targetRotationX = handPosition.y * Math.PI * 0.5; // Limited vertical range
      const currentRotationX = groupRef.current.rotation.x;
      const smoothedRotationX = THREE.MathUtils.lerp(currentRotationX, targetRotationX, 0.1);
      
      groupRef.current.rotation.set(
        smoothedRotationX,  // Vertical rotation (up/down)
        smoothedRotationY,  // Horizontal rotation (left/right)
        groupRef.current.rotation.z
      );
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} color="#4f46e5" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />

      {/* Environment */}
      <Environment preset="night" />
      <fog attach="fog" args={['#0f172a', 30, 100]} />

      {/* Controls */}
      <OrbitControls
        enablePan={!isDragging}
        enableZoom={!isDragging}
        enableRotate={!isDragging}
        maxDistance={200}
        minDistance={10}
        autoRotate={!selectedTrend && !isDragging && !controlsActive}
        autoRotateSpeed={0.2}
        panSpeed={1.2}
        zoomSpeed={1.2}
        rotateSpeed={0.8}
        {...({} as any)}
      />

      {/* Trend Spheres */}
      <group ref={groupRef}>
        {trends.slice(0, positions.length).map((trend, index) => (
          <Float
            key={trend.id}
            speed={0.2 + Math.random() * 0.3}
            rotationIntensity={0.1}
            floatIntensity={0.1}
          >
            <TrendCrystal
              trend={trend}
              position={positions[index]}
              selected={selectedTrend?.id === trend.id}
              onSelect={() => onTrendSelect(trend)}
              anyTrendSelected={selectedTrend !== null}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </Float>
        ))}
      </group>

      {/* Particle background */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={500}
            array={new Float32Array(
              Array.from({ length: 1500 }, () => (Math.random() - 0.5) * 200)
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color="#4f46e5"
          transparent
          opacity={0.3}
          sizeAttenuation
        />
      </points>
    </>
  );
};

export default Scene;