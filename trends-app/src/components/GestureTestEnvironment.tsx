import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import * as THREE from 'three';

interface GestureTestEnvironmentProps {
  controlMode: 'hand-presence' | 'fist-activation' | 'keyboard-mouse' | 'voice';
}

// Simple 3D scene for testing
const TestScene: React.FC<{ controlMode: string; handPosition?: { x: number; y: number; z: number }; controlsActive?: boolean }> = ({ 
  controlMode, 
  handPosition, 
  controlsActive 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (groupRef.current && handPosition && controlsActive) {
      // Map hand movement to rotation with better smoothing
      const targetRotationY = handPosition.x * Math.PI;
      const targetRotationX = handPosition.y * Math.PI * 0.5;
      
      // Much smoother rotation with higher lerp factor
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, 
        targetRotationY, 
        0.05  // Reduced from 0.1 for smoother movement
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, 
        targetRotationX, 
        0.05  // Reduced from 0.1 for smoother movement
      );
      
      // Map hand Z to scale (zoom effect) with smoother scaling
      const targetScale = 1 + (handPosition.z * 0.3); // Reduced zoom range
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.08); // Smoother scaling
      groupRef.current.scale.setScalar(newScale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Test cube */}
      <Box args={[2, 2, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4f46e5" />
      </Box>
      
      {/* Direction indicators */}
      <Text position={[0, 3, 0]} fontSize={0.5} color="white">
        {controlMode}
      </Text>
      
      <Text position={[0, -3, 0]} fontSize={0.3} color="yellow">
        {controlsActive ? 'CONTROLS ACTIVE' : 'CONTROLS INACTIVE'}
      </Text>
      
      {/* Hand position indicator */}
      {handPosition && (
        <Text position={[0, 2, 0]} fontSize={0.2} color="cyan">
          X: {handPosition.x.toFixed(2)} Y: {handPosition.y.toFixed(2)} Z: {handPosition.z.toFixed(2)}
        </Text>
      )}
    </group>
  );
};

// Simplified hand controller for testing
const SimpleHandController: React.FC<{
  onHandMove: (x: number, y: number, z: number) => void;
  onControlActivated: (activated: boolean) => void;
  mode: 'hand-presence' | 'fist-activation';
}> = ({ onHandMove, onControlActivated, mode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [gesture, setGesture] = useState<string>('none');

  // Initialize model
  useEffect(() => {
    const initModel = async () => {
      try {
        await tf.ready();
        const handposeModel = await handpose.load();
        setModel(handposeModel);
        console.log('✅ Handpose model loaded');
      } catch (err) {
        console.error('❌ Failed to load handpose model:', err);
        setError('Failed to load hand tracking model');
      }
    };
    initModel();
  }, []);

  // Start video
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsTracking(true);
        }
      } catch (err) {
        setError('Camera access denied');
      }
    };
    if (model) startVideo();
  }, [model]);

  // Hand tracking loop
  useEffect(() => {
    if (!model || !videoRef.current || !isTracking) return;

    const detectHands = async () => {
      if (videoRef.current?.readyState === 4) {
        try {
          const predictions = await model.estimateHands(videoRef.current);
          
          if (predictions.length > 0) {
            const hand = predictions[0];
            const palmBase = hand.landmarks[0];
            
            // Normalize coordinates
            const x = (palmBase[0] / 640) * 2 - 1;
            const y = -((palmBase[1] / 480) * 2 - 1);
            const z = palmBase[2] / 100;
            
            // Apply dead zone
            const deadZone = 0.05;
            const finalX = Math.abs(x) < deadZone ? 0 : x * 0.8;
            const finalY = Math.abs(y) < deadZone ? 0 : y * 0.8;
            const finalZ = z;
            
            // Detect gesture (simplified)
            const thumbTip = hand.landmarks[4];
            const indexTip = hand.landmarks[8];
            const middleTip = hand.landmarks[12];
            const ringTip = hand.landmarks[16];
            const pinkyTip = hand.landmarks[20];
            const palmBaseY = palmBase[1];
            
            const tolerance = 10;
            const isFist = indexTip[1] > (palmBaseY - tolerance) && 
                          middleTip[1] > (palmBaseY - tolerance) && 
                          ringTip[1] > (palmBaseY - tolerance) && 
                          pinkyTip[1] > (palmBaseY - tolerance);
            
            const currentGesture = isFist ? 'fist' : 'open';
            setGesture(currentGesture);
            
            // Control activation logic
            let shouldActivate = false;
            if (mode === 'hand-presence') {
              shouldActivate = true; // Always active when hand is present
            } else if (mode === 'fist-activation') {
              shouldActivate = isFist;
            }
            
            if (shouldActivate) {
              setHandDetected(true);
              onControlActivated(true);
              onHandMove(finalX, finalY, finalZ);
            } else {
              setHandDetected(false);
              onControlActivated(false);
              onHandMove(0, 0, 0);
            }
            
            // Draw visualization
            drawHandVisualization(hand.landmarks, currentGesture, shouldActivate);
          } else {
            setHandDetected(false);
            onControlActivated(false);
            onHandMove(0, 0, 0);
            setGesture('none');
            drawEmptyFrame();
          }
        } catch (error) {
          console.error('Hand detection error:', error);
        }
      }
      requestAnimationFrame(detectHands);
    };

    detectHands();
  }, [model, isTracking, mode, onHandMove, onControlActivated]);

  const drawHandVisualization = (landmarks: number[][], gesture: string, active: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Color based on state
    const color = active ? '#00ff00' : gesture === 'fist' ? '#ff0000' : '#ffff00';
    
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Draw key points
    const keyPoints = [0, 4, 8, 12, 16, 20];
    keyPoints.forEach(index => {
      const point = landmarks[index];
      const x = (point[0] / 640) * 160;
      const y = (point[1] / 480) * 120;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawEmptyFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No hand detected', canvas.width / 2, canvas.height / 2);
  };

  if (error) {
    return (
      <div className="fixed top-4 left-4 bg-red-500 text-white p-3 rounded-lg z-50">
        <div className="font-bold">Error:</div>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 bg-black/80 rounded-lg p-2 z-50">
      <div className="text-white text-xs mb-2">Gesture Test - {mode}</div>
      <video
        ref={videoRef}
        width="160"
        height="120"
        style={{ display: 'none' }}
        playsInline
      />
      <canvas
        ref={canvasRef}
        width="160"
        height="120"
        className="rounded border-2 border-white/50"
      />
      <div className="text-white text-xs mt-1">
        Hand: {handDetected ? '✅' : '❌'} | Gesture: {gesture}
      </div>
      <div className="text-white text-xs">
        Mode: {mode === 'hand-presence' ? 'Hand Presence' : 'Fist Activation'}
      </div>
    </div>
  );
};

// Keyboard/Mouse controller for comparison
const KeyboardMouseController: React.FC<{
  onHandMove: (x: number, y: number, z: number) => void;
  onControlActivated: (activated: boolean) => void;
}> = ({ onHandMove, onControlActivated }) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsActive(true);
        onControlActivated(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsActive(false);
        onControlActivated(false);
        setPosition({ x: 0, y: 0, z: 0 });
        onHandMove(0, 0, 0);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isActive) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -((e.clientY / window.innerHeight) * 2 - 1);
        const newPosition = { x: x * 0.8, y: y * 0.8, z: position.z };
        setPosition(newPosition);
        onHandMove(newPosition.x, newPosition.y, newPosition.z);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isActive) {
        const newZ = Math.max(-1, Math.min(1, position.z + e.deltaY * 0.001));
        const newPosition = { ...position, z: newZ };
        setPosition(newPosition);
        onHandMove(newPosition.x, newPosition.y, newPosition.z);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('wheel', handleWheel);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isActive, position, onHandMove, onControlActivated]);

  return (
    <div className="fixed top-4 left-4 bg-black/80 rounded-lg p-2 z-50">
      <div className="text-white text-xs mb-2">Keyboard/Mouse Test</div>
      <div className="text-white text-xs">
        Hold SPACE + Move Mouse
      </div>
      <div className="text-white text-xs">
        Active: {isActive ? '✅' : '❌'}
      </div>
      <div className="text-white text-xs">
        X: {position.x.toFixed(2)} Y: {position.y.toFixed(2)} Z: {position.z.toFixed(2)}
      </div>
    </div>
  );
};

