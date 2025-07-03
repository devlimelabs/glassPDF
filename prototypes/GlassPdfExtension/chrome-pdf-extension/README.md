# 🌟 Glass PDF Generator - Chrome Extension

A modern Chrome extension that generates pixel-perfect PDFs from web pages and local files with a stunning glass-morphic interface.

![Glass PDF Generator](assets/icons/icon128.png)

## ✨ Features

### 🎨 Glass-Morphic Interface
- **Modern Design**: Beautiful glass-morphic UI with blur effects and translucent elements
- **Responsive Layout**: Adapts seamlessly to different screen sizes
- **Smooth Animations**: Fluid transitions and micro-interactions for enhanced UX

### 📄 Advanced PDF Generation
- **Pixel-Perfect Rendering**: Canvas-based generation avoiding print CSS issues
- **High-Quality Output**: Professional PDFs with proper scaling and resolution
- **Smart Page Breaks**: Interactive page break adjustment with drag-and-drop
- **Element Exclusion**: Click to exclude unwanted elements from PDF

### 🛠️ Professional Tools
- **Interactive Overlays**: Visual page break management with real-time preview
- **Element Selection**: Intuitive click-to-exclude interface with highlighting
- **Custom Settings**: Comprehensive PDF customization options
- **Multiple Formats**: Support for various page sizes and orientations

### 🔧 Advanced Features
- **Background Processing**: Service worker for efficient PDF generation
- **Local File Support**: Generate PDFs from local HTML files
- **Download Management**: Integrated download with progress tracking
- **Built-in Viewer**: Modern PDF viewer with zoom, navigation, and tools

## 🚀 Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "Glass PDF Generator"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Glass PDF Generator icon will appear in your toolbar

## 📖 Usage

### Quick PDF Generation
1. **Navigate** to any web page
2. **Click** the Glass PDF Generator icon in the toolbar
3. **Click** "Generate PDF" for instant conversion
4. **Choose** save location and download

### Advanced Configuration
1. **Click** "Advanced" in the popup for detailed settings
2. **Adjust** page format, orientation, scale, and margins
3. **Enable** options like background printing and viewer mode
4. **Generate** with custom settings

### Interactive Page Management
1. **Click** "Adjust Breaks" to manage page breaks
2. **Drag** the blue lines to reposition page breaks
3. **Add** new breaks or reset to defaults
4. **Save** changes and generate PDF

### Element Exclusion
1. **Click** "Exclude Elements" to enter selection mode
2. **Click** on page elements to exclude them from PDF
3. **See** real-time highlighting of excluded elements
4. **Save** selections and generate clean PDF

## 🎯 Key Benefits

### For Web Developers
- **Accurate Rendering**: No more broken layouts in PDF exports
- **Developer Tools**: Element inspection and exclusion capabilities
- **Local File Support**: Test HTML files before publishing

### For Content Creators
- **Professional Output**: High-quality PDFs for presentations and documents
- **Custom Formatting**: Full control over page layout and appearance
- **Batch Processing**: Efficient handling of multiple pages

### For End Users
- **Simple Interface**: One-click PDF generation with beautiful UI
- **Reliable Results**: Consistent, professional PDF output
- **Modern Experience**: Glass-morphic design that's pleasant to use

## 🔧 Technical Specifications

### Architecture
- **Manifest V3**: Latest Chrome extension standard
- **Service Worker**: Background processing for efficiency
- **Content Scripts**: Page interaction and overlay management
- **Canvas Rendering**: High-quality image capture

### Supported Features
- **Page Formats**: Letter, A4, Legal, A3, Custom sizes
- **Orientations**: Portrait and Landscape
- **Scaling**: 10% to 500% with custom values
- **Margins**: Customizable margins in inches
- **Quality**: 300 DPI for print-ready output

### Browser Compatibility
- **Chrome**: Version 88+ (Manifest V3 support required)
- **Chromium**: Based browsers with extension support
- **Edge**: Chromium-based Edge browsers

## 🛡️ Privacy & Security

### Data Protection
- **No Data Collection**: Extension works entirely locally
- **No External Servers**: All processing happens in your browser
- **Secure Processing**: Uses Chrome's built-in PDF capabilities

### Permissions
- **Active Tab**: Access current page for PDF generation
- **Downloads**: Save generated PDFs to your computer
- **Storage**: Save user preferences and settings
- **Scripting**: Inject content scripts for page interaction

## 🔄 Updates & Support

### Version History
- **v1.0.0**: Initial release with full feature set
- Modern glass-morphic interface
- Advanced PDF generation capabilities
- Interactive page break management
- Element exclusion system

### Getting Help
- **Issues**: Report bugs or feature requests on GitHub
- **Documentation**: Comprehensive guides and tutorials
- **Community**: Join discussions and share feedback

## 🏗️ Development

### Project Structure
```
chrome-pdf-extension/
├── manifest.json          # Extension manifest
├── background.js           # Service worker
├── popup/                  # Extension popup
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/                # Content scripts
│   ├── content.js
│   └── overlay.css
├── pdf-viewer/             # Built-in PDF viewer
│   ├── viewer.html
│   ├── viewer.css
│   └── viewer.js
├── utils/                  # Utility functions
│   ├── pdf-generator.js
│   └── helpers.js
└── assets/                 # Icons and resources
    └── icons/
```

### Key Technologies
- **JavaScript ES6+**: Modern JavaScript with async/await
- **CSS Grid/Flexbox**: Responsive layout system
- **Chrome Extension APIs**: Native browser integration
- **Canvas API**: High-quality image rendering
- **CSS Backdrop-Filter**: Glass-morphic effects

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chrome Extension Team**: For excellent documentation and APIs
- **Glass-morphism Community**: For design inspiration
- **Open Source Contributors**: For libraries and tools used

---

**Made with ❤️ for the web development community**

*Transform any web page into a beautiful PDF with the power of modern web technologies and glass-morphic design.*