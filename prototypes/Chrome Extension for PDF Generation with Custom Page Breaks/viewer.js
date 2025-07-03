// PDF Viewer JavaScript for PDF Generator Pro
console.log('PDF Generator Pro: Viewer script loaded');

// Global state
let pdfData = null;
let pdfFilename = 'document.pdf';
let currentZoom = 1.0;
let pdfBlob = null;
let pdfUrl = null;

// DOM elements
const elements = {
  loadingContainer: null,
  errorContainer: null,
  pdfContainer: null,
  pdfFrame: null,
  filename: null,
  fileSize: null,
  zoomLevel: null,
  currentPage: null,
  totalPages: null,
  generationMethod: null,
  generationTime: null,
  downloadBtn: null,
  contextMenu: null
};

// Initialize viewer
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Viewer DOM loaded');
  
  // Get DOM elements
  initializeElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load PDF data
  await loadPDFData();
  
  console.log('Viewer initialized');
});

// Initialize DOM elements
function initializeElements() {
  elements.loadingContainer = document.getElementById('loadingContainer');
  elements.errorContainer = document.getElementById('errorContainer');
  elements.pdfContainer = document.getElementById('pdfContainer');
  elements.pdfFrame = document.getElementById('pdfFrame');
  elements.filename = document.getElementById('filename');
  elements.fileSize = document.getElementById('fileSize');
  elements.zoomLevel = document.getElementById('zoomLevel');
  elements.currentPage = document.getElementById('currentPage');
  elements.totalPages = document.getElementById('totalPages');
  elements.generationMethod = document.getElementById('generationMethod');
  elements.generationTime = document.getElementById('generationTime');
  elements.downloadBtn = document.getElementById('downloadBtn');
  elements.contextMenu = document.getElementById('contextMenu');
}

// Set up event listeners
function setupEventListeners() {
  // Toolbar buttons
  document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
  document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
  document.getElementById('fitWidthBtn').addEventListener('click', fitWidth);
  document.getElementById('fitPageBtn').addEventListener('click', fitPage);
  elements.downloadBtn.addEventListener('click', downloadPDF);
  
  // Footer buttons
  document.getElementById('newPdfBtn').addEventListener('click', createNewPDF);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('retryBtn').addEventListener('click', retryLoad);
  
  // Context menu
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('click', hideContextMenu);
  
  // Context menu items
  document.getElementById('copyLinkItem').addEventListener('click', copyLink);
  document.getElementById('saveAsItem').addEventListener('click', saveAs);
  document.getElementById('printItem').addEventListener('click', printPDF);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
  
  // Window events
  window.addEventListener('beforeunload', cleanup);
}

// Load PDF data from storage
async function loadPDFData() {
  try {
    showLoading('Loading PDF data...');
    
    // Get tab ID from URL or storage
    const tabId = new URLSearchParams(window.location.search).get('tabId') || 
                  window.location.hash.replace('#', '') ||
                  chrome.tabs.getCurrent?.()?.id;
    
    if (!tabId) {
      throw new Error('No tab ID found');
    }
    
    // Get PDF data from storage
    const result = await chrome.storage.local.get([`pdf_${tabId}`]);
    const pdfInfo = result[`pdf_${tabId}`];
    
    if (!pdfInfo || !pdfInfo.data) {
      throw new Error('PDF data not found');
    }
    
    pdfData = pdfInfo.data;
    pdfFilename = pdfInfo.filename || 'document.pdf';
    
    // Create blob and URL
    const binaryString = atob(pdfData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    pdfBlob = new Blob([bytes], { type: 'application/pdf' });
    pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Update UI
    updateFileInfo();
    
    // Load PDF in iframe
    await loadPDFInFrame();
    
    showPDF();
    
  } catch (error) {
    console.error('Error loading PDF data:', error);
    showError('Failed to load PDF', error.message);
  }
}

// Load PDF in iframe
async function loadPDFInFrame() {
  return new Promise((resolve, reject) => {
    elements.pdfFrame.onload = () => {
      console.log('PDF loaded in iframe');
      resolve();
    };
    
    elements.pdfFrame.onerror = () => {
      reject(new Error('Failed to load PDF in iframe'));
    };
    
    // Set iframe source
    elements.pdfFrame.src = pdfUrl;
    
    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('PDF loading timeout'));
    }, 10000);
  });
}

// Update file information
function updateFileInfo() {
  elements.filename.textContent = pdfFilename;
  
  if (pdfBlob) {
    const sizeKB = Math.round(pdfBlob.size / 1024);
    const sizeMB = (pdfBlob.size / (1024 * 1024)).toFixed(1);
    elements.fileSize.textContent = sizeKB > 1024 ? `Size: ${sizeMB} MB` : `Size: ${sizeKB} KB`;
  }
  
  // Update generation info
  elements.generationMethod.textContent = 'Standard'; // This should come from the actual method used
  elements.generationTime.textContent = 'Generated just now';
}

