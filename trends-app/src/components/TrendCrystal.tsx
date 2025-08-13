import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { TrendItem, getCategoryColor } from '../types';
import * as THREE from 'three';

interface TrendCrystalProps {
  trend: TrendItem;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
  anyTrendSelected?: boolean;
}

const TrendCrystal: React.FC<TrendCrystalProps> = ({ trend, position, selected, onSelect, anyTrendSelected = false }) => {
  console.log('🔍 TrendCrystal component starting for:', trend.title);
  
  // Use anyTrendSelected parameter to avoid TypeScript warning
  void anyTrendSelected;
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  console.log('🔍 State initialized for:', trend.title);
  
  // Error handling for malformed data
  if (!trend || typeof trend !== 'object') {
    console.error('❌ Invalid trend data:', trend);
    return null;
  }
  
  console.log('🔍 Trend data validated for:', trend.title);
  

  
  // Dynamic size scaling based on actual live data range
  const minScore = 50; // Much wider range to handle live data variety
  const maxScore = 100; // Full theoretical range
  const normalizedScore = Math.max(0, Math.min(1, (trend.scores.total - minScore) / (maxScore - minScore)));
  // Reasonable scaling with clear differences
  const adjustedSize = 1.0 + (normalizedScore * 4.0); // Range 1.0 to 5.0 (5x difference)
  
  // Debug logging to see actual scores
  console.log(`📊 ${trend.category} (${trend.scores.total}) -> Size: ${adjustedSize.toFixed(1)}`);
  const intensity = trend.viz?.intensity || 1.0; // Fallback if viz data is missing
  
  console.log('🔍 Size and intensity calculated for:', trend.title);
  

  
  // Use T&P Group category colors
  const categoryColor = getCategoryColor(trend.category);
  const color = new THREE.Color(categoryColor);
  
  console.log('🔍 Color calculated for:', trend.title);
  
  // Debug: Log what we're trying to render
  console.log(`🎨 Rendering trend "${trend.title}":`, {
    hasImageUrl: !!trend.creative?.imageUrl,
    hasScores: !!trend.scores,
    scoresTotal: trend.scores?.total,
    hasWhyItMatters: !!trend.whyItMatters,
    whyItMattersLength: trend.whyItMatters?.length
  });

  // Shape based on category - using adjusted size for better visual distinction
  const getGeometry = (category: string) => {
    console.log('🔍 Getting geometry for category:', category);
    switch (category.toLowerCase()) {
      case 'ai/ml':
      case 'ai':
        return <dodecahedronGeometry args={[adjustedSize, 0]} />; // Complex AI shape
      case 'sustainability':
      case 'design':
        return <tetrahedronGeometry args={[adjustedSize * 1.2, 0]} />; // Clean pyramid for design
      case 'e-commerce':
      case 'technology':
        return <boxGeometry args={[adjustedSize * 1.2, adjustedSize * 1.2, adjustedSize * 1.2]} />; // Cube for tech
      case 'social media':
        return <sphereGeometry args={[adjustedSize, 16, 16]} />; // Sphere for social
      default:
        return <octahedronGeometry args={[adjustedSize, 0]} />; // Default crystal
    }
  };

  const getWireframeGeometry = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai/ml':
      case 'ai':
        return <dodecahedronGeometry args={[adjustedSize * 1.02, 0]} />;
      case 'sustainability':
      case 'design':
        return <tetrahedronGeometry args={[adjustedSize * 1.22, 0]} />;
      case 'e-commerce':
      case 'technology':
        return <boxGeometry args={[adjustedSize * 1.22, adjustedSize * 1.22, adjustedSize * 1.22]} />;
      case 'social media':
        return <sphereGeometry args={[adjustedSize * 1.02, 16, 16]} />;
      default:
        return <octahedronGeometry args={[adjustedSize * 1.02, 0]} />;
    }
  };

  console.log('🔍 Geometry functions defined for:', trend.title);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * intensity * 0.5) * 0.05;
      const selectedScale = selected ? 1.3 : 1;
      const hoverScale = hovered ? 1.15 : 1;
      
      meshRef.current.scale.setScalar(pulseScale * selectedScale * hoverScale);
      
      // Gentle rotation
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
  });

  // Handle image loading with CORS error handling
  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully for:', trend.title);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (error: any) => {
    console.log('❌ Image failed to load for:', trend.title, error);
    setImageError(true);
    setImageLoaded(false);
  };

  console.log('🔍 About to render JSX for:', trend.title);

  try {
    return (
      <group position={position}>
        {/* Main crystal mesh */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            console.log('🖱️ Hover start for:', trend.title);
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            console.log('🖱️ Hover end for:', trend.title);
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          {getGeometry(trend.category)}
          <meshPhongMaterial
            color={color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Wireframe layers for depth */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
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
            {getWireframeGeometry(trend.category)}
            <meshBasicMaterial
              color={color}
              wireframe
              transparent
              opacity={0.8 - i * 0.12}
            />
          </mesh>
        ))}
      
        {/* Enhanced hover card with image preview */}
        {(() => {
          console.log(`🎯 Rendering hover card for "${trend.title}": hovered=${hovered}, selected=${selected}, hasImage=${!!trend.creative?.imageUrl}`);
          return (hovered || selected);
        })() && (
          <Html
            as="div"
            center
            transform
            sprite
            style={{
              pointerEvents: 'none',
              transform: 'translate3d(0, -80px, 0)',
            }}
          >
            <div className="glass-panel rounded-xl p-4 text-white max-w-sm min-h-[200px]">
              <div className="font-bold mb-2 text-lg">{trend.title || 'No Title'}</div>
              <div className="text-white/80 text-sm mb-2">{trend.category || 'No Category'}</div>
              <div className="text-white/60 text-sm mb-3">
                Score: {trend.scores?.total || 'N/A'}
              </div>
              
              {/* Image Preview Section - Only show if we have an image URL */}
              {trend.creative?.imageUrl && (
                <div className="mb-3">
                  <div className="text-white/70 text-xs mb-2">Generated Image:</div>
                  <div className="relative">
                    {/* Loading state */}
                    {!imageLoaded && !imageError && (
                      <div className="w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center">
                        <div className="text-white/50 text-xs">Loading...</div>
                      </div>
                    )}
                    
                    {/* Error state */}
                    {imageError && (
                      <div className="w-32 h-32 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                        <div className="text-red-300 text-xs">⚠️ CORS may block preview</div>
                      </div>
                    )}
                    
                    {/* Image - Only show when loaded successfully */}
                    <img
                      src={trend.creative.imageUrl}
                      alt={trend.title}
                      className={`w-32 h-32 object-cover rounded-lg border-2 ${
                        imageLoaded ? 'border-green-400/50' : 'border-transparent'
                      } ${imageError ? 'hidden' : ''}`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{ display: imageLoaded ? 'block' : 'none' }}
                      crossOrigin="anonymous"
                    />
                    
                    {/* Always show the link, even if image fails */}
                    <a 
                      href={trend.creative.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline text-xs block mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {imageError ? 'View Generated Image (opens in new tab)' : 'View Full Size'}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div className="text-white/90 text-sm">
                {trend.whyItMatters ? trend.whyItMatters.slice(0, 100) + '...' : 'No description available'}
              </div>
            </div>
          </Html>
        )}
      
        {/* Particle effects for velocity */}
        {trend.scores.velocity > 70 && (
          <points>
            <sphereGeometry args={[adjustedSize * 2, 8, 8]} />
            <pointsMaterial
              color={color}
              size={0.1}
              transparent
              opacity={0.4}
            />
          </points>
        )}
      </group>
    );
  } catch (error) {
    console.error('❌ Error rendering TrendCrystal for trend:', trend.title, error);
    return (
      <group position={position}>
        <mesh>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <Html center>
          <div className="bg-red-500 text-white p-2 rounded text-xs">
            Error: {trend.title}
          </div>
        </Html>
      </group>
    );
  }
};

export default TrendCrystal;