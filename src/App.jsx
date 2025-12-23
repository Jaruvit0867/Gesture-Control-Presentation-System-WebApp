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
    pointer,
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
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="bg-blob animate-blob w-[500px] h-[500px] bg-accent-primary/20 top-[-10%] left-[-10%]" />
        <div className="bg-blob animate-blob w-[400px] h-[400px] bg-accent-secondary/15 bottom-[-5%] right-[-5%]" style={{ animationDelay: '2s' }} />
        <div className="bg-blob animate-blob w-[600px] h-[600px] bg-purple-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '5s' }} />
      </div>

      <Header />

      {/* Main content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero text */}
          {!isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-12 pt-8"
            >
              <h2 className="font-display text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
                Redefine Your <span className="gradient-text">Presentation</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                Control your slides with natural hand gestures.
                Experience a seamless, hands-free presenting experience.
              </p>
            </motion.div>
          )}

          {/* Main layout container that goes fullscreen */}
          <motion.div
            ref={viewerContainerRef}
            className={`
              grid gap-8 transition-all duration-700
              ${isFullscreen
                ? 'fixed inset-0 z-50 bg-dark-950 grid-cols-1 p-0 m-0'
                : 'grid-cols-1 lg:grid-cols-3'}
            `}
          >
            {/* PDF Viewer - Primary Area */}
            <div className={`
              transition-all duration-700 ease-in-out
              ${isFullscreen
                ? 'col-span-1 h-screen w-screen'
                : 'lg:col-span-2 glass rounded-3xl p-8 h-[650px] shadow-2xl'}
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
                pointer={pointer}
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
                <div className="mt-6 glass rounded-2xl p-6 shadow-xl border-white/5">
                  <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-accent-primary">✦</span> Quick Tips
                  </h3>
                  <ul className="space-y-4 text-sm text-slate-400">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                      </div>
                      Use arrow keys for manual navigation
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                      </div>
                      Keep your hand within the camera frame
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                      </div>
                      Make a fist to pause gesture detection
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Swipe indicator overlay - moved inside fullscreen container */}
            <SwipeIndicator
              direction={swipeIndicator.direction}
              isVisible={swipeIndicator.visible}
            />
          </motion.div>

          {/* How it works section */}
          {!isFullscreen && (
            <motion.section
              id="how-it-works"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-24"
            >
              <div className="text-center mb-12">
                <h3 className="font-display text-4xl font-bold text-white mb-4">
                  How it Works
                </h3>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our system uses advanced computer vision to translate your hand movements
                  into presentation controls in real-time.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: '01',
                    title: 'Upload PDF',
                    desc: 'Drag and drop or click to upload your presentation PDF directly.',
                    icon: '📄',
                  },
                  {
                    step: '02',
                    title: 'Start Camera',
                    desc: 'Enable your webcam. All processing happens locally on your device.',
                    icon: '📷',
                  },
                  {
                    step: '03',
                    title: 'Present!',
                    desc: 'Swipe with an open hand to navigate slides naturally.',
                    icon: '✨',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="glass rounded-3xl p-8 relative group card-hover border-white/5"
                  >
                    <span className="absolute top-6 right-8 font-mono text-5xl font-bold text-white/5 group-hover:text-accent-primary/10 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      {item.icon}
                    </div>
                    <h4 className="font-display font-bold text-white text-xl mb-3">
                      {item.title}
                    </h4>
                    <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>



      {/* Footer */}
      {!isFullscreen && (
        <footer className="relative z-10 py-12 text-center text-slate-500 border-t border-white/5 mt-12">
          <p className="font-medium">SmartPresentation</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            <span>Built with React</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>MediaPipe</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>PDF.js</span>
          </div>
          <p className="mt-4 text-xs opacity-60">
            Private • Secure • Browser-based
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;
