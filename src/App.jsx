import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { PdfViewer } from './components/PdfViewer';
import { GestureCamera } from './components/GestureCamera';
import { SwipeIndicator } from './components/SwipeIndicator';
import { useGesture } from './hooks/useGesture';
import { usePdfViewer } from './hooks/usePdfViewer';

function App() {
  const [swipeIndicator, setSwipeIndicator] = useState({ visible: false, direction: null });
  const [slideDirection, setSlideDirection] = useState('next');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerContainerRef = useRef(null);

  const {
    pageImage,
    currentPage,
    totalPages,
    isLoading: pdfLoading,
    error: pdfError,
    fileName,
    loadPdf,
    nextPage,
    prevPage,
  } = usePdfViewer();

  // Handle swipe callbacks
  const handleSwipeLeft = useCallback(() => {
    console.log('Swipe Action: Previous');
    setSlideDirection('prev');
    prevPage();
    setSwipeIndicator({ visible: true, direction: 'left' });
    setTimeout(() => setSwipeIndicator({ visible: false, direction: null }), 800);
  }, [prevPage]);

  const handleSwipeRight = useCallback(() => {
    console.log('Swipe Action: Next');
    setSlideDirection('next');
    nextPage();
    setSwipeIndicator({ visible: true, direction: 'right' });
    setTimeout(() => setSwipeIndicator({ visible: false, direction: null }), 800);
  }, [nextPage]);

  const handlePause = useCallback(() => {
    // Could add pause functionality here
  }, []);

  const {
    videoRef,
    isActive: cameraActive,
    gesture,
    error: cameraError,
    start: startCamera,
    stop: stopCamera,
  } = useGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onPause: handlePause,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        console.log('Key Pressed: ArrowLeft');
        setSlideDirection('prev');
        prevPage();
      } else if (e.key === 'ArrowRight') {
        console.log('Key Pressed: ArrowRight');
        setSlideDirection('next');
        nextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPage, nextPage]);

  const handlePrevPage = useCallback(() => {
    setSlideDirection('prev');
    prevPage();
  }, [prevPage]);

  const handleNextPage = useCallback(() => {
    setSlideDirection('next');
    nextPage();
  }, [nextPage]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!viewerContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (viewerContainerRef.current.requestFullscreen) {
          await viewerContainerRef.current.requestFullscreen();
        } else if (viewerContainerRef.current.webkitRequestFullscreen) {
          await viewerContainerRef.current.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error(`Error attempting to toggle fullscreen: ${err.message}`);
    }
  }, []);

  // Listen for native escape/close fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 relative noise">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-pink/5 rounded-full blur-3xl" />
      </div>

      <Header />

      {/* Main content */}
      <main className="relative z-10 px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero text */}
          {!isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Present with <span className="gradient-text">Gestures</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Upload your PDF and control your presentation using hand gestures.
                No more clicking – just natural hand movements.
              </p>
            </motion.div>
          )}

          {/* Main layout container that goes fullscreen */}
          <motion.div
            ref={viewerContainerRef}
            className={`
              grid gap-6 transition-all duration-500
              ${isFullscreen
                ? 'fixed inset-0 z-50 bg-dark-900 grid-cols-1 p-0 m-0'
                : 'grid-cols-1 lg:grid-cols-3'}
            `}
          >
            {/* PDF Viewer - Primary Area */}
            <div className={`
              transition-all duration-500
              ${isFullscreen
                ? 'col-span-1 h-screen w-screen'
                : 'lg:col-span-2 glass rounded-2xl p-6 h-[600px]'}
            `}>
              <PdfViewer
                pageImage={pageImage}
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={pdfLoading}
                error={pdfError}
                fileName={fileName}
                onFileSelect={loadPdf}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                slideDirection={slideDirection}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
              />
            </div>

            {/* Gesture Camera - Sidebar or Mini-PIP */}
            <div className={`
              transition-all duration-500
              ${isFullscreen
                ? 'fixed bottom-4 right-4 w-64 z-[70]'
                : 'lg:col-span-1'}
            `}>
              <GestureCamera
                videoRef={videoRef}
                isActive={cameraActive}
                gesture={gesture}
                error={cameraError}
                onStart={startCamera}
                onStop={stopCamera}
                isMini={isFullscreen}
              />

              {/* Tips only in non-fullscreen */}
              {!isFullscreen && (
                <div className="mt-4 glass rounded-xl p-4">
                  <h3 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
                    <span>💡</span> Quick Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-cyan">→</span>
                      Use arrow keys for manual navigation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-cyan">→</span>
                      Keep your hand within the camera frame
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-cyan">→</span>
                      Make a fist to pause gesture detection
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          {/* How it works section */}
          {!isFullscreen && (
            <motion.section
              id="how-it-works"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16"
            >
              <h3 className="font-display text-2xl font-bold text-white text-center mb-8">
                How It Works
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: '01',
                    title: 'Upload PDF',
                    desc: 'Drag and drop or click to upload your presentation PDF',
                    icon: '📄',
                  },
                  {
                    step: '02',
                    title: 'Start Camera',
                    desc: 'Enable your webcam for hand gesture detection',
                    icon: '📷',
                  },
                  {
                    step: '03',
                    title: 'Present!',
                    desc: 'Swipe left/right with open hand to navigate slides',
                    icon: '✨',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                    className="glass rounded-xl p-6 relative group hover:scale-105 transition-transform duration-300"
                  >
                    <span className="absolute top-4 right-4 font-mono text-4xl font-bold text-dark-600 group-hover:text-dark-500 transition-colors">
                      {item.step}
                    </span>
                    <span className="text-4xl mb-4 block">{item.icon}</span>
                    <h4 className="font-display font-semibold text-white text-lg mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      {/* Swipe indicator overlay */}
      <SwipeIndicator
        direction={swipeIndicator.direction}
        isVisible={swipeIndicator.visible}
      />

      {/* Footer */}
      {!isFullscreen && (
        <footer className="relative z-10 py-8 text-center text-gray-500 text-sm">
          <p>Built with React, MediaPipe & PDF.js</p>
          <p className="mt-1">
            Free to use • No data collected • Runs entirely in your browser
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;
