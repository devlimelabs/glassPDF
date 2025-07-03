# Project Plan: Glass PDF - Production Chrome Extension

This document outlines the plan for creating a production-ready version of the Glass PDF Chrome Extension. The goal is to combine the best features of the existing prototypes, enhance them with additional functionality, and ensure a high-quality, robust, and user-friendly extension.

## 1. Technology Stack

*   **Manifest Version**: Manifest V3
*   **Core Language**: TypeScript for type safety and improved developer experience.
*   **UI Framework**: React with TypeScript for the popup and options pages, enabling a modern, component-based UI.
*   **Styling**: Tailwind CSS for a utility-first CSS workflow, allowing for rapid and consistent styling.
*   **PDF Generation**: A hybrid approach:
    *   **Primary**: Chrome's `tabs.print()` API for fast and efficient PDF generation.
    *   **Secondary**: A canvas-based, screenshot-stitching method using the `html2canvas` library for pixel-perfect rendering when the primary method is insufficient.
*   **Build Tool**: Vite for fast development and optimized production builds.
*   **Linting**: ESLint and Prettier for code quality and consistency.

## 2. Architecture

The extension will be structured into the following key components:

*   **`src/background`**: The service worker, responsible for handling PDF generation requests, managing the extension's state, and coordinating communication between different parts of the extension.
*   **`src/content`**: The content script, injected into web pages to handle DOM manipulation, element selection, and page break previews.
*   **`src/popup`**: The React-based popup UI, providing users with a simple and intuitive interface for generating PDFs.
*   **`src/options`**: The React-based options page, allowing users to configure advanced settings for the extension.
*   **`src/viewer`**: A dedicated PDF viewer page for previewing and downloading generated PDFs.
*   **`src/utils`**: A collection of utility functions for tasks such as PDF generation, image manipulation, and DOM interactions.

## 3. Task List

### Phase 1: Project Setup and Core Functionality

*   [x] **Task 1.1**: Set up a new Vite-based project with React, TypeScript, and Tailwind CSS.
*   [x] **Task 1.2**: Create the basic file structure for the extension, including folders for `background`, `content`, `popup`, `options`, and `utils`.
*   [x] **Task 1.3**: Implement the core service worker (`background/index.ts`) to handle PDF generation requests using the `chrome.tabs.print()` API.
*   [x] **Task 1.4**: Develop the basic popup UI (`popup/index.tsx`) with a "Generate PDF" button and basic options.
*   [x] **Task 1.5**: Create the content script (`content/index.ts`) to handle basic communication with the service worker.

### Phase 2: Advanced PDF Generation and UI/UX

*   [x] **Task 2.1**: Implement the secondary, canvas-based PDF generation method using `html2canvas` in `utils/pdf-generator.ts`.
*   [x] **Task 2.2**: Add a fallback mechanism in the service worker to automatically switch to the canvas-based method if the primary method fails.
*   [x] **Task 2.3**: Enhance the popup UI with a modern, "glass-morphic" design, similar to the `GlassPdfExtension` prototype.
*   [x] **Task 2.4**: Implement the interactive page break preview feature in the content script, allowing users to drag and drop page break markers.
*   [x] **Task 2.5**: Implement the element exclusion feature, allowing users to select and hide elements from the generated PDF.

### Phase 3: Polishing and Final Touches

*   [x] **Task 3.1**: Develop the options page (`options/index.tsx`) to allow users to customize default settings.
*   [x] **Task 3.2**: Create the dedicated PDF viewer (`viewer/index.tsx`) for previewing and downloading generated PDFs.
*   [x] **Task 3.3**: Add comprehensive error handling and user feedback mechanisms throughout the extension.
*   [x] **Task 3.4**: Write unit and integration tests for the key components of the extension.
*   [ ] **Task 3.5**: Prepare the extension for submission to the Chrome Web Store, including creating promotional materials and writing a detailed description.
