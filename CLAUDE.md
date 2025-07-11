# CLAUDE.md - glassPDF Project Instructions

## Project Overview
glassPDF is a Chrome Extension for converting web pages to PDF with advanced features like interactive page break previews, element exclusion, and multiple PDF generation methods.

## Technology Stack
- **Chrome Extension**: Manifest V3
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS (utility-first)
- **Build Tool**: Vite
- **Testing**: Vitest with React Testing Library
- **PDF Generation**: 
  - Primary: Chrome's `tabs.print()` API
  - Secondary: html2canvas + jspdf for pixel-perfect rendering

## Project Structure
```
glass-pdf-chrome-extension/
├── src/
│   ├── background/     # Service worker for PDF generation
│   ├── content/        # Content script for DOM manipulation
│   ├── popup/          # React popup UI
│   ├── options/        # React options page
│   ├── viewer/         # PDF viewer page
│   ├── utils/          # Shared utilities
│   └── __tests__/      # Test files
├── dist/               # Build output
└── public/            # Static assets
```

## Development Commands
```bash
# Install dependencies
npm install

# Development mode (watches for changes)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Preview build
npm run preview
```

## Key Architectural Decisions

### 1. Dual PDF Generation Approach
- **Primary Method**: Uses Chrome's native `tabs.print()` API for fast, efficient PDF generation
- **Fallback Method**: Canvas-based screenshot stitching with html2canvas for pixel-perfect rendering when print API fails

### 2. Component Architecture
- All UI components use React with TypeScript for type safety
- Popup and options pages are separate React apps with shared components
- Content script handles DOM manipulation and page break previews

### 3. Message Passing Pattern
```typescript
// Content script → Background
chrome.runtime.sendMessage({ action: 'generatePdf', options });

// Background → Content script
chrome.tabs.sendMessage(tabId, { action: 'captureContent' });
```

## Testing Strategy
- Unit tests for utility functions and React components
- Integration tests for Chrome API interactions
- Test setup in `src/__tests__/setup.ts`
- Mock Chrome APIs for testing

## Chrome Extension Specific Guidelines

### 1. Manifest V3 Requirements
- Service workers instead of background pages
- No remote code execution
- Declarative net request API for network modifications

### 2. Permissions Management
- Only request necessary permissions in manifest.json
- Use optional permissions where possible
- Current permissions: tabs, activeTab, storage

### 3. Content Security Policy
- Strict CSP for extension pages
- No inline scripts or styles
- All resources must be bundled

## UI/UX Conventions

### 1. Glass-morphic Design
- Semi-transparent backgrounds with backdrop blur
- Subtle gradients and shadows
- Consistent border radius (0.5rem default)

### 2. Interactive Features
- Drag-and-drop page break markers
- Click-to-exclude element selection
- Real-time preview updates

### 3. Toast Notifications
- Use Sonner for user feedback
- Success/error states for all actions
- Non-blocking notifications

## Code Style Guidelines

### 1. TypeScript Conventions
```typescript
// Use interfaces for object shapes
interface PdfOptions {
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: number;
}

// Use type for unions and primitives
type PdfFormat = 'A4' | 'Letter';
```

### 2. React Patterns
```typescript
// Prefer function components with hooks
const PdfButton: React.FC<Props> = ({ onClick }) => {
  const [loading, setLoading] = useState(false);
  // ...
};

// Use custom hooks for logic extraction
const usePdfGeneration = () => {
  // PDF generation logic
};
```

### 3. File Naming
- Components: PascalCase (e.g., `PdfButton.tsx`)
- Utilities: camelCase (e.g., `pdfGenerator.ts`)
- Tests: `*.test.ts` or `*.test.tsx`

## Git Workflow

### Commit Message Format
Use conventional commits:
```
feat: add interactive page break preview
fix: resolve pdf generation memory leak
test: add unit tests for pdf utilities
docs: update setup instructions
```

### Branch Strategy
- `main`: Production-ready code
- Feature branches: `feat/feature-name`
- Bug fixes: `fix/issue-description`

## Performance Considerations

### 1. Memory Management
- Clean up event listeners in content scripts
- Dispose of canvas elements after PDF generation
- Use weak references for DOM element storage

### 2. Bundle Size
- Code split between popup, options, and viewer
- Lazy load heavy dependencies (html2canvas, jspdf)
- Tree-shake unused utilities

### 3. Runtime Performance
- Debounce resize events in content script
- Use requestAnimationFrame for smooth animations
- Minimize DOM manipulations

## Security Best Practices

### 1. Input Validation
- Sanitize all user inputs
- Validate PDF options before processing
- Prevent XSS in injected content

### 2. Chrome API Usage
- Always check for API availability
- Handle permission denials gracefully
- Use message validation between scripts

## Debugging Tips

### 1. Extension Development
- Use Chrome DevTools for popup/options pages
- Check service worker logs in chrome://extensions
- Use console.log with prefixes for different scripts

### 2. Common Issues
- Content script not injecting: Check manifest permissions
- PDF generation failing: Verify tab permissions
- Message passing errors: Check sender/receiver setup

## Future Enhancements (from PROJECT_PLAN.md)
- [ ] Task 3.5: Prepare for Chrome Web Store submission
- [ ] Add batch PDF generation for multiple tabs
- [ ] Implement cloud storage integration
- [ ] Add PDF annotation features
- [ ] Support for more PDF formats and sizes

## Related Resources
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Vite Documentation](https://vitejs.dev/)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)