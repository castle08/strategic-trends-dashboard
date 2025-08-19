import React, { useState, useRef } from 'react';
import { Html } from '@react-three/drei';
import { TrendItem, getCategoryColor } from '../types';
import * as THREE from 'three';

interface TrendCrystalProps {
  trend: TrendItem;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
  anyTrendSelected?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  itemId: string; // Add unique ID for debugging
}

const TrendCrystal: React.FC<TrendCrystalProps> = ({ 
  trend, 
  position, 
  selected, 
  onSelect, 
  anyTrendSelected = false,
  onDragStart,
  onDragEnd,
  itemId
}) => {
  // console.log('🔍 TrendCrystal component starting for:', trend.title);
  
  // Use anyTrendSelected parameter to avoid TypeScript warning
  void anyTrendSelected;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const isMouseDown = useRef(false);
  
  // console.log('🔍 State initialized for:', trend.title);
  
  // Error handling for malformed data
  if (!trend || typeof trend !== 'object') {
    console.error('❌ Invalid trend data:', trend);
    return null;
  }
  
  // console.log('🔍 Trend data validated for:', trend.title);
  

  
  // Debug logging to see actual scores
  // console.log(`📊 ${trend.category} (${trend.scores.total})`);
  
  // console.log('🔍 Image-based display prepared for:', trend.title);
  

  
  // Use T&P Group category colors
  const categoryColor = getCategoryColor(trend.category);
  const color = new THREE.Color(categoryColor);
  
  // console.log('🔍 Color calculated for:', trend.title);
  
  // Debug: Log what we're trying to render
  // console.log(`🎨 Rendering trend "${trend.title}":`, {
  //   hasImageUrl: !!trend.creative?.imageUrl,
  //   hasScores: !!trend.scores,
  //   scoresTotal: trend.scores?.total,
  //   hasWhyItMatters: !!trend.whyItMatters,
  //   whyItMattersLength: trend.whyItMatters?.length
  // });

  // Remove unused geometry functions and useFrame since we're using images now
  // console.log('🔍 Image-based display for:', trend.title);

  // Handle image loading with CORS error handling
  const handleImageLoad = () => {
    // console.log('✅ Image loaded successfully for:', trend.title);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (error: any) => {
    // console.log('❌ Image failed to load for:', trend.title, error);
    setImageError(true);
    setImageLoaded(false);
  };

  // Get image URL - prioritize imageUrl (Vercel blob storage) over blobFilename
  const getImageUrl = () => {
    // Use imageUrl first (direct Vercel blob storage URL)
    if (trend.creative?.imageUrl) {
      return trend.creative.imageUrl;
    }
    
    // Fallback to blobFilename if no imageUrl
    if (trend.creative?.blobFilename) {
      return `/trends/images/${trend.creative.blobFilename}`;
    }
    
    return '';
  };

  // Handle mouse events for drag vs click
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // console.log('🖱️ Mouse down on trend:', trend.title);
    isMouseDown.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
    onDragStart?.();
    
    // Add global mouse listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isMouseDown.current && dragStartPos.current) {
      const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
      
      // If moved more than 5px, consider it a drag
      if (deltaX > 5 || deltaY > 5) {
        console.log('🔄 Dragging trend:', trend.title, 'delta:', { deltaX, deltaY });
        setIsDragging(true);
      }
    }
  };

  const handleGlobalMouseUp = (e: MouseEvent) => {
    if (isMouseDown.current && dragStartPos.current) {
      const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
      
      console.log('🖱️ Mouse up on trend:', trend.title, 'delta:', { deltaX, deltaY }, 'isDragging:', isDragging);
      
      // Only trigger onSelect if it wasn't a drag (moved less than 5px)
      if (deltaX <= 5 && deltaY <= 5) {
        console.log('✅ Click detected - opening side drawer for:', trend.title);
        onSelect();
      } else {
        console.log('🔄 Drag detected - not opening side drawer');
      }
      
      // Clean up
      isMouseDown.current = false;
      dragStartPos.current = null;
      setIsDragging(false);
      onDragEnd?.();
      
      // Remove global listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  };



  // console.log('🔍 About to render JSX for:', trend.title);

  try {
    return (
      <group position={position}>
        {/* Image-based trend display */}
        <Html
          as="div"
          center
          transform
          sprite
          style={{
            pointerEvents: 'auto',
            transform: 'translate3d(0, 0, 0)',
            zIndex: 1,
          }}
        >
          <div 
            className={`cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseLeave={() => {
              if (isMouseDown.current) {
                isMouseDown.current = false;
                dragStartPos.current = null;
                setIsDragging(false);
                onDragEnd?.();
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
              }
            }}
          >
            {/* Image Container */}
            <div className="relative">
              {/* Debug ID - small indicator */}
              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded z-10">
                {itemId}
              </div>
              {/* Loading state */}
              {!imageLoaded && !imageError && (
                <div 
                  className="w-96 h-96 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color.getHexString() + '20' }}
                >
                  <div className="text-white/70 text-xl">Loading...</div>
                </div>
              )}
              
              {/* Error state - show colored placeholder */}
              {imageError && (
                <div 
                  className="w-96 h-96 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color.getHexString() + '40' }}
                >
                  <div className="text-white/90 text-xl text-center">
                    <div className="font-bold mb-1">{trend.title?.slice(0, 20)}...</div>
                    <div className="text-white/70">{trend.category}</div>
                  </div>
                </div>
              )}
              
              {/* Image - Show if we have any image data */}
              {(trend.creative?.imageUrl || trend.creative?.blobFilename) && (
                <img
                  src={getImageUrl()}
                  alt={trend.title}
                  className={`w-96 h-96 object-cover rounded-lg ${
                        imageLoaded ? '' : 'hidden'
                      } ${imageError ? 'hidden' : ''}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoaded ? 'block' : 'none' }}
                />
              )}
              
              {/* Fallback for trends without images */}
              {!trend.creative?.imageUrl && !trend.creative?.blobFilename && (
                <div 
                  className="w-96 h-96 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color.getHexString() + '40' }}
                >
                  <div className="text-white/90 text-xl text-center">
                    <div className="font-bold mb-1">{trend.title?.slice(0, 20)}...</div>
                    <div className="text-white/70">{trend.category}</div>
                  </div>
                </div>
              )}
              
              
            </div>
          </div>
        </Html>
      

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