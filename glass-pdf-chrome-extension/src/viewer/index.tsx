import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../styles.css';

const Viewer = () => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['generatedPdfDataUrl'], (result) => {
      if (result.generatedPdfDataUrl) {
        setPdfDataUrl(result.generatedPdfDataUrl);
      }
    });
  }, []);

  const handleDownload = () => {
    if (pdfDataUrl) {
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = 'generated-pdf.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-4 font-sans flex flex-col h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Glass PDF Viewer</h1>

      {pdfDataUrl ? (
        <>
          <div className="flex-grow border border-gray-300 rounded-md overflow-hidden mb-4">
            <iframe src={pdfDataUrl} className="w-full h-full"></iframe>
          </div>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Download PDF
          </button>
        </>
      ) : (
        <p className="text-gray-600">No PDF to display. Generate a PDF first.</p>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Viewer />
  </React.StrictMode>
);