# Chrome PDF Extension Architecture

## Overview
A Chrome extension that generates pixel-perfect PDFs from web pages, URLs, or local files with customizable page breaks and a modern glassmorphic interface.

## Core Components

### 1. Manifest (manifest.json)
- Defines extension permissions and structure
- Required permissions: tabs, activeTab, storage, downloads, scripting, printToPDF
- Manifest V3 compliant

### 2. Background Service Worker (src/background/service-worker.js)
- Handles PDF generation requests
- Manages Chrome APIs (tabs.printToPDF, tabs.captureVisibleTab)
- Coordinates between popup and content scripts

### 3. Content Script (src/content/content-script.js)
- Injected into web pages for interaction
- Handles element selection and highlighting
- Provides page break preview functionality
- Captures page dimensions and layout information

### 4. Popup Interface (src/popup/)
- popup.html: Main extension interface
- popup.js: Popup logic and user interactions
- popup.css: Glassmorphic styling

### 5. PDF Viewer (src/viewer/)
- viewer.html: Dedicated tab for PDF preview and download
- viewer.js: PDF display and download functionality
- viewer.css: Viewer styling

## PDF Generation Strategy

### Primary Method: Chrome printToPDF API
- Uses chrome.tabs.printToPDF() for standard PDF generation
- Supports custom page settings and margins
- Fast and efficient for most use cases

### Fallback Method: Screenshot-based Rendering
- Captures full-page screenshots using chrome.tabs.captureVisibleTab()
- Stitches multiple screenshots for long pages
- Converts to PDF using client-side libraries (jsPDF)
- Provides pixel-perfect rendering

### Page Break Control
- Interactive overlay for page break visualization
- Drag-and-drop page break adjustment
- Element-aware break positioning
- Preview mode before final generation

## Key Features

### 1. Pixel-Perfect Rendering
- Screenshot-based approach for exact visual reproduction
- Handles complex layouts, animations, and custom fonts
- Preserves exact colors and positioning

### 2. Interactive Element Selection
- Click-to-select elements for debugging
- Visual highlighting of problematic areas
- Element information display
- Manual adjustment capabilities

### 3. Page Break Management
- Visual page break indicators
- Drag-to-adjust break positions
- Smart break positioning (avoid breaking elements)
- Custom page size support

### 4. Modern UI Design
- Glassmorphic design with blur effects
- Smooth animations and transitions
- Responsive layout for different screen sizes
- Dark/light theme support

## File Structure
```
chrome-pdf-extension/
├── manifest.json
├── src/
│   ├── background/
│   │   └── service-worker.js
│   ├── content/
│   │   ├── content-script.js
│   │   └── overlay.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── viewer/
│       ├── viewer.html
│       ├── viewer.js
│       └── viewer.css
├── assets/
│   └── icons/
├── styles/
│   └── common.css
└── scripts/
    └── pdf-generator.js
```

## Technical Considerations

### Performance
- Lazy loading for large pages
- Progressive screenshot capture
- Memory management for large PDFs
- Background processing

### Compatibility
- Support for various page layouts
- Handle dynamic content and SPAs
- Local file access permissions
- Cross-origin restrictions

### Error Handling
- Graceful fallback between methods
- User feedback for errors
- Retry mechanisms
- Debug information display

