# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

glassPDF is a Chrome extension that converts web pages to PDF with interactive page break control. It uses a modern glass-morphic UI design and offers two PDF generation approaches: Chrome's native print API (primary) and a canvas-based screenshot stitching fallback.

## Key Development Commands

```bash
# Chrome Extension (main project)
cd glass-pdf-chrome-extension
npm run dev        # Start development server with HMR
npm run build      # Build for production
npm test           # Run tests with Vitest
npm run preview    # Preview production build

# Showcase Website
cd glass-pdf-showcase-website
pnpm dev          # Start development server
pnpm build        # Build for production
```

## Architecture & Code Structure

### Chrome Extension Architecture (Manifest V3)

The extension follows a multi-context architecture:

1. **Background Service Worker** (`src/background/background.ts`):
   - Handles extension lifecycle and message routing
   - Manages tab interactions and PDF generation triggers

2. **Content Scripts** (`src/content/`):
   - `contentScript.ts`: Main content script for interacting with web pages
   - `pageBreakManager.ts`: Manages interactive page break functionality
   - Injected into web pages to enable PDF conversion features

3. **UI Contexts** (React-based):
   - **Popup** (`src/popup/`): Quick access interface for PDF conversion
   - **Options** (`src/options/`): Settings page for user preferences
   - **Viewer** (`src/viewer/`): PDF preview and customization interface

### PDF Generation Approach

The extension uses a dual approach for maximum compatibility:

1. **Primary Method**: Chrome's native print API
   - Leverages browser's built-in PDF generation
   - Better text selection and smaller file sizes

2. **Fallback Method**: Canvas-based screenshot stitching
   - Uses html2canvas + jsPDF
   - Located in `src/utils/pdfGenerator.ts`
   - Handles cases where print API is unavailable

### Message Passing Pattern

Communication between different parts of the extension:
```typescript
// Content to Background
chrome.runtime.sendMessage({ action: 'generatePDF', data });

// Background to Content
chrome.tabs.sendMessage(tabId, { action: 'getPageContent' });
```

### Testing Approach

- **Framework**: Vitest with React Testing Library
- **Environment**: jsdom for browser simulation
- **Test Location**: `src/__tests__/`
- **Setup File**: `src/__tests__/setup.ts`
- **Run Single Test**: `npm test -- path/to/test.spec.ts`

### Build Configuration

The project uses Vite with multiple entry points:
- `popup.html` → Extension popup
- `options.html` → Settings page
- `viewer.html` → PDF viewer
- `background.js` → Service worker (separate build)
- `contentScript.js` → Content script (separate build)

### Key Technical Decisions

1. **TypeScript Strict Mode**: Enabled for better type safety
2. **Glass-morphic Design**: Modern UI with transparency effects using Tailwind CSS
3. **Component Organization**: UI components in `src/components/ui/`
4. **Interactive Features**: 
   - Drag-and-drop page breaks with visual feedback
   - Element exclusion from PDFs
   - Real-time preview updates

### Development Guidelines

1. **Message Handling**: Always validate messages between contexts for security
2. **State Management**: Use React hooks for UI state, Chrome storage API for persistence
3. **Error Handling**: Gracefully handle PDF generation failures with user feedback
4. **Performance**: Minimize content script impact on page performance

### Current Project Status

The extension is feature-complete with only Chrome Web Store submission remaining (Task 3.5). All core functionality including interactive page breaks, element exclusion, and dual PDF generation methods are implemented and tested.