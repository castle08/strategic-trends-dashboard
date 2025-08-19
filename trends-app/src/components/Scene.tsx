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
      const radius = 18 + Math.random() * 12; // Optimized for 14" laptop: 18-30

      let x = radius * Math.cos(theta) * Math.sin(phi);
      let y = radius * Math.sin(theta) * Math.sin(phi);
      let z = radius * Math.cos(phi);
      
      // Ensure no items are too close to the center axis
      const minDistanceFromCenter = 15;
      const distanceFromCenter = Math.sqrt(x * x + y * y);
      
      if (distanceFromCenter < minDistanceFromCenter) {
        // Push the item away from center
        const angle = Math.atan2(y, x);
        x = minDistanceFromCenter * Math.cos(angle);
        y = minDistanceFromCenter * Math.sin(angle);
        console.log(`Scene: Repositioned item ${i} from center to (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
      }

      positions.push([x, y, z]);
    }

    // Debug: Log all positions
    console.log('Scene: All item positions:', positions.map((pos, i) => `Item ${i}: (${pos[0].toFixed(2)}, ${pos[1].toFixed(2)}, ${pos[2].toFixed(2)})`));
    
    // Special debug for item 4
    if (positions[4]) {
      console.log('🔍 Item 4 position:', positions[4]);
      console.log('🔍 Item 4 distance from center:', Math.sqrt(positions[4][0]**2 + positions[4][1]**2).toFixed(2));
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
      // Only process if we have meaningful hand position (not 0,0,0)
      if (Math.abs(handPosition.x) > 0.01 || Math.abs(handPosition.y) > 0.01) {
        console.log('Scene: Applying hand controls:', { handPosition, controlsActive });
      // Map hand X position to horizontal rotation (left/right)
      const targetRotationY = handPosition.x * Math.PI * 2; // Full rotation range
      const currentRotationY = groupRef.current.rotation.y;
      const smoothedRotationY = THREE.MathUtils.lerp(currentRotationY, targetRotationY, 0.03); // Smoother movement
      
      // Map hand Y position to vertical rotation (up/down) - full 360° range
      const targetRotationX = handPosition.y * Math.PI * 2; // Full rotation range
      const currentRotationX = groupRef.current.rotation.x;
      const smoothedRotationX = THREE.MathUtils.lerp(currentRotationX, targetRotationX, 0.03); // Smoother movement
      
      groupRef.current.rotation.set(
        smoothedRotationX,  // Vertical rotation (up/down)
        smoothedRotationY,  // Horizontal rotation (left/right)
        groupRef.current.rotation.z
      );
      
      // Also move camera slightly to make center items more accessible
      if (cameraRef.current) {
        const cameraOffsetX = handPosition.x * 8; // Increased camera movement
        const cameraOffsetY = handPosition.y * 5;
        const targetCameraX = cameraOffsetX;
        const targetCameraY = cameraOffsetY;
        const currentCameraX = cameraRef.current.position.x;
        const currentCameraY = cameraRef.current.position.y;
        
        cameraRef.current.position.x = THREE.MathUtils.lerp(currentCameraX, targetCameraX, 0.05);
        cameraRef.current.position.y = THREE.MathUtils.lerp(currentCameraY, targetCameraY, 0.05);
        cameraRef.current.lookAt(0, 0, 0); // Keep looking at center
      }
      }
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
              itemId={`${index}`}
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