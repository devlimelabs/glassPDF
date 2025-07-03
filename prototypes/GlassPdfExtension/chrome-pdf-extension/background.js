// Background Service Worker for Glass PDF Generator
// Handles PDF generation, downloads, and cross-component communication

class PDFGeneratorBackground {
  constructor() {
    this.setupEventListeners();
    this.pageBreaks = new Map();
    this.excludedElements = new Map();
  }

  setupEventListeners() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Glass PDF Generator installed');
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates to reset state
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading') {
        this.resetTabState(tabId);
      }
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'generatePDF':
          await this.generatePDF(message.data, sender.tab, sendResponse);
          break;
        
        case 'setPageBreaks':
          this.setPageBreaks(sender.tab.id, message.data);
          sendResponse({ success: true });
          break;
        
        case 'setExcludedElements':
          this.setExcludedElements(sender.tab.id, message.data);
          sendResponse({ success: true });
          break;
        
        case 'getTabState':
          sendResponse(this.getTabState(sender.tab.id));
          break;
        
        case 'captureVisibleTab':
          await this.captureVisibleTab(sender.tab.id, sendResponse);
          break;
        
        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ error: error.message });
    }
  }

  async generatePDF(options, tab, sendResponse) {
    try {
      // Inject PDF generation script into the active tab
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['utils/pdf-generator.js']
      });

      // Get page content and apply user preferences
      const pageData = await chrome.tabs.sendMessage(tab.id, {
        action: 'prepareForPDF',
        pageBreaks: this.pageBreaks.get(tab.id) || [],
        excludedElements: this.excludedElements.get(tab.id) || []
      });

      // Generate PDF using Chrome's printing API with custom settings
      const pdfData = await chrome.tabs.printToPDF(tab.id, {
        landscape: options.landscape || false,
        displayHeaderFooter: options.displayHeaderFooter || false,
        printBackground: true,
        scale: options.scale || 1,
        paperWidth: options.paperWidth || 8.5,
        paperHeight: options.paperHeight || 11,
        marginTop: options.marginTop || 0.4,
        marginBottom: options.marginBottom || 0.4,
        marginLeft: options.marginLeft || 0.4,
        marginRight: options.marginRight || 0.4,
        headerTemplate: options.headerTemplate || '',
        footerTemplate: options.footerTemplate || '',
        preferCSSPageSize: false
      });

      // Create download
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const filename = options.filename || `${tab.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: options.saveAs || true
      });

      // Open PDF viewer in new tab if requested
      if (options.openInViewer) {
        await this.openPDFViewer(pdfData, filename);
      }

      sendResponse({ 
        success: true, 
        filename: filename,
        size: pdfData.byteLength 
      });

    } catch (error) {
      console.error('PDF generation failed:', error);
      sendResponse({ 
        error: `PDF generation failed: ${error.message}` 
      });
    }
  }

  async captureVisibleTab(tabId, sendResponse) {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: 'png',
        quality: 95
      });
      sendResponse({ success: true, dataUrl });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  }

  async openPDFViewer(pdfData, filename) {
    // Convert PDF data to base64 for viewer
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfData)));
    const viewerUrl = chrome.runtime.getURL('pdf-viewer/viewer.html');
    
    const tab = await chrome.tabs.create({
      url: `${viewerUrl}?pdf=${encodeURIComponent(base64)}&filename=${encodeURIComponent(filename)}`
    });
    
    return tab;
  }

  setPageBreaks(tabId, pageBreaks) {
    this.pageBreaks.set(tabId, pageBreaks);
  }

  setExcludedElements(tabId, excludedElements) {
    this.excludedElements.set(tabId, excludedElements);
  }

  getTabState(tabId) {
    return {
      pageBreaks: this.pageBreaks.get(tabId) || [],
      excludedElements: this.excludedElements.get(tabId) || []
    };
  }

  resetTabState(tabId) {
    this.pageBreaks.delete(tabId);
    this.excludedElements.delete(tabId);
  }
}

// Initialize the background service
const pdfGenerator = new PDFGeneratorBackground();