import React from 'react';
import { Camera, CameraOff, Hand, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const gestureInfo = {
  WAITING: { label: 'Awaiting Input', color: 'text-slate-500', icon: '⏳' },
  SCANNING: { label: 'Initializing...', color: 'text-accent-primary', icon: '👁️' },
  PAUSED: { label: 'Detection Paused', color: 'text-rose-400', icon: '✊' },
  SWIPE_READY: { label: 'Motion Ready', color: 'text-emerald-400', icon: '🖐️' },
  SWIPE_LEFT: { label: 'Previous Frame', color: 'text-indigo-400', icon: '👈' },
  SWIPE_RIGHT: { label: 'Next Frame', color: 'text-indigo-400', icon: '👉' },
  READY: { label: 'Pointer Mode', color: 'text-accent-primary', icon: '☝️' },
  STABILIZING: { label: 'Calibrating...', color: 'text-amber-400', icon: '⏳' },
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
    <div className={`glass rounded-3xl p-5 relative overflow-hidden border border-white/5 shadow-2xl ${isMini ? 'p-2 opacity-80 hover:opacity-100 transition-all duration-500 scale-95 hover:scale-100' : ''}`}>
      <div className="relative z-10">
        {/* Header */}
        {!isMini && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <Hand className="w-5 h-5 text-accent-primary" />
              </div>
              <span className="font-display font-bold text-white tracking-tight">Camera Feed</span>
            </div>

            <button
              onClick={isActive ? onStop : onStart}
              className={`
                flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest
                transition-all duration-300 shadow-lg active:scale-95
                ${isActive
                  ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/10'
                  : 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 border border-accent-primary/10'}
              `}
            >
              {isActive ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" />
                  Disable
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  Enable Feed
                </>
              )}
            </button>
          </div>
        )}

        {/* Video container */}
        <div className="relative aspect-video bg-dark-950 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`
              w-full h-full object-cover camera-mirror grayscale-[0.2] contrast-[1.1]
              ${!isActive && 'hidden'}
            `}
          />

          {/* Placeholder when inactive */}
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-slate-900/50 backdrop-blur-sm">
              <Camera className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-40">Feed Offline</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-rose-500/5 backdrop-blur-md">
              <div className="text-center p-6 glass rounded-2xl border-rose-500/20 max-w-[240px]">
                <p className="text-rose-400 font-bold text-sm mb-1 uppercase tracking-tight">Access Error</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Permissions required to initialize gesture intelligence.
                </p>
              </div>
            </div>
          )}

          {/* Gesture indicator overlay */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-4 left-4 right-4"
              >
                <div className={`glass rounded-2xl px-4 py-3.5 flex items-center justify-between border-white/10 shadow-3xl ${isMini ? 'px-2 py-1.5' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-slate-900/80 flex items-center justify-center text-2xl shadow-inner ${isMini ? 'w-8 h-8 text-lg' : ''}`}>
                      {info.icon}
                    </div>
                    <div>
                      <p className={`font-black tracking-tight ${info.color} ${isMini ? 'text-[10px]' : 'text-sm'}`}>{info.label.toUpperCase()}</p>
                      {!isMini && (
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                          {gesture.fingerCount > 0 ? `${gesture.fingerCount} Reference Points` : 'Analyzing Scenery'}
                        </p>
                      )}
                    </div>
                  </div>

                  {gesture.confidence > 0 && !isMini && (
                    <div className="text-right">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="18"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            className="text-slate-800"
                          />
                          <motion.circle
                            cx="24"
                            cy="24"
                            r="18"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray="113.1"
                            initial={{ strokeDashoffset: 113.1 }}
                            animate={{ strokeDashoffset: 113.1 - (113.1 * gesture.confidence) }}
                            className="text-accent-primary"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {Math.round(gesture.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gesture guide */}
        {!isMini && (
          <div className="mt-5 grid grid-cols-4 gap-3">
            {[
              { icon: '✊', label: 'Pause', desc: 'Fist' },
              { icon: '☝️', label: 'Pointer', desc: 'Index' },
              { icon: '🖐️', label: 'Motion', desc: 'Open' },
              { icon: '👋', label: 'Swipe', desc: 'Wave' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-900/40 rounded-2xl p-3 text-center border border-white/5 hover:bg-slate-800/60 transition-all duration-300 group"
              >
                <div className="text-xl mb-1.5 group-hover:scale-125 transition-transform duration-300">{item.icon}</div>
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">{item.label}</p>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
