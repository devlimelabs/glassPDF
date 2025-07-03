// Glass PDF Generator - Popup JavaScript
// Handles user interactions and communication with background script

class PopupController {
  constructor() {
    this.isGenerating = false;
    this.currentTab = null;
    this.settings = {
      pageFormat: 'letter',
      orientation: 'portrait',
      scale: 1,
      margins: { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 },
      printBackground: true,
      openInViewer: false,
      saveAs: true
    };

    this.init();
  }

  async init() {
    await this.getCurrentTab();
    this.setupEventListeners();
    this.loadSettings();
    this.updateStatus();
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      return tab;
    } catch (error) {
      console.error('Failed to get current tab:', error);
      this.showError('Failed to access current tab');
    }
  }

  setupEventListeners() {
    // Primary action buttons
    document.getElementById('generateBtn').addEventListener('click', () => this.generatePDF());
    document.getElementById('advancedBtn').addEventListener('click', () => this.toggleAdvanced());

    // Page management buttons
    document.getElementById('pageBreaksBtn').addEventListener('click', () => this.managePageBreaks());
    document.getElementById('excludeElementsBtn').addEventListener('click', () => this.excludeElements());

    // Help button
    document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());

    // Settings controls
    this.setupSettingsListeners();

    // Handle advanced section toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('#advancedBtn')) return;
      if (!e.target.closest('.advanced-section') && document.getElementById('advancedSection').style.display !== 'none') {
        // Auto-collapse when clicking outside
      }
    });
  }

  setupSettingsListeners() {
    // Page format
    document.getElementById('pageFormat').addEventListener('change', (e) => {
      this.settings.pageFormat = e.target.value;
      this.saveSettings();
    });

    // Orientation
    document.querySelectorAll('input[name="orientation"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.settings.orientation = e.target.value;
        this.saveSettings();
      });
    });

    // Scale slider
    const scaleSlider = document.getElementById('scale');
    const scaleValue = document.getElementById('scaleValue');
    scaleSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.settings.scale = value;
      scaleValue.textContent = `${Math.round(value * 100)}%`;
      this.saveSettings();
    });

    // Margin inputs
    ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(id => {
      document.getElementById(id).addEventListener('change', (e) => {
        const key = id.replace('margin', '').toLowerCase();
        this.settings.margins[key] = parseFloat(e.target.value) || 0.4;
        this.saveSettings();
      });
    });

    // Checkboxes
    ['printBackground', 'openInViewer', 'saveAs'].forEach(id => {
      document.getElementById(id).addEventListener('change', (e) => {
        this.settings[id] = e.target.checked;
        this.saveSettings();
      });
    });
  }

  toggleAdvanced() {
    const section = document.getElementById('advancedSection');
    const btn = document.getElementById('advancedBtn');
    
    if (section.style.display === 'none' || !section.style.display) {
      section.style.display = 'block';
      section.style.animation = 'slideIn 0.3s ease-out forwards';
      btn.textContent = btn.textContent.replace('Advanced', 'Hide Settings');
    } else {
      section.style.display = 'none';
      btn.textContent = btn.textContent.replace('Hide Settings', 'Advanced');
    }
  }

  async generatePDF() {
    if (this.isGenerating) return;

    try {
      this.isGenerating = true;
      this.showProgress(0, 'Preparing PDF generation...');

      // Get page dimensions based on format
      const dimensions = this.getPageDimensions();
      
      // Prepare PDF options
      const pdfOptions = {
        landscape: this.settings.orientation === 'landscape',
        displayHeaderFooter: false,
        printBackground: this.settings.printBackground,
        scale: this.settings.scale,
        paperWidth: dimensions.width,
        paperHeight: dimensions.height,
        marginTop: this.settings.margins.top,
        marginRight: this.settings.margins.right,
        marginBottom: this.settings.margins.bottom,
        marginLeft: this.settings.margins.left,
        openInViewer: this.settings.openInViewer,
        saveAs: this.settings.saveAs,
        filename: this.generateFilename()
      };

      this.showProgress(25, 'Capturing page content...');

      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'generatePDF',
        data: pdfOptions
      });

      if (response.error) {
        throw new Error(response.error);
      }

      this.showProgress(100, 'PDF generated successfully!');
      this.showSuccess(`PDF generated: ${response.filename} (${this.formatFileSize(response.size)})`);

      // Auto-hide progress after success
      setTimeout(() => {
        this.hideProgress();
      }, 2000);

    } catch (error) {
      console.error('PDF generation failed:', error);
      this.showError(`PDF generation failed: ${error.message}`);
      this.hideProgress();
    } finally {
      this.isGenerating = false;
    }
  }

  async managePageBreaks() {
    try {
      // Inject page break management overlay
      await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'showPageBreakOverlay'
      });
      
      // Close popup to show overlay
      window.close();
    } catch (error) {
      this.showError('Failed to activate page break management');
    }
  }

  async excludeElements() {
    try {
      // Inject element exclusion overlay
      await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'showElementExclusionOverlay'
      });
      
      // Close popup to show overlay
      window.close();
    } catch (error) {
      this.showError('Failed to activate element exclusion mode');
    }
  }

  getPageDimensions() {
    const formats = {
      letter: { width: 8.5, height: 11 },
      a4: { width: 8.27, height: 11.7 },
      legal: { width: 8.5, height: 14 },
      a3: { width: 11.7, height: 16.5 },
      custom: { width: 8.5, height: 11 } // Default fallback
    };

    let dimensions = formats[this.settings.pageFormat] || formats.letter;
    
    // Swap dimensions for landscape
    if (this.settings.orientation === 'landscape') {
      dimensions = { 
        width: dimensions.height, 
        height: dimensions.width 
      };
    }

    return dimensions;
  }

  generateFilename() {
    const title = this.currentTab?.title || 'webpage';
    const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    return `${cleanTitle}_${timestamp}.pdf`;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showProgress(percentage, message) {
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const generateBtn = document.getElementById('generateBtn');

    progressSection.style.display = 'block';
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = message;
    generateBtn.classList.add('loading');
    generateBtn.textContent = 'Generating...';
  }

  hideProgress() {
    const progressSection = document.getElementById('progressSection');
    const generateBtn = document.getElementById('generateBtn');

    progressSection.style.display = 'none';
    generateBtn.classList.remove('loading');
    generateBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
      </svg>
      Generate PDF
    `;
  }

  updateStatus() {
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');
    
    if (this.currentTab) {
      const url = new URL(this.currentTab.url);
      statusText.textContent = `Ready - ${url.hostname}`;
      statusDot.style.background = 'var(--glass-success)';
    } else {
      statusText.textContent = 'Not available';
      statusDot.style.background = 'var(--glass-error)';
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '12px',
      zIndex: '10000',
      maxWidth: '300px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: type === 'success' ? 'var(--glass-success)' : 
                 type === 'error' ? 'var(--glass-error)' : 
                 'var(--glass-primary)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  showHelp() {
    const helpContent = `
**Glass PDF Generator Help**

**Quick Start:**
1. Click "Generate PDF" for instant PDF creation
2. Use "Advanced" to customize settings
3. Manage page breaks for better layout
4. Exclude elements you don't want in PDF

**Features:**
- Pixel-perfect PDF generation
- Custom page sizes and margins
- Interactive page break adjustment
- Element exclusion for cleaner PDFs
- Glass-morphic modern interface

**Keyboard Shortcuts:**
- Ctrl+Shift+P: Quick PDF generation
- Escape: Close overlays

**Support:**
Visit our help documentation for detailed guides and troubleshooting.
    `.trim();

    this.showNotification(helpContent, 'info');
  }

  loadSettings() {
    // Load settings from Chrome storage
    chrome.storage.sync.get('pdfSettings', (result) => {
      if (result.pdfSettings) {
        this.settings = { ...this.settings, ...result.pdfSettings };
        this.applySettingsToUI();
      }
    });
  }

  saveSettings() {
    // Save settings to Chrome storage
    chrome.storage.sync.set({ pdfSettings: this.settings });
  }

  applySettingsToUI() {
    // Apply loaded settings to UI elements
    document.getElementById('pageFormat').value = this.settings.pageFormat;
    
    document.querySelector(`input[name="orientation"][value="${this.settings.orientation}"]`).checked = true;
    
    const scaleSlider = document.getElementById('scale');
    scaleSlider.value = this.settings.scale;
    document.getElementById('scaleValue').textContent = `${Math.round(this.settings.scale * 100)}%`;

    document.getElementById('marginTop').value = this.settings.margins.top;
    document.getElementById('marginRight').value = this.settings.margins.right;
    document.getElementById('marginBottom').value = this.settings.margins.bottom;
    document.getElementById('marginLeft').value = this.settings.margins.left;

    document.getElementById('printBackground').checked = this.settings.printBackground;
    document.getElementById('openInViewer').checked = this.settings.openInViewer;
    document.getElementById('saveAs').checked = this.settings.saveAs;
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    document.getElementById('generateBtn').click();
  }
});