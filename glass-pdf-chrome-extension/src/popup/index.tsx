import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../styles.css';
import { FileText, Zap, Settings, Download } from 'lucide-react';
import { Toaster } from '../components/ui/sonner';
import { toast } from '../hooks/use-toast';

const Popup = () => {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
      if (response.success) {
        setBgImage(response.dataUrl);
      } else {
        console.error('Failed to capture tab:', response.error);
        toast({ title: 'Error', description: 'Failed to capture tab.', variant: 'destructive' });
      }
    });
  }, []);

  const generatePdf = () => {
    chrome.runtime.sendMessage({ action: 'generatePdf' }, (response) => {
      if (response.success) {
        console.log('PDF generation started');
        toast({ title: 'Success', description: 'PDF generation started.' });
      } else {
        console.error('PDF generation failed:', response.error);
        toast({ title: 'Error', description: `PDF generation failed: ${response.error}`, variant: 'destructive' });
      }
    });
  };

  const generatePdfWithCanvas = () => {
    chrome.runtime.sendMessage({ action: 'generatePdfWithCanvas' }, (response) => {
      if (response.success) {
        console.log('PDF generation with canvas started', response.dataUrl);
        toast({ title: 'Success', description: 'PDF generation with canvas started.' });
      } else {
        console.error('PDF generation with canvas failed:', response.error);
        toast({ title: 'Error', description: `PDF generation with canvas failed: ${response.error}`, variant: 'destructive' });
      }
    });
  };

  return (
    <div
      className="font-sans relative overflow-hidden w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 backdrop-blur-md bg-black/20"></div>
      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Glass PDF</h1>
        </div>

        <p className="text-purple-100/80 mb-6 text-sm">
          Generate pixel-perfect PDFs from any web page with advanced customization.
        </p>

        <div className="space-y-3">
          <button
            onClick={generatePdf}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 hover:from-blue-700 hover:to-purple-800 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            <Download className="w-5 h-5" />
            <span>Generate PDF (Print API)</span>
          </button>

          <button
            onClick={generatePdfWithCanvas}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-semibold transition-all duration-300 hover:from-green-600 hover:to-teal-700 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            <Zap className="w-5 h-5" />
            <span>Generate PDF (Canvas)</span>
          </button>

          <button
            onClick={() => {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id) {
                  chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePageBreakPreview' });
                }
              });
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold transition-all duration-300 hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75"
          >
            <Settings className="w-5 h-5" />
            <span>Page Breaks</span>
          </button>

          <button
            onClick={() => {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id) {
                  chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleElementExclusion' });
                }
              });
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-semibold transition-all duration-300 hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          >
            <Zap className="w-5 h-5" />
            <span>Exclude Elements</span>
          </button>
        </div>

        <div className="mt-auto pt-4 border-t border-purple-300/20 flex justify-between items-center text-xs text-purple-200/60">
          <div className="flex items-center space-x-1">
            <Settings className="w-4 h-4 text-purple-300" />
            <span>Settings</span>
          </div>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('toaster-root')!).render(
  <React.StrictMode>
    <Toaster />
  </React.StrictMode>
);

export default Popup;