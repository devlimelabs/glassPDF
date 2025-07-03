// Glass PDF Viewer - Advanced PDF Display and Management
class PDFViewer {
  constructor() {
    this.pdfData = null;
    this.filename = '';
    this.currentPage = 1;
    this.totalPages = 1;
    this.zoom = 1;
    this.rotation = 0;
    this.sidebarCollapsed = false;
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.loadPDFFromURL();
    this.updateUI();
  }

  setupEventListeners() {
    // Page navigation
    document.getElementById('prevPage').addEventListener('click', () => this.previousPage());
    document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
    document.getElementById('currentPageInput').addEventListener('change', (e) => this.goToPage(parseInt(e.target.value)));

    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
    document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
    document.getElementById('zoomSelect').addEventListener('change', (e) => this.setZoom(e.target.value));

    // View controls
    document.getElementById('toggleSidebar').addEventListener('click', () => this.toggleSidebar());
    document.getElementById('fullscreen').addEventListener('click', () => this.toggleFullscreen());

    // Action controls
    document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
    document.getElementById('printBtn').addEventListener('click', () => this.printPDF());

    // Tool buttons
    document.getElementById('selectTextTool').addEventListener('click', () => this.activateTextSelection());
    document.getElementById('rotateTool').addEventListener('click', () => this.rotatePDF());

    // Retry button
    document.getElementById('retryBtn').addEventListener('click', () => this.loadPDFFromURL());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Window events
    window.addEventListener('resize', () => this.handleResize());
  }

  loadPDFFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pdfBase64 = urlParams.get('pdf');
      const filename = urlParams.get('filename');

      if (!pdfBase64) {
        this.showError('No PDF data provided');
        return;
      }

      this.filename = filename || 'document.pdf';
      this.pdfData = pdfBase64;
      
