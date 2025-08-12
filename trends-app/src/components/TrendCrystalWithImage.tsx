import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { TrendItem, getCategoryColor } from '../types';
import * as THREE from 'three';

interface TrendCrystalWithImageProps {
  trend: TrendItem;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
  anyTrendSelected?: boolean;
}

const TrendCrystalWithImage: React.FC<TrendCrystalWithImageProps> = ({ 
  trend, 
  position, 
  selected, 
  onSelect, 
  anyTrendSelected = false 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Dynamic size scaling based on actual live data range
  const minScore = 50;
  const maxScore = 100;
  const normalizedScore = Math.max(0, Math.min(1, (trend.scores.total - minScore) / (maxScore - minScore)));
  const adjustedSize = 1.0 + (normalizedScore * 4.0); // Range 1.0 to 5.0
  
  const intensity = trend.viz.intensity;
  const categoryColor = getCategoryColor(trend.category);
  const color = new THREE.Color(categoryColor);

  // Load image texture
  useEffect(() => {
    if (trend.creative.imageUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(
        trend.creative.imageUrl,
        (loadedTexture) => {
          loadedTexture.encoding = THREE.sRGBEncoding;
          loadedTexture.flipY = false; // DALL-E images are already flipped
          setTexture(loadedTexture);
          setImageLoaded(true);
        },
        undefined,
        (error) => {
          console.error('Failed to load image texture:', error);
          setImageLoaded(false);
        }
      );
    }
  }, [trend.creative.imageUrl]);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * intensity * 0.5) * 0.05;
      const selectedScale = selected ? 1.3 : 1;
      const hoverScale = hovered ? 1.15 : 1;
      
      meshRef.current.scale.setScalar(pulseScale * selectedScale * hoverScale);
      
      // Gentle rotation - slowed down
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.0015;
      meshRef.current.rotation.z += 0.0005;
    }
  });

  // Fallback to geometric shape if no image
  if (!trend.creative.imageUrl || !imageLoaded) {
    return (
      <group position={position}>
        {/* Fallback geometric shape */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
        >
          <octahedronGeometry args={[adjustedSize, 0]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.8}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
        
        {/* Wireframe outline */}
        <mesh>
          <octahedronGeometry args={[adjustedSize * 1.02, 0]} />
          <meshBasicMaterial 
            color={color} 
            wireframe 
            transparent 
            opacity={0.6}
          />
        </mesh>

        {/* Hover info */}
        {hovered && (
          <Html position={[0, adjustedSize + 1, 0]} center>
            <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
              <div className="font-semibold">{trend.title}</div>
              <div className="text-xs opacity-80">{trend.category}</div>
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Image-based crystal
  return (
    <group position={position}>
      {/* Main image plane */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <planeGeometry args={[adjustedSize * 2, adjustedSize * 2]} />
        <meshStandardMaterial 
          map={texture}
          transparent 
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Glowing border effect */}
      <mesh>
        <planeGeometry args={[adjustedSize * 2.1, adjustedSize * 2.1]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Category label */}
      <Text
        position={[0, -adjustedSize - 0.5, 0]}
        fontSize={0.3}
        color={categoryColor}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {trend.category}
      </Text>

      {/* Hover info */}
      {hovered && (
        <Html position={[0, adjustedSize + 1, 0]} center>
          <div className="bg-black/90 text-white px-4 py-3 rounded-lg text-sm max-w-xs">
            <div className="font-semibold mb-1">{trend.title}</div>
            <div className="text-xs opacity-80 mb-2">{trend.category}</div>
            <div className="text-xs opacity-70">{trend.summary.substring(0, 100)}...</div>
            <div className="text-xs mt-2 opacity-60">
              Impact: {trend.scores.total}/100
            </div>
          </div>
        </Html>
      )}

      {/* Selection indicator */}
      {selected && (
        <Html position={[0, 0, 0]} center>
          <div className="w-8 h-8 border-4 border-white rounded-full animate-pulse"></div>
        </Html>
      )}
    </group>
  );
};

export default TrendCrystalWithImage;
