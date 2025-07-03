// PDF Generator Utility for Chrome Extension
// This script handles the conversion of screenshots to PDF using jsPDF

class PDFGenerator {
  constructor() {
    this.jsPDF = null;
    this.loadJsPDF();
  }

  // Load jsPDF library dynamically
  async loadJsPDF() {
    if (typeof window !== 'undefined' && window.jsPDF) {
      this.jsPDF = window.jsPDF;
      return;
    }

    // For extension environment, we'll include jsPDF via CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        this.jsPDF = window.jspdf.jsPDF;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Convert screenshots to PDF
  async convertScreenshotsToPDF(screenshots, settings = {}) {
    await this.loadJsPDF();
    
    if (!this.jsPDF) {
      throw new Error('jsPDF library not loaded');
    }

    const {
      format = 'A4',
      orientation = 'portrait',
      margins = { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      scale = 1.0,
      quality = 0.95
    } = settings;

    // Create new PDF document
    const pdf = new this.jsPDF({
      orientation: orientation === 'landscape' ? 'l' : 'p',
      unit: 'in',
      format: format.toLowerCase()
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate content area (excluding margins)
    const contentWidth = pageWidth - margins.left - margins.right;
    const contentHeight = pageHeight - margins.top - margins.bottom;

    console.log('PDF dimensions:', { pageWidth, pageHeight, contentWidth, contentHeight });

    // Process each screenshot
    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      
      if (i > 0) {
        pdf.addPage();
      }

      try {
        // Add screenshot to PDF
        await this.addImageToPDF(pdf, screenshot.data, {
          x: margins.left,
          y: margins.top,
          width: contentWidth * scale,
          height: contentHeight * scale,
          quality: quality
        });

        console.log(`Added screenshot ${i + 1}/${screenshots.length} to PDF`);
      } catch (error) {
        console.error(`Error adding screenshot ${i + 1}:`, error);
      }
    }

    // Generate PDF as base64
    const pdfBase64 = pdf.output('datauristring');
    return pdfBase64.split(',')[1]; // Remove data:application/pdf;base64, prefix
  }

  // Add image to PDF with proper scaling
  async addImageToPDF(pdf, imageData, options) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate aspect ratio and scaling
          const imgAspectRatio = img.width / img.height;
          const containerAspectRatio = options.width / options.height;
          
          let finalWidth = options.width;
          let finalHeight = options.height;
          let offsetX = options.x;
          let offsetY = options.y;

          // Maintain aspect ratio
          if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container
            finalHeight = finalWidth / imgAspectRatio;
            offsetY = options.y + (options.height - finalHeight) / 2;
          } else {
            // Image is taller than container
            finalWidth = finalHeight * imgAspectRatio;
            offsetX = options.x + (options.width - finalWidth) / 2;
          }

          // Add image to PDF
          pdf.addImage(
            imageData,
            'PNG',
            offsetX,
            offsetY,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageData;
    });
  }

  // Convert single page to PDF
  async convertPageToPDF(pageData, settings = {}) {
    const screenshots = [{ data: pageData, scrollY: 0, index: 0 }];
    return await this.convertScreenshotsToPDF(screenshots, settings);
  }

  // Merge multiple PDFs (if needed)
  async mergePDFs(pdfDataArray) {
    // This would require additional libraries like PDF-lib
    // For now, we'll just return the first PDF
    console.warn('PDF merging not implemented yet');
    return pdfDataArray[0];
  }

  // Get optimal page break positions
  calculatePageBreaks(pageHeight, contentHeight, elementPositions = []) {
    const breaks = [];
    const pageCount = Math.ceil(contentHeight / pageHeight);
    
    for (let i = 1; i < pageCount; i++) {
      let breakPosition = i * pageHeight;
      
      // Try to avoid breaking elements
      const nearbyElements = elementPositions.filter(el => 
        Math.abs(el.top - breakPosition) < 50 || 
        Math.abs(el.bottom - breakPosition) < 50
      );
      
      if (nearbyElements.length > 0) {
        // Find better break position
        const betterPosition = this.findBetterBreakPosition(
          breakPosition, 
          nearbyElements, 
          pageHeight
        );
        breakPosition = betterPosition;
      }
      
      breaks.push({
        page: i,
        position: breakPosition,
        adjusted: breakPosition !== i * pageHeight
      });
    }
    
    return breaks;
  }

  // Find better page break position to avoid splitting elements
  findBetterBreakPosition(originalPosition, elements, pageHeight) {
    const tolerance = pageHeight * 0.1; // 10% of page height
    
    // Sort elements by distance from break position
    elements.sort((a, b) => {
      const distA = Math.min(
        Math.abs(a.top - originalPosition),
        Math.abs(a.bottom - originalPosition)
      );
      const distB = Math.min(
        Math.abs(b.top - originalPosition),
        Math.abs(b.bottom - originalPosition)
      );
      return distA - distB;
    });
    
    const closestElement = elements[0];
    
    // Try to break before or after the element
    const beforeElement = closestElement.top - 10;
    const afterElement = closestElement.bottom + 10;
    
    const beforeDistance = Math.abs(beforeElement - originalPosition);
    const afterDistance = Math.abs(afterElement - originalPosition);
    
    if (beforeDistance <= tolerance) {
      return beforeElement;
    } else if (afterDistance <= tolerance) {
      return afterElement;
    }
    
    // If no good position found, return original
    return originalPosition;
  }

  // Generate filename with timestamp
  generateFilename(title = 'webpage', extension = 'pdf') {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
    
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, '-');
    
    return `${cleanTitle}_${timestamp}.${extension}`;
  }

  // Validate PDF settings
  validateSettings(settings) {
    const validFormats = ['A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid'];
    const validOrientations = ['portrait', 'landscape'];
    
    const validated = {
      format: validFormats.includes(settings.format) ? settings.format : 'A4',
      orientation: validOrientations.includes(settings.orientation) ? settings.orientation : 'portrait',
      margins: {
        top: Math.max(0, Math.min(2, settings.margins?.top || 0.5)),
        right: Math.max(0, Math.min(2, settings.margins?.right || 0.5)),
        bottom: Math.max(0, Math.min(2, settings.margins?.bottom || 0.5)),
        left: Math.max(0, Math.min(2, settings.margins?.left || 0.5))
      },
      scale: Math.max(0.1, Math.min(2, settings.scale || 1.0)),
      quality: Math.max(0.1, Math.min(1, settings.quality || 0.95))
    };
    
    return validated;
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFGenerator;
} else if (typeof window !== 'undefined') {
  window.PDFGenerator = PDFGenerator;
}

// Create global instance
const pdfGenerator = new PDFGenerator();