      this.displayPDF();
      this.updateFileInfo();
      
    } catch (error) {
      console.error('Failed to load PDF from URL:', error);
      this.showError('Failed to load PDF data');
    }
  }

  displayPDF() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const pdfFrame = document.getElementById('pdfFrame');

    try {
      // Hide error state and show loading
      errorState.style.display = 'none';
      loadingState.style.display = 'flex';
      pdfFrame.style.display = 'none';

      // Create blob URL for PDF
      const binaryString = atob(this.pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Load PDF in iframe
      pdfFrame.src = `${blobUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=${this.zoom * 100}`;
      
      // Wait for iframe to load
      pdfFrame.onload = () => {
        loadingState.style.display = 'none';
        pdfFrame.style.display = 'block';
        this.extractPDFInfo();
        this.generateThumbnails();
        this.showSuccess('PDF loaded successfully');
      };

      pdfFrame.onerror = () => {
        this.showError('Failed to display PDF');
      };

    } catch (error) {
      console.error('PDF display error:', error);
      this.showError(`Failed to display PDF: ${error.message}`);
    }
  }

  extractPDFInfo() {
    // Extract PDF metadata and page count
    // Note: In a real implementation, you'd use PDF.js for detailed extraction
    const fileSize = this.calculateFileSize();
    const createdDate = new Date().toLocaleDateString();
    
    document.getElementById('documentSize').textContent = fileSize;
    document.getElementById('createdDate').textContent = createdDate;
    document.getElementById('pageCount').textContent = this.totalPages;
    
    this.updateStatus('PDF loaded successfully');
  }

  calculateFileSize() {
    if (!this.pdfData) return '0 KB';
    
    const bytes = this.pdfData.length * 0.75; // Approximate size from base64
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateThumbnails() {
    const thumbnailContainer = document.getElementById('pageThumbnails');
    thumbnailContainer.innerHTML = '';

    // Generate thumbnail items (simplified - would use PDF.js in real implementation)
    for (let i = 1; i <= Math.max(1, this.totalPages); i++) {
      const thumbnailItem = document.createElement('div');
      thumbnailItem.className = `thumbnail-item ${i === this.currentPage ? 'active' : ''}`;
      thumbnailItem.innerHTML = `
        <div class="thumbnail-preview">${i}</div>
        <div class="thumbnail-info">
          <div class="thumbnail-title">Page ${i}</div>
        </div>
      `;
      
      thumbnailItem.addEventListener('click', () => this.goToPage(i));
      thumbnailContainer.appendChild(thumbnailItem);
    }
  }

  updateFileInfo() {
    document.getElementById('fileName').textContent = this.filename;
    document.getElementById('fileSize').textContent = this.calculateFileSize();
    document.title = `${this.filename} - Glass PDF Viewer`;
  }

  // Navigation Methods
  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    
    this.currentPage = pageNumber;
    this.updatePageControls();
    this.updateThumbnailSelection();
    
    // Update iframe URL with page number
    const pdfFrame = document.getElementById('pdfFrame');
    if (pdfFrame.src) {
      const url = new URL(pdfFrame.src);
      url.hash = `page=${pageNumber}&zoom=${this.zoom * 100}`;
      pdfFrame.src = url.toString();
    }
    
    this.updateStatus(`Page ${pageNumber} of ${this.totalPages}`);
  }

  updatePageControls() {
    document.getElementById('currentPageInput').value = this.currentPage;
    document.getElementById('totalPages').textContent = this.totalPages;
    
    document.getElementById('prevPage').disabled = this.currentPage <= 1;
    document.getElementById('nextPage').disabled = this.currentPage >= this.totalPages;
  }

  updateThumbnailSelection() {
    document.querySelectorAll('.thumbnail-item').forEach((item, index) => {
      item.classList.toggle('active', index + 1 === this.currentPage);
    });
  }

  // Zoom Methods
  zoomIn() {
    this.setZoom(Math.min(this.zoom * 1.25, 5));
  }

  zoomOut() {
    this.setZoom(Math.max(this.zoom / 1.25, 0.25));
  }

  setZoom(zoomValue) {
    if (typeof zoomValue === 'string') {
      switch (zoomValue) {
        case 'fit-width':
          this.zoom = 'fit-width';
          break;
        case 'fit-page':
          this.zoom = 'fit-page';
          break;
        case 'auto':
          this.zoom = 1;
          break;
        default:
          this.zoom = parseFloat(zoomValue) || 1;
      }
    } else {
      this.zoom = Math.max(0.25, Math.min(5, zoomValue));
    }

    this.updateZoomDisplay();
    this.applyZoom();
  }

  updateZoomDisplay() {
    const zoomSelect = document.getElementById('zoomSelect');
    const zoomIndicator = document.getElementById('zoomIndicator');
    
    if (typeof this.zoom === 'number') {
      zoomSelect.value = this.zoom.toString();
      zoomIndicator.textContent = `${Math.round(this.zoom * 100)}%`;
    } else {
      zoomSelect.value = this.zoom;
      zoomIndicator.textContent = this.zoom.replace('-', ' ');
    }
  }

  applyZoom() {
    const pdfFrame = document.getElementById('pdfFrame');
    if (pdfFrame.src) {
      const url = new URL(pdfFrame.src);
      const zoomParam = typeof this.zoom === 'number' ? this.zoom * 100 : this.zoom;
      url.hash = `page=${this.currentPage}&zoom=${zoomParam}`;
      pdfFrame.src = url.toString();
    }
  }

  // View Controls
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    this.sidebarCollapsed = !this.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    
    // Update button icon or text as needed
    const btn = document.getElementById('toggleSidebar');
    btn.title = this.sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar';
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        this.showError(`Fullscreen failed: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Actions
  downloadPDF() {
    try {
      const binaryString = atob(this.pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = this.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showSuccess('PDF download started');
      
    } catch (error) {
      this.showError(`Download failed: ${error.message}`);
    }
  }

  printPDF() {
    try {
      const pdfFrame = document.getElementById('pdfFrame');
      if (pdfFrame.contentWindow) {
        pdfFrame.contentWindow.print();
      } else {
        window.print();
      }
      this.showSuccess('Print dialog opened');
    } catch (error) {
      this.showError(`Print failed: ${error.message}`);
    }
  }

  // Tools
  activateTextSelection() {
    this.showInfo('Text selection tool activated');
    // In a real implementation, this would enable text selection mode
  }

  rotatePDF() {
    this.rotation = (this.rotation + 90) % 360;
    const pdfFrame = document.getElementById('pdfFrame');
    
    if (pdfFrame.style.transform) {
      pdfFrame.style.transform = `rotate(${this.rotation}deg)`;
    } else {
      pdfFrame.style.transform = `rotate(${this.rotation}deg)`;
    }
    
    this.showInfo(`PDF rotated ${this.rotation}°`);
  }

  // Event Handlers
  handleKeyboard(e) {
    // Prevent default for handled shortcuts
    switch (e.key) {
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        this.previousPage();
        break;
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        this.nextPage();
        break;
      case 'Home':
        e.preventDefault();
        this.goToPage(1);
        break;
      case 'End':
        e.preventDefault();
        this.goToPage(this.totalPages);
        break;
      case '+':
      case '=':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.zoomIn();
        }
        break;
      case '-':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.zoomOut();
        }
        break;
      case '0':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.setZoom(1);
        }
        break;
      case 'F11':
        e.preventDefault();
        this.toggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          e.preventDefault();
          document.exitFullscreen();
        }
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.downloadPDF();
        }
        break;
      case 'p':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.printPDF();
        }
        break;
    }
  }

  handleResize() {
    // Adjust layout for responsive design
    if (window.innerWidth < 768 && !this.sidebarCollapsed) {
      this.toggleSidebar();
    }
  }

  // UI Updates
  updateUI() {
    this.updatePageControls();
    this.updateZoomDisplay();
    this.updateFileInfo();
  }

  updateStatus(message) {
    document.getElementById('statusText').textContent = message;
  }

  // Notifications
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
    
    // Show error state
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('pdfFrame').style.display = 'none';
    document.getElementById('errorState').style.display = 'flex';
    document.getElementById('errorMessage').textContent = message;
    
    this.updateStatus('Error loading PDF');
  }

  showInfo(message) {
    this.showToast(message, 'info');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }
}

// Initialize PDF Viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PDFViewer();
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
  const fullscreenBtn = document.getElementById('fullscreen');
  const isFullscreen = !!document.fullscreenElement;
  fullscreenBtn.title = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
});

// Prevent default drag and drop
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());