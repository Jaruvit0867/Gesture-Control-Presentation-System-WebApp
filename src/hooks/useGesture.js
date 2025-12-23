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
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);

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

  // Count fingers
  const countFingers = useCallback((landmarks, isRightHand) => {
    const fingers = [0, 0, 0, 0, 0];

    // Thumb - check X axis
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const palmCenter = landmarks[9];

    if (isRightHand) {
      fingers[0] = thumbTip.x < thumbIp.x - 0.02 ? 1 : 0;
    } else {
      fingers[0] = thumbTip.x > thumbIp.x + 0.02 ? 1 : 0;
    }

    // Check if thumb is away from palm
    if (Math.abs(thumbTip.x - palmCenter.x) < 0.08) {
      fingers[0] = 0;
    }

    // Other fingers - check Y axis
    for (let i = 1; i < 5; i++) {
      const tipY = landmarks[FINGER_TIPS[i]].y;
      const pipY = landmarks[FINGER_PIPS[i]].y;
      fingers[i] = (pipY - tipY) > 0.02 ? 1 : 0;
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
      setGesture({
        name: 'SCANNING',
        fingerCount: 0,
        confidence: 0,
      });
      swipeRef.current.startX = null;
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const handedness = results.multiHandedness?.[0];
    const isRightHand = handedness?.label === 'Right';
    const confidence = handedness?.score || 0;

    const fingers = countFingers(landmarks, isRightHand);
    const totalFingers = fingers.reduce((a, b) => a + b, 0);
    const nonThumbFingers = fingers.slice(1).reduce((a, b) => a + b, 0);

    const palmX = landmarks[9].x;

    // Fist detection
    if (nonThumbFingers === 0) {
      lastFistTimeRef.current = now;
      swipeRef.current.startX = null;

      setGesture({
        name: 'PAUSED',
        fingerCount: totalFingers,
        confidence,
      });
      onPause?.();
      return;
    }

    // Open hand - swipe mode
    if (totalFingers >= 4) {
      lastOpenTimeRef.current = now;

      const swipeDirection = detectSwipe(palmX);

      if (swipeDirection === 'left') {
        callbacksRef.current.onSwipeRight?.(); // Swap: Swipe left on screen (hand move to user right) -> Next
        setGesture({
          name: 'SWIPE_RIGHT',
          fingerCount: totalFingers,
          confidence,
        });
      } else if (swipeDirection === 'right') {
        callbacksRef.current.onSwipeLeft?.(); // Swap: Swipe right on screen (hand move to user left) -> Prev
        setGesture({
          name: 'SWIPE_LEFT',
          fingerCount: totalFingers,
          confidence,
        });
      } else {
        setGesture({
          name: 'SWIPE_READY',
          fingerCount: totalFingers,
          confidence,
        });
      }
      return;
    }

    // Check delays
    const fistDelayOk = now - lastFistTimeRef.current > 600;
    const openDelayOk = now - lastOpenTimeRef.current > 500;

    if (fistDelayOk && openDelayOk) {
      setGesture({
        name: 'READY',
        fingerCount: totalFingers,
        confidence,
      });
    } else {
      setGesture({
        name: 'STABILIZING',
        fingerCount: totalFingers,
        confidence,
      });
    }

    swipeRef.current.startX = null;
  }, [countFingers, detectSwipe]);

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
        modelComplexity: 0,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
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
    error,
    start,
    stop,
  };
}
