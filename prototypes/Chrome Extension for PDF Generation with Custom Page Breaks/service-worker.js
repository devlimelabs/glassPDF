// Background Service Worker for PDF Generator Pro
console.log('PDF Generator Pro: Service Worker loaded');

// Extension installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
  console.log('PDF Generator Pro installed/updated:', details.reason);
  
  // Set default settings
  chrome.storage.sync.set({
    pdfSettings: {
      format: 'A4',
      orientation: 'portrait',
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5
      },
      scale: 1.0,
      displayHeaderFooter: false,
      printBackground: true,
      preferCSSPageSize: false
    },
    renderMethod: 'printToPDF', // 'printToPDF' or 'screenshot'
    theme: 'light'
  });
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'generate-pdf') {
    generatePDFFromActiveTab();
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Service Worker received message:', request);
  
  switch (request.action) {
    case 'generatePDF':
      handleGeneratePDF(request.data, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'captureScreenshot':
      handleCaptureScreenshot(request.data, sendResponse);
      return true;
      
    case 'getPageInfo':
      handleGetPageInfo(sender.tab.id, sendResponse);
      return true;
      
    case 'openPDFViewer':
      handleOpenPDFViewer(request.data, sendResponse);
      return true;
      
    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
});

// Generate PDF from active tab (keyboard shortcut)
async function generatePDFFromActiveTab() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) {
      console.error('No active tab found');
      return;
    }
    
    const settings = await chrome.storage.sync.get(['pdfSettings', 'renderMethod']);
    await generatePDF(activeTab.id, settings.pdfSettings || {}, settings.renderMethod || 'printToPDF');
  } catch (error) {
    console.error('Error generating PDF from active tab:', error);
  }
}

// Handle PDF generation request
async function handleGeneratePDF(data, sendResponse) {
  try {
    const { tabId, settings, method } = data;
    const result = await generatePDF(tabId, settings, method);
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('Error generating PDF:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Main PDF generation function
async function generatePDF(tabId, settings, method = 'printToPDF') {
  console.log('Generating PDF for tab:', tabId, 'Method:', method);
  
  try {
    if (method === 'printToPDF') {
      return await generatePDFUsingPrintAPI(tabId, settings);
    } else if (method === 'screenshot') {
      return await generatePDFUsingScreenshots(tabId, settings);
    } else {
      throw new Error('Invalid PDF generation method');
    }
  } catch (error) {
    console.error('PDF generation failed:', error);
    // Fallback to screenshot method if printToPDF fails
    if (method === 'printToPDF') {
      console.log('Falling back to screenshot method');
      return await generatePDFUsingScreenshots(tabId, settings);
    }
    throw error;
  }
}

// Generate PDF using Chrome's printToPDF API
async function generatePDFUsingPrintAPI(tabId, settings) {
  console.log('Using printToPDF API');
  
  const printOptions = {
    format: settings.format || 'A4',
    landscape: settings.orientation === 'landscape',
    marginTop: settings.margins?.top || 0.5,
    marginBottom: settings.margins?.bottom || 0.5,
    marginLeft: settings.margins?.left || 0.5,
    marginRight: settings.margins?.right || 0.5,
    scale: settings.scale || 1.0,
    displayHeaderFooter: settings.displayHeaderFooter || false,
    printBackground: settings.printBackground !== false,
    preferCSSPageSize: settings.preferCSSPageSize || false
  };
  
  const pdfData = await chrome.tabs.printToPDF(tabId, printOptions);
  
  // Convert ArrayBuffer to base64
  const base64Data = arrayBufferToBase64(pdfData);
  
  return {
    method: 'printToPDF',
    data: base64Data,
    mimeType: 'application/pdf',
    filename: await generateFilename(tabId)
  };
}

// Generate PDF using screenshots (pixel-perfect method)
async function generatePDFUsingScreenshots(tabId, settings) {
  console.log('Using screenshot method');
  
  // Get page dimensions
  const pageInfo = await getPageDimensions(tabId);
  const screenshots = await captureFullPageScreenshots(tabId, pageInfo);
  
  // Convert screenshots to PDF using jsPDF (will be implemented in pdf-generator.js)
  const pdfData = await convertScreenshotsToPDF(screenshots, settings);
  
  return {
    method: 'screenshot',
    data: pdfData,
    mimeType: 'application/pdf',
    filename: await generateFilename(tabId)
  };
}

// Capture full page screenshots
async function captureFullPageScreenshots(tabId, pageInfo) {
  const screenshots = [];
  const viewportHeight = pageInfo.viewportHeight;
  const totalHeight = pageInfo.scrollHeight;
  const scrollSteps = Math.ceil(totalHeight / viewportHeight);
  
  console.log(`Capturing ${scrollSteps} screenshots for full page`);
  
  // Scroll to top first
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.scrollTo(0, 0)
  });
  
  for (let i = 0; i < scrollSteps; i++) {
    const scrollY = i * viewportHeight;
    
    // Scroll to position
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (y) => window.scrollTo(0, y),
      args: [scrollY]
    });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Capture screenshot
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    screenshots.push({
      data: screenshot,
      scrollY: scrollY,
      index: i
    });
  }
  
  return screenshots;
}

