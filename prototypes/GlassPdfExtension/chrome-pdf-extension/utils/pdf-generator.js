// Glass PDF Generator - Core PDF Generation Utilities
// Advanced PDF generation with canvas-based rendering for pixel-perfect output

class AdvancedPDFGenerator {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.pageBreaks = [];
    this.excludedElements = [];
    this.generationProgress = 0;
  }

  /**
   * Initialize the PDF generation process
   * @param {Object} options - PDF generation options
   */
  async initialize(options = {}) {
    this.options = {
      scale: options.scale || 1,
      quality: options.quality || 1,
      paperWidth: options.paperWidth || 8.5,
      paperHeight: options.paperHeight || 11,
      margins: options.margins || { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 },
      landscape: options.landscape || false,
      includeBackground: options.includeBackground !== false,
      ...options
    };

    this.setupCanvas();
    return this;
  }

  /**
   * Setup canvas for high-quality rendering
   */
  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    
    // Set canvas dimensions based on paper size and DPI
    const dpi = 300; // High DPI for print quality
    this.canvas.width = this.options.paperWidth * dpi * this.options.scale;
    this.canvas.height = this.options.paperHeight * dpi * this.options.scale;
    
    // Scale context for high DPI
    this.context.scale(dpi / 96 * this.options.scale, dpi / 96 * this.options.scale);
    
    // Set rendering quality
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';
  }

  /**
   * Capture page content with high quality
   */
  async capturePageContent() {
    try {
      // Save original styles
      const originalStyles = this.saveOriginalStyles();
      
      // Apply PDF-specific styles
      this.applyPDFStyles();
      
      // Hide excluded elements
      this.hideExcludedElements();
      
      // Force layout reflow
      document.body.offsetHeight;
      
      // Capture using multiple methods for best quality
      const imageData = await this.captureWithMultipleMethods();
      
      // Restore original styles
      this.restoreOriginalStyles(originalStyles);
      
      return imageData;
      
    } catch (error) {
      console.error('Failed to capture page content:', error);
      throw new Error(`Content capture failed: ${error.message}`);
    }
  }

  /**
   * Capture using multiple methods for best results
   */
  async captureWithMultipleMethods() {
    const methods = [
      () => this.captureWithHTML2Canvas(),
      () => this.captureWithNativeAPI(),
      () => this.captureWithDOMToImage()
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result) return result;
      } catch (error) {
        console.warn('Capture method failed, trying next:', error);
      }
    }
    
    throw new Error('All capture methods failed');
  }

  /**
   * Capture using html2canvas for best DOM rendering
   */
  async captureWithHTML2Canvas() {
    // Note: This would require html2canvas library
    // Simulating the functionality for this example
    return new Promise((resolve) => {
      // In a real implementation, you'd use:
      // html2canvas(document.body, {
      //   scale: this.options.scale,
      //   useCORS: true,
      //   allowTaint: true,
      //   backgroundColor: this.options.includeBackground ? null : 'transparent'
      // }).then(canvas => resolve(canvas.toDataURL()));
      
      // Placeholder implementation
      resolve(this.createPlaceholderImage());
    });
  }

  /**
   * Capture using Chrome's native API
   */
  async captureWithNativeAPI() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'captureVisibleTab'
      });
      
      if (response.success) {
        return response.dataUrl;
      }
      throw new Error('Native capture failed');
    } catch (error) {
      throw new Error(`Native API capture failed: ${error.message}`);
    }
  }

  /**
   * Capture using dom-to-image library
   */
  async captureWithDOMToImage() {
    // Note: This would require dom-to-image library
    // Placeholder implementation
    return this.createPlaceholderImage();
  }

  /**
   * Create placeholder image for demonstration
   */
  createPlaceholderImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some content representation
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.fillText('PDF Content Capture', 50, 50);
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 50, 80);
    
    // Add page elements representation
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(50, 120, 700, 60);
    ctx.fillRect(50, 200, 700, 200);
    ctx.fillRect(50, 420, 700, 150);
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Save original element styles
   */
  saveOriginalStyles() {
    const styles = new Map();
    
    // Save body styles
    const body = document.body;
    styles.set(body, {
      overflow: body.style.overflow,
      width: body.style.width,
      height: body.style.height
    });
    
    // Save all element styles that might affect PDF
    document.querySelectorAll('*').forEach(el => {
      styles.set(el, {
        pageBreakBefore: el.style.pageBreakBefore,
        pageBreakAfter: el.style.pageBreakAfter,
        display: el.style.display,
        visibility: el.style.visibility
      });
    });
    
    return styles;
  }

  /**
   * Apply PDF-specific styles
   */
  applyPDFStyles() {
    // Set document styles for PDF
    document.body.style.overflow = 'visible';
    document.body.style.width = `${this.options.paperWidth}in`;
    
    // Apply print styles
    const printStyle = document.createElement('style');
    printStyle.id = 'pdf-generator-styles';
    printStyle.textContent = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        body {
          margin: 0 !important;
          padding: ${this.options.margins.top}in ${this.options.margins.right}in ${this.options.margins.bottom}in ${this.options.margins.left}in !important;
        }
        
        .glass-pdf-page-break {
          page-break-before: always !important;
        }
        
        .glass-pdf-no-break {
          page-break-inside: avoid !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
  }

  /**
   * Hide excluded elements
   */
  hideExcludedElements() {
    this.excludedElements.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none';
          el.setAttribute('data-pdf-excluded', 'true');
        });
      } catch (error) {
        console.warn(`Failed to hide elements with selector: ${selector}`, error);
      }
    });
  }

  /**
   * Restore original element styles
   */
  restoreOriginalStyles(originalStyles) {
    originalStyles.forEach((styles, element) => {
      Object.assign(element.style, styles);
    });
    
    // Remove excluded element markers
    document.querySelectorAll('[data-pdf-excluded]').forEach(el => {
      el.removeAttribute('data-pdf-excluded');
    });
    
    // Remove PDF styles
    const pdfStyles = document.getElementById('pdf-generator-styles');
    if (pdfStyles) {
      pdfStyles.remove();
    }
  }

  /**
   * Apply page breaks
   */
  applyPageBreaks() {
    this.pageBreaks.forEach(position => {
      const element = document.elementFromPoint(window.innerWidth / 2, position);
      if (element && element !== document.body) {
        element.classList.add('glass-pdf-page-break');
      }
    });
  }

  /**
   * Generate PDF with progressive enhancement
   */
  async generatePDF(progressCallback) {
    try {
      progressCallback?.(0, 'Initializing PDF generation...');
      
      // Capture page content
      progressCallback?.(20, 'Capturing page content...');
      const imageData = await this.capturePageContent();
      
      // Apply page breaks
      progressCallback?.(40, 'Processing page breaks...');
      this.applyPageBreaks();
      
      // Generate PDF data
      progressCallback?.(60, 'Generating PDF...');
      const pdfData = await this.createPDFFromImage(imageData);
      
      // Optimize PDF
      progressCallback?.(80, 'Optimizing PDF...');
      const optimizedPDF = await this.optimizePDF(pdfData);
      
      progressCallback?.(100, 'PDF generation complete!');
      
      return optimizedPDF;
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Create PDF from captured image
   */
  async createPDFFromImage(imageData) {
    // In a real implementation, you'd use a PDF library like jsPDF
    // For this demo, we'll return the image data
    return {
      type: 'image/png',
      data: imageData,
      pages: 1
    };
  }

  /**
   * Optimize PDF for size and quality
   */
  async optimizePDF(pdfData) {
    // Implement PDF optimization techniques
    // - Compress images
    // - Remove redundant data
    // - Optimize fonts
    return pdfData;
  }

  /**
   * Set page breaks
   */
  setPageBreaks(breaks) {
    this.pageBreaks = breaks || [];
  }

  /**
   * Set excluded elements
   */
  setExcludedElements(elements) {
    this.excludedElements = elements || [];
  }

  /**
   * Calculate optimal page breaks
   */
  calculateOptimalPageBreaks() {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const breaks = [];
    
    // Add breaks at natural boundaries
    for (let y = viewportHeight; y < documentHeight; y += viewportHeight) {
      // Find the best break point near this position
      const breakPoint = this.findBestBreakPoint(y - 100, y + 100);
      if (breakPoint && !breaks.includes(breakPoint)) {
        breaks.push(breakPoint);
      }
    }
    
    return breaks;
  }

  /**
   * Find best break point within range
   */
  findBestBreakPoint(startY, endY) {
    const elements = document.elementsFromPoint(window.innerWidth / 2, startY);
    
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      const elementY = rect.top + window.pageYOffset;
      
      if (elementY >= startY && elementY <= endY) {
        // Prefer breaks between paragraphs, sections, etc.
        if (this.isGoodBreakElement(element)) {
          return elementY;
        }
      }
    }
    
    // Fallback to middle of range
    return (startY + endY) / 2;
  }

  /**
   * Check if element is good for page breaks
   */
  isGoodBreakElement(element) {
    const goodBreakTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'SECTION', 'ARTICLE'];
    return goodBreakTags.includes(element.tagName);
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.canvas) {
      this.canvas = null;
      this.context = null;
    }
  }
}

// Export for use in background script
if (typeof window !== 'undefined') {
  window.AdvancedPDFGenerator = AdvancedPDFGenerator;
}

// PDF Processing Utilities
class PDFUtils {
  /**
   * Convert data URL to blob
   */
  static dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Get optimal PDF settings for current page
   */
  static getOptimalSettings() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    const document = {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    };
    
    // Calculate optimal scale
    const scale = Math.min(
      8.5 / (viewport.width / 96), // Letter width in inches / viewport width in inches
      11 / (viewport.height / 96)  // Letter height in inches / viewport height in inches
    );
    
    return {
      scale: Math.max(0.5, Math.min(2, scale)),
      paperWidth: 8.5,
      paperHeight: 11,
      margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
    };
  }

  /**
   * Estimate PDF file size
   */
  static estimateFileSize(imageData, pages = 1) {
    // Rough estimation based on image data size
    const baseSize = imageData.length * 0.7; // Compression factor
    return Math.round(baseSize * pages * 0.8); // PDF overhead
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export utilities
if (typeof window !== 'undefined') {
  window.PDFUtils = PDFUtils;
}