# PDF Generator Pro - Chrome Extension

A powerful Chrome extension that generates pixel-perfect PDFs from web pages, URLs, or local files with customizable page breaks and a modern glassmorphic interface.

## Features

### 🎯 Core Functionality
- **Dual Rendering Methods**: Standard (fast) and Pixel-Perfect (exact visual copy)
- **Universal Compatibility**: Works with any web page, URL, or local HTML file
- **Customizable Page Breaks**: Interactive page break control with drag-and-drop adjustment
- **Multiple Page Formats**: A4, A3, A5, Letter, Legal, Tabloid
- **Flexible Orientation**: Portrait and landscape modes

### 🎨 Modern Interface
- **Glassmorphic Design**: Sleek, modern interface with blur effects and transparency
- **Responsive Layout**: Works perfectly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme detection
- **Smooth Animations**: Polished micro-interactions and transitions

### 🔧 Advanced Tools
- **Element Selection**: Interactive element highlighting and debugging
- **Debug Mode**: Identify potential PDF rendering issues
- **Page Break Preview**: Visual page break positioning before generation
- **Custom Settings**: Margins, scale, background printing, and more

### ⚡ Performance
- **Background Processing**: Non-blocking PDF generation
- **Memory Efficient**: Optimized for large pages and documents
- **Fallback Support**: Automatic fallback between rendering methods
- **Progress Tracking**: Real-time generation progress

## Installation

### Method 1: Developer Mode (Recommended)

1. **Download the Extension**
   - Download and extract the `chrome-pdf-extension` folder
   - Or clone this repository

2. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome-pdf-extension` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "PDF Generator Pro" and click the pin icon

### Method 2: Chrome Web Store (Future)
*This extension will be available on the Chrome Web Store soon.*

## Usage

### Basic PDF Generation

1. **Open Any Web Page**
   - Navigate to the page you want to convert to PDF
   - Click the PDF Generator Pro icon in the toolbar

2. **Choose Settings**
   - Select render method (Standard or Pixel Perfect)
   - Choose page format and orientation
   - Adjust margins and scale if needed

3. **Generate PDF**
   - Click "Generate PDF"
   - The PDF will open in a new tab with download option

### Advanced Features

#### Page Break Control
1. Click "Preview Breaks" in the popup
2. Drag the red lines to adjust page break positions
3. Click "Apply Changes" to save adjustments

#### Element Selection
1. Click "Element Selection" in the popup
2. Click on page elements to select/deselect them
3. Hover over elements to see detailed information
4. Yellow outlines indicate potential rendering issues

#### Debug Mode
1. Click "Debug Mode" in the popup
2. View color-coded highlights for different issue types:
   - 🔴 Red: Fixed positioning elements
   - 🟡 Yellow: CSS transforms
   - 🟣 Purple: Viewport overflow
   - 🔵 Blue: High z-index elements

## Settings Reference

### Render Methods
- **Standard**: Fast PDF generation using Chrome's built-in print API
- **Pixel Perfect**: Screenshot-based rendering for exact visual reproduction

### Page Formats
- **A4**: 210 × 297 mm (most common)
- **A3**: 297 × 420 mm (large format)
- **A5**: 148 × 210 mm (small format)
- **Letter**: 8.5 × 11 inches (US standard)
- **Legal**: 8.5 × 14 inches (US legal)
- **Tabloid**: 11 × 17 inches (large US format)

### Options
- **Print Backgrounds**: Include background colors and images
- **Header & Footer**: Add automatic headers and footers
- **Use CSS Page Size**: Respect CSS @page rules
- **Scale**: Adjust content size (10% - 200%)
- **Margins**: Set custom margins in inches

## Keyboard Shortcuts

- `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac): Generate PDF from current page
- `Ctrl+S` (in PDF viewer): Download PDF
- `Ctrl+P` (in PDF viewer): Print PDF
- `Ctrl/Cmd + +/-`: Zoom in/out in PDF viewer
- `Ctrl/Cmd + 0`: Reset zoom in PDF viewer
- `Escape`: Close overlays and selection modes

## Troubleshooting

### Common Issues

**PDF Generation Fails**
- Try switching to "Pixel Perfect" mode
- Check if the page has finished loading
- Disable browser extensions that might interfere

**Missing Content in PDF**
- Enable "Print Backgrounds" option
- Try increasing the scale setting
- Use "Pixel Perfect" mode for complex layouts

**Page Breaks in Wrong Places**
- Use the "Preview Breaks" feature to adjust manually
- Consider changing page format or orientation
- Check for elements with fixed positioning

**Extension Not Working**
- Refresh the page and try again
- Check if the extension is enabled in `chrome://extensions/`
- Try reloading the extension

### Performance Tips

- For large pages, use "Standard" mode first
- Close unnecessary tabs to free up memory
- Use page break preview to optimize layout
- Consider splitting very long pages into multiple PDFs

## Technical Details

### Browser Compatibility
- Chrome 88+ (Manifest V3 support required)
- Chromium-based browsers (Edge, Brave, etc.)

### Permissions Used
- `tabs`: Access to current tab information
- `activeTab`: Interact with the current page
- `storage`: Save user preferences
- `downloads`: Download generated PDFs
- `scripting`: Inject content scripts
- `printToPDF`: Generate PDFs using Chrome API

### File Structure
```
chrome-pdf-extension/
├── manifest.json              # Extension configuration
├── src/
│   ├── background/           # Background service worker
│   ├── content/             # Content scripts and overlays
│   ├── popup/               # Extension popup interface
│   └── viewer/              # PDF viewer page
├── assets/
│   └── icons/               # Extension icons
├── styles/
│   └── common.css           # Shared styles
└── scripts/
    └── pdf-generator.js     # PDF generation utilities
```

## Privacy & Security

- **No Data Collection**: This extension does not collect or transmit any personal data
- **Local Processing**: All PDF generation happens locally in your browser
- **No External Servers**: No data is sent to external servers
- **Temporary Storage**: PDF data is temporarily stored locally and automatically cleaned up

## Contributing

This extension is open source and welcomes contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup

1. Clone the repository
2. Make changes to the source files
3. Load the extension in developer mode
4. Test your changes
5. Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, bug reports, or feature requests:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review Chrome extension development documentation

## Changelog

### Version 1.0.0
- Initial release
- Dual rendering methods (Standard and Pixel Perfect)
- Interactive page break control
- Element selection and debugging tools
- Glassmorphic UI design
- Multiple page formats and orientations
- Keyboard shortcuts
- Responsive design

---

**Made with ❤️ for the Chrome community**

