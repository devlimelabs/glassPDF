// Popup JavaScript for PDF Generator Pro
console.log('PDF Generator Pro: Popup script loaded');

// Global state
let currentTab = null;
let pageInfo = null;
let isGenerating = false;
let settingsExpanded = false;

// DOM elements
const elements = {
  status: null,
  pageTitle: null,
  pageUrl: null,
  pageSize: null,
  pageElements: null,
  generatePdfBtn: null,
  previewBreaksBtn: null,
  elementSelectionBtn: null,
  debugModeBtn: null,
  settingsToggle: null,
  settingsContent: null,
  progressContainer: null,
  progressFill: null,
  progressText: null,
  scaleRange: null,
  scaleValue: null
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup DOM loaded');
  
  // Get DOM elements
  initializeElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load current tab info
  await loadCurrentTab();
  
  // Load saved settings
  await loadSettings();
  
  // Update UI
  updateUI();
  
  console.log('Popup initialized');
});

// Initialize DOM elements
function initializeElements() {
  elements.status = document.getElementById('status');
  elements.pageTitle = document.getElementById('pageTitle');
  elements.pageUrl = document.getElementById('pageUrl');
  elements.pageSize = document.getElementById('pageSize');
  elements.pageElements = document.getElementById('pageElements');
  elements.generatePdfBtn = document.getElementById('generatePdfBtn');
  elements.previewBreaksBtn = document.getElementById('previewBreaksBtn');
  elements.elementSelectionBtn = document.getElementById('elementSelectionBtn');
  elements.debugModeBtn = document.getElementById('debugModeBtn');
  elements.settingsToggle = document.getElementById('settingsToggle');
  elements.settingsContent = document.getElementById('settingsContent');
  elements.progressContainer = document.getElementById('progressContainer');
  elements.progressFill = document.getElementById('progressFill');
  elements.progressText = document.getElementById('progressText');
  elements.scaleRange = document.getElementById('scale');
  elements.scaleValue = document.getElementById('scaleValue');
}

// Set up event listeners
function setupEventListeners() {
  // Main action buttons
  elements.generatePdfBtn.addEventListener('click', handleGeneratePDF);
  elements.previewBreaksBtn.addEventListener('click', handlePreviewBreaks);
  elements.elementSelectionBtn.addEventListener('click', handleElementSelection);
  elements.debugModeBtn.addEventListener('click', handleDebugMode);
  
  // Settings toggle
  elements.settingsToggle.addEventListener('click', toggleSettings);
  
  // Scale range input
  elements.scaleRange.addEventListener('input', updateScaleValue);
  
  // Settings change listeners
  const settingsInputs = document.querySelectorAll('input, select');
  settingsInputs.forEach(input => {
    input.addEventListener('change', saveSettings);
  });
  
  // Footer buttons
  document.getElementById('helpBtn').addEventListener('click', showHelp);
  document.getElementById('settingsBtn').addEventListener('click', showSettings);
  document.getElementById('aboutBtn').addEventListener('click', showAbout);
}

// Load current tab information
async function loadCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    
    if (!tab) {
      updateStatus('error', 'No active tab found');
      return;
    }
    
    // Get page info from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'getPageDimensions'
    });
    
    if (response && response.success) {
      pageInfo = response.data;
      updatePageInfo();
      updateStatus('ready', 'Ready');
    } else {
      // Fallback: get basic tab info
      pageInfo = {
        title: tab.title,
        url: tab.url,
        scrollHeight: 0,
        scrollWidth: 0
      };
      updatePageInfo();
      updateStatus('warning', 'Limited info available');
    }
  } catch (error) {
    console.error('Error loading tab info:', error);
    updateStatus('error', 'Error loading page');
  }
}

// Update page information display
function updatePageInfo() {
  if (!pageInfo || !currentTab) return;
  
  elements.pageTitle.textContent = pageInfo.title || currentTab.title || 'Untitled';
  elements.pageUrl.textContent = formatUrl(pageInfo.url || currentTab.url || '');
  
  if (pageInfo.scrollHeight && pageInfo.scrollWidth) {
    elements.pageSize.textContent = `Size: ${pageInfo.scrollWidth} × ${pageInfo.scrollHeight}px`;
  } else {
    elements.pageSize.textContent = 'Size: Unknown';
  }
  
  // Estimate element count (placeholder)
  elements.pageElements.textContent = 'Elements: Scanning...';
  
  // Try to get actual element count
  if (currentTab) {
    chrome.tabs.sendMessage(currentTab.id, {
      action: 'getElementCount'
    }).then(response => {
      if (response && response.success) {
        elements.pageElements.textContent = `Elements: ${response.data}`;
      } else {
        elements.pageElements.textContent = 'Elements: Unknown';
      }
    }).catch(() => {
      elements.pageElements.textContent = 'Elements: Unknown';
    });
  }
}

