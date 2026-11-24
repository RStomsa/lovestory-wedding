/**
 * Safe SVG Sanitizer for LoveStory Studio
 * Removes executable scripts, dangerous event handlers (onload, onerror),
 * and foreign objects while preserving decorative paths and shapes.
 */

export function sanitizeSvg(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== 'string') return '';

  return rawSvg
    // Strip <script> tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip on* event handlers (onload, onclick, onerror, etc.)
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    // Strip javascript: pseudo protocols
    .replace(/href=["']javascript:[^"']*["']/gi, '')
    .replace(/xlink:href=["']javascript:[^"']*["']/gi, '')
    // Strip iframe and object tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
}
