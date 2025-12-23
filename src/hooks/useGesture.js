import { useState, useRef, useCallback, useEffect } from 'react';

// Finger landmark indices
const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];

export function useGesture({ onSwipeLeft, onSwipeRight, onPause }) {
  const [isActive, setIsActive] = useState(false);
  const [gesture, setGesture] = useState({
    name: 'WAITING',
    fingerCount: 0,
    confidence: 0,
  });
  const [pointer, setPointer] = useState({ x: 0, y: 0, isActive: false });
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);

  const pointerRef = useRef({ x: 0, y: 0, isActive: false });
  const pointerDropoutRef = useRef(0); // For keeping pointer active during brief tracking loss
  const SMOOTHING = 0.25; // Lower = smoother, higher = more responsive (EMA factor)

  const consecutiveFistRef = useRef(0);
  const consecutiveReadyRef = useRef(0);
  const consecutiveSwipeRef = useRef(0);

  // Swipe detection state
  const swipeRef = useRef({
    startX: null,
    startTime: 0,
    lastSwipeTime: 0,
  });

  const lastFistTimeRef = useRef(0);
  const lastOpenTimeRef = useRef(0);

  // Keep track of latest callbacks to avoid stale closures in MediaPipe
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight, onPause });

  useEffect(() => {
    callbacksRef.current = { onSwipeLeft, onSwipeRight, onPause };
  }, [onSwipeLeft, onSwipeRight, onPause]);

  // Count fingers using distance from wrist (more robust than Y-axis only)
  const countFingers = useCallback((landmarks, isRightHand) => {
    const fingers = [0, 0, 0, 0, 0];
    const wrist = landmarks[0];

    // Thumb detection: uses distance from Index MCP (landmark 5) and Pinky MCP (landmark 17)
    // or just distance from wrist compared to Tip 4 vs IP 3
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];

    const distThumbTip = Math.sqrt(Math.pow(thumbTip.x - wrist.x, 2) + Math.pow(thumbTip.y - wrist.y, 2));
    const distThumbIp = Math.sqrt(Math.pow(thumbIp.x - wrist.x, 2) + Math.pow(thumbIp.y - wrist.y, 2));

    // Thumb is open if tip is further from wrist than IP joint
    fingers[0] = distThumbTip > distThumbIp + 0.01 ? 1 : 0;

    // Other fingers - check distance from wrist tip vs pip
    for (let i = 1; i < 5; i++) {
      const tip = landmarks[FINGER_TIPS[i]];
      const pip = landmarks[FINGER_PIPS[i]];

      const dTip = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
      const dPip = Math.sqrt(Math.pow(pip.x - wrist.x, 2) + Math.pow(pip.y - wrist.y, 2));

      fingers[i] = dTip > dPip + 0.015 ? 1 : 0;
    }

    return fingers;
  }, []);

  // Detect swipe gesture
  const detectSwipe = useCallback((palmX) => {
    const now = Date.now();
    const swipe = swipeRef.current;

    if (swipe.startX === null) {
      swipe.startX = palmX;
      swipe.startTime = now;
      return null;
    }

    const dx = palmX - swipe.startX;
    const dt = now - swipe.startTime;

    // Reset if too slow
    if (dt > 500) {
      swipe.startX = palmX;
      swipe.startTime = now;
      return null;
    }

    // Check cooldown
    if (now - swipe.lastSwipeTime < 600) {
      return null;
    }

    // Threshold reached
    if (Math.abs(dx) > 0.15) {
      swipe.lastSwipeTime = now;
      swipe.startX = null;
      return dx > 0 ? 'right' : 'left';
    }

    return null;
  }, []);

  // Process hand landmarks
  const onResults = useCallback((results) => {
    const now = Date.now();

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      consecutiveFistRef.current = 0;
      consecutiveReadyRef.current = 0;
      consecutiveSwipeRef.current = 0;

      // OPTIMIZATION: Keep pointer for few more frames even if hand lost
      if (pointerDropoutRef.current > 0) {
        pointerDropoutRef.current--;
      } else {
        setGesture({ name: 'SCANNING', fingerCount: 0, confidence: 0 });
        setPointer(prev => ({ ...prev, isActive: false }));
      }

      swipeRef.current.startX = null;
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const handedness = results.multiHandedness?.[0];
    const isRightHand = handedness?.label === 'Right';
    const confidence = handedness?.score || 0;

    const fingers = countFingers(landmarks, isRightHand);
    const totalFingers = fingers.reduce((a, b) => a + b, 0);
    const palmX = landmarks[9].x;

    // 1. Fist detection (Zero fingers)
    if (totalFingers === 0) {
      consecutiveFistRef.current++;
      consecutiveReadyRef.current = 0;
      consecutiveSwipeRef.current = 0;

      if (consecutiveFistRef.current >= 10) {
        if (gesture.name !== 'PAUSED') {
          lastFistTimeRef.current = now;
          onPause?.();
        }
        swipeRef.current.startX = null;
        setGesture({ name: 'PAUSED', fingerCount: totalFingers, confidence });
        setPointer(prev => ({ ...prev, isActive: false }));
        return;
      }
    }
    // 2. Open hand - swipe mode (4+ fingers)
    else if (totalFingers >= 4) {
      consecutiveSwipeRef.current++;
      consecutiveFistRef.current = 0;
      consecutiveReadyRef.current = 0;

      if (consecutiveSwipeRef.current >= 4) {
        lastOpenTimeRef.current = now;
        const swipeDirection = detectSwipe(palmX);

        if (swipeDirection === 'left') {
          callbacksRef.current.onSwipeRight?.();
          setGesture({ name: 'SWIPE_RIGHT', fingerCount: totalFingers, confidence });
        } else if (swipeDirection === 'right') {
          callbacksRef.current.onSwipeLeft?.();
          setGesture({ name: 'SWIPE_LEFT', fingerCount: totalFingers, confidence });
        } else {
          setGesture({ name: 'SWIPE_READY', fingerCount: totalFingers, confidence });
        }
        setPointer(prev => ({ ...prev, isActive: false }));
        return;
      }
    }
    // 3. Ready / Pointer / Stabilizing
    else {
      consecutiveFistRef.current = 0;
      consecutiveSwipeRef.current = 0;

      const fistDelayOk = now - lastFistTimeRef.current > 300;
      const openDelayOk = now - lastOpenTimeRef.current > 300;

      if (fistDelayOk && openDelayOk) {
        consecutiveReadyRef.current++;

        if (consecutiveReadyRef.current >= 3) {
          setGesture({ name: 'READY', fingerCount: totalFingers, confidence });

          // Index finger pointer mode
          if (totalFingers === 1 && fingers[1] === 1) {
            const indexTip = landmarks[8];

            // ROI Mapping: Use only the central 70% of the camera frame (0.15 to 0.85)
            // This means user doesn't have to reach the extreme edges of camera to reach screen corners
            const roiMin = 0.15;
            const roiMax = 0.85;
            const roiRange = roiMax - roiMin;

            const mapROI = (val) => Math.max(0, Math.min(1, (val - roiMin) / roiRange));

            const rawX = 1 - mapROI(indexTip.x); // Mirrored & Mapped
            const rawY = mapROI(indexTip.y);     // Mapped

            // EMA Smoothing
            const newX = rawX * SMOOTHING + pointerRef.current.x * (1 - SMOOTHING);
            const newY = rawY * SMOOTHING + pointerRef.current.y * (1 - SMOOTHING);

            pointerRef.current = { x: newX, y: newY, isActive: true };
            pointerDropoutRef.current = 20;

            setPointer({ x: newX, y: newY, isActive: true });
          } else {
            // OPTIMIZATION: If tracking lost but we were just in pointer, apply dropout
            if (pointerDropoutRef.current > 0) {
              pointerDropoutRef.current--;
            } else {
              setPointer(prev => ({ ...prev, isActive: false }));
            }
          }
        } else {
          setGesture({ name: 'STABILIZING', fingerCount: totalFingers, confidence });
        }
      } else {
        setGesture({ name: 'STABILIZING', fingerCount: totalFingers, confidence });
        setPointer(prev => ({ ...prev, isActive: false }));
      }
    }

    swipeRef.current.startX = null;
  }, [countFingers, detectSwipe, gesture.name, onPause]);

  // Stable wrapper for onResults to pass to MediaPipe
  const stableOnResultsWrapper = useCallback((results) => {
    onResults(results);
  }, [onResults]);

  // Start camera and hand detection
  const start = useCallback(async () => {
    try {
      setError(null);

      // Use MediaPipe from global window object (loaded via CDN in index.html)
      // This avoids bundling issues in production (e.g. "C is not a constructor")
      const Hands = window.Hands;
      const Camera = window.Camera;

      if (!Hands || !Camera) {
        throw new Error('MediaPipe scripts not loaded. Please check your internet connection.');
      }

      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.65,
      });

      hands.onResults((results) => onResults(results));
      handsRef.current = hands;

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });

        await camera.start();
        cameraRef.current = camera;
        setIsActive(true);
      }
    } catch (err) {
      console.error('Failed to start gesture detection:', err);
      setError(err.message || 'Failed to access camera');
      setIsActive(false);
    }
  }, [onResults]);

  // Stop camera
  const stop = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsActive(false);
    setGesture({
      name: 'WAITING',
      fingerCount: 0,
      confidence: 0,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    videoRef,
    canvasRef,
    isActive,
    gesture,
    pointer,
    error,
    start,
    stop,
  };
}
