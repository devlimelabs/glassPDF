// Enhanced Overlay Functionality for PDF Generator Pro
// This file provides additional overlay features for element selection and page break control

class PDFOverlayManager {
  constructor() {
    this.isActive = false;
    this.selectedElements = [];
    this.pageBreakMarkers = [];
    this.overlayContainer = null;
    this.currentMode = 'none'; // 'selection', 'pageBreaks', 'debug'
    this.settings = {};
    
    this.init();
  }

  init() {
    this.createOverlayContainer();
    this.setupEventListeners();
    console.log('PDF Overlay Manager initialized');
  }

  createOverlayContainer() {
    if (this.overlayContainer) return;
    
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'pdf-generator-overlay-manager';
    this.overlayContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    document.documentElement.appendChild(this.overlayContainer);
  }

  setupEventListeners() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'startElementSelection':
          this.startElementSelection();
          sendResponse({ success: true });
          break;
          
        case 'stopElementSelection':
          this.stopElementSelection();
          sendResponse({ success: true });
          break;
          
        case 'showPageBreakPreview':
          this.showPageBreakPreview(request.data);
          sendResponse({ success: true });
          break;
          
        case 'hidePageBreakPreview':
          this.hidePageBreakPreview();
          sendResponse({ success: true });
          break;
          
        case 'getSelectedElements':
          sendResponse({ success: true, data: this.getSelectedElementsInfo() });
          break;
          
        case 'highlightElement':
          this.highlightElement(request.data.selector);
          sendResponse({ success: true });
          break;
          
        case 'enableDebugMode':
          this.enableDebugMode();
          sendResponse({ success: true });
          break;
          
        case 'disableDebugMode':
          this.disableDebugMode();
          sendResponse({ success: true });
          break;
      }
    });
  }

  // Element Selection Mode
  startElementSelection() {
    if (this.currentMode === 'selection') return;
    
    this.currentMode = 'selection';
    this.isActive = true;
    
    // Add selection styles
    this.addSelectionStyles();
    
    // Make elements selectable
    this.makeElementsSelectable();
    
    // Add event listeners
    document.addEventListener('click', this.handleElementClick.bind(this), true);
    document.addEventListener('mouseover', this.handleElementHover.bind(this), true);
    document.addEventListener('mouseout', this.handleElementHoverOut.bind(this), true);
    
    // Show instructions
    this.showSelectionInstructions();
    
    console.log('Element selection mode started');
  }

  stopElementSelection() {
    if (this.currentMode !== 'selection') return;
    
    this.currentMode = 'none';
    this.isActive = false;
    
    // Remove styles and classes
    this.removeSelectionStyles();
    
    // Remove event listeners
    document.removeEventListener('click', this.handleElementClick.bind(this), true);
    document.removeEventListener('mouseover', this.handleElementHover.bind(this), true);
    document.removeEventListener('mouseout', this.handleElementHoverOut.bind(this), true);
    
    // Clear overlay
    this.clearOverlay();
    
    console.log('Element selection mode stopped');
  }

  addSelectionStyles() {
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
        background-color: rgba(16, 185, 129, 0.15) !important;
      }
      
      .pdf-generator-problematic {
        outline: 2px solid #f59e0b !important;
        outline-offset: 2px !important;
        background-color: rgba(245, 158, 11, 0.1) !important;
      }
    `;
    document.head.appendChild(style);
  }

  removeSelectionStyles() {
    const style = document.getElementById('pdf-generator-selection-styles');
    if (style) style.remove();
    
    // Remove classes from all elements
    const elements = document.querySelectorAll('.pdf-generator-selectable, .pdf-generator-selected, .pdf-generator-problematic');
    elements.forEach(el => {
      el.classList.remove('pdf-generator-selectable', 'pdf-generator-selected', 'pdf-generator-problematic');
    });
  }

  makeElementsSelectable() {
    const elements = document.querySelectorAll('*:not(#pdf-generator-overlay-manager):not(#pdf-generator-overlay-manager *)');
    elements.forEach(el => {
      el.classList.add('pdf-generator-selectable');
    });
  }

  handleElementClick(event) {
    if (!this.isActive || this.currentMode !== 'selection') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    
    // Skip overlay elements
    if (element.closest('#pdf-generator-overlay-manager')) return;
    
    // Toggle selection
    if (element.classList.contains('pdf-generator-selected')) {
      element.classList.remove('pdf-generator-selected');
      this.selectedElements = this.selectedElements.filter(el => el !== element);
    } else {
      element.classList.add('pdf-generator-selected');
      this.selectedElements.push(element);
      
      // Analyze element for potential issues
      this.analyzeElement(element);
    }
    
    this.updateSelectionInfo();
  }

  handleElementHover(event) {
    if (!this.isActive || this.currentMode !== 'selection') return;
    
    const element = event.target;
    if (element.closest('#pdf-generator-overlay-manager')) return;
    
    this.showElementTooltip(element, event);
  }

  handleElementHoverOut(event) {
    if (!this.isActive || this.currentMode !== 'selection') return;
    
    this.hideElementTooltip();
  }

  showElementTooltip(element, event) {
    this.hideElementTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'pdf-generator-tooltip';
    tooltip.id = 'pdf-generator-element-tooltip';
    
    const rect = element.getBoundingClientRect();
    const tagName = element.tagName.toLowerCase();
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const id = element.id ? `#${element.id}` : '';
    
    // Get element info
    const info = this.getElementInfo(element);
    
    tooltip.innerHTML = `
      <div class="tooltip-header">${tagName}${id}${className}</div>
      <div class="tooltip-body">
        <div>Size: ${Math.round(rect.width)}×${Math.round(rect.height)}px</div>
        <div>Position: ${Math.round(rect.left)}, ${Math.round(rect.top)}</div>
        ${info.issues.length > 0 ? `<div class="tooltip-issues">Issues: ${info.issues.join(', ')}</div>` : ''}
      </div>
    `;
    
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      pointer-events: none;
      z-index: 2147483648;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 250px;
    `;
    
    // Position tooltip
    const x = event.pageX + 10;
    const y = event.pageY - 10;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    
    this.overlayContainer.appendChild(tooltip);
  }

  hideElementTooltip() {
    const tooltip = document.getElementById('pdf-generator-element-tooltip');
    if (tooltip) tooltip.remove();
  }

  getElementInfo(element) {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const issues = [];
    
    // Check for potential PDF rendering issues
    if (computedStyle.position === 'fixed') {
      issues.push('Fixed positioning');
    }
    
    if (computedStyle.transform !== 'none') {
      issues.push('CSS transforms');
    }
    
    if (computedStyle.filter !== 'none') {
      issues.push('CSS filters');
    }
    
    if (rect.width > window.innerWidth) {
      issues.push('Overflows viewport');
    }
    
    if (computedStyle.zIndex && parseInt(computedStyle.zIndex) > 1000) {
      issues.push('High z-index');
    }
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      rect: rect,
      computedStyle: computedStyle,
      issues: issues
    };
  }

  analyzeElement(element) {
    const info = this.getElementInfo(element);
    
    if (info.issues.length > 0) {
      element.classList.add('pdf-generator-problematic');
      console.warn('Potentially problematic element for PDF:', element, info.issues);
    }
  }

  showSelectionInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'pdf-generator-selection-instructions';
    instructions.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 20px;
      border-radius: 12px;
      font-size: 14px;
      max-width: 320px;
      z-index: 2147483648;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      pointer-events: auto;
    `;
    
    instructions.innerHTML = `
      <div style="font-weight: 600; font-size: 16px; margin-bottom: 12px; color: #3b82f6;">Element Selection Mode</div>
      <div style="margin-bottom: 8px; line-height: 1.4;">• Click elements to select/deselect</div>
      <div style="margin-bottom: 8px; line-height: 1.4;">• Hover for element information</div>
      <div style="margin-bottom: 8px; line-height: 1.4;">• Yellow outline = potential issues</div>
      <div style="margin-bottom: 12px; line-height: 1.4;">Selected: <span id="selection-count" style="font-weight: bold; color: #10b981;">0</span> elements</div>
      <button id="close-selection" style="
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        width: 100%;
      ">Exit Selection Mode</button>
    `;
    
    this.overlayContainer.appendChild(instructions);
    
    // Add close button listener
    document.getElementById('close-selection').addEventListener('click', () => {
      this.stopElementSelection();
    });
  }

  updateSelectionInfo() {
    const countElement = document.getElementById('selection-count');
    if (countElement) {
      countElement.textContent = this.selectedElements.length;
    }
  }

  getSelectedElementsInfo() {
    return this.selectedElements.map(element => {
      const info = this.getElementInfo(element);
      return {
        tagName: info.tagName,
        id: info.id,
        className: info.className,
        rect: {
          x: info.rect.x,
          y: info.rect.y,
          width: info.rect.width,
          height: info.rect.height
        },
        issues: info.issues,
        selector: this.generateSelector(element)
      };
    });
  }

  generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    // Generate nth-child selector as fallback
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      return `${element.tagName.toLowerCase()}:nth-child(${index})`;
    }
    
    return element.tagName.toLowerCase();
  }

  // Page Break Preview Mode
  showPageBreakPreview(settings) {
    this.currentMode = 'pageBreaks';
    this.settings = settings;
    
    const pageHeight = settings.pageHeight || 1056; // A4 height in pixels
    const documentHeight = document.documentElement.scrollHeight;
    const pageCount = Math.ceil(documentHeight / pageHeight);
    
    console.log('Showing page break preview:', { pageHeight, documentHeight, pageCount });
    
    // Clear existing markers
    this.hidePageBreakPreview();
    
    // Create page break markers
    for (let i = 1; i < pageCount; i++) {
      const breakY = i * pageHeight;
      this.createPageBreakMarker(breakY, i, pageHeight);
    }
    
    // Show page break controls
    this.showPageBreakControls(pageCount, pageHeight);
  }

  createPageBreakMarker(y, pageNumber, pageHeight) {
    const marker = document.createElement('div');
    marker.className = 'pdf-generator-page-break-marker';
    marker.dataset.page = pageNumber;
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
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    `;
    
    // Add drag handle
    const handle = document.createElement('div');
    handle.className = 'page-break-handle';
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
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
    `;
    handle.textContent = pageNumber;
    
    marker.appendChild(handle);
    
    // Add drag functionality
    this.addDragFunctionality(marker, pageHeight);
    
    this.overlayContainer.appendChild(marker);
    this.pageBreakMarkers.push(marker);
  }

  addDragFunctionality(marker, pageHeight) {
    let isDragging = false;
    let startY = 0;
    let originalY = parseInt(marker.style.top);
    
    const handleMouseDown = (e) => {
      isDragging = true;
      startY = e.clientY;
      originalY = parseInt(marker.style.top);
      marker.style.opacity = '0.7';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaY = e.clientY - startY;
      const newY = Math.max(0, originalY + deltaY);
      marker.style.top = newY + 'px';
      
      // Show preview of new position
      this.showBreakPreview(newY);
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        marker.style.opacity = '1';
        
        const newY = parseInt(marker.style.top);
        const pageNumber = parseInt(marker.dataset.page);
        
        console.log(`Page break ${pageNumber} moved to ${newY}px`);
        
        // Notify background script of change
        chrome.runtime.sendMessage({
          action: 'updatePageBreak',
          data: { pageNumber, position: newY }
        });
        
        this.hideBreakPreview();
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
    
    marker.addEventListener('mousedown', handleMouseDown);
  }

  showBreakPreview(y) {
    // Remove existing preview
    this.hideBreakPreview();
    
    const preview = document.createElement('div');
    preview.id = 'page-break-preview';
    preview.style.cssText = `
      position: absolute;
      left: 0;
      top: ${y}px;
      width: 100%;
      height: 1px;
      background: rgba(239, 68, 68, 0.5);
      z-index: 2147483646;
      pointer-events: none;
    `;
    
    this.overlayContainer.appendChild(preview);
  }

  hideBreakPreview() {
    const preview = document.getElementById('page-break-preview');
    if (preview) preview.remove();
  }

  showPageBreakControls(pageCount, pageHeight) {
    const controls = document.createElement('div');
    controls.id = 'pdf-generator-page-break-controls';
    controls.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 20px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 2147483648;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      pointer-events: auto;
      min-width: 280px;
    `;
    
    controls.innerHTML = `
      <div style="font-weight: 600; font-size: 16px; margin-bottom: 12px; color: #f59e0b;">Page Break Preview</div>
      <div style="margin-bottom: 8px; line-height: 1.4; color: #d1d5db;">Pages: ${pageCount}</div>
      <div style="margin-bottom: 8px; line-height: 1.4; color: #d1d5db;">Page height: ${pageHeight}px</div>
      <div style="margin-bottom: 16px; line-height: 1.4; color: #d1d5db;">Drag the red lines to adjust page breaks</div>
      <div style="display: flex; gap: 10px;">
        <button id="hide-page-breaks" style="
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          flex: 1;
        ">Hide Preview</button>
        <button id="apply-page-breaks" style="
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          flex: 1;
        ">Apply Changes</button>
      </div>
    `;
    
    this.overlayContainer.appendChild(controls);
    
    // Add event listeners
    document.getElementById('hide-page-breaks').addEventListener('click', () => {
      this.hidePageBreakPreview();
    });
    
    document.getElementById('apply-page-breaks').addEventListener('click', () => {
      this.applyPageBreaks();
    });
  }

  hidePageBreakPreview() {
    this.currentMode = 'none';
    
    // Remove markers
    this.pageBreakMarkers.forEach(marker => marker.remove());
    this.pageBreakMarkers = [];
    
    // Remove controls
    const controls = document.getElementById('pdf-generator-page-break-controls');
    if (controls) controls.remove();
    
    // Remove preview
    this.hideBreakPreview();
    
    console.log('Page break preview hidden');
  }

  applyPageBreaks() {
    const breaks = this.pageBreakMarkers.map((marker, index) => ({
      page: index + 1,
      position: parseInt(marker.style.top)
    }));
    
    console.log('Applying page breaks:', breaks);
    
    chrome.runtime.sendMessage({
      action: 'applyPageBreaks',
      data: breaks
    });
    
    this.hidePageBreakPreview();
  }

  // Debug Mode
  enableDebugMode() {
    this.currentMode = 'debug';
    
    // Add debug styles to highlight potential issues
    this.addDebugStyles();
    
    // Analyze all elements
    this.analyzeAllElements();
    
    // Show debug panel
    this.showDebugPanel();
    
    console.log('Debug mode enabled');
  }

  disableDebugMode() {
    this.currentMode = 'none';
    
    // Remove debug styles
    this.removeDebugStyles();
    
    // Clear overlay
    this.clearOverlay();
    
    console.log('Debug mode disabled');
  }

  addDebugStyles() {
    const style = document.createElement('style');
    style.id = 'pdf-generator-debug-styles';
    style.textContent = `
      .pdf-debug-fixed { outline: 2px solid #ef4444 !important; }
      .pdf-debug-transform { outline: 2px solid #f59e0b !important; }
      .pdf-debug-overflow { outline: 2px solid #8b5cf6 !important; }
      .pdf-debug-high-z { outline: 2px solid #06b6d4 !important; }
    `;
    document.head.appendChild(style);
  }

  removeDebugStyles() {
    const style = document.getElementById('pdf-generator-debug-styles');
    if (style) style.remove();
    
    // Remove debug classes
    const elements = document.querySelectorAll('[class*="pdf-debug-"]');
    elements.forEach(el => {
      el.className = el.className.replace(/pdf-debug-\w+/g, '').trim();
    });
  }

  analyzeAllElements() {
    const elements = document.querySelectorAll('*:not(#pdf-generator-overlay-manager):not(#pdf-generator-overlay-manager *)');
    const issues = {
      fixed: [],
      transform: [],
      overflow: [],
      highZ: []
    };
    
    elements.forEach(element => {
      const info = this.getElementInfo(element);
      
      if (info.issues.includes('Fixed positioning')) {
        element.classList.add('pdf-debug-fixed');
        issues.fixed.push(element);
      }
      
      if (info.issues.includes('CSS transforms')) {
        element.classList.add('pdf-debug-transform');
        issues.transform.push(element);
      }
      
      if (info.issues.includes('Overflows viewport')) {
        element.classList.add('pdf-debug-overflow');
        issues.overflow.push(element);
      }
      
      if (info.issues.includes('High z-index')) {
        element.classList.add('pdf-debug-high-z');
        issues.highZ.push(element);
      }
    });
    
    this.debugIssues = issues;
    console.log('Debug analysis complete:', issues);
  }

  showDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'pdf-generator-debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 20px;
      border-radius: 12px;
      font-size: 14px;
      max-width: 320px;
      z-index: 2147483648;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      pointer-events: auto;
    `;
    
    const issues = this.debugIssues || { fixed: [], transform: [], overflow: [], highZ: [] };
    
    panel.innerHTML = `
      <div style="font-weight: 600; font-size: 16px; margin-bottom: 12px; color: #8b5cf6;">Debug Mode</div>
      <div style="margin-bottom: 8px;">
        <span style="color: #ef4444;">■</span> Fixed positioning: ${issues.fixed.length}
      </div>
      <div style="margin-bottom: 8px;">
        <span style="color: #f59e0b;">■</span> CSS transforms: ${issues.transform.length}
      </div>
      <div style="margin-bottom: 8px;">
        <span style="color: #8b5cf6;">■</span> Viewport overflow: ${issues.overflow.length}
      </div>
      <div style="margin-bottom: 16px;">
        <span style="color: #06b6d4;">■</span> High z-index: ${issues.highZ.length}
      </div>
      <button id="close-debug" style="
        background: linear-gradient(135deg, #6b7280, #4b5563);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        width: 100%;
      ">Exit Debug Mode</button>
    `;
    
    this.overlayContainer.appendChild(panel);
    
    // Add close button listener
    document.getElementById('close-debug').addEventListener('click', () => {
      this.disableDebugMode();
    });
  }

  // Utility methods
  highlightElement(selector) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight effect
        const originalOutline = element.style.outline;
        const originalOutlineOffset = element.style.outlineOffset;
        
        element.style.outline = '3px solid #f59e0b';
        element.style.outlineOffset = '2px';
        
        setTimeout(() => {
          element.style.outline = originalOutline;
          element.style.outlineOffset = originalOutlineOffset;
        }, 3000);
      }
    } catch (error) {
      console.error('Error highlighting element:', error);
    }
  }

  clearOverlay() {
    if (this.overlayContainer) {
      this.overlayContainer.innerHTML = '';
    }
  }
}

// Initialize overlay manager
const pdfOverlayManager = new PDFOverlayManager();