// Update status indicator
function updateStatus(type, message) {
  const statusElement = elements.status;
  const indicator = statusElement.querySelector('.status-indicator');
  const text = statusElement.querySelector('span');
  
  // Remove existing classes
  indicator.className = 'status-indicator';
  
  // Add new class
  indicator.classList.add(type);
  text.textContent = message;
}

// Handle PDF generation
async function handleGeneratePDF() {
  if (isGenerating || !currentTab) return;
  
  try {
    isGenerating = true;
    showProgress('Preparing PDF generation...');
    
    // Get current settings
    const settings = getCurrentSettings();
    const renderMethod = document.querySelector('input[name="renderMethod"]:checked').value;
    
    console.log('Generating PDF with settings:', settings, 'Method:', renderMethod);
    
    // Send generation request to background script
    const response = await chrome.runtime.sendMessage({
      action: 'generatePDF',
      data: {
        tabId: currentTab.id,
        settings: settings,
        method: renderMethod
      }
    });
    
    if (response && response.success) {
      showProgress('Opening PDF viewer...');
      
      // Open PDF in viewer
      const viewerResponse = await chrome.runtime.sendMessage({
        action: 'openPDFViewer',
        data: {
          pdfData: response.data.data,
          filename: response.data.filename
        }
      });
      
      if (viewerResponse && viewerResponse.success) {
        hideProgress();
        updateStatus('success', 'PDF generated successfully');
        
        // Close popup after short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        throw new Error('Failed to open PDF viewer');
      }
    } else {
      throw new Error(response?.error || 'PDF generation failed');
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    hideProgress();
    updateStatus('error', 'Generation failed');
    showErrorMessage(error.message);
  } finally {
    isGenerating = false;
  }
}

// Handle page break preview
async function handlePreviewBreaks() {
  if (!currentTab) return;
  
  try {
    const settings = getCurrentSettings();
    
    // Calculate page height based on format and orientation
    const pageHeight = calculatePageHeight(settings.format, settings.orientation);
    
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'showPageBreakPreview',
      data: { pageHeight }
    });
    
    if (response && response.success) {
      updateStatus('info', 'Page break preview active');
      elements.previewBreaksBtn.textContent = 'Hide Preview';
      elements.previewBreaksBtn.classList.add('active');
    } else {
      throw new Error('Failed to show page break preview');
    }
  } catch (error) {
    console.error('Page break preview error:', error);
    updateStatus('error', 'Preview failed');
  }
}

// Handle element selection
async function handleElementSelection() {
  if (!currentTab) return;
  
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'toggleElementSelection'
    });
    
    if (response && response.success) {
      elements.elementSelectionBtn.classList.toggle('active');
      const isActive = elements.elementSelectionBtn.classList.contains('active');
      updateStatus(isActive ? 'info' : 'ready', isActive ? 'Element selection active' : 'Ready');
    } else {
      throw new Error('Failed to toggle element selection');
    }
  } catch (error) {
    console.error('Element selection error:', error);
    updateStatus('error', 'Selection failed');
  }
}

// Handle debug mode
function handleDebugMode() {
  elements.debugModeBtn.classList.toggle('active');
  const isActive = elements.debugModeBtn.classList.contains('active');
  
  if (isActive) {
    updateStatus('info', 'Debug mode active');
    // Add debug functionality here
  } else {
    updateStatus('ready', 'Ready');
  }
}

// Toggle settings panel
function toggleSettings() {
  settingsExpanded = !settingsExpanded;
  
  if (settingsExpanded) {
    elements.settingsContent.style.display = 'block';
    elements.settingsToggle.style.transform = 'rotate(180deg)';
  } else {
    elements.settingsContent.style.display = 'none';
    elements.settingsToggle.style.transform = 'rotate(0deg)';
  }
}

// Update scale value display
function updateScaleValue() {
  const value = elements.scaleRange.value;
  const percentage = Math.round(value * 100);
  elements.scaleValue.textContent = `${percentage}%`;
}

// Get current settings from form
function getCurrentSettings() {
  return {
    format: document.getElementById('pageFormat').value,
    orientation: document.querySelector('input[name="orientation"]:checked').value,
    margins: {
      top: parseFloat(document.getElementById('marginTop').value),
      right: parseFloat(document.getElementById('marginRight').value),
      bottom: parseFloat(document.getElementById('marginBottom').value),
      left: parseFloat(document.getElementById('marginLeft').value)
    },
    scale: parseFloat(document.getElementById('scale').value),
    printBackground: document.getElementById('printBackground').checked,
    displayHeaderFooter: document.getElementById('displayHeaderFooter').checked,
    preferCSSPageSize: document.getElementById('preferCSSPageSize').checked
  };
}

