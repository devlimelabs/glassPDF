# Glass PDF Generator

This project is a Chrome extension called "Glass PDF Generator" that allows users to create PDF files from web pages. The project also includes a showcase website to promote the extension.

## Key Features

*   **PDF Generation**: The core functionality of the Chrome extension is to generate high-quality PDFs from any web page.
*   **Glass-Morphic UI**: The showcase website and the extension itself feature a modern, visually appealing "glass-morphic" design with blur effects and smooth animations.
*   **Interactive Tools**: The extension provides interactive tools for customizing the PDF output, such as drag-and-drop page breaks and the ability to exclude specific elements from the generated PDF.
*   **Advanced Settings**: Users can configure various settings for the PDF generation, including page size, orientation, and quality.

## Technology Stack

The project utilizes the following technologies:

*   **Showcase Website**:
    *   React
    *   TypeScript
    *   Vite
    *   Tailwind CSS
*   **Chrome Extension**:
    *   JavaScript
    *   HTML
    *   CSS

## Project Structure

The project is organized into two main folders:

*   `glass-pdf-showcase-website`: Contains the source code for the showcase website.
*   `prototypes`: Contains different versions and prototypes of the Chrome extension.

## Prototypes

The `prototypes` folder contains two versions of the Chrome extension:

*   **`Chrome Extension for PDF Generation with Custom Page Breaks`**: A feature-rich prototype with a dual-rendering strategy (Chrome's `printToPDF` API and a screenshot-based approach). It offers interactive features like page break control and element selection.
*   **`GlassPdfExtension`**: A very similar prototype that also emphasizes a "glass-morphic" design and provides advanced PDF generation features. The file structure and core components are nearly identical to the first prototype.

Both prototypes are well-documented and share a common goal. The main difference appears to be in the naming and some minor variations in the documentation.