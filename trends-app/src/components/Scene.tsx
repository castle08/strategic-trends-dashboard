import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { TrendItem } from '../types';
import * as THREE from 'three';
import TrendCrystal from './TrendCrystal';

interface SceneProps {
  trends: TrendItem[];
  onTrendSelect: (trend: TrendItem | null) => void;
  selectedTrend: TrendItem | null;
}

const Scene: React.FC<SceneProps> = ({ trends, onTrendSelect, selectedTrend }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const positions = useMemo(() => {
    const maxNodes = parseInt((import.meta as any).env?.VITE_THREE_MAX_NODES || '200');
    const nodesToShow = Math.min(trends.length, maxNodes);
    const positions: [number, number, number][] = [];
    
    for (let i = 0; i < nodesToShow; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodesToShow);
      const theta = Math.sqrt(nodesToShow * Math.PI) * phi;
      const radius = 18 + Math.random() * 12; // Tighter grouping: 18-30 for better initial view
      
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      
      positions.push([x, y, z]);
    }
    
    return positions;
  }, [trends.length]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
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
        enablePan={true}
        enableZoom={true}
        maxDistance={150}
        minDistance={2}
        autoRotate={!selectedTrend}
        autoRotateSpeed={0.5}
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
            speed={0.5 + Math.random() * 0.5}
            rotationIntensity={0.3}
            floatIntensity={0.3}
          >
            <TrendCrystal
              trend={trend}
              position={positions[index]}
              selected={selectedTrend?.id === trend.id}
              onSelect={() => onTrendSelect(trend)}
              anyTrendSelected={selectedTrend !== null}
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