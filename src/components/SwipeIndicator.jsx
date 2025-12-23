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
              flex items-center gap-6 px-10 py-8 rounded-[2.5rem]
              bg-accent-primary/10 border border-accent-primary/20
              backdrop-blur-2xl shadow-3xl shadow-accent-primary/20
            `}
          >
            {direction === 'left' && (
              <ChevronLeft className="w-12 h-12 text-accent-primary animate-pulse" />
            )}

            <span className="text-4xl font-display font-black text-white tracking-tight uppercase">
              {direction === 'left' ? 'Previous' : 'Next'}
            </span>

            {direction === 'right' && (
              <ChevronRight className="w-12 h-12 text-accent-primary animate-pulse" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
