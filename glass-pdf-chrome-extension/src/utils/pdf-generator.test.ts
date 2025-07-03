import { describe, it, expect, vi } from 'vitest';
import { generatePdfFromImages } from './pdf-generator';

describe('PDF Generator', () => {
  it('should generate a PDF blob from image data URLs', async () => {
    // Mock the Image constructor
    let onloadCallback: () => void;
    const mockImage = {
      set src(_: string) { // Changed 'value' to '_' to indicate it's intentionally unused
        // Simulate async loading
        setTimeout(() => onloadCallback(), 0);
      },
      set onload(callback: () => void) {
        onloadCallback = callback;
      },
      width: 100,
      height: 100,
    };
    vi.stubGlobal('Image', vi.fn(() => mockImage));

    // Create a dummy image data URL (a 1x1 transparent PNG)
    const dummyImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const imageDataUrls = [dummyImageDataUrl];

    const pdfBlob = await generatePdfFromImages(imageDataUrls);

    expect(pdfBlob).toBeInstanceOf(Blob);
    expect(pdfBlob.type).toBe('application/pdf');
    expect(pdfBlob.size).toBeGreaterThan(0);
  });
});
