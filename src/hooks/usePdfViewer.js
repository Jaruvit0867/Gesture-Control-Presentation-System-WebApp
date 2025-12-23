import { useState, useCallback, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function usePdfViewer() {
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  const renderTaskRef = useRef(null);

  // Render current page
  const renderPage = useCallback(async (pdfDoc, pageNum) => {
    if (!pdfDoc) return;

    try {
      // Cancel previous render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNum);

      // Calculate scale for good quality
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;

      setPageImage(canvas.toDataURL('image/png'));
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    }
  }, []);

  // Load PDF from file
  const loadPdf = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setPdf(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);
      setFileName(file.name);

      await renderPage(pdfDoc, 1);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  }, [renderPage]);

  // Navigate pages
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const goToPage = useCallback((pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  }, [totalPages]);

  // Handle automatic rendering when page or PDF changes
  useEffect(() => {
    if (pdf && currentPage) {
      renderPage(pdf, currentPage);
    }
  }, [pdf, currentPage, renderPage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, []);

  return {
    pdf,
    currentPage,
    totalPages,
    pageImage,
    isLoading,
    error,
    fileName,
    loadPdf,
    nextPage,
    prevPage,
    goToPage,
  };
}
