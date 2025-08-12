import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { TrendsData, TrendItem } from '../types';
import * as THREE from 'three';

interface SimpleTrendTestProps {
  trendsData: TrendsData | null;
}

const TrendCard: React.FC<{ trend: TrendItem; position: [number, number, number] }> = ({ trend, position }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const floatY = Math.sin(time * 0.5 + position[0] * 0.1) * 0.5;
      const floatX = Math.cos(time * 0.3 + position[1] * 0.1) * 0.3;
      
      groupRef.current.position.y = position[1] + floatY;
      groupRef.current.position.x = position[0] + floatX;
      groupRef.current.position.z = position[2];
      
      // Gentle rotation
      groupRef.current.rotation.y += 0.001;
    }
  });
  
  return (
    <group ref={groupRef} position={position}>

      <Html
        center
        transform
        sprite
        scale={3}
        style={{
          pointerEvents: 'none',
        }}
      >
        <div className="bg-black/80 border border-white/30 rounded-xl p-8 text-white text-center min-w-[400px] backdrop-blur-sm">
          <div className="font-bold text-xl mb-6 leading-tight">{trend.title || 'No Title'}</div>
          
          {trend.creative?.imageUrl ? (
            <div>
              <img 
                src={trend.creative.imageUrl} 
                alt={trend.title}
                className="w-64 h-64 object-cover rounded-lg border-2 border-white/20 mb-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
              <div className="w-64 h-64 bg-red-500/20 border-2 border-red-500/50 rounded-lg flex items-center justify-center text-base text-red-400 mb-4" style={{ display: 'none' }}>
                Image Failed
              </div>
              <div className="text-green-400 text-base">✅ Generated Image</div>
            </div>
          ) : (
            <div>
              <div className="w-64 h-64 bg-red-500/20 border-2 border-red-500/50 rounded-lg flex items-center justify-center text-base text-red-400 mb-4">
                ❌ No Image
              </div>
              <div className="text-red-400 text-base">No image available</div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

const SimpleTrendTest: React.FC<SimpleTrendTestProps> = ({ trendsData }) => {
  if (!trendsData?.trends) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div>Loading trends...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        

        
        {trendsData.trends.map((trend, index) => {
          // Use full screen space
          const cols = 3;
          const rows = Math.ceil(trendsData.trends.length / cols);
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          // Spread across the full viewport
          const x = (col - 1) * 35; // -35, 0, 35 for 3 columns (more spread)
          const y = (row - (rows - 1) / 2) * 25; // Center vertically (more spread)
          const z = (Math.random() - 0.5) * 10; // More depth variation
          
          console.log(`🎨 Rendering trend ${index + 1}:`, {
            title: trend.title,
            hasImage: !!trend.creative?.imageUrl,
            imageUrl: trend.creative?.imageUrl,
            position: [x, y, z]
          });
          
          return (
            <TrendCard 
              key={trend.id || index} 
              trend={trend} 
              position={[x, y, z]} 
            />
          );
        })}
      </Canvas>
    </div>
  );
};

export default SimpleTrendTest;