const GestureTestEnvironment: React.FC<GestureTestEnvironmentProps> = ({ controlMode }) => {
  const [handPosition, setHandPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const [controlsActive, setControlsActive] = useState(false);

  const handleHandMove = (x: number, y: number, z: number) => {
    setHandPosition({ x, y, z });
  };

  const handleControlActivated = (activated: boolean) => {
    setControlsActive(activated);
  };

  return (
    <div className="min-h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        
        <TestScene 
          controlMode={controlMode}
          handPosition={handPosition}
          controlsActive={controlsActive}
        />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          enableRotate={!controlsActive}
          autoRotate={!controlsActive}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Control interface based on mode */}
      {controlMode === 'hand-presence' && (
        <SimpleHandController
          onHandMove={handleHandMove}
          onControlActivated={handleControlActivated}
          mode="hand-presence"
        />
      )}
      
      {controlMode === 'fist-activation' && (
        <SimpleHandController
          onHandMove={handleHandMove}
          onControlActivated={handleControlActivated}
          mode="fist-activation"
        />
      )}
      
      {controlMode === 'keyboard-mouse' && (
        <KeyboardMouseController
          onHandMove={handleHandMove}
          onControlActivated={handleControlActivated}
        />
      )}

      {/* Status info */}
      <div className="fixed bottom-4 left-4 bg-black/80 rounded-lg p-3 z-50">
        <div className="text-white text-sm mb-2">Hand Presence Control</div>
        <div className="text-white text-xs">
          Simply show your hand to activate controls
        </div>
        <div className="text-white text-xs">
          Move hand left/right to rotate, closer/further to zoom
        </div>
      </div>

      {/* Status display */}
      <div className="fixed top-4 right-4 bg-black/80 rounded-lg p-3 z-50">
        <div className="text-white text-sm mb-2">Status</div>
        <div className="text-white text-xs">
          Controls: {controlsActive ? '✅ Active' : '❌ Inactive'}
        </div>
        {handPosition && (
          <div className="text-white text-xs">
            Position: X:{handPosition.x.toFixed(2)} Y:{handPosition.y.toFixed(2)} Z:{handPosition.z.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestureTestEnvironment;