// Save settings to storage
async function saveSettings() {
  try {
    const settings = getCurrentSettings();
    const renderMethod = document.querySelector('input[name="renderMethod"]:checked').value;
    
    await chrome.storage.sync.set({
      pdfSettings: settings,
      renderMethod: renderMethod
    });
    
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['pdfSettings', 'renderMethod']);
    
    if (result.pdfSettings) {
      const settings = result.pdfSettings;
      
      // Apply settings to form
      document.getElementById('pageFormat').value = settings.format || 'A4';
      document.querySelector(`input[name="orientation"][value="${settings.orientation || 'portrait'}"]`).checked = true;
      
      if (settings.margins) {
        document.getElementById('marginTop').value = settings.margins.top || 0.5;
        document.getElementById('marginRight').value = settings.margins.right || 0.5;
        document.getElementById('marginBottom').value = settings.margins.bottom || 0.5;
        document.getElementById('marginLeft').value = settings.margins.left || 0.5;
      }
      
      document.getElementById('scale').value = settings.scale || 1.0;
      document.getElementById('printBackground').checked = settings.printBackground !== false;
      document.getElementById('displayHeaderFooter').checked = settings.displayHeaderFooter || false;
      document.getElementById('preferCSSPageSize').checked = settings.preferCSSPageSize || false;
      
      updateScaleValue();
    }
    
    if (result.renderMethod) {
      document.querySelector(`input[name="renderMethod"][value="${result.renderMethod}"]`).checked = true;
    }
    
    console.log('Settings loaded:', result);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Calculate page height in pixels
function calculatePageHeight(format, orientation) {
  // Page dimensions in pixels at 96 DPI
  const dimensions = {
    'A4': { width: 794, height: 1123 },
    'A3': { width: 1123, height: 1587 },
    'A5': { width: 559, height: 794 },
    'Letter': { width: 816, height: 1056 },
    'Legal': { width: 816, height: 1344 },
    'Tabloid': { width: 1056, height: 1632 }
  };
  
  const dim = dimensions[format] || dimensions['A4'];
  return orientation === 'landscape' ? dim.width : dim.height;
}

// Show progress indicator
function showProgress(message) {
  elements.progressText.textContent = message;
  elements.progressContainer.style.display = 'block';
  elements.generatePdfBtn.disabled = true;
  
  // Animate progress bar
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > 90) progress = 90;
    elements.progressFill.style.width = `${progress}%`;
  }, 200);
  
  // Store interval for cleanup
  elements.progressContainer.dataset.interval = interval;
}

// Hide progress indicator
function hideProgress() {
  elements.progressContainer.style.display = 'none';
  elements.generatePdfBtn.disabled = false;
  elements.progressFill.style.width = '0%';
  
  // Clear interval
  const interval = elements.progressContainer.dataset.interval;
  if (interval) {
    clearInterval(parseInt(interval));
  }
}

// Show error message
function showErrorMessage(message) {
  // Create error toast (simple implementation)
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    background: #ef4444;
    color: white;
    padding: 12px;
    border-radius: 6px;
    z-index: 1000;
    font-size: 14px;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Format URL for display
function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname;
  } catch {
    return url.length > 50 ? url.substring(0, 50) + '...' : url;
  }
}

// Update UI state
function updateUI() {
  // Update button states based on current tab
  const isValidTab = currentTab && !currentTab.url.startsWith('chrome://');
  
  elements.generatePdfBtn.disabled = !isValidTab || isGenerating;
  elements.previewBreaksBtn.disabled = !isValidTab;
  elements.elementSelectionBtn.disabled = !isValidTab;
  
  if (!isValidTab) {
    updateStatus('warning', 'Cannot process this page');
  }
}

// Footer button handlers
function showHelp() {
  chrome.tabs.create({ url: 'https://github.com/your-repo/pdf-generator-pro#help' });
}

function showSettings() {
  chrome.runtime.openOptionsPage();
}

function showAbout() {
  const aboutInfo = `
PDF Generator Pro v1.0.0

A Chrome extension for generating pixel-perfect PDFs from web pages with customizable page breaks and modern interface.

Features:
• Standard and pixel-perfect rendering
• Customizable page formats and margins
• Interactive page break control
• Element selection and debugging
• Modern glassmorphic interface

Created with ❤️ by the PDF Generator Pro team.
  `;
  
  alert(aboutInfo);
}

