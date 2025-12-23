import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function SwipeIndicator({ direction, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ x: direction === 'left' ? 50 : -50 }}
            animate={{ x: 0 }}
            className={`
              flex items-center gap-4 px-8 py-6 rounded-2xl
              bg-gradient-to-r 
              ${direction === 'left' 
                ? 'from-purple-500/30 to-cyan-500/30' 
                : 'from-cyan-500/30 to-purple-500/30'}
              backdrop-blur-xl border border-white/10
            `}
          >
            {direction === 'left' && (
              <ChevronLeft className="w-10 h-10 text-purple-400" />
            )}
            
            <span className="text-3xl font-display font-bold text-white">
              {direction === 'left' ? 'Previous' : 'Next'}
            </span>
            
            {direction === 'right' && (
              <ChevronRight className="w-10 h-10 text-cyan-400" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