// Show loading state
function showLoading(message = 'Loading...') {
  elements.loadingContainer.style.display = 'flex';
  elements.errorContainer.style.display = 'none';
  elements.pdfContainer.style.display = 'none';
  
  const loadingText = elements.loadingContainer.querySelector('.loading-text');
  if (loadingText) {
    loadingText.textContent = message;
  }
}

// Show error state
function showError(title, message) {
  elements.loadingContainer.style.display = 'none';
  elements.errorContainer.style.display = 'flex';
  elements.pdfContainer.style.display = 'none';
  
  document.getElementById('errorMessage').textContent = message;
  const errorTitle = elements.errorContainer.querySelector('.error-title');
  if (errorTitle) {
    errorTitle.textContent = title;
  }
}

// Show PDF
function showPDF() {
  elements.loadingContainer.style.display = 'none';
  elements.errorContainer.style.display = 'none';
  elements.pdfContainer.style.display = 'block';
}

// Zoom functions
function zoomIn() {
  currentZoom = Math.min(currentZoom * 1.25, 5.0);
  updateZoom();
}

function zoomOut() {
  currentZoom = Math.max(currentZoom / 1.25, 0.25);
  updateZoom();
}

function fitWidth() {
  // This would require more complex implementation with PDF.js
  currentZoom = 1.0;
  updateZoom();
}

function fitPage() {
  // This would require more complex implementation with PDF.js
  currentZoom = 1.0;
  updateZoom();
}

function updateZoom() {
  const percentage = Math.round(currentZoom * 100);
  elements.zoomLevel.textContent = `${percentage}%`;
  
  // Apply zoom to iframe (limited functionality with basic iframe)
  elements.pdfFrame.style.transform = `scale(${currentZoom})`;
  elements.pdfFrame.style.transformOrigin = 'top left';
  
  // Adjust container size
  const wrapper = elements.pdfFrame.parentElement;
  wrapper.style.width = `${100 * currentZoom}%`;
  wrapper.style.height = `${100 * currentZoom}%`;
}

// Download PDF
function downloadPDF() {
  if (!pdfBlob) {
    console.error('No PDF blob available for download');
    return;
  }
  
  try {
    // Create download link
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfFilename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('PDF download initiated:', pdfFilename);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('Failed to download PDF. Please try again.');
  }
}

// Create new PDF
function createNewPDF() {
  // Go back to the original tab or open extension popup
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
    }
  });
}

// Open settings
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Retry loading
function retryLoad() {
  loadPDFData();
}

// Handle context menu
function handleContextMenu(event) {
  event.preventDefault();
  
  const menu = elements.contextMenu;
  menu.style.display = 'block';
  menu.style.left = event.pageX + 'px';
  menu.style.top = event.pageY + 'px';
  
  // Adjust position if menu goes off screen
  const rect = menu.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  if (rect.right > windowWidth) {
    menu.style.left = (event.pageX - rect.width) + 'px';
  }
  
  if (rect.bottom > windowHeight) {
    menu.style.top = (event.pageY - rect.height) + 'px';
  }
}

// Hide context menu
function hideContextMenu() {
  elements.contextMenu.style.display = 'none';
}

// Copy link
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    console.log('Link copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy link:', err);
  });
  
  hideContextMenu();
}

// Save as
function saveAs() {
  downloadPDF();
  hideContextMenu();
}

// Print PDF
function printPDF() {
  if (elements.pdfFrame.contentWindow) {
    elements.pdfFrame.contentWindow.print();
  } else {
    window.print();
  }
  
  hideContextMenu();
}

// Handle keyboard shortcuts
function handleKeyboard(event) {
  // Prevent default for handled shortcuts
  const handled = true;
  
  switch (event.key) {
    case '+':
    case '=':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        zoomIn();
      }
      break;
      
    case '-':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        zoomOut();
      }
      break;
      
    case '0':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        currentZoom = 1.0;
        updateZoom();
      }
      break;
      
    case 's':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        downloadPDF();
      }
      break;
      
    case 'p':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        printPDF();
      }
      break;
      
    case 'Escape':
      hideContextMenu();
      break;
      
    default:
      // Not handled
      break;
  }
}

// Cleanup function
function cleanup() {
  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
    console.log('PDF URL revoked');
  }
}

// Update page info (placeholder - would need PDF.js for real implementation)
function updatePageInfo() {
  // This is a placeholder - real implementation would require PDF.js
  elements.currentPage.textContent = '1';
  elements.totalPages.textContent = '1';
}

// Error handling for iframe
elements.pdfFrame?.addEventListener('error', (event) => {
  console.error('PDF iframe error:', event);
  showError('PDF Display Error', 'Failed to display PDF in viewer');
});

// Handle iframe load events
elements.pdfFrame?.addEventListener('load', () => {
  console.log('PDF iframe loaded successfully');
  updatePageInfo();
});

