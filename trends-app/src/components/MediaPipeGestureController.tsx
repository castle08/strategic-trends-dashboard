import React, { useEffect, useRef, useState, useCallback } from 'react';

// Dynamic import for MediaPipe to handle production builds
let HandsModule: any = null;
let CameraModule: any = null;
let DrawingUtilsModule: any = null;

interface MediaPipeGestureControllerProps {
  onHandMove: (x: number, y: number, z: number) => void;
  onGestureDetected: (gesture: string) => void;
  onControlActivated: (activated: boolean) => void;
  mode?: 'hand-presence' | 'fist-activation' | 'hybrid';
}

const MediaPipeGestureController: React.FC<MediaPipeGestureControllerProps> = ({ 
  onHandMove, 
  onGestureDetected, 
  onControlActivated,
  mode = 'hand-presence'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simple state management
  const [handDetected, setHandDetected] = useState(false);
  const [controlsActive, setControlsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>('none');
  
  // Performance optimization
  const lastUpdate = useRef(0);
  const UPDATE_INTERVAL = 50; // 20 FPS
  
  // Hand position smoothing
  const lastPosition = useRef<{ x: number; y: number; z: number } | null>(null);
  const smoothingFactor = 0.8;
  
  // Tolerance system for state changes
  const handDetectedHistory = useRef<boolean[]>([]);
  const TOLERANCE_FRAMES = 1; // Reduced from 3 to 1 for faster deactivation // Require 3 consecutive frames of same state
  

  
  // MediaPipe references
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Initialize MediaPipe Hands
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        // Check if we're in a secure context (HTTPS)
        if (!window.isSecureContext) {
          throw new Error('MediaPipe requires HTTPS for camera access');
        }

        // Dynamic import to handle production builds
        if (!HandsModule) {
          console.log('Loading MediaPipe modules...');
          try {
            const handsImport = await import('@mediapipe/hands');
            const cameraImport = await import('@mediapipe/camera_utils');
            const drawingImport = await import('@mediapipe/drawing_utils');
            
            console.log('MediaPipe imports:', { handsImport, cameraImport, drawingImport });
            
            HandsModule = handsImport.Hands || handsImport.default?.Hands;
            CameraModule = cameraImport.Camera || cameraImport.default?.Camera;
            DrawingUtilsModule = drawingImport;
            
            if (!HandsModule) {
              // Try global MediaPipe as fallback
              if ((window as any).MediaPipe && (window as any).MediaPipe.Hands) {
                console.log('Using global MediaPipe object');
                HandsModule = (window as any).MediaPipe.Hands;
                CameraModule = (window as any).MediaPipe.Camera;
                DrawingUtilsModule = (window as any).MediaPipe.DrawingUtils;
              } else {
                throw new Error('Hands module not found in import or global object');
              }
            }
          } catch (importError) {
            console.error('Failed to import MediaPipe modules:', importError);
            throw new Error(`MediaPipe import failed: ${importError.message}`);
          }
        }

        // Initialize MediaPipe Hands
        const hands = new HandsModule({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });

        // Set up the results callback
        hands.onResults((results) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const handedness = results.multiHandedness?.[0]?.label || 'Unknown';
            
            // Process hand detection
            processHandLandmarks(landmarks, handedness);
            
            // Draw landmarks
            drawHandLandmarks(landmarks);
          } else {
            // No hand detected
            handleNoHandDetected();
          }
        });

        handsRef.current = hands;

        // Initialize camera after a short delay to ensure video element is ready
        setTimeout(async () => {
          if (videoRef.current) {
            const camera = new CameraModule(videoRef.current, {
              onFrame: async () => {
                if (handsRef.current && videoRef.current) {
                  await handsRef.current.send({ image: videoRef.current });
                }
              },
              width: 640,
              height: 480
            });

            cameraRef.current = camera;
            await camera.start();
            setIsTracking(true);
          }
        }, 100);

      } catch (err) {
        console.error('❌ Failed to initialize MediaPipe:', err);
        console.error('❌ Error details:', {
          isSecureContext: window.isSecureContext,
          userAgent: navigator.userAgent,
          mediaDevices: !!navigator.mediaDevices,
          location: window.location.href
        });
        setError(`Failed to initialize hand tracking: ${err.message}`);
      }
    };

    initMediaPipe();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

      // Process hand landmarks
    const processHandLandmarks = useCallback((landmarks: any[], handedness: string) => {
      console.log('MediaPipe: Processing hand landmarks, handedness:', handedness);
    const now = Date.now();
    
    if (now - lastUpdate.current < UPDATE_INTERVAL) {
      return;
    }

    // Get palm base (landmark 0)
    const palmBase = landmarks[0];
    
    // Update hand detection history for tolerance
    handDetectedHistory.current.push(true);
    if (handDetectedHistory.current.length > TOLERANCE_FRAMES) {
      handDetectedHistory.current.shift();
    }
    
    // Only update state if we have consistent detection
    const consistentDetection = handDetectedHistory.current.length === TOLERANCE_FRAMES && 
                              handDetectedHistory.current.every(detected => detected);
    
    if (!handDetected && consistentDetection) {
      console.log('MediaPipe: Hand detected!');
      setHandDetected(true);
    }
    
    // Always process position data when hand is detected (don't wait for tolerance)
    if (handDetected || consistentDetection) {
      console.log('MediaPipe: Processing position data');
      
      // Process hand position
      const rawX = (palmBase.x * 2) - 1; // Convert to -1 to 1 range
      const rawY = -((palmBase.y * 2) - 1); // Invert Y and convert to -1 to 1 range
      const rawZ = palmBase.z; // Z is already normalized
      
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
      const deadZone = 0.02;
      if (Math.abs(x) < deadZone) x = 0;
      if (Math.abs(y) < deadZone) y = 0;
      
      // Scale movement
      x = x * 0.8;
      y = y * 0.8;
      
      lastPosition.current = { x, y, z };
      
      // Detect gesture
      const gesture = detectGestures(landmarks);
      setCurrentGesture(gesture);
      
      // Control activation logic based on mode
      let shouldActivate = false;
      
      if (mode === 'hand-presence') {
        shouldActivate = true;
      } else if (mode === 'fist-activation') {
        shouldActivate = gesture === 'fist';
      } else if (mode === 'hybrid') {
        shouldActivate = true;
      }
      
      // Update control state
      if (shouldActivate && !controlsActive) {
        console.log('MediaPipe: Activating controls');
        setControlsActive(true);
        onControlActivated(true);
      } else if (!shouldActivate && controlsActive) {
        console.log('MediaPipe: Deactivating controls');
        setControlsActive(false);
        onControlActivated(false);
      }
      
      // Send data
      if (shouldActivate) {
        console.log('MediaPipe: Sending hand position:', { x, y, z });
        onHandMove(x, y, z);
      }
      onGestureDetected(gesture);
      
      lastUpdate.current = now;
    }
  }, [handDetected, controlsActive, mode, onHandMove, onControlActivated, onGestureDetected]);

  // Handle no hand detected
  const handleNoHandDetected = useCallback(() => {
    console.log('MediaPipe: No hand detected - immediately deactivating');
    
    // Immediately deactivate when no hand is detected
    if (handDetected || controlsActive) {
      console.log('MediaPipe: Deactivating controls immediately');
      setHandDetected(false);
      setControlsActive(false);
      onControlActivated(false);
      setCurrentGesture('none');
      lastPosition.current = null;
      handDetectedHistory.current = []; // Reset history
      
      // Send a "no position" signal to Scene
      onHandMove(0, 0, 0);
    }
    
    drawEmptyVideoFrame();
  }, [handDetected, controlsActive, onControlActivated]);

  // Gesture detection function (defined outside useCallback to avoid circular dependency)
  const detectGestures = (landmarks: any[]) => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    const palmBase = landmarks[0];
    
    // Check if fingers are extended
    const tolerance = 0.1; // MediaPipe uses normalized coordinates
    const isThumbExtended = thumbTip.y < (palmBase.y - tolerance);
    const isIndexExtended = indexTip.y < (palmBase.y - tolerance);
    const isMiddleExtended = middleTip.y < (palmBase.y - tolerance);
    const isRingExtended = ringTip.y < (palmBase.y - tolerance);
    const isPinkyExtended = pinkyTip.y < (palmBase.y - tolerance);
    
    // Open hand: all fingers extended
    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
      return 'open_hand';
    }
    // Fist: no fingers extended
    else if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'fist';
    }
    // Point: only index extended
    else if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'point';
    }
    
    return 'partial';
  };

  // Draw hand landmarks
  const drawHandLandmarks = (landmarks: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set color based on state
    const color = controlsActive ? '#00ffff' : '#00ff00';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    // Draw landmarks
    DrawingUtilsModule.drawLandmarks(ctx, landmarks, {
      color: color,
      lineWidth: 2,
      radius: 3
    });

    // Draw connections
    DrawingUtilsModule.drawConnectors(ctx, landmarks, HandsModule.HAND_CONNECTIONS, {
      color: color,
      lineWidth: 2
    });
  };

  // Draw empty frame
  const drawEmptyVideoFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
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
      <div className="text-white text-xs mb-2">MediaPipe Hand Control - {mode}</div>
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
        Hand: {handDetected ? '✅' : '❌'} | Controls: {controlsActive ? '🎯 ACTIVE' : '⏸️ INACTIVE'}
      </div>
      <div className="text-white text-xs">
        Debug: handDetected={handDetected.toString()}, controlsActive={controlsActive.toString()}
      </div>
      <div className="text-white text-xs">
        Gesture: {currentGesture} | Mode: {mode}
      </div>
      <div className="text-white text-xs">
        {mode === 'hand-presence' && '🖐️ Hand presence activates controls'}
        {mode === 'fist-activation' && '👊 Make a fist to activate'}
        {mode === 'hybrid' && '🖐️ Hand presence + 👊 Fist for precision'}
      </div>
      <div className="text-white text-xs">
        Move hand left/right to rotate horizontally
      </div>
      <div className="text-white text-xs">
        Move hand up/down to rotate vertically
      </div>
    </div>
  );
};

export default MediaPipeGestureController;
