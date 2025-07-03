// Content Script for PDF Generator Pro
console.log('PDF Generator Pro: Content script loaded');

// Global state
let isOverlayActive = false;
let selectedElements = [];
let pageBreakMarkers = [];
let overlayContainer = null;

// Initialize content script
function initializeContentScript() {
  // Listen for messages from popup and background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    switch (request.action) {
      case 'toggleElementSelection':
        toggleElementSelection();
        sendResponse({ success: true });
        break;
        
      case 'showPageBreakPreview':
        showPageBreakPreview(request.data);
        sendResponse({ success: true });
        break;
        
      case 'hidePageBreakPreview':
        hidePageBreakPreview();
        sendResponse({ success: true });
        break;
        
      case 'getSelectedElements':
        sendResponse({ success: true, data: selectedElements });
        break;
        
      case 'highlightElement':
        highlightElement(request.data);
        sendResponse({ success: true });
        break;
        
      case 'getPageDimensions':
        const dimensions = getPageDimensions();
        sendResponse({ success: true, data: dimensions });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open
  });
  
  // Create overlay container
  createOverlayContainer();
  
  console.log('PDF Generator Pro: Content script initialized');
}

// Create overlay container for UI elements
function createOverlayContainer() {
  if (overlayContainer) return;
  
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'pdf-generator-overlay';
  overlayContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  document.documentElement.appendChild(overlayContainer);
}

// Toggle element selection mode
function toggleElementSelection() {
  isOverlayActive = !isOverlayActive;
  
  if (isOverlayActive) {
    enableElementSelection();
  } else {
    disableElementSelection();
  }
}

// Enable element selection mode
function enableElementSelection() {
  console.log('Enabling element selection mode');
  
  // Add selection styles
  const style = document.createElement('style');
  style.id = 'pdf-generator-selection-styles';
  style.textContent = `
    .pdf-generator-selectable {
      cursor: crosshair !important;
      transition: all 0.2s ease !important;
    }
    
    .pdf-generator-selectable:hover {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
      background-color: rgba(59, 130, 246, 0.1) !important;
    }
    
    .pdf-generator-selected {
      outline: 2px solid #10b981 !important;
      outline-offset: 2px !important;
      background-color: rgba(16, 185, 129, 0.1) !important;
    }
    
    .pdf-generator-overlay-tooltip {
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 2147483648;
      backdrop-filter: blur(10px);
    }
  `;
  document.head.appendChild(style);
  
  // Add selectable class to all elements
  const elements = document.querySelectorAll('*:not(#pdf-generator-overlay):not(#pdf-generator-overlay *)');
  elements.forEach(el => {
    el.classList.add('pdf-generator-selectable');
  });
  
  // Add event listeners
  document.addEventListener('click', handleElementClick, true);
  document.addEventListener('mouseover', handleElementHover, true);
  document.addEventListener('mouseout', handleElementHoverOut, true);
  
  // Show instructions
  showSelectionInstructions();
}

// Disable element selection mode
function disableElementSelection() {
  console.log('Disabling element selection mode');
  
  // Remove styles
  const style = document.getElementById('pdf-generator-selection-styles');
  if (style) style.remove();
  
  // Remove classes
  const elements = document.querySelectorAll('.pdf-generator-selectable, .pdf-generator-selected');
  elements.forEach(el => {
    el.classList.remove('pdf-generator-selectable', 'pdf-generator-selected');
  });
  
  // Remove event listeners
  document.removeEventListener('click', handleElementClick, true);
  document.removeEventListener('mouseover', handleElementHover, true);
  document.removeEventListener('mouseout', handleElementHoverOut, true);
  
  // Clear overlay
  if (overlayContainer) {
    overlayContainer.innerHTML = '';
  }
}

// Handle element click
function handleElementClick(event) {
  if (!isOverlayActive) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  
  // Skip overlay elements
  if (element.closest('#pdf-generator-overlay')) return;
  
  // Toggle selection
  if (element.classList.contains('pdf-generator-selected')) {
    element.classList.remove('pdf-generator-selected');
    selectedElements = selectedElements.filter(el => el !== element);
  } else {
    element.classList.add('pdf-generator-selected');
    selectedElements.push(element);
  }
  
  // Update selection info
  updateSelectionInfo();
  
  console.log('Selected elements:', selectedElements.length);
}

// Handle element hover
function handleElementHover(event) {
  if (!isOverlayActive) return;
  
  const element = event.target;
  if (element.closest('#pdf-generator-overlay')) return;
  
  // Show tooltip
  showElementTooltip(element, event);
}

// Handle element hover out
function handleElementHoverOut(event) {
  if (!isOverlayActive) return;
  
  // Hide tooltip
  hideElementTooltip();
}

// Show element tooltip
function showElementTooltip(element, event) {
  hideElementTooltip(); // Remove existing tooltip
  
  const tooltip = document.createElement('div');
  tooltip.className = 'pdf-generator-overlay-tooltip';
  tooltip.id = 'pdf-generator-tooltip';
  
  const tagName = element.tagName.toLowerCase();
  const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
  const id = element.id ? `#${element.id}` : '';
  
  tooltip.textContent = `${tagName}${id}${className}`;
  tooltip.style.left = event.pageX + 10 + 'px';
  tooltip.style.top = event.pageY - 30 + 'px';
  
  overlayContainer.appendChild(tooltip);
}

// Hide element tooltip
function hideElementTooltip() {
  const tooltip = document.getElementById('pdf-generator-tooltip');
  if (tooltip) tooltip.remove();
}

