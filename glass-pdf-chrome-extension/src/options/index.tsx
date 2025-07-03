import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../styles.css';

const Options = () => {
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [quality, setQuality] = useState(2);

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(['pageSize', 'orientation', 'quality'], (items) => {
      if (items.pageSize) setPageSize(items.pageSize);
      if (items.orientation) setOrientation(items.orientation);
      if (items.quality) setQuality(items.quality);
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({
      pageSize,
      orientation,
      quality,
    }, () => {
      console.log('Settings saved');
      // Optionally, provide user feedback
    });
  };

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Glass PDF Options</h1>

      <div className="mb-4">
        <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700">Page Size</label>
        <select
          id="pageSize"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
          <option value="Legal">Legal</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="orientation" className="block text-sm font-medium text-gray-700">Orientation</label>
        <select
          id="orientation"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={orientation}
          onChange={(e) => setOrientation(e.target.value)}
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="quality" className="block text-sm font-medium text-gray-700">Quality (DPI Scale)</label>
        <input
          type="number"
          id="quality"
          className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          min="1"
          max="4"
        />
      </div>

      <button
        onClick={saveSettings}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        Save Settings
      </button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);