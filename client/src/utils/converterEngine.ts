/**
 * High-quality image conversion engine using HTML5 Canvas
 */

export async function convertImageFormat(file: File, outputFormat: string): Promise<Blob> {
  const format = outputFormat.toLowerCase();
  
  // Create image bitmap for high-quality decoding
  const imageBitmap = await createImageBitmap(file);
  
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  
  const ctx = canvas.getContext('2d', { alpha: format !== 'jpg' && format !== 'jpeg' });
  if (!ctx) throw new Error('Canvas context could not be created');

  // Set high quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Handle JPG background (transparency -> white)
  if (format === 'jpg' || format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(imageBitmap, 0, 0);

  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Image conversion failed'));
    }, mimeType, 0.92); // 0.92 is a good balance for high quality
  });
}