// Show selection instructions
function showSelectionInstructions() {
  const instructions = document.createElement('div');
  instructions.id = 'pdf-generator-instructions';
  instructions.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 16px;
    border-radius: 8px;
    font-size: 14px;
    max-width: 300px;
    z-index: 2147483648;
    backdrop-filter: blur(10px);
    pointer-events: auto;
  `;
  
  instructions.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">Element Selection Mode</div>
    <div style="margin-bottom: 4px;">• Click elements to select/deselect</div>
    <div style="margin-bottom: 4px;">• Selected: <span id="selection-count">0</span> elements</div>
    <button id="close-selection" style="
      background: #ef4444;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 8px;
    ">Exit Selection Mode</button>
  `;
  
  overlayContainer.appendChild(instructions);
  
  // Add close button listener
  document.getElementById('close-selection').addEventListener('click', () => {
    toggleElementSelection();
  });
}

// Update selection info
function updateSelectionInfo() {
  const countElement = document.getElementById('selection-count');
  if (countElement) {
    countElement.textContent = selectedElements.length;
  }
}

// Show page break preview
function showPageBreakPreview(settings) {
  console.log('Showing page break preview');
  
  const pageHeight = settings.pageHeight || 1056; // A4 height in pixels at 96 DPI
  const documentHeight = document.documentElement.scrollHeight;
  const pageCount = Math.ceil(documentHeight / pageHeight);
  
  // Clear existing markers
  hidePageBreakPreview();
  
  // Create page break markers
  for (let i = 1; i < pageCount; i++) {
    const breakY = i * pageHeight;
    createPageBreakMarker(breakY, i);
  }
  
  // Show page break controls
  showPageBreakControls(pageCount);
}

// Create page break marker
function createPageBreakMarker(y, pageNumber) {
  const marker = document.createElement('div');
  marker.className = 'pdf-generator-page-break';
  marker.style.cssText = `
    position: absolute;
    left: 0;
    top: ${y}px;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #ef4444, #f97316);
    z-index: 2147483647;
    pointer-events: auto;
    cursor: ns-resize;
  `;
  
  // Add drag handle
  const handle = document.createElement('div');
  handle.style.cssText = `
    position: absolute;
    right: 20px;
    top: -10px;
    width: 20px;
    height: 20px;
    background: #ef4444;
    border-radius: 50%;
    cursor: ns-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 10px;
    font-weight: bold;
  `;
  handle.textContent = pageNumber;
  
  marker.appendChild(handle);
  
  // Add drag functionality
  let isDragging = false;
  let startY = 0;
  
  marker.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    marker.style.opacity = '0.7';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - startY;
    const newY = Math.max(0, y + deltaY);
    marker.style.top = newY + 'px';
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      marker.style.opacity = '1';
      
      // Update page break position
      const newY = parseInt(marker.style.top);
      updatePageBreakPosition(pageNumber, newY);
    }
  });
  
  overlayContainer.appendChild(marker);
  pageBreakMarkers.push(marker);
}

// Show page break controls
function showPageBreakControls(pageCount) {
  const controls = document.createElement('div');
  controls.id = 'pdf-generator-page-break-controls';
  controls.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 2147483648;
    backdrop-filter: blur(10px);
    pointer-events: auto;
  `;
  
  controls.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">Page Break Preview</div>
    <div style="margin-bottom: 8px;">Pages: ${pageCount}</div>
    <div style="margin-bottom: 8px;">Drag the red lines to adjust page breaks</div>
    <button id="hide-page-breaks" style="
      background: #6b7280;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 8px;
    ">Hide Preview</button>
    <button id="apply-page-breaks" style="
      background: #10b981;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    ">Apply Changes</button>
  `;
  
  overlayContainer.appendChild(controls);
  
  // Add event listeners
  document.getElementById('hide-page-breaks').addEventListener('click', hidePageBreakPreview);
  document.getElementById('apply-page-breaks').addEventListener('click', applyPageBreaks);
}

// Hide page break preview
function hidePageBreakPreview() {
  console.log('Hiding page break preview');
  
  // Remove markers
  pageBreakMarkers.forEach(marker => marker.remove());
  pageBreakMarkers = [];
  
  // Remove controls
  const controls = document.getElementById('pdf-generator-page-break-controls');
  if (controls) controls.remove();
}

// Update page break position
function updatePageBreakPosition(pageNumber, newY) {
  console.log(`Updated page break ${pageNumber} to position ${newY}`);
  // This would communicate back to the popup/background script
  chrome.runtime.sendMessage({
    action: 'updatePageBreak',
    data: { pageNumber, position: newY }
  });
}

// Apply page breaks
function applyPageBreaks() {
  const breaks = pageBreakMarkers.map((marker, index) => ({
    page: index + 1,
    position: parseInt(marker.style.top)
  }));
  
  console.log('Applying page breaks:', breaks);
  
  chrome.runtime.sendMessage({
    action: 'applyPageBreaks',
    data: breaks
  });
  
  hidePageBreakPreview();
}

// Highlight specific element
function highlightElement(selector) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.outline = '3px solid #f59e0b';
      element.style.outlineOffset = '2px';
      
      setTimeout(() => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      }, 3000);
    }
  } catch (error) {
    console.error('Error highlighting element:', error);
  }
}

// Get page dimensions
function getPageDimensions() {
  return {
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio || 1,
    title: document.title,
    url: window.location.href
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}

