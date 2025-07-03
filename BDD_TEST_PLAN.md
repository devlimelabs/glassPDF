# BDD Unit Test Plan for Glass PDF Generator Chrome Extension

This document outlines a detailed plan for implementing full Behavior-Driven Development (BDD) unit tests for the Glass PDF Generator Chrome Extension.

## 1. Project Analysis & Technology Stack

The Glass PDF Generator Chrome Extension's source code is located in the `glass-pdf-chrome-extension/src` directory. Key areas include:

*   `background/index.ts`: Handles background tasks and communication between different parts of the extension.
*   `content/index.ts`: Injects scripts into web pages to enable PDF generation and interactive features.
*   `popup/index.tsx`: The main user interface of the extension, allowing users to trigger PDF generation and access settings.
*   `options/index.tsx`: The extension's options page for configuring advanced settings.
*   `utils/pdf-generator.ts`: The core logic for generating PDFs, likely containing complex functionality that requires thorough testing.

The extension is built with TypeScript and React. Given the project's use of Vite, **Vitest** is the chosen testing framework due to its speed, modernity, and compatibility. For the BDD layer, **`vitest-cucumber`** will be used to integrate Gherkin-based feature files.

## 2. BDD Testing Plan

A Behavior-Driven Development (BDD) approach will be followed to ensure tests are aligned with user perspective and business requirements. This involves writing user stories in Gherkin syntax (`.feature` files) and then implementing the corresponding test steps.

### Step 1: Set Up the Testing Environment

1.  **Install Dependencies**: Add the necessary development dependencies to `glass-pdf-chrome-extension/package.json`:
    *   `vitest`: The core testing framework.
    *   `vitest-cucumber`: A BDD plugin for Vitest that allows writing tests in Gherkin.
    *   `@testing-library/react`: For rendering and interacting with React components.
    *   `jsdom`: To simulate a browser environment for testing.
    *   `sinon` or `vitest.spy()`: For creating spies, stubs, and mocks to isolate components during testing.
2.  **Configure Vitest**: Create a `vitest.config.ts` file in `glass-pdf-chrome-extension/` to configure the testing environment, including setting up the test runner, defining global mocks, and integrating the BDD plugin.
3.  **Create Test Directories**: Organize the tests in a `glass-pdf-chrome-extension/src/__tests__` directory, with subdirectories for features, step definitions, and component-specific tests.

### Step 2: Define Features and Scenarios

Create `.feature` files for each key functionality of the extension. Each file will contain a set of scenarios that describe a specific behavior from the user's perspective.

**Example: `glass-pdf-chrome-extension/src/__tests__/features/pdf-generation.feature`**

```gherkin
Feature: PDF Generation
  As a user, I want to generate a PDF from a web page so that I can save its content for offline use.

  Scenario: Generate a simple PDF
    Given I am on a web page
    When I click the "Generate PDF" button in the extension popup
    Then a PDF should be generated successfully
    And the PDF should be displayed in the viewer

  Scenario: Generate a PDF with custom settings
    Given I have opened the extension's options page
    And I have set the page orientation to "Landscape"
    When I generate a PDF from a web page
    Then the generated PDF should have a landscape orientation
```

**Example: `glass-pdf-chrome-extension/src/__tests__/features/interactive-tools.feature`**

```gherkin
Feature: Interactive PDF Tools
  As a user, I want to customize the PDF output using interactive tools.

  Scenario: Add a page break
    Given I am in the PDF generation preview mode
    When I drag and drop a page break onto the page
    Then a page break should be added at the specified location
    And the generated PDF should reflect the new page break

  Scenario: Exclude an element from the PDF
    Given I am in the PDF generation preview mode
    When I select an element to exclude
    Then the element should be marked for exclusion
    And the generated PDF should not contain the excluded element
```

### Step 3: Implement Step Definitions

Create step definition files that link the Gherkin steps to the actual test code.

**Example: `glass-pdf-chrome-extension/src/__tests__/step-definitions/pdf-generation.steps.ts`**

```typescript
import { given, when, then } from 'vitest-cucumber';
import { render, fireEvent } from '@testing-library/react';
import Popup from '../../popup/index.tsx';
import * as PDFGenerator from '../../utils/pdf-generator';

given('I am on a web page', () => {
  // Mock the browser environment and the content script
});

when('I click the "Generate PDF" button in the extension popup', () => {
  const { getByText } = render(<Popup />);
  const generateButton = getByText('Generate PDF');
  fireEvent.click(generateButton);
});

then('a PDF should be generated successfully', () => {
  // Spy on the PDFGenerator and assert that it was called
});
```

### Step 4: Write Unit Tests for Components and Utilities

Write detailed unit tests for individual components and utility functions to ensure they work correctly in isolation.

*   **`pdf-generator.test.ts`**:
    *   Test the core PDF generation logic with various inputs and configurations.
    *   Mock dependencies like the Chrome API and external libraries to isolate the tests.
    *   Verify that the generated PDF content is correct and matches the expected output.
*   **`popup.test.tsx`**:
    *   Test the rendering and behavior of the popup UI.
    *   Simulate user interactions like button clicks and form submissions.
    *   Assert that the component's state and props are updated correctly.
*   **`options.test.tsx`**:
    *   Test the options page UI and its interaction with the extension's storage.
    *   Verify that changing a setting in the UI correctly updates the configuration.

## Execution and Verification

Once the tests are implemented, the following steps will be taken:

1.  **Run the Tests**: Execute the tests using the `vitest` command.
2.  **Review the Results**: Analyze the test results and address any failures.
3.  **Generate Coverage Reports**: Create a code coverage report to identify any parts of the codebase that are not adequately tested.