// Get page dimensions
async function getPageDimensions(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio
    })
  });
  
  return results[0].result;
}

// Handle screenshot capture request
async function handleCaptureScreenshot(data, sendResponse) {
  try {
    const { tabId, options } = data;
    const screenshot = await chrome.tabs.captureVisibleTab(null, options || { format: 'png' });
    sendResponse({ success: true, data: screenshot });
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle page info request
async function handleGetPageInfo(tabId, sendResponse) {
  try {
    const pageInfo = await getPageDimensions(tabId);
    const tab = await chrome.tabs.get(tabId);
    
    sendResponse({
      success: true,
      data: {
        ...pageInfo,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      }
    });
  } catch (error) {
    console.error('Error getting page info:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle PDF viewer opening
async function handleOpenPDFViewer(data, sendResponse) {
  try {
    const { pdfData, filename } = data;
    
    // Create a new tab with the PDF viewer
    const viewerUrl = chrome.runtime.getURL('src/viewer/viewer.html');
    const tab = await chrome.tabs.create({ url: viewerUrl });
    
    // Store PDF data for the viewer
    await chrome.storage.local.set({
      [`pdf_${tab.id}`]: {
        data: pdfData,
        filename: filename,
        timestamp: Date.now()
      }
    });
    
    sendResponse({ success: true, tabId: tab.id });
  } catch (error) {
    console.error('Error opening PDF viewer:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Convert screenshots to PDF (placeholder - will use external library)
async function convertScreenshotsToPDF(screenshots, settings) {
  // This will be implemented using jsPDF library in the pdf-generator.js
  // For now, return a placeholder
  console.log('Converting screenshots to PDF:', screenshots.length, 'screenshots');
  return 'base64-pdf-data-placeholder';
}

// Generate filename for PDF
async function generateFilename(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const title = tab.title || 'webpage';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    // Clean filename
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 50);
    return `${cleanTitle}_${timestamp}.pdf`;
  } catch (error) {
    console.error('Error generating filename:', error);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `webpage_${timestamp}.pdf`;
  }
}

// Utility function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Clean up old PDF data from storage
setInterval(async () => {
  try {
    const storage = await chrome.storage.local.get();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const key in storage) {
      if (key.startsWith('pdf_') && storage[key].timestamp < now - oneHour) {
        await chrome.storage.local.remove(key);
        console.log('Cleaned up old PDF data:', key);
      }
    }
  } catch (error) {
    console.error('Error cleaning up storage:', error);
  }
}, 30 * 60 * 1000); // Run every 30 minutes

