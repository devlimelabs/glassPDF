# glassPDF

A modern Chrome extension that converts web pages to PDF with interactive page break control and a beautiful glass-morphic UI design.

## Features

- 🎯 **Interactive Page Breaks**: Drag-and-drop to adjust page breaks in real-time
- 🚫 **Element Exclusion**: Select and exclude unwanted elements from your PDF
- 🎨 **Glass-morphic Design**: Modern, transparent UI with smooth animations
- 📄 **Dual PDF Generation**: Chrome's native print API with html2canvas fallback
- ⚡ **Fast & Efficient**: Optimized for performance with minimal page impact
- 🔧 **Customizable**: Adjust settings to fit your PDF generation needs

## Project Structure

```
glassPDF/
├── glass-pdf-chrome-extension/    # Main Chrome extension
│   ├── src/                      # Source code
│   ├── public/                   # Static assets
│   └── package.json             # Dependencies
└── glass-pdf-showcase-website/   # Landing page and documentation
    ├── src/                      # React website source
    └── package.json             # Dependencies
```

## Development

### Chrome Extension

```bash
cd glass-pdf-chrome-extension
npm install
npm run dev    # Start development server
npm run build  # Build for production
npm test       # Run tests
```

### Showcase Website

```bash
cd glass-pdf-showcase-website
pnpm install
pnpm dev       # Start development server
pnpm build     # Build for production
```

## Installation

The extension will be available on the Chrome Web Store soon. For now, you can install it manually:

1. Clone this repository
2. Build the extension: `cd glass-pdf-chrome-extension && npm run build`
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `glass-pdf-chrome-extension/dist` folder

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
