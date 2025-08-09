import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { TrendItem } from '../types';
import * as THREE from 'three';

interface TrendCrystalProps {
  trend: TrendItem;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
}

const TrendCrystal: React.FC<TrendCrystalProps> = ({ trend, position, selected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Scale size dramatically based on trend scores - much more noticeable variance
  const scoreRatio = trend.scores.total / 100; // 0-1 ratio
  const size = 0.8 + (scoreRatio * 4); // Range from 0.8 to 4.8 (6x difference)
  const intensity = trend.viz.intensity;
  
  // Parse HSL color
  const hslMatch = trend.viz.colorHint.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  const hue = hslMatch ? parseInt(hslMatch[1]) / 360 : 0.6;
  const saturation = hslMatch ? parseInt(hslMatch[2]) / 100 : 0.8;
  const lightness = hslMatch ? parseInt(hslMatch[3]) / 100 : 0.6;
  
  const color = new THREE.Color().setHSL(hue, saturation, lightness);

  // Shape based on category
  const getGeometry = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai/ml':
      case 'ai':
        return <dodecahedronGeometry args={[size, 0]} />; // Complex AI shape
      case 'sustainability':
      case 'design':
        return <tetrahedronGeometry args={[size * 1.2, 0]} />; // Clean pyramid for design
      case 'e-commerce':
      case 'technology':
        return <boxGeometry args={[size * 1.5, size * 1.5, size * 1.5]} />; // Cube for tech
      case 'social media':
        return <sphereGeometry args={[size, 16, 16]} />; // Sphere for social
      default:
        return <octahedronGeometry args={[size, 0]} />; // Default crystal
    }
  };

  const getWireframeGeometry = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai/ml':
      case 'ai':
        return <dodecahedronGeometry args={[1.02, 0]} />;
      case 'sustainability':
      case 'design':
        return <tetrahedronGeometry args={[1.22, 0]} />;
      case 'e-commerce':
      case 'technology':
        return <boxGeometry args={[1.53, 1.53, 1.53]} />;
      case 'social media':
        return <sphereGeometry args={[1.02, 16, 16]} />;
      default:
        return <octahedronGeometry args={[1.02, 0]} />;
    }
  };

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * intensity * 0.5) * 0.05;
      const selectedScale = selected ? 1.3 : 1;
      const hoverScale = hovered ? 1.15 : 1;
      
      meshRef.current.scale.setScalar(pulseScale * selectedScale * hoverScale);
      
      // Gentle rotation
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group position={position}>
      {/* Main crystal shape */}
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
        {/* Dynamic geometry based on category */}
        {getGeometry(trend.category)}
        <meshPhongMaterial
          color={color}
          transparent
          opacity={0.8}
          shininess={100}
          reflectivity={0.5}
        />
      </mesh>
      
      {/* Wireframe overlay for premium feel */}
      <mesh scale={[size, size, size]}>
        {getWireframeGeometry(trend.category)}
        <meshBasicMaterial
          color={color}
          wireframe
          wireframeLinewidth={3}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Floating text label */}
      {(hovered || selected) && (
        <Html
          as="div"
          center
          transform
          sprite
          style={{
            pointerEvents: 'none',
            transform: 'translate3d(0, -60px, 0)',
          }}
        >
          <div className="glass-panel rounded-xl p-4 text-white max-w-sm">
            <div className="font-bold mb-2 text-lg">{trend.title}</div>
            <div className="text-white/80 text-sm mb-2">{trend.category}</div>
            <div className="text-white/60 text-sm">
              Impact Score: {Math.round(trend.scores.total)}
            </div>
            {selected && (
              <div className="mt-3 text-white/90 text-sm">
                {trend.whyItMatters.slice(0, 120)}...
              </div>
            )}
          </div>
        </Html>
      )}
      
      {/* Glow effect for high-impact trends */}
      {trend.scores.total > 80 && (
        <mesh scale={[size * 2, size * 2, size * 2]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Particle effects for velocity */}
      {trend.scores.velocity > 80 && (
        <points>
          <sphereGeometry args={[size * 3, 8, 8]} />
          <pointsMaterial
            color={color}
            size={0.1}
            transparent
            opacity={0.6}
          />
        </points>
      )}
    </group>
  );
};

export default TrendCrystal;