import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';

interface GestureControllerProps {
  onHandMove: (x: number, y: number, z: number) => void;
  onGestureDetected: (gesture: string) => void;
  onControlActivated: (activated: boolean) => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ onHandMove, onGestureDetected, onControlActivated }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Single source of truth for control state
  const [controlsActive, setControlsActive] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<'loading' | 'no-hand' | 'hand-detected' | 'controls-active'>('loading');
  const [currentGesture, setCurrentGesture] = useState<string>('none');
  
  // Performance optimization: throttle updates
  const lastUpdate = useRef(0);
  const UPDATE_INTERVAL = 100; // 10 FPS for better responsiveness
  
  // Hand position smoothing
  const lastPosition = useRef<{ x: number; y: number; z: number } | null>(null);
  const smoothingFactor = 0.7;

  // Initialize TensorFlow and load handpose model
  useEffect(() => {
    const initModel = async () => {
      try {
        await tf.ready();
        const handposeModel = await handpose.load();
        setModel(handposeModel);
        console.log('✅ Handpose model loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load handpose model:', err);
        setError('Failed to load hand tracking model');
      }
    };

    initModel();
  }, []);

  // Start video stream
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsTracking(true);
          console.log('✅ Video stream started');
        }
      } catch (err) {
        console.error('❌ Failed to start video stream:', err);
        setError('Camera access denied or unavailable');
      }
    };

    if (model) {
      startVideo();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [model]);

  // Gesture detection function
  const detectGestures = useCallback((landmarks: number[][]) => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    const palmBase = landmarks[0];
    
    // Check if fingers are curled (more reliable than up/down)
    const tolerance = 5;
    const isThumbCurled = thumbTip[1] > (palmBase[1] - tolerance);
    const isIndexCurled = indexTip[1] > (palmBase[1] - tolerance);
    const isMiddleCurled = middleTip[1] > (palmBase[1] - tolerance);
    const isRingCurled = ringTip[1] > (palmBase[1] - tolerance);
    const isPinkyCurled = pinkyTip[1] > (palmBase[1] - tolerance);
    
    // Fist: all fingers curled
    if (isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled) {
      return 'fist';
    }
    // Open hand: all fingers extended
    else if (!isIndexCurled && !isMiddleCurled && !isRingCurled && !isPinkyCurled) {
      return 'open_hand';
    }
    // Point: only index extended
    else if (!isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled) {
      return 'point';
    }
    
    return 'none';
  }, []);

  // Hand tracking loop
  useEffect(() => {
    if (!model || !videoRef.current || !canvasRef.current || !isTracking) return;

    const detectHands = async () => {
      const now = Date.now();
      
      if (now - lastUpdate.current < UPDATE_INTERVAL) {
        requestAnimationFrame(detectHands);
        return;
      }
      
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const predictions = await model.estimateHands(videoRef.current);
          
          if (predictions.length > 0) {
            const hand = predictions[0];
            const palmBase = hand.landmarks[0];
            
            // Update tracking status
            if (trackingStatus !== 'hand-detected' && trackingStatus !== 'controls-active') {
              setTrackingStatus('hand-detected');
            }
            
            // Process hand position
            const rawX = (palmBase[0] / 640) * 2 - 1;
            const rawY = -((palmBase[1] / 480) * 2 - 1);
            const rawZ = palmBase[2] / 100;
            
            // Apply smoothing
            let x = rawX;
            let y = rawY;
            let z = rawZ;
            
            if (lastPosition.current) {
              x = lastPosition.current.x * (1 - smoothingFactor) + rawX * smoothingFactor;
              y = lastPosition.current.y * (1 - smoothingFactor) + rawY * smoothingFactor;
              z = lastPosition.current.z * (1 - smoothingFactor) + rawZ * smoothingFactor;
            }
            
            // Apply dead zone
            const deadZone = 0.05;
            if (Math.abs(x) < deadZone) x = 0;
            if (Math.abs(y) < deadZone) y = 0;
            
            // Scale movement
            x = x * 0.6;
            y = y * 0.6;
            
            lastPosition.current = { x, y, z };
            
            // Detect gesture first
            const gesture = detectGestures(hand.landmarks);
            setCurrentGesture(gesture);
            
            // Handle gesture-based control activation
            if (gesture === 'fist' && !controlsActive) {
              setControlsActive(true);
              setTrackingStatus('controls-active');
              onControlActivated(true);
            } else if (gesture === 'open_hand' && controlsActive) {
              setControlsActive(false);
              setTrackingStatus('hand-detected');
              onControlActivated(false);
            }
            
            // Send hand position only if controls are active
            if (controlsActive) {
              onHandMove(x, y, z);
            }
            
            // Draw landmarks
            drawHandLandmarks(hand.landmarks, gesture);
            
            lastUpdate.current = now;
          } else {
            // No hand detected
            if (trackingStatus !== 'no-hand') {
              setTrackingStatus('no-hand');
              setControlsActive(false);
              onControlActivated(false);
              setCurrentGesture('none');
              lastPosition.current = null;
            }
            drawEmptyVideoFrame();
          }
        } catch (error) {
          console.error('❌ Hand detection error:', error);
        }
      }
      
      requestAnimationFrame(detectHands);
    };

    detectHands();
  }, [model, isTracking, controlsActive, trackingStatus, detectGestures, onHandMove, onControlActivated]);

  const drawHandLandmarks = (landmarks: number[][], gesture: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set color based on gesture
    let color = '#00ff00'; // Green for normal
    if (gesture === 'fist') {
      color = '#ff0000'; // Red for fist
    } else if (gesture === 'point') {
      color = '#ffff00'; // Yellow for point
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Draw only key landmarks
    const keyLandmarks = [0, 4, 8, 12, 16, 20]; // Palm base, fingertips
    keyLandmarks.forEach((index) => {
      const landmark = landmarks[index];
      const scaledX = (landmark[0] / 640) * 160;
      const scaledY = (landmark[1] / 480) * 120;
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw simple bounding box
    const xCoords = keyLandmarks.map(i => (landmarks[i][0] / 640) * 160);
    const yCoords = keyLandmarks.map(i => (landmarks[i][1] / 480) * 120);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
  };

  const drawEmptyVideoFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No hand detected', canvas.width / 2, canvas.height / 2);
  };

  if (error) {
    return (
      <div className="fixed top-4 left-4 bg-red-500 text-white p-3 rounded-lg z-50">
        <div className="font-bold">Hand Tracking Error:</div>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 bg-black/80 rounded-lg p-2 z-50">
      <div className="text-white text-xs mb-2">Hand Tracking</div>
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
        {trackingStatus === 'loading' && '🔄 Loading...'}
        {trackingStatus === 'no-hand' && '👋 No hand detected'}
        {trackingStatus === 'hand-detected' && '🖐️ Hand detected'}
        {trackingStatus === 'controls-active' && '🎯 CONTROLS ACTIVE'}
      </div>
      <div className="text-white text-xs mt-1">
        {trackingStatus === 'hand-detected' && '👊 Make a fist to activate'}
        {trackingStatus === 'controls-active' && '✋ Open hand to deactivate'}
      </div>
      <div className="text-white text-xs">
        Gesture: {currentGesture} | Active: {controlsActive ? 'YES' : 'NO'}
      </div>
      <div className="text-white text-xs">
        Move hand left/right to rotate
      </div>
      <div className="text-white text-xs">
        Move hand closer/further to zoom
      </div>
    </div>
  );
};

export default GestureController;
