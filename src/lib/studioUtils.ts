/**
 * LoveStory Studio Utility Helpers
 * Zero-mock asset resolver and sanitizer
 */

export const WEDDING_SAMPLE_IMAGES: string[] = [
  '/assets/wedding/samples/sample_01.jpg',
  '/assets/wedding/samples/sample_02.jpg',
  '/assets/wedding/samples/sample_03.jpg',
  '/assets/wedding/samples/sample_04.jpg',
  '/assets/wedding/samples/sample_05.jpg',
  '/assets/wedding/samples/sample_06.jpg',
  '/assets/wedding/samples/sample_07.jpg',
  '/assets/wedding/samples/sample_08.jpg',
  '/assets/wedding/samples/sample_09.jpg',
  '/assets/wedding/samples/sample_10.jpg',
  '/assets/wedding/samples/sample_11.jpg',
  '/assets/wedding/samples/sample_12.jpg',
  '/assets/wedding/samples/sample_13.jpg',
  '/assets/wedding/samples/sample_14.jpg',
  '/assets/wedding/samples/sample_15.jpg',
  '/assets/wedding/samples/sample_16.jpg',
  '/assets/wedding/samples/sample_17.jpg',
  '/assets/wedding/samples/sample_18.jpg',
  '/assets/wedding/samples/sample_19.jpg',
  '/assets/wedding/samples/sample_20.jpg',
];

/**
 * Resolves any legacy or external asset URL to an accessible local/optimized path.
 * In particular, transforms Biihappy/M-Invite stock SVG assets (which send invalid image/svg mime-type
 * on Biihappy's CDN causing browser broken image icons) to LoveStory's local /assets/m-invite/stock/...
 * which serves valid image/svg+xml and loads flawlessly in Chromium/Firefox/Safari.
 */
export function resolveStudioAssetUrl(src?: string | null): string {
  if (!src || typeof src !== 'string') return '';

  const trimmed = src.trim();
  if (!trimmed) return '';

  // 1. Resolve broken / offline assets.lovestory.vn or assets.chungdoi.com assets to local high-res wedding sample photos
  if (trimmed.includes('assets.lovestory.vn') || trimmed.includes('assets.chungdoi.com')) {
    if (trimmed.includes('.mp3')) {
      return '/assets/wedding/audio/wedding-melody-01.mp3';
    }
    // Small plugins, hearts, calendar stickers
    if (
      trimmed.includes('plugins') ||
      trimmed.includes('heart') ||
      trimmed.includes('calen') ||
      trimmed.includes('seal')
    ) {
      return '/assets/m-invite/stock/6964ecd375dc09b0bdcfa023.svg';
    }
    // Deterministically hash the URL so the same template element consistently gets the same photo
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      hash = (hash << 5) - hash + trimmed.charCodeAt(i);
      hash |= 0;
    }
    const sampleIndex = Math.abs(hash) % WEDDING_SAMPLE_IMAGES.length;
    return WEDDING_SAMPLE_IMAGES[sampleIndex];
  }

  // 2. Check if it's an M-Invite stock asset (SVG/PNG/WebP)
  if (trimmed.includes('cdn.biihappy.com/m-invite/stock/') || trimmed.includes('/stock/') || trimmed.startsWith('stock/')) {
    const parts = trimmed.split(/(?:\/|^)stock(?:\/|%2F)/);
    if (parts.length > 1) {
      const rawFilename = parts[parts.length - 1].split('?')[0].split('#')[0];
      if (rawFilename) {
        let filename = rawFilename;
        try {
          filename = decodeURIComponent(rawFilename);
        } catch {
          // keep as is
        }
        return `/assets/m-invite/stock/${encodeURIComponent(filename).replace(/%2F/g, '/')}`;
      }
    }
  }

  // 2. Relative template photos from M-Invite
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('data:') &&
    !trimmed.startsWith('blob:')
  ) {
    return `https://cdn.biihappy.com/m-invite/${trimmed}`;
  }

  return trimmed;
}
