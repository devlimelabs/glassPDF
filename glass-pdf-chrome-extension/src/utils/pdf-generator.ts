import jsPDF from 'jspdf';

export const generatePdfFromImages = async (imageDataUrls: string[]) => {
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();

  for (let i = 0; i < imageDataUrls.length; i++) {
    if (i > 0) {
      pdf.addPage();
    }
    const imgData = imageDataUrls[i];
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve) => (img.onload = resolve));

    const ratio = img.width / img.height;
    const width = pdfWidth;
    const height = width / ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
  }

  return pdf.output('blob');
};