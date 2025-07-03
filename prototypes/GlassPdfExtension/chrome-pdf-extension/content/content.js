// Glass PDF Generator - Content Script
// Handles page overlays, element selection, and page break management

class PDFContentController {
  constructor() {
    this.overlayActive = false;
    this.currentMode = null;
    this.pageBreaks = [];
    this.excludedElements = [];
    this.selectedElements = new Set();
    this.overlay = null;
    
    this.init();
  }

  init() {
    this.setupMessageListener();
    this.injectStyles();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'showPageBreakOverlay':
          await this.showPageBreakOverlay();
          sendResponse({ success: true });
          break;
        
        case 'showElementExclusionOverlay':
          await this.showElementExclusionOverlay();
          sendResponse({ success: true });
          break;
        
        case 'prepareForPDF':
          const pageData = await this.prepareForPDF(message.pageBreaks, message.excludedElements);
          sendResponse(pageData);
          break;
        
        case 'hideOverlay':
          this.hideOverlay();
          sendResponse({ success: true });
          break;
        
        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Content script error:', error);
      sendResponse({ error: error.message });
    }
  }

  injectStyles() {
    if (document.getElementById('glass-pdf-styles')) return;

    const style = document.createElement('style');
    style.id = 'glass-pdf-styles';
    style.textContent = `
      .glass-pdf-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 999999;
        pointer-events: all;
      }

      .glass-pdf-toolbar {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 1000000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 280px;
      }

      .glass-pdf-toolbar h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: white;
        text-align: center;
      }

      .glass-pdf-toolbar-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .glass-pdf-btn {
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        flex: 1;
        text-align: center;
      }

      .glass-pdf-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }

      .glass-pdf-btn.primary {
        background: rgba(99, 102, 241, 0.8);
        border-color: rgba(99, 102, 241, 0.6);
      }

      .glass-pdf-btn.danger {
        background: rgba(239, 68, 68, 0.8);
        border-color: rgba(239, 68, 68, 0.6);
      }

      .glass-pdf-instructions {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        line-height: 1.4;
      }

      .glass-pdf-page-break {
        position: absolute;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, 
          rgba(99, 102, 241, 0.8), 
          rgba(168, 85, 247, 0.8));
        cursor: ns-resize;
        z-index: 1000000;
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
      }

      .glass-pdf-page-break::before {
        content: '📄 Page Break - Drag to adjust';
        position: absolute;
        left: 20px;
        top: -25px;
        background: rgba(99, 102, 241, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        backdrop-filter: blur(10px);
      }

      .glass-pdf-highlight {
        outline: 3px solid rgba(239, 68, 68, 0.8) !important;
        outline-offset: 2px;
        background: rgba(239, 68, 68, 0.1) !important;
        cursor: pointer !important;
        position: relative;
      }

      .glass-pdf-excluded {
        outline: 3px solid rgba(239, 68, 68, 0.8) !important;
        outline-offset: 2px;
        background: rgba(239, 68, 68, 0.2) !important;
        opacity: 0.5 !important;
        position: relative;
      }

      .glass-pdf-excluded::after {
        content: '❌ Excluded';
        position: absolute;
        top: -25px;
        left: 0;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        z-index: 1000001;
        backdrop-filter: blur(10px);
      }

      .glass-pdf-selection-info {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 12px 20px;
        color: white;
        font-size: 14px;
        z-index: 1000000;
      }

      .glass-pdf-hover-info {
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000001;
        backdrop-filter: blur(10px);
      }
    `;
    
    document.head.appendChild(style);
  }

  async showPageBreakOverlay() {
    if (this.overlayActive) this.hideOverlay();

    this.currentMode = 'pageBreaks';
    this.overlayActive = true;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'glass-pdf-overlay';
    
    // Create toolbar
    const toolbar = this.createPageBreakToolbar();
    this.overlay.appendChild(toolbar);

    // Add initial page breaks based on viewport height
    this.addInitialPageBreaks();

    // Add event listeners
    this.setupPageBreakEvents();

    document.body.appendChild(this.overlay);
  }

  async showElementExclusionOverlay() {
    if (this.overlayActive) this.hideOverlay();

    this.currentMode = 'elementExclusion';
    this.overlayActive = true;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'glass-pdf-overlay';
    
    // Create toolbar
    const toolbar = this.createElementExclusionToolbar();
    this.overlay.appendChild(toolbar);

    // Setup element selection
    this.setupElementSelection();

    document.body.appendChild(this.overlay);
  }

  createPageBreakToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'glass-pdf-toolbar';
    
    toolbar.innerHTML = `
      <h3>📄 Page Break Management</h3>
      <div class="glass-pdf-instructions">
        Drag the blue lines to adjust page breaks. New breaks will be added automatically based on content height.
      </div>
      <div class="glass-pdf-toolbar-buttons">
        <button class="glass-pdf-btn" onclick="window.pdfContent.addPageBreak()">Add Break</button>
        <button class="glass-pdf-btn" onclick="window.pdfContent.resetPageBreaks()">Reset</button>
        <button class="glass-pdf-btn primary" onclick="window.pdfContent.savePageBreaks()">Save & Close</button>
        <button class="glass-pdf-btn danger" onclick="window.pdfContent.hideOverlay()">Cancel</button>
      </div>
    `;
    
    return toolbar;
  }

  createElementExclusionToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'glass-pdf-toolbar';
    
    toolbar.innerHTML = `
      <h3>❌ Element Exclusion</h3>
      <div class="glass-pdf-instructions">
        Click on elements to exclude them from the PDF. Excluded elements will be hidden during generation.
      </div>
      <div class="glass-pdf-toolbar-buttons">
        <button class="glass-pdf-btn" onclick="window.pdfContent.clearExclusions()">Clear All</button>
        <button class="glass-pdf-btn primary" onclick="window.pdfContent.saveExclusions()">Save & Close</button>
        <button class="glass-pdf-btn danger" onclick="window.pdfContent.hideOverlay()">Cancel</button>
      </div>
    `;
    
    const info = document.createElement('div');
    info.className = 'glass-pdf-selection-info';
    info.textContent = 'Click elements to exclude them from PDF';
    toolbar.appendChild(info);
    
    return toolbar;
  }

  addInitialPageBreaks() {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const numberOfBreaks = Math.floor(documentHeight / viewportHeight);

    for (let i = 1; i <= numberOfBreaks; i++) {
      const position = i * viewportHeight;
      this.addPageBreakAtPosition(position);
    }
  }

  addPageBreakAtPosition(top) {
    const pageBreak = document.createElement('div');
    pageBreak.className = 'glass-pdf-page-break';
    pageBreak.style.top = `${top}px`;
    pageBreak.dataset.position = top;
    
    // Make draggable
    this.makeDraggable(pageBreak);
    
    this.overlay.appendChild(pageBreak);
    this.pageBreaks.push({ element: pageBreak, position: top });
  }

  makeDraggable(element) {
    let isDragging = false;
    let startY = 0;
    let startTop = 0;

    element.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startTop = parseInt(element.style.top);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.preventDefault();
    });

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      const newTop = Math.max(0, startTop + deltaY);
      element.style.top = `${newTop}px`;
      element.dataset.position = newTop;
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }

  setupElementSelection() {
    // Store original styles
    this.originalStyles = new Map();

    // Add hover effects
    document.addEventListener('mouseover', this.handleElementHover);
    document.addEventListener('mouseout', this.handleElementHoverOut);
    document.addEventListener('click', this.handleElementClick);
  }

  handleElementHover = (e) => {
    if (this.currentMode !== 'elementExclusion' || e.target.closest('.glass-pdf-overlay')) return;
    
    e.target.classList.add('glass-pdf-highlight');
    
    // Show element info
    this.showElementInfo(e);
  }

  handleElementHoverOut = (e) => {
    if (this.currentMode !== 'elementExclusion') return;
    
    if (!this.selectedElements.has(e.target)) {
      e.target.classList.remove('glass-pdf-highlight');
    }
    
    this.hideElementInfo();
  }

  handleElementClick = (e) => {
    if (this.currentMode !== 'elementExclusion' || e.target.closest('.glass-pdf-overlay')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    this.toggleElementExclusion(e.target);
  }

  toggleElementExclusion(element) {
    if (this.selectedElements.has(element)) {
      // Remove exclusion
      this.selectedElements.delete(element);
      element.classList.remove('glass-pdf-excluded');
      element.classList.add('glass-pdf-highlight');
    } else {
      // Add exclusion
      this.selectedElements.add(element);
      element.classList.remove('glass-pdf-highlight');
      element.classList.add('glass-pdf-excluded');
    }
    
    this.updateSelectionInfo();
  }

  showElementInfo(e) {
    const info = document.createElement('div');
    info.className = 'glass-pdf-hover-info';
    info.textContent = `${e.target.tagName.toLowerCase()}${e.target.className ? '.' + e.target.className.split(' ')[0] : ''}`;
    info.style.left = `${e.clientX + 10}px`;
    info.style.top = `${e.clientY - 30}px`;
    
    document.body.appendChild(info);
    this.hoverInfo = info;
  }

  hideElementInfo() {
    if (this.hoverInfo) {
      this.hoverInfo.remove();
      this.hoverInfo = null;
    }
  }

  updateSelectionInfo() {
    const info = document.querySelector('.glass-pdf-selection-info');
    if (info) {
      info.textContent = `${this.selectedElements.size} elements selected for exclusion`;
    }
  }

  setupPageBreakEvents() {
    // ESC key to close
    document.addEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = (e) => {
    if (e.key === 'Escape') {
      this.hideOverlay();
    }
  }

  addPageBreak() {
    const scrollTop = window.pageYOffset + window.innerHeight / 2;
    this.addPageBreakAtPosition(scrollTop);
  }

  resetPageBreaks() {
    // Remove all page breaks
    this.pageBreaks.forEach(pb => pb.element.remove());
    this.pageBreaks = [];
    
    // Add initial breaks
    this.addInitialPageBreaks();
  }

  clearExclusions() {
    this.selectedElements.forEach(element => {
      element.classList.remove('glass-pdf-excluded', 'glass-pdf-highlight');
    });
    this.selectedElements.clear();
    this.updateSelectionInfo();
  }

  async savePageBreaks() {
    const positions = this.pageBreaks.map(pb => parseInt(pb.element.dataset.position));
    
    await chrome.runtime.sendMessage({
      action: 'setPageBreaks',
      data: positions
    });
    
    this.hideOverlay();
  }

  async saveExclusions() {
    const selectors = Array.from(this.selectedElements).map(element => {
      return this.generateSelector(element);
    });
    
    await chrome.runtime.sendMessage({
      action: 'setExcludedElements',
      data: selectors
    });
    
    this.hideOverlay();
  }

  generateSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const className = element.className.split(' ')[0];
      return `.${className}`;
    }
    return element.tagName.toLowerCase();
  }

  hideOverlay() {
    if (!this.overlayActive) return;

    // Clean up event listeners
    document.removeEventListener('mouseover', this.handleElementHover);
    document.removeEventListener('mouseout', this.handleElementHoverOut);
    document.removeEventListener('click', this.handleElementClick);
    document.removeEventListener('keydown', this.handleKeydown);

    // Remove overlay
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    // Clean up element styles
    this.selectedElements.forEach(element => {
      element.classList.remove('glass-pdf-excluded', 'glass-pdf-highlight');
    });

    // Reset state
    this.overlayActive = false;
    this.currentMode = null;
    this.pageBreaks = [];
    this.selectedElements.clear();

    if (this.hoverInfo) {
      this.hoverInfo.remove();
      this.hoverInfo = null;
    }
  }

  async prepareForPDF(pageBreaks, excludedElements) {
    // Apply exclusions
    excludedElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none';
      });
    });

    // Apply page breaks (CSS page-break-before)
    pageBreaks.forEach(position => {
      const element = document.elementFromPoint(0, position);
      if (element) {
        element.style.pageBreakBefore = 'always';
      }
    });

    return {
      success: true,
      pageBreaks: pageBreaks.length,
      excludedElements: excludedElements.length
    };
  }
}

// Initialize content controller and expose globally for toolbar buttons
window.pdfContent = new PDFContentController();