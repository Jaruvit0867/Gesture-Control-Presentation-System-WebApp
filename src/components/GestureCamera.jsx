import React from 'react';
import { Camera, CameraOff, Hand, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const gestureInfo = {
  WAITING: { label: 'Waiting', color: 'text-gray-400', icon: '⏳' },
  SCANNING: { label: 'Scanning...', color: 'text-cyan-400', icon: '👁️' },
  PAUSED: { label: 'Paused', color: 'text-red-400', icon: '✊' },
  SWIPE_READY: { label: 'Swipe Ready', color: 'text-green-400', icon: '🖐️' },
  SWIPE_LEFT: { label: '← Previous', color: 'text-purple-400', icon: '👈' },
  SWIPE_RIGHT: { label: 'Next →', color: 'text-purple-400', icon: '👉' },
  READY: { label: 'Ready', color: 'text-cyan-400', icon: '☝️' },
  STABILIZING: { label: 'Stabilizing...', color: 'text-yellow-400', icon: '⏳' },
};

export function GestureCamera({
  videoRef,
  isActive,
  gesture,
  error,
  onStart,
  onStop,
  isMini = false
}) {
  const info = gestureInfo[gesture.name] || gestureInfo.WAITING;

  return (
    <div className={`glass rounded-2xl p-4 relative overflow-hidden ${isMini ? 'p-2 opacity-50 hover:opacity-100 transition-opacity' : ''}`}>
      {/* Background glow */}
      {!isMini && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-purple blur-3xl" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        {!isMini && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Hand className="w-5 h-5 text-accent-cyan" />
              <span className="font-display font-semibold text-white">Gesture Control</span>
            </div>

            <button
              onClick={isActive ? onStop : onStart}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
                transition-all duration-300 transform hover:scale-105
                ${isActive
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30'}
              `}
            >
              {isActive ? (
                <>
                  <CameraOff className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Start Camera
                </>
              )}
            </button>
          </div>
        )}

        {/* Video container */}
        <div className="relative aspect-video bg-dark-800 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`
              w-full h-full object-cover camera-mirror
              ${!isActive && 'hidden'}
            `}
          />

          {/* Placeholder when inactive */}
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <Camera className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Camera is off</p>
              <p className="text-xs text-gray-600 mt-1">Click "Start Camera" to begin</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
              <div className="text-center p-4">
                <p className="text-red-400 font-medium">⚠️ {error}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Please allow camera access and try again
                </p>
              </div>
            </div>
          )}

          {/* Gesture indicator overlay */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-3 left-3 right-3"
              >
                <div className={`glass rounded-xl px-4 py-3 flex items-center justify-between ${isMini ? 'px-2 py-1' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`${isMini ? 'text-lg' : 'text-2xl'} gesture-pulse`}>{info.icon}</span>
                    <div>
                      <p className={`font-semibold ${info.color} ${isMini ? 'text-xs' : ''}`}>{info.label}</p>
                      {!isMini && (
                        <p className="text-xs text-gray-500">
                          {gesture.fingerCount > 0 && `${gesture.fingerCount} fingers detected`}
                        </p>
                      )}
                    </div>
                  </div>

                  {gesture.confidence > 0 && !isMini && (
                    <div className="text-right">
                      <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                          initial={{ width: 0 }}
                          animate={{ width: `${gesture.confidence * 100}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(gesture.confidence * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gesture guide */}
        {!isMini && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { icon: '✊', label: 'Pause', desc: 'Fist' },
              { icon: '☝️', label: 'Ready', desc: '1 Finger' },
              { icon: '🖐️', label: 'Swipe', desc: 'Open Hand' },
              { icon: '👋', label: 'Navigate', desc: 'Wave L/R' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-dark-700/50 rounded-lg p-2 text-center hover:bg-dark-600/50 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-xs font-medium text-white mt-1">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
