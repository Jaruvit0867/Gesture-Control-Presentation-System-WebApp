import React, { useCallback, useRef } from 'react';
import { Upload, ChevronLeft, ChevronRight, FileText, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PdfViewer({
  pageImage,
  currentPage,
  totalPages,
  isLoading,
  error,
  fileName,
  onFileSelect,
  onPrevPage,
  onNextPage,
  slideDirection,
  isFullscreen,
  onToggleFullscreen,
  pointer,
}) {
  const fileInputRef = useRef(null);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with file info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5">
            <FileText className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white tracking-tight">
              {fileName || 'Document Viewer'}
            </h2>
            {totalPages > 0 && (
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {totalPages || 0} {totalPages === 1 ? 'Slide' : 'Slides'} Loaded
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleFullscreen}
            className="p-3 rounded-2xl bg-dark-800 hover:bg-dark-700 transition-all text-slate-400 hover:text-white border border-white/5 shadow-lg group"
            title={isFullscreen ? "Minimize Viewer" : "Expand Viewer"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          </button>
          <label className="cursor-pointer group">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-accent-primary hover:bg-indigo-500 transition-all text-sm font-bold text-white shadow-lg shadow-accent-primary/20 group-hover:scale-[1.02]">
              <Upload className="w-4 h-4" />
              Upload PDF
            </div>
          </label>
        </div>
      </div>

      {/* Main viewer area */}
      <div
        className={`flex-1 relative rounded-[2rem] overflow-hidden bg-dark-950 border border-white/5 shadow-inner ${isFullscreen ? 'rounded-none border-none h-full w-full' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 p-1">
          {/* Visual Pointer Overlay */}
          {pointer?.isActive && (
            <div
              className="absolute w-6 h-6 bg-rose-500/40 border-2 border-rose-500 rounded-full z-50 pointer-events-none transition-all duration-75 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
              style={{
                left: `${pointer.x * 100}%`,
                top: `${pointer.y * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20" />
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-950/90 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-accent-primary/10" />
                  <Loader2 className="absolute inset-0 w-16 h-16 text-accent-primary animate-spin" />
                </div>
                <p className="text-slate-400 font-medium tracking-wide">Syncing Assets...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-950/90 backdrop-blur-sm">
              <div className="text-center p-8 glass rounded-[2rem] border-rose-500/20 max-w-sm">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <p className="text-2xl">⚠️</p>
                </div>
                <p className="text-rose-400 font-bold mb-2">Process Interrupted</p>
                <p className="text-slate-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Empty state - drop zone */}
          {!pageImage && !isLoading && !error && (
            <div
              className="absolute inset-0 flex items-center justify-center group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center p-12 glass rounded-[3rem] border-dashed border-slate-700/50 hover:border-accent-primary/50 transition-all">
                <div className="w-24 h-24 mx-auto mb-6 rounded-[2rem] bg-slate-900 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-accent-primary/5 transition-all duration-500">
                  <Upload className="w-12 h-12 text-slate-600 group-hover:text-accent-primary transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  Import Presentation
                </h3>
                <p className="text-slate-500 text-sm mb-6 max-w-[200px] mx-auto">
                  Drag and drop your PDF slides or click to browse files.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-slate-800" />
                  <span className="w-2 h-2 rounded-full bg-slate-800" />
                  <span className="w-2 h-2 rounded-full bg-slate-800" />
                </div>
              </div>
            </div>
          )}

          {/* PDF Page display */}
          <AnimatePresence mode="wait">
            {pageImage && (
              <motion.div
                key={currentPage}
                initial={{
                  opacity: 0,
                  x: slideDirection === 'next' ? 100 : -100
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: slideDirection === 'next' ? -100 : 100
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }}
                className="absolute inset-0 flex items-center justify-center p-4"
              >
                <img
                  src={pageImage}
                  alt={`Page ${currentPage}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation controls */}
      {totalPages > 0 && (
        <div className={`flex items-center justify-center gap-6 mt-6 ${isFullscreen ? 'fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] glass p-3 rounded-[2rem] border-white/10 shadow-3xl' : ''}`}>
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className={`
              p-4 rounded-2xl transition-all duration-300 border border-white/5
              ${currentPage <= 1
                ? 'bg-slate-900/50 text-slate-700 cursor-not-allowed opacity-50'
                : 'bg-dark-800 text-white hover:bg-slate-700 hover:scale-110 shadow-lg active:scale-95'}
            `}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 px-8 py-3.5 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md">
            <span className="text-accent-primary font-mono font-black text-xl tracking-tighter">
              {String(currentPage).padStart(2, '0')}
            </span>
            <span className="text-slate-700 font-light text-xl">|</span>
            <span className="text-slate-500 font-mono font-medium">
              {String(totalPages).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className={`
              p-4 rounded-2xl transition-all duration-300 border border-white/5
              ${currentPage >= totalPages
                ? 'bg-slate-900/50 text-slate-700 cursor-not-allowed opacity-50'
                : 'bg-dark-800 text-white hover:bg-slate-700 hover:scale-110 shadow-lg active:scale-95'}
            `}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {isFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-4 rounded-2xl bg-slate-100 text-dark-950 hover:bg-white transition-all hover:scale-110 shadow-xl active:scale-95"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
