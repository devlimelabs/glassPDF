import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePdfFromImages } from '../../utils/pdf-generator';
import jsPDF from 'jspdf';

// Mock jspdf
vi.mock('jspdf', () => {
  const mockAddPage = vi.fn();
  const mockAddImage = vi.fn();
  const mockOutput = vi.fn(() => new Blob());
  const mockGetWidth = vi.fn(() => 595.28);

  return {
    __esModule: true,
    default: vi.fn(() => ({
      addPage: mockAddPage,
      addImage: mockAddImage,
      output: mockOutput,
      internal: {
        pageSize: {
          getWidth: mockGetWidth,
        },
      },
    })),
  };
});

// Mock Image constructor
const mockImage = vi.fn(() => ({
  src: '',
  onload: null,
}));

vi.stubGlobal('Image', mockImage);

describe('pdf-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a PDF with a single image', async () => {
    const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    // Simulate image loading
    mockImage.mockImplementationOnce(function(this: any) {
      this.src = imageDataUrl;
      setTimeout(() => {
        this.width = 100;
        this.height = 100;
        if (this.onload) this.onload();
      }, 0);
      return this;
    });

    await generatePdfFromImages([imageDataUrl]);

    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
    });
    expect(jsPDF.mock.results[0].value.addPage).not.toHaveBeenCalled();
    expect(jsPDF.mock.results[0].value.addImage).toHaveBeenCalledWith(
      imageDataUrl,
      'PNG',
      0,
      0,
      expect.any(Number),
      expect.any(Number)
    );
    expect(jsPDF.mock.results[0].value.output).toHaveBeenCalledWith('blob');
  });

  it('should generate a PDF with multiple images, adding a new page for each subsequent image', async () => {
    const imageDataUrls = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    ];

    // Simulate image loading for multiple images
    mockImage.mockImplementation(function(this: any) {
      this.src = this.src;
      setTimeout(() => {
        this.width = 100;
        this.height = 100;
        if (this.onload) this.onload();
      }, 0);
      return this;
    });

    await generatePdfFromImages(imageDataUrls);

    expect(jsPDF).toHaveBeenCalledTimes(1);
    expect(jsPDF.mock.results[0].value.addPage).toHaveBeenCalledTimes(imageDataUrls.length - 1);
    expect(jsPDF.mock.results[0].value.addImage).toHaveBeenCalledTimes(imageDataUrls.length);
    expect(jsPDF.mock.results[0].value.output).toHaveBeenCalledWith('blob');
  });
});