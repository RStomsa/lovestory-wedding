/**
 * LoveStory High-Performance Image Compressor
 * Compresses raw camera photos (15MB-30MB) down to optimized WebP (<400KB)
 * preserving crisp wedding details, correct EXIF orientation, and sharp typography.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.85)
  format?: 'image/webp' | 'image/jpeg';
}

export async function compressWeddingPhoto(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<{
  dataUrl: string;
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}> {
  const {
    maxWidth = 1920,
    maxHeight = 2560,
    quality = 0.85,
    format = 'image/webp',
  } = options;

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate constrained dimensions keeping aspect ratio
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const bestRatio = Math.min(widthRatio, heightRatio);

          width = Math.round(width * bestRatio);
          height = Math.round(height * bestRatio);
        }

        // Draw onto offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          reject(new Error('Failed to create canvas 2d context for compression'));
          return;
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Export to WebP (fallback to JPEG if browser doesn't support WebP export)
        const targetFormat =
          format === 'image/webp' && canvas.toDataURL('image/webp').startsWith('data:image/webp')
            ? 'image/webp'
            : 'image/jpeg';

        const dataUrl = canvas.toDataURL(targetFormat, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback blob from dataUrl
              const byteString = atob(dataUrl.split(',')[1]);
              const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const fallbackBlob = new Blob([ab], { type: mimeString });
              const compressedSize = fallbackBlob.size;
              const reduction = Math.round((1 - compressedSize / originalSize) * 100);

              resolve({
                dataUrl,
                blob: fallbackBlob,
                originalSize,
                compressedSize,
                reductionPercentage: Math.max(0, reduction),
              });
            } else {
              const compressedSize = blob.size;
              const reduction = Math.round((1 - compressedSize / originalSize) * 100);

              resolve({
                dataUrl,
                blob,
                originalSize,
                compressedSize,
                reductionPercentage: Math.max(0, reduction),
              });
            }
          },
          targetFormat,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}
