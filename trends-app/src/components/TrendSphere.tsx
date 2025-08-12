import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { TrendItem } from '../types';
import * as THREE from 'three';

interface TrendSphereProps {
  trend: TrendItem;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
}

const TrendSphere: React.FC<TrendSphereProps> = ({ trend, position, selected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const size = trend.viz.size * 0.5;
  const intensity = trend.viz.intensity;
  
  // Parse HSL color
  const hslMatch = trend.viz.colorHint.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  const hue = hslMatch ? parseInt(hslMatch[1]) / 360 : 0.6;
  const saturation = hslMatch ? parseInt(hslMatch[2]) / 100 : 0.7;
  const lightness = hslMatch ? parseInt(hslMatch[3]) / 100 : 0.5;
  
  const color = new THREE.Color().setHSL(hue, saturation, lightness);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * intensity) * 0.1;
      const selectedScale = selected ? 1.5 : 1;
      const hoverScale = hovered ? 1.2 : 1;
      
      meshRef.current.scale.setScalar(pulseScale * selectedScale * hoverScale);
      
      // Gentle rotation based on velocity
      meshRef.current.rotation.x += 0.001 * intensity;
      meshRef.current.rotation.y += 0.002 * intensity;
      
      // Emissive intensity pulsing
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      if (material && material.emissive) {
        const emissiveIntensity = 0.2 + Math.sin(time * intensity * 2) * 0.1;
        material.emissive.copy(color).multiplyScalar(emissiveIntensity);
      }
    }
  });


  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Hover tooltip */}
      {hovered && !selected && (
        <Html
          as="div"
          center
          transform
          sprite
          style={{
            pointerEvents: 'none',
            transform: 'translate3d(0, -40px, 0)',
          }}
        >
          <div className="glass-panel rounded-lg p-3 text-white text-sm max-w-xs">
            <div className="font-semibold mb-1">{trend.title}</div>
            <div className="text-white/70 text-xs mb-1">{trend.category}</div>
            <div className="text-white/50 text-xs">
              Score: {Math.round(trend.scores.total)}
            </div>
          </div>
        </Html>
      )}
      
      {/* Glow effect for high-intensity trends */}
      {intensity > 1.5 && (
        <mesh scale={[size * 2, size * 2, size * 2]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default TrendSphere;