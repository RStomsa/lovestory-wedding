/**
 * LoveStory Studio Utility Helpers
 * Zero-mock asset resolver and sanitizer
 */

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

  // 1. Check if it's an M-Invite stock asset (SVG/PNG/WebP)
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
