import html2canvas from 'html2canvas';

console.log('Glass PDF content script loaded');

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'capturePageForPdf') {
    html2canvas(document.body, {
      useCORS: true, // Important for capturing images from other origins
      scale: 2, // Increase scale for better quality
    }).then(canvas => {
      const imageData = canvas.toDataURL('image/png');
      sendResponse({ success: true, imageData });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'togglePageBreakPreview') {
    togglePageBreakPreview();
    sendResponse({ success: true });
  } else if (request.action === 'toggleElementExclusion') {
    toggleElementExclusion();
    sendResponse({ success: true });
  }
});

let isExclusionModeActive = false;
let excludedElements: HTMLElement[] = [];

const toggleElementExclusion = () => {
  isExclusionModeActive = !isExclusionModeActive;
  if (isExclusionModeActive) {
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick);
    console.log('Element exclusion mode activated.');
  } else {
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('click', handleClick);
    console.log('Element exclusion mode deactivated.');
  }
};

const handleMouseOver = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target && target !== document.body && !excludedElements.includes(target)) {
    target.style.outline = '2px solid red';
  }
};

const handleMouseOut = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target && target !== document.body && !excludedElements.includes(target)) {
    target.style.outline = '';
  }
};

const handleClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target && target !== document.body) {
    event.preventDefault();
    event.stopPropagation();
    if (excludedElements.includes(target)) {
      // If already excluded, unhide it
      target.style.display = '';
      target.style.outline = '';
      excludedElements = excludedElements.filter(el => el !== target);
    } else {
      // Exclude it
      target.style.display = 'none';
      target.style.outline = '';
      excludedElements.push(target);
    }
  }
};

const togglePageBreakPreview = () => {
  const pageBreakOverlay = document.getElementById('glass-pdf-page-break-overlay');
  if (pageBreakOverlay) {
    pageBreakOverlay.remove();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'glass-pdf-page-break-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = `${document.body.scrollHeight}px`;
  overlay.style.zIndex = '99999';

  const pageHeight = 1123; // A4 height in pixels at 96 DPI
  for (let i = pageHeight; i < document.body.scrollHeight; i += pageHeight) {
    const pageBreak = document.createElement('div');
    pageBreak.className = 'glass-pdf-page-break';
    pageBreak.style.position = 'absolute';
    pageBreak.style.top = `${i}px`;
    pageBreak.style.left = '0';
    pageBreak.style.width = '100%';
    pageBreak.style.height = '2px';
    pageBreak.style.backgroundColor = '#ff0000';
    pageBreak.style.cursor = 'row-resize';
    overlay.appendChild(pageBreak);
  }

  document.body.appendChild(overlay);
};