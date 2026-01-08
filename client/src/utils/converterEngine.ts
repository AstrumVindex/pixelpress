import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

/**
 * Helper: Load an image file
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

/**
 * 1. PDF TO IMAGE CONVERTER (Ultra HD Fix)
 * Renders PDF pages as 5x Resolution Images for maximum text clarity.
 */
export const convertPdfToImages = async (file: File, outputFormat: string) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const outputFiles = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    
    // SCALE 5.0 = Ultra High Definition (~360 DPI)
    // This creates very large images (approx 3500px x 5000px)
    // ensuring text remains sharp even when zoomed in significantly.
    const viewport = page.getViewport({ scale: 5.0 }); 

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context error');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // OPTIMIZATION: Disable smoothing to keep text edges crisp during rendering
    context.imageSmoothingEnabled = false;

    // CRITICAL: Fill background white. 
    // PDFs have transparent backgrounds by default. 
    // Converting transparent text to JPG often causes blurry gray fringing.
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      // Enable text enhancement flags if supported by version
      background: 'rgba(255, 255, 255, 1)' 
    };

    await page.render(renderContext).promise;

    const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve) => 
      canvas.toBlob((b) => resolve(b!), mimeType, 1.0)
    );
    
    outputFiles.push({
      blob: blob,
      name: `${file.name.replace(/\.pdf$/i, '')}_page_${i}.${outputFormat}`,
      size: blob.size
    });
  }

  return outputFiles;
};

/**
 * 2. IMAGE TO IMAGE CONVERTER
 */
export const convertImageFormat = async (file: File, outputFormat: string) => {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context error');

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob>((resolve) => 
    canvas.toBlob((b) => resolve(b!), mimeType, 1.0)
  );
  
  return [{ blob, name: file.name.replace(/\.[^/.]+$/, `.${outputFormat}`), size: blob.size }];
};

/**
 * 3. IMAGE TO PDF GENERATOR
 */
export const generatePDF = async (files: File[], options: { orientation: string, pageSize: string, margin: string }) => {
  const { orientation, pageSize, margin } = options;
  const doc = new jsPDF({
    orientation: orientation === 'portrait' ? 'p' : 'l',
    unit: 'mm',
    format: pageSize === 'letter' ? 'letter' : 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let marginSize = 0;
  if (margin === 'small') marginSize = 10;
  if (margin === 'big') marginSize = 25;

  const workableWidth = pageWidth - (marginSize * 2);
  const workableHeight = pageHeight - (marginSize * 2);

  for (let i = 0; i < files.length; i++) {
    const img = await loadImage(files[i]);
    const imgRatio = img.width / img.height;
    const pageRatio = workableWidth / workableHeight;

    let finalWidth, finalHeight;
    if (imgRatio > pageRatio) {
      finalWidth = workableWidth;
      finalHeight = finalWidth / imgRatio;
    } else {
      finalHeight = workableHeight;
      finalWidth = finalHeight * imgRatio;
    }

    const x = marginSize + (workableWidth - finalWidth) / 2;
    const y = marginSize + (workableHeight - finalHeight) / 2;

    if (i > 0) doc.addPage();
    doc.addImage(img, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
  }

  return doc.output('blob');
};
