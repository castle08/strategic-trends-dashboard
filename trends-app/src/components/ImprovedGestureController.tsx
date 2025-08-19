import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';

interface ImprovedGestureControllerProps {
  onHandMove: (x: number, y: number, z: number) => void;
  onGestureDetected: (gesture: string) => void;
  onControlActivated: (activated: boolean) => void;
  mode?: 'hand-presence' | 'fist-activation' | 'hybrid';
}

const ImprovedGestureController: React.FC<ImprovedGestureControllerProps> = ({ 
  onHandMove, 
  onGestureDetected, 
  onControlActivated,
  mode = 'hand-presence'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Simplified state management
  const [handDetected, setHandDetected] = useState(false);
  const [controlsActive, setControlsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>('none');
  const [confidence, setConfidence] = useState(0);
  
  // Performance optimization
  const lastUpdate = useRef(0);
  const UPDATE_INTERVAL = 50; // 20 FPS for better responsiveness
  
  // Hand position smoothing
  const lastPosition = useRef<{ x: number; y: number; z: number } | null>(null);
  const smoothingFactor = 0.9; // Increased smoothing for more fluid movement
  
  // Timeout for hand detection
  const handTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const HAND_TIMEOUT = 2000; // 2 seconds
  
  // Forgiveness system for brief detection dropouts
  const lastValidPosition = useRef<{ x: number; y: number; z: number } | null>(null);
  const lastValidTime = useRef<number>(0);
  const FORGIVENESS_WINDOW = 500; // Reduced to 500ms to prevent false activation
  const MOMENTUM_DECAY = 0.95; // Faster decay to stop sooner
  
  // Hand confidence tracking to avoid false positives
  const handConfidence = useRef<number>(0);
  const CONFIDENCE_THRESHOLD = 0.8; // Increased threshold to filter out false positives
  
  // Tolerance system for state changes
  const handDetectedHistory = useRef<boolean[]>([]);
  const TOLERANCE_FRAMES = 3; // Require 3 consecutive frames of same state

  // Initialize TensorFlow and load handpose model
  useEffect(() => {
    const initModel = async () => {
      try {
        // console.log('🔄 Initializing TensorFlow...');
        await tf.ready();
        // console.log('✅ TensorFlow ready');
        
        // console.log('🔄 Loading handpose model...');
        const handposeModel = await handpose.load();
        setModel(handposeModel);
        // console.log('✅ Improved Handpose model loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load handpose model:', err);
        console.error('Error details:', err.message, err.stack);
        setError('Failed to load hand tracking model');
      }
    };

    initModel();
  }, []);

  // Start video stream
  useEffect(() => {
    const startVideo = async () => {
      try {
        console.log('🔄 Requesting camera access...');
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
        console.error('Error details:', err.message, err.stack);
        setError('Camera access denied or unavailable');
      }
    };

    if (model) {
              // console.log('🔄 Model loaded, starting video...');
      startVideo();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [model]);

  // Geometric validation: check if landmarks form a reasonable hand shape
  const validateHandGeometry = useCallback((landmarks: number[][]) => {
    if (!landmarks || landmarks.length !== 21) return false;
    
    // Check if hand size is reasonable (not too small or too large)
    const palmBase = landmarks[0];
    const wrist = landmarks[1];
    const middleFingerMcp = landmarks[9];
    
    // Calculate hand size (distance from wrist to middle finger MCP)
    const handSize = Math.sqrt(
      Math.pow(middleFingerMcp[0] - wrist[0], 2) + 
      Math.pow(middleFingerMcp[1] - wrist[1], 2)
    );
    
    // Hand should be between 20-500 pixels (very wide range for different distances)
    const minHandSize = 20;
    const maxHandSize = 500;
    
    console.log('DEBUG - Hand size check:', handSize, 'range:', minHandSize, '-', maxHandSize);
    if (handSize < minHandSize || handSize > maxHandSize) {
      console.log('Hand size invalid:', handSize, 'should be between', minHandSize, 'and', maxHandSize);
      return false;
    }
    
    // Check if fingers are in reasonable positions relative to palm
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    // All fingertips should be above the palm base (Y coordinate) - very lenient
    const palmY = palmBase[1];
    const fingersAbovePalm = [indexTip, middleTip, ringTip, pinkyTip].every(
      tip => tip[1] < palmY + 50 // Much more tolerance for different hand orientations
    );
    
    if (!fingersAbovePalm) {
      console.log('Fingers not above palm');
      return false;
    }
    
    // Check if hand is reasonably horizontal (not too tilted)
    const handWidth = Math.max(indexTip[0], middleTip[0], ringTip[0], pinkyTip[0]) - 
                     Math.min(indexTip[0], middleTip[0], ringTip[0], pinkyTip[0]);
    const handHeight = palmY - Math.min(indexTip[1], middleTip[1], ringTip[1], pinkyTip[1]);
    
    // Hand should be wider than tall (reasonable aspect ratio) - very lenient
    if (handWidth < handHeight * 0.1) {
      console.log('Hand too narrow:', handWidth, 'vs height:', handHeight);
      return false;
    }
    
    return true;
  }, []);

  // Additional validation: check for common false positive patterns
  const validateFalsePositivePatterns = useCallback((landmarks: number[][], gesture: string) => {
    const palmBase = landmarks[0];
    const palmX = palmBase[0];
    const palmY = palmBase[1];
    
    // Calculate hand size
    const wrist = landmarks[1];
    const middleFingerMcp = landmarks[9];
    const handSize = Math.sqrt(
      Math.pow(middleFingerMcp[0] - wrist[0], 2) + 
      Math.pow(middleFingerMcp[1] - wrist[1], 2)
    );
    
    // Pattern 1: Small "fist" in bottom area (likely shirt folds)
    if (gesture === 'fist' && handSize < 40 && palmY > 350) {
      console.log('Rejecting small fist in bottom area (likely shirt folds)');
      return false;
    }
    
    // Pattern 2: Very small hand with high confidence (likely false positive)
    if (handSize < 30 && gesture === 'fist') {
      console.log('Rejecting very small fist (likely false positive)');
      return false;
    }
    
    // Pattern 3: Any very small hand (likely false positive) - more lenient
    if (handSize < 15) {
      console.log('Rejecting very small hand (likely false positive)');
      return false;
    }
    
    // Pattern 4: Hand in bottom area with small size (likely shirt/background) - more lenient
    if (palmY > 380 && handSize < 30) {
      console.log('Rejecting small hand in bottom area (likely background)');
      return false;
    }
    
    // Pattern 5: Require a valid gesture - if it can't detect a proper gesture, it's probably not a hand
    const validGestures = ['open_hand', 'fist', 'point'];
    if (!validGestures.includes(gesture)) {
      console.log('Rejecting invalid gesture:', gesture);
      return false;
    }
    
    // Pattern 6: Check finger spread - real hands should have reasonable finger spacing
    const indexTip = landmarks[8];
    const pinkyTip = landmarks[20];
    const fingerSpread = Math.abs(indexTip[0] - pinkyTip[0]);
    const minFingerSpread = handSize * 0.3; // Fingers should be reasonably spread
    
    if (fingerSpread < minFingerSpread && gesture === 'open_hand') {
      console.log('Rejecting hand with insufficient finger spread:', fingerSpread, '<', minFingerSpread);
      return false;
    }
    
    return true;
  }, []);

  // Simplified gesture detection - focus only on rotation
  const detectGestures = useCallback((landmarks: number[][]) => {
    const palmBase = landmarks[0];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    // Check if fingers are extended (more reliable than curled)
    const tolerance = 15;
    const isIndexExtended = indexTip[1] < (palmBase[1] - tolerance);
    const isMiddleExtended = middleTip[1] < (palmBase[1] - tolerance);
    const isRingExtended = ringTip[1] < (palmBase[1] - tolerance);
    const isPinkyExtended = pinkyTip[1] < (palmBase[1] - tolerance);
    
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
            // console.log('Hand detected! Predictions:', predictions.length, 'First hand:', predictions[0]);
            const hand = predictions[0];
            const palmBase = hand.landmarks[0];
            
            // Check hand confidence to avoid false positives
            const confidence = hand.handInViewConfidence || hand.score || 0;
            handConfidence.current = confidence;
            
            // console.log('Hand confidence:', confidence, 'threshold:', CONFIDENCE_THRESHOLD);
            // console.log('Hand landmarks:', hand.landmarks.length, 'palm position:', palmBase);
            
            // Additional validation: check if landmarks are reasonable
            const hasValidLandmarks = hand.landmarks && hand.landmarks.length === 21;
            const palmInView = palmBase && palmBase[0] > 0 && palmBase[0] < 640 && palmBase[1] > 0 && palmBase[1] < 480;
            
            // console.log('Valid landmarks:', hasValidLandmarks, 'Palm in view:', palmInView);
            
            if (!hasValidLandmarks || !palmInView) {
              console.log('Rejecting invalid hand data');
              drawEmptyVideoFrame();
              return;
            }
            
            // Geometric validation: check if landmarks form a reasonable hand shape
            const isValidHandShape = validateHandGeometry(hand.landmarks);
            // console.log('Valid hand geometry:', isValidHandShape);
            
            // Re-enable geometric validation to filter false positives
            if (!isValidHandShape) {
              console.log('Rejecting invalid hand geometry');
              // Clear tolerance history when geometry is invalid
              handDetectedHistory.current = [];
              drawEmptyVideoFrame();
              return;
            }
            
            // Debug: log confidence when it's low
            if (confidence < CONFIDENCE_THRESHOLD) {
              console.log('Low confidence detected:', confidence, 'threshold:', CONFIDENCE_THRESHOLD);
            }
            
            // Only proceed if confidence is high enough
            if (confidence < CONFIDENCE_THRESHOLD) {
              console.log('Rejecting low confidence detection:', confidence, '<', CONFIDENCE_THRESHOLD);
              // Low confidence - treat as no hand detected and deactivate controls
              setHandDetected(false);
              setControlsActive(false);
              onControlActivated(false);
              setCurrentGesture('none');
              lastPosition.current = null;
              lastValidPosition.current = null;
              drawEmptyVideoFrame();
              return;
            }
            
            // Clear timeout since hand is detected
            if (handTimeoutRef.current) {
              clearTimeout(handTimeoutRef.current);
              handTimeoutRef.current = null;
            }
            
            // Update hand detection history for tolerance
            handDetectedHistory.current.push(true);
            if (handDetectedHistory.current.length > TOLERANCE_FRAMES) {
              handDetectedHistory.current.shift();
            }
            
            // Only update state if we have consistent detection
            const consistentDetection = handDetectedHistory.current.length === TOLERANCE_FRAMES && 
                                      handDetectedHistory.current.every(detected => detected);
            
            if (!handDetected && consistentDetection) {
              setHandDetected(true);
            }
            
            // Process hand position with improved normalization
            const rawX = (palmBase[0] / 640) * 2 - 1;
            const rawY = -((palmBase[1] / 480) * 2 - 1);
            const rawZ = Math.max(-1, Math.min(1, (palmBase[2] - 0.5) * 2)); // Better Z normalization
            
            // Apply smoothing
            let x = rawX;
            let y = rawY;
            let z = rawZ;
            
            if (lastPosition.current) {
              x = lastPosition.current.x * (1 - smoothingFactor) + rawX * smoothingFactor;
              y = lastPosition.current.y * (1 - smoothingFactor) + rawY * smoothingFactor;
              z = lastPosition.current.z * (1 - smoothingFactor) + rawZ * smoothingFactor;
            }
            
            // Apply dead zone with hysteresis
            const deadZone = 0.02; // Reduced dead zone for more responsive control
            const hysteresis = 0.02;
            
            if (Math.abs(x) < deadZone) x = 0;
            if (Math.abs(y) < deadZone) y = 0;
            if (Math.abs(z) < deadZone) z = 0;
            
            // Scale movement for better control
            x = x * 0.8; // Increased scaling for more responsive movement
            y = y * 0.8;
            z = z * 0.4;
            
            // Store valid position for forgiveness system
            lastValidPosition.current = { x, y, z };
            lastValidTime.current = now;
            lastPosition.current = { x, y, z };
            
            // Always send position when hand is detected (for continuous rotation)
            if (controlsActive) {
              onHandMove(x, y, z);
            }
            
            // Detect gesture
            const gesture = detectGestures(hand.landmarks);
            setCurrentGesture(gesture);
            
            // Additional false positive validation
            const isValidPattern = validateFalsePositivePatterns(hand.landmarks, gesture);
            // console.log('Valid pattern:', isValidPattern);
            
            if (!isValidPattern) {
              // Clear tolerance history and treat as no hand detected
              handDetectedHistory.current = [];
              if (handDetected) {
                setHandDetected(false);
                setControlsActive(false);
                onControlActivated(false);
                setCurrentGesture('none');
                lastPosition.current = null;
                lastValidPosition.current = null;
              }
              drawEmptyVideoFrame();
              return;
            }
            
            // Control activation logic based on mode
            let shouldActivate = false;
            
            if (mode === 'hand-presence') {
              // Always active when hand is present
              shouldActivate = true;
            } else if (mode === 'fist-activation') {
              // Only active when fist is made
              shouldActivate = gesture === 'fist';
            } else if (mode === 'hybrid') {
              // Active when hand is present, but fist gives more control
              shouldActivate = true;
            }
            
            // Update control state
            if (shouldActivate && !controlsActive) {
              setControlsActive(true);
              onControlActivated(true);
            } else if (!shouldActivate && controlsActive) {
              setControlsActive(false);
              onControlActivated(false);
            }
            

            
            // Send gesture info
            onGestureDetected(gesture);
            
            // Draw visualization
            drawHandLandmarks(hand.landmarks, gesture, controlsActive);
            
            lastUpdate.current = now;
          } else {
            // No hand detected - add to tolerance history
            handDetectedHistory.current.push(false);
            if (handDetectedHistory.current.length > TOLERANCE_FRAMES) {
              handDetectedHistory.current.shift();
            }
            
            // Only deactivate if we have consistent no-detection
            const consistentNoDetection = handDetectedHistory.current.length === TOLERANCE_FRAMES && 
                                        handDetectedHistory.current.every(detected => !detected);
            
            // console.log('No hand detected in frame, tolerance:', consistentNoDetection ? 'deactivating' : 'waiting');
            
            if (handDetected && consistentNoDetection) {
              setHandDetected(false);
              setControlsActive(false);
              onControlActivated(false);
              setCurrentGesture('none');
              lastPosition.current = null;
              lastValidPosition.current = null;
            }
            drawEmptyVideoFrame();
          }
        } catch (error) {
          console.error('❌ Hand detection error:', error);
          console.error('Error details:', error.message, error.stack);
        }
      }
      
      requestAnimationFrame(detectHands);
    };

    detectHands();
  }, [model, isTracking, handDetected, controlsActive, detectGestures, validateHandGeometry, validateFalsePositivePatterns, onHandMove, onControlActivated, onGestureDetected, mode]);

  const drawHandLandmarks = (landmarks: number[][], gesture: string, active: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set color based on state and gesture
    let color = '#00ff00'; // Green for active
    if (!active) {
      if (gesture === 'open_hand') {
        color = '#4ecdc4'; // Teal for open hand
      } else if (gesture === 'fist') {
        color = '#ff0000'; // Red for fist
      } else if (gesture === 'point') {
        color = '#ff6b35'; // Orange for point
      } else {
        color = '#ffff00'; // Yellow for other
      }
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Draw key landmarks
    const keyLandmarks = [0, 4, 8, 12, 16, 20]; // Palm base, fingertips
    keyLandmarks.forEach((index) => {
      const landmark = landmarks[index];
      const scaledX = (landmark[0] / 640) * 160;
      const scaledY = (landmark[1] / 480) * 120;
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw bounding box
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
      <div className="text-white text-xs mb-2">Improved Hand Control - {mode}</div>
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
        Gesture: {currentGesture} | Confidence: {(handConfidence.current * 100).toFixed(0)}% (need {CONFIDENCE_THRESHOLD * 100}%)
      </div>
      <div className="text-white text-xs">
        {handConfidence.current > CONFIDENCE_THRESHOLD ? '✅ Valid Hand' : '❌ False Detection'}
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

export default ImprovedGestureController;
