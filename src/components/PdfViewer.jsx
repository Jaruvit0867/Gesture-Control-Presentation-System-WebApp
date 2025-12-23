import React, { useCallback } from 'react';
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
}) {
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-white">
              {fileName || 'No file loaded'}
            </h2>
            {totalPages > 0 && (
              <p className="text-sm text-gray-400">
                {totalPages} {totalPages === 1 ? 'page' : 'pages'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-dark-600 hover:bg-dark-500 transition-colors text-gray-400 hover:text-white"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-600 hover:bg-dark-500 transition-colors text-sm font-medium text-white">
              <Upload className="w-4 h-4" />
              Upload PDF
            </div>
          </label>
        </div>
      </div>

      {/* Main viewer area */}
      <div
        className={`flex-1 relative rounded-2xl overflow-hidden gradient-border ${isFullscreen ? 'rounded-none border-none h-full w-full' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 bg-dark-800 p-1">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-800/80 z-10">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-accent-cyan animate-spin mx-auto" />
                <p className="text-gray-400 mt-3">Loading PDF...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <p className="text-red-400 font-medium">⚠️ {error}</p>
              </div>
            </div>
          )}

          {/* Empty state - drop zone */}
          {!pageImage && !isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-dark-700 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-lg font-medium text-white mb-2">
                  Drop your PDF here
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  or click "Upload PDF" to select a file
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
                  <span className="px-2 py-1 bg-dark-700 rounded">Presentations</span>
                  <span className="px-2 py-1 bg-dark-700 rounded">Documents</span>
                  <span className="px-2 py-1 bg-dark-700 rounded">Slides</span>
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
        <div className={`flex items-center justify-center gap-4 mt-4 ${isFullscreen ? 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-dark-800/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl' : ''}`}>
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className={`
              p-3 rounded-xl transition-all duration-200
              ${currentPage <= 1
                ? 'bg-dark-700 text-gray-600 cursor-not-allowed'
                : 'bg-dark-600 text-white hover:bg-dark-500 hover:scale-105'}
            `}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 px-6 py-3 bg-dark-700 rounded-xl">
            <span className="text-accent-cyan font-mono font-bold text-lg">
              {currentPage}
            </span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400 font-mono">
              {totalPages}
            </span>
          </div>

          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className={`
              p-3 rounded-xl transition-all duration-200
              ${currentPage >= totalPages
                ? 'bg-dark-700 text-gray-600 cursor-not-allowed'
                : 'bg-dark-600 text-white hover:bg-dark-500 hover:scale-105'}
            `}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {isFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-3 rounded-xl bg-dark-600 text-white hover:bg-dark-500 transition-all hover:scale-105"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
