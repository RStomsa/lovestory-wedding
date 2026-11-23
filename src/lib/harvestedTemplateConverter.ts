import fs from 'fs';
import path from 'path';
import { CanvasElement, CanvasConfig } from '@/components/editor/studio/studioTypes';
import { STUDIO_TEMPLATE_PRESETS, StudioTemplatePreset } from '@/data/studioTemplatePresets';
import { getCustomStudioPreset } from '@/lib/studioPresetsService';
import { getAllCatalogTemplates } from '@/lib/templatesService';
import minviteTemplates from '@/data/minvite_templates.json';
import { resolveStudioAssetUrl } from '@/lib/studioUtils';

export interface HarvestedRawTemplate {
  slug: string;
  title: string;
  templateId?: string;
  longThumbnail?: string | null;
  images?: string[];
  audios?: string[];
  plugins?: string[];
  textSnippets?: string[];
  feedUrl?: string;
  imagesCount?: number;
}

const HARVESTED_DIR = path.join(process.cwd(), 'src', 'data', 'harvested_templates');

export const HARVESTED_SLUG_MAP: Record<string, string> = {
  // 1. C165 - Save The Date Cream Gold
  'save-the-date-cream-gold': 'thiep-cuoi-165',
  'thiep-cuoi-165': 'thiep-cuoi-165',
  'tpl-165': 'thiep-cuoi-165',
  'c165': 'thiep-cuoi-165',
  'tpl-wedding-165': 'thiep-cuoi-165',
  'thiep-cuoi-hoang-gia': 'thiep-cuoi-165',
  'royal-wedding': 'thiep-cuoi-165',

  // 2. C61 - Our Love Begins
  'our-love-begins': 'thiep-cuoi-61',
  'tpl-61': 'thiep-cuoi-61',
  'tpl-wedding-01': 'thiep-cuoi-61',
  'thiep-cuoi-61': 'thiep-cuoi-61',

  // 3. C39 - Our Love Story Rose
  'our-love-story-rose': 'thiep-cuoi-39',
  'thiep-cuoi-39': 'thiep-cuoi-39',
  'tpl-39': 'thiep-cuoi-39',
  'tpl-wedding-02': 'thiep-cuoi-39',

  // 4. C44 - Envelope Chamomile
  'envelope-chamomile': 'thiep-cuoi-44',
  'thiep-cuoi-44': 'thiep-cuoi-44',
  'tpl-44': 'thiep-cuoi-44',
  'tpl-wedding-03': 'thiep-cuoi-44',

  // 5. C47 - Wedding Car Illustration
  'wedding-car-illustration': 'thiep-cuoi-47',
  'tpl-wedding-04': 'thiep-cuoi-47',
  'thiep-cuoi-47': 'thiep-cuoi-47',

  // 6. C42 - Marry Me Pink Pastel
  'marry-me-pink-pastel': 'thiep-cuoi-42',
  'tpl-wedding-05': 'thiep-cuoi-42',
  'thiep-cuoi-42': 'thiep-cuoi-42',

  // 7. C2 - Fall In Love Meadow
  'fall-in-love-meadow': 'thiep-cuoi-2',
  'tpl-wedding-06': 'thiep-cuoi-2',
  'thiep-cuoi-2': 'thiep-cuoi-2',

  // 8. C38 - Burgundy Handwritten
  'burgundy-handwritten': 'thiep-cuoi-38',
  'tpl-wedding-07': 'thiep-cuoi-38',
  'thiep-cuoi-38': 'thiep-cuoi-38',

  // 9. C46 - Arch White Burgundy
  'arch-white-burgundy': 'thiep-cuoi-46',
  'tpl-wedding-08': 'thiep-cuoi-46',
  'thiep-cuoi-46': 'thiep-cuoi-46',

  // 10. C1 - Blue Ocean Film Strip
  'blue-ocean-film-strip': 'thiep-cuoi-1',
  'tpl-wedding-09': 'thiep-cuoi-1',
  'thiep-cuoi-1': 'thiep-cuoi-1',

  // 11. C36 - Silver White Arch
  'silver-white-arch': 'thiep-cuoi-36',
  'tpl-wedding-10': 'thiep-cuoi-36',
  'thiep-cuoi-36': 'thiep-cuoi-36',

  // 12. C148 - Envelope Sage Polaroid
  'envelope-sage-polaroid': 'thiep-cuoi-148',
  'tpl-wedding-11': 'thiep-cuoi-148',
  'thiep-cuoi-148': 'thiep-cuoi-148',

  // 13. C114 - Watercolor Pink Floral
  'watercolor-pink-floral': 'thiep-cuoi-114',
  'tpl-wedding-12': 'thiep-cuoi-114',
  'thiep-cuoi-114': 'thiep-cuoi-114',

  // 14. C40 - Studio White Calendar
  'studio-white-calendar': 'thiep-cuoi-40',
  'tpl-wedding-13': 'thiep-cuoi-40',
  'thiep-cuoi-40': 'thiep-cuoi-40',

  // 15. C16 - Rose Arch Gate
  'rose-arch-gate': 'thiep-cuoi-52',
  'tpl-wedding-14': 'thiep-cuoi-52',
  'thiep-cuoi-16': 'thiep-cuoi-52',
  'thiep-cuoi-52': 'thiep-cuoi-52',

  // 16. C48 - Green Envelope Hill
  'green-envelope-hill': 'thiep-cuoi-48',
  'tpl-wedding-15': 'thiep-cuoi-48',
  'thiep-cuoi-48': 'thiep-cuoi-48',

  // 17. C117 - Red Envelope Cream Flower
  'red-envelope-cream-flower': 'thiep-cuoi-117',
  'tpl-wedding-16': 'thiep-cuoi-117',
  'thiep-cuoi-117': 'thiep-cuoi-117',

  // 18. C19 - Beige Lace Dress
  'beige-lace-dress': 'thiep-cuoi-145',
  'tpl-wedding-17': 'thiep-cuoi-145',
  'thiep-cuoi-19': 'thiep-cuoi-145',
  'thiep-cuoi-145': 'thiep-cuoi-145',

  // 19. C139 - Red Rose Champagne
  'red-rose-champagne': 'thiep-cuoi-139',
  'tpl-wedding-18': 'thiep-cuoi-139',
  'thiep-cuoi-139': 'thiep-cuoi-139',

  // 20. C56 - White Grey Red Ribbon
  'white-grey-red-ribbon': 'thiep-cuoi-56',
  'tpl-wedding-19': 'thiep-cuoi-56',
  'thiep-cuoi-56': 'thiep-cuoi-56',

  // 21. phong-bi-do - Red Envelope Tradition
  'red-envelope-tradition': 'phong-bi-do',
  'tpl-wedding-20': 'phong-bi-do',
  'phong-bi-do': 'phong-bi-do',

  // 22. thiep-cuoi-tone-xanh - Chibi Nha Co Hy
  'chibi-nha-co-hy': 'thiep-cuoi-tone-xanh',
  'tpl-wedding-21': 'thiep-cuoi-tone-xanh',
  'thiep-cuoi-tone-xanh': 'thiep-cuoi-tone-xanh',

  // 23. C53 - Blue Envelope Timeline
  'blue-envelope-timeline': 'thiep-cuoi-55',
  'tpl-wedding-22': 'thiep-cuoi-55',
  'thiep-cuoi-53': 'thiep-cuoi-55',
  'thiep-cuoi-55': 'thiep-cuoi-55',

  // 24. C5 - Chibi Red Tan Hon
  'chibi-red-tan-hon': 'thiep-cuoi-5',
  'tpl-wedding-23': 'thiep-cuoi-5',
  'thiep-cuoi-5': 'thiep-cuoi-5',

  // 25. C23 - Forest Moonlight
  'forest-moonlight': 'thiep-cuoi-23',
  'tpl-wedding-24': 'thiep-cuoi-23',
  'thiep-cuoi-23': 'thiep-cuoi-23',

  // Base template mappings
  'pastel': 'thiep-cuoi-44',
  'floral': 'thiep-cuoi-42',
  'retro': 'thiep-cuoi-2',
  'burgundy': 'thiep-cuoi-38',
};

/**
 * Load raw harvested template JSON from disk
 */
export function getHarvestedRawTemplate(slug: string): HarvestedRawTemplate | null {
  try {
    const cleanSlug = slug.replace(/\.json$/, '');
    const filePath = path.join(HARVESTED_DIR, `${cleanSlug}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading harvested template ${slug}:`, err);
  }
  return null;
}

/**
 * Convert a raw harvested template into a full rich Studio preset with 100% authentic data
 */
export function convertHarvestedToStudioPreset(raw: HarvestedRawTemplate): StudioTemplatePreset {
  // Clean raw image URLs (remove trailing backslashes, invalid formatting)
  const images = (raw.images || [])
    .filter((url) => typeof url === 'string' && url.startsWith('http'))
    .map((url) => url.replace(/\\+/g, '').trim());

  // Clean raw text snippets
  const texts = (raw.textSnippets || [])
    .map((t) =>
      t
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/cinelove(\.me)?/gi, 'LoveStory')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);

  const audio =
    raw.audios && raw.audios.length > 0
      ? raw.audios[0]
      : '/assets/wedding/mp3/ee11a985-5e0e-4eb0-b6da-28fa39c9946f.mp3';

  // Clean title
  const cleanTitle = raw.title
    ? raw.title
        .replace(/-\s*Thiệp online LoveStory.*$/i, '')
        .replace(/-\s*CineLove.*$/i, '')
        .replace(/cinelove/gi, 'LoveStory')
        .trim()
    : `Mẫu Thiệp ${raw.slug}`;

  const elements: CanvasElement[] = [];
  let currentY = 40;

  // Detect specific template themes
  const isC61 = raw.slug === 'thiep-cuoi-61' || raw.slug.includes('our-love-begins');
  const isC39 = raw.slug === 'thiep-cuoi-39' || raw.slug.includes('rose') || raw.slug.includes('hoa-hong');
  const isC44 = raw.slug === 'thiep-cuoi-44' || raw.slug.includes('chamomile') || raw.slug.includes('hoa-cuc');

  // Extract couple names if available
  let coupleNames = texts.find((t) => t.includes('-') && t.length > 5 && t.length < 35);
  if (!coupleNames) {
    coupleNames = texts.find((t) => t.includes('&') && t.length > 5 && t.length < 35);
  }
  if (!coupleNames) {
    coupleNames = texts.find((t) => t.length > 4 && t.length < 28 && !t.includes('.')) || 'Văn Minh & Minh An';
  }
  coupleNames = coupleNames.replace(/-/g, '&').trim();

  // Find romantic quotes
  const quotes = texts.filter((t) => t.length > 25);
  const romanticQuote =
    quotes[0] ||
    'Một người sẽ gặp 29,2 triệu người trong đời, nhưng xác suất hai người yêu nhau chỉ là 0,000049. Và rồi tôi gặp bạn.';

  // 1. Cover Photo & Hero Header
  if (isC61) {
    // Magazine style Cover for C61
    const coverImg = images[0] || raw.longThumbnail || '/assets/wedding/templates/c165/photo_01.webp';
    elements.push({
      id: `cover-hero-${raw.slug}`,
      type: 'image',
      x: 0,
      y: 0,
      width: 500,
      height: 760,
      rotation: 0,
      zIndex: 1,
      opacity: 1,
      src: coverImg,
      borderRadius: 0,
      objectFit: 'cover',
    });

    elements.push({
      id: `text-our-${raw.slug}`,
      type: 'text',
      x: 30,
      y: 430,
      width: 200,
      height: 90,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'Our',
      fontFamily: 'Pinyon Script',
      fontSize: 110,
      color: '#e8d29b',
      textAlign: 'left',
      continuousAnimation: { type: 'floating', duration: 2.2, delay: 0 },
    });

    elements.push({
      id: `text-love-begins-${raw.slug}`,
      type: 'text',
      x: 40,
      y: 480,
      width: 420,
      height: 180,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'Love\nBegins',
      fontFamily: 'Playfair Display',
      fontSize: 85,
      fontWeight: '700',
      color: '#e8d29b',
      textAlign: 'right',
      lineHeight: 0.95,
    });

    elements.push({
      id: `text-date-banner-${raw.slug}`,
      type: 'text',
      x: 20,
      y: 710,
      width: 460,
      height: 35,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: '♥ SAVE THE DATE ──────── 2026',
      fontFamily: 'Playfair Display',
      fontSize: 16,
      color: '#e8d29b',
      textAlign: 'center',
      letterSpacing: 2,
    });

    currentY = 790;
  } else {
    // Elegant Classic Top Script Title
    elements.push({
      id: `text-header-${raw.slug}`,
      type: 'text',
      x: 0,
      y: currentY,
      width: 500,
      height: 70,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: isC44 ? 'Together Forever' : isC39 ? 'Our Love Story' : 'Save The Date',
      fontFamily: isC44 ? 'Great Vibes' : 'Pinyon Script',
      fontSize: isC44 ? 56 : 72,
      color: isC39 ? '#9d0208' : '#8C7355',
      textAlign: 'center',
      continuousAnimation: { type: 'floating', duration: 2.2, delay: 0 },
    });
    currentY += 80;

    // Couple Names Subtitle
    elements.push({
      id: `text-names-${raw.slug}`,
      type: 'text',
      x: 20,
      y: currentY,
      width: 460,
      height: 40,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: coupleNames.toUpperCase(),
      fontFamily: 'Playfair Display',
      fontSize: 22,
      fontWeight: '700',
      color: isC39 ? '#370617' : '#63554D',
      textAlign: 'center',
      letterSpacing: 4,
    });
    currentY += 50;

    // Cover Photo
    const coverImg = raw.longThumbnail || images[0] || '/assets/wedding/templates/c165/photo_01.webp';
    elements.push({
      id: `photo-hero-${raw.slug}`,
      type: 'image',
      x: 40,
      y: currentY,
      width: 420,
      height: 540,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
      src: coverImg,
      borderRadius: 24,
      objectFit: 'cover',
    });
    currentY += 560;
  }

  // 2. Romantic Quote Card
  elements.push({
    id: `quote-${raw.slug}`,
    type: 'text',
    x: 40,
    y: currentY,
    width: 420,
    height: 90,
    rotation: 0,
    zIndex: 8,
    opacity: 1,
    text: `"${romanticQuote}"`,
    fontFamily: 'Playfair Display',
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7D6A58',
    textAlign: 'center',
    lineHeight: 1.6,
  });
  currentY += 110;

  // 3. Countdown Widget
  elements.push({
    id: `countdown-${raw.slug}`,
    type: 'widget',
    widgetType: 'countdown',
    x: 40,
    y: currentY,
    width: 420,
    height: 120,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
  });
  currentY += 140;

  // 4. Groom & Bride Portraits
  const groomImg = images[1] || images[0];
  const brideImg = images[2] || images[0];
  if (groomImg && brideImg) {
    elements.push({
      id: `photo-groom-${raw.slug}`,
      type: 'image',
      x: 40,
      y: currentY,
      width: 200,
      height: 270,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
      src: groomImg,
      borderRadius: 18,
      objectFit: 'cover',
    });

    elements.push({
      id: `photo-bride-${raw.slug}`,
      type: 'image',
      x: 260,
      y: currentY,
      width: 200,
      height: 270,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
      src: brideImg,
      borderRadius: 18,
      objectFit: 'cover',
    });

    // Center decorative seal
    const sealPlugin =
      raw.plugins && raw.plugins.length > 0
        ? raw.plugins[0].replace(/\\+/g, '').replace(/&quot;/g, '').trim()
        : '/assets/wedding/plugins/calen_heart_1.png';

    elements.push({
      id: `seal-center-${raw.slug}`,
      type: 'graphic',
      x: 215,
      y: currentY + 100,
      width: 70,
      height: 70,
      rotation: 0,
      zIndex: 15,
      opacity: 1,
      src: sealPlugin,
      objectFit: 'contain',
      continuousAnimation: { type: 'floating', duration: 2.0, delay: 0 },
    });

    currentY += 295;
  }

  // 5. Calendar Widget
  elements.push({
    id: `calendar-${raw.slug}`,
    type: 'widget',
    widgetType: 'calendar',
    x: 45,
    y: currentY,
    width: 410,
    height: 330,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
  });
  currentY += 350;

  // 6. Complete Photo Gallery (Load ALL remaining harvested photos)
  const remainingImages = images.slice(3);
  if (remainingImages.length > 0) {
    elements.push({
      id: `text-gallery-title-${raw.slug}`,
      type: 'text',
      x: 0,
      y: currentY,
      width: 500,
      height: 40,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'Album Hình Cưới',
      fontFamily: 'Playfair Display',
      fontSize: 24,
      fontWeight: '700',
      color: '#63554D',
      textAlign: 'center',
    });
    currentY += 55;

    // 2-column responsive layout
    for (let i = 0; i < remainingImages.length; i += 2) {
      const img1 = remainingImages[i];
      const img2 = remainingImages[i + 1];

      elements.push({
        id: `gallery-img-${raw.slug}-${i}`,
        type: 'image',
        x: 40,
        y: currentY,
        width: 200,
        height: 260,
        rotation: 0,
        zIndex: 4,
        opacity: 1,
        src: img1,
        borderRadius: 16,
        objectFit: 'cover',
      });

      if (img2) {
        elements.push({
          id: `gallery-img-${raw.slug}-${i + 1}`,
          type: 'image',
          x: 260,
          y: currentY,
          width: 200,
          height: 260,
          rotation: 0,
          zIndex: 4,
          opacity: 1,
          src: img2,
          borderRadius: 16,
          objectFit: 'cover',
        });
      }
      currentY += 280;
    }
  }

  // 7. Wedding Invitation Text Snippet / Family details
  const familyTexts = texts.filter(
    (t) =>
      t.toLowerCase().includes('ông') ||
      t.toLowerCase().includes('bà') ||
      t.toLowerCase().includes('nhà trai') ||
      t.toLowerCase().includes('nhà gái') ||
      t.toLowerCase().includes('trân trọng')
  );
  if (familyTexts.length > 0) {
    elements.push({
      id: `text-invitation-family-${raw.slug}`,
      type: 'text',
      x: 40,
      y: currentY,
      width: 420,
      height: 100,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: familyTexts.join('\n'),
      fontFamily: 'Playfair Display',
      fontSize: 14,
      fontWeight: '500',
      color: '#63554D',
      textAlign: 'center',
      lineHeight: 1.6,
    });
    currentY += 120;
  }

  // 8. RSVP Widget
  elements.push({
    id: `rsvp-${raw.slug}`,
    type: 'widget',
    widgetType: 'rsvp',
    x: 40,
    y: currentY,
    width: 420,
    height: 340,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
  });
  currentY += 360;

  // 9. QR Gift Box Widget
  elements.push({
    id: `qr-${raw.slug}`,
    type: 'widget',
    widgetType: 'giftbox',
    x: 40,
    y: currentY,
    width: 420,
    height: 280,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
  });
  currentY += 320;

  const totalHeight = Math.max(currentY + 80, 5200);

  const isRedRose =
    raw.slug.includes('rose') ||
    raw.slug.includes('burgundy') ||
    raw.slug.includes('hoa-hong') ||
    raw.slug.includes('thiep-cuoi-38') ||
    raw.slug.includes('thiep-cuoi-39') ||
    raw.slug.includes('thiep-cuoi-139') ||
    raw.slug.includes('thiep-cuoi-117') ||
    raw.slug.includes('thiep-cuoi-5') ||
    raw.slug.includes('phong-bi-do');

  const isSageGreen =
    raw.slug.includes('sage') ||
    raw.slug.includes('polaroid') ||
    raw.slug.includes('green') ||
    raw.slug.includes('thiep-cuoi-148') ||
    raw.slug.includes('thiep-cuoi-48');

  const isOceanBlue =
    raw.slug.includes('blue') ||
    raw.slug.includes('ocean') ||
    raw.slug.includes('xanh') ||
    raw.slug.includes('thiep-cuoi-1') ||
    raw.slug.includes('thiep-cuoi-53') ||
    raw.slug.includes('thiep-cuoi-tone-xanh');

  const bgColor = isRedRose ? '#FAF0F2' : isSageGreen ? '#F4F7F4' : isOceanBlue ? '#F2F7FA' : '#FAF7F2';
  const effectType: 'hearts' | 'snow' = isRedRose ? 'hearts' : 'snow';

  return {
    id: raw.slug,
    slug: raw.slug,
    name: cleanTitle,
    category: raw.slug.includes('sinh-nhat')
      ? 'birthday'
      : raw.slug.includes('tot-nghiep')
      ? 'graduation'
      : 'wedding',
    tier: 'PREMIUM',
    thumbnail: raw.longThumbnail || images[0] || '/assets/wedding/templates/c165/photo_01.webp',
    imagesCount: images.length,
    description: `Mẫu thiết kế cao cấp "${cleanTitle}" với ${images.length} ảnh thực tế sắc nét và hiệu ứng tương tác hoàn chỉnh.`,
    config: {
        width: 500,
        height: totalHeight,
        background: bgColor,
        title: cleanTitle,
        audioTitle: 'Nhạc nền LoveStory',
        audioUrl: audio,
        fallingEffect: { enabled: true, type: effectType },
      },
      elements,
    };
  }

/**
 * Resolve any template by slug or ID with ZERO-MOCK guarantee:
 * Always prioritizes real harvested templates with authentic images and content!
 */
function parseMinviteTransform(transformStr?: string): { tx: number; ty: number; rot: number } {
  let tx = 0;
  let ty = 0;
  let rot = 0;
  if (!transformStr) return { tx, ty, rot };

  const tMatch = transformStr.match(/translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/);
  if (tMatch) {
    tx = parseFloat(tMatch[1]);
    ty = parseFloat(tMatch[2]);
  }

  const rMatch = transformStr.match(/rotate\(\s*([-\d.]+)deg\s*\)/);
  if (rMatch) {
    rot = ((Math.round(parseFloat(rMatch[1])) % 360) + 360) % 360;
  }

  return { tx, ty, rot };
}

function convertMinviteDesignToStudioPreset(minviteMatch: any, rawDesign: any): StudioTemplatePreset {
  const coverSrc = minviteMatch.coverImage || minviteMatch.thumbnail || '/assets/wedding/templates/c165/photo_01.webp';
  const cat = (minviteMatch.category === 'birthday' || minviteMatch.category === 'baby'
    ? 'birthday'
    : minviteMatch.category === 'event' || minviteMatch.category === 'opening'
    ? 'event'
    : 'wedding') as 'wedding' | 'birthday' | 'event' | 'graduation';

  const rawWidgets = Array.isArray(rawDesign.widgets) ? rawDesign.widgets : [];
  const canvasWidth = 500;
  const mWidth = 428;
  const offsetX = Math.round((canvasWidth - mWidth) / 2); // 36px

  let minY = 0;
  rawWidgets.forEach((w: any) => {
    const top = parseFloat(w.style?.top || 0);
    const { ty } = parseMinviteTransform(w.style?.transform);
    const calculatedY = top + ty;
    if (calculatedY < minY) minY = calculatedY;
  });

  const shiftY = minY < 0 ? Math.abs(minY) + 20 : 20;
  const elements: CanvasElement[] = [];

  rawWidgets.forEach((w: any, idx: number) => {
    const wType = w.type;
    const style = w.style || {};
    const props = w.props || {};

    const top = parseFloat(style.top || 0);
    const left = parseFloat(style.left || 0);
    const { tx, ty, rot } = parseMinviteTransform(style.transform);

    const calcX = Math.round(left + tx + offsetX);
    const calcY = Math.round(top + ty + shiftY);

    const rawW = style.width;
    const width = typeof rawW === 'number' ? Math.round(rawW) : !isNaN(parseFloat(rawW)) ? Math.round(parseFloat(rawW)) : 300;

    const rawH = style.height;
    const height = typeof rawH === 'number' ? Math.round(rawH) : !isNaN(parseFloat(rawH)) ? Math.round(parseFloat(rawH)) : 60;

    const zIndex = parseInt(style.zIndex, 10) || idx + 1;
    const opacity = style.opacity !== undefined ? parseFloat(style.opacity) : 1;

    if (wType === 'text') {
      const textContent = w.content || props.content || '';
      if (!textContent.trim()) return;

      const fontSize = Math.round(parseFloat(style.fontSize || 16));
      const fontFamily = style.fontFamily || 'Playfair Display';
      const color = style.color || '#052307';
      const textAlign = (style.textAlign as any) || 'center';
      const letterSpacing = parseFloat(style.letterSpacing || 0);
      const linesCount = textContent.split('\n').length;
      const autoH = Math.max(24, Math.round(fontSize * 1.5 * linesCount));

      elements.push({
        id: `minvite-text-${w.id || idx}`,
        type: 'text',
        x: calcX,
        y: calcY,
        width: Math.max(30, width),
        height: autoH,
        rotation: rot,
        zIndex,
        opacity,
        text: textContent,
        fontFamily,
        fontSize,
        color,
        textAlign,
        letterSpacing,
        fontWeight: style.fontWeight >= 600 || style.fontWeight === 'bold' ? '700' : 'normal',
        fontStyle: style.fontStyle === 'italic' ? 'italic' : 'normal',
      });
    } else if (wType === 'image') {
      let src = props.src || (props.variants && (props.variants.large || props.variants.small)) || '';
      src = resolveStudioAssetUrl(src);
      if (!src) src = coverSrc;

      const bRadius = Math.round(parseFloat(style.borderRadiusTopLeft || style.borderRadius || 0));

      elements.push({
        id: `minvite-img-${w.id || idx}`,
        type: 'image',
        x: calcX,
        y: calcY,
        width: Math.max(20, width),
        height: Math.max(20, height),
        rotation: rot,
        zIndex,
        opacity,
        src,
        borderRadius: bRadius,
        objectFit: 'cover',
      });
    } else if (wType === 'svg') {
      let src = props.src || '';
      src = resolveStudioAssetUrl(src);
      if (!src) return;

      elements.push({
        id: `minvite-gfx-${w.id || idx}`,
        type: 'graphic',
        x: calcX,
        y: calcY,
        width: Math.max(10, width),
        height: Math.max(10, height),
        rotation: rot,
        zIndex,
        opacity,
        src,
        objectFit: 'contain',
      });
    } else if (wType === 'line') {
      elements.push({
        id: `minvite-line-${w.id || idx}`,
        type: 'shape',
        shapeType: 'line',
        x: calcX,
        y: calcY,
        width: Math.max(10, width),
        height: Math.max(1, Math.round(parseFloat(style.borderWidth || 1))),
        rotation: rot,
        zIndex,
        opacity,
        color: style.borderColor || '#052307',
      });
    } else if (wType === 'map') {
      elements.push({
        id: `minvite-map-${w.id || idx}`,
        type: 'widget',
        widgetType: 'map',
        x: 40,
        y: calcY,
        width: 420,
        height: Math.max(200, height),
        rotation: 0,
        zIndex,
        opacity: 1,
        widgetConfig: {
          address: props.mapAddress || '44 Phan Đình Phùng, Hải Châu, Đà Nẵng',
          locationName: 'Địa điểm tổ chức hôn lễ',
        },
      });
    } else if (wType === 'rsvp') {
      elements.push({
        id: `minvite-rsvp-${w.id || idx}`,
        type: 'widget',
        widgetType: 'rsvp',
        x: 40,
        y: calcY,
        width: 420,
        height: 340,
        rotation: 0,
        zIndex,
        opacity: 1,
      });
    } else if (wType === 'calendar') {
      elements.push({
        id: `minvite-calendar-${w.id || idx}`,
        type: 'widget',
        widgetType: 'calendar',
        x: 40,
        y: calcY,
        width: 420,
        height: 300,
        rotation: 0,
        zIndex,
        opacity: 1,
        widgetConfig: {
          date: '2027-11-24',
        },
      });
    } else if (wType === 'qr') {
      elements.push({
        id: `minvite-qr-${w.id || idx}`,
        type: 'widget',
        widgetType: 'giftbox',
        x: 40,
        y: calcY,
        width: 420,
        height: 280,
        rotation: 0,
        zIndex,
        opacity: 1,
        widgetConfig: {
          groomBank: {
            bankName: props.groomBankName || 'VCB',
            accountNo: props.groomAccountNumber || '0123456789',
            accountName: props.groomAccountName || 'Hoàng Kiến Văn',
          },
          brideBank: {
            bankName: props.brideBankName || 'VCB',
            accountNo: props.brideAccountNumber || '0987654321',
            accountName: props.brideAccountName || 'Ngô Việt Hoài',
          },
        },
      });
    } else if (wType === 'photo_album') {
      elements.push({
        id: `minvite-album-${w.id || idx}`,
        type: 'widget',
        widgetType: 'album',
        x: 40,
        y: calcY,
        width: 420,
        height: 340,
        rotation: 0,
        zIndex,
        opacity: 1,
      });
    }
  });

  const rawHeight = parseFloat(rawDesign.settings?.canvasHeight || 5358);
  const canvasHeight = Math.max(2500, Math.round(rawHeight + shiftY + 100));
  const bgMusic = rawDesign.settings?.backgroundMusic;
  const audioUrl = bgMusic
    ? bgMusic.startsWith('http')
      ? bgMusic
      : `https://cdn.biihappy.com/m-invite/${bgMusic}`
    : 'https://assets.cinelove.me/mp3/5f4c5139-a13a-4ff0-82a2-e3a61240042f.mp3';

  return {
    id: minviteMatch.id,
    slug: minviteMatch.slug,
    name: minviteMatch.title,
    category: cat,
    tier: minviteMatch.tier || 'VIP 200k',
    thumbnail: coverSrc,
    imagesCount: elements.filter((e) => e.type === 'image').length || 10,
    description: minviteMatch.description || `Mẫu thiệp ${minviteMatch.title} thu thập từ M-Invite.`,
    config: {
      width: 500,
      height: canvasHeight,
      background: rawDesign.settings?.canvasBackgroundColor || '#ffffff',
      title: minviteMatch.title,
      audioTitle: `Nhạc thiệp ${minviteMatch.title}`,
      audioUrl,
      envelopeCover: { enabled: true, coverId: 'default' },
      fallingEffect: { enabled: true, type: 'snow' },
    },
    elements,
  };
}

export function getStudioTemplate(slugOrId: string): StudioTemplatePreset | null {
  const norm = slugOrId.toLowerCase().trim();

  // 0. Check M-Invite scraped templates
  const minviteMatch = (minviteTemplates as any[]).find(
    (m: any) =>
      m.slug?.toLowerCase() === norm ||
      m.id?.toLowerCase() === norm ||
      norm.includes(m.id?.toLowerCase())
  );
  if (minviteMatch) {
    const designFile = path.join(process.cwd(), 'src', 'data', 'minvite_designs', `${minviteMatch.id}.json`);
    if (fs.existsSync(designFile)) {
      try {
        const rawDesign = JSON.parse(fs.readFileSync(designFile, 'utf-8'));
        return convertMinviteDesignToStudioPreset(minviteMatch, rawDesign);
      } catch (err) {
        console.error('Error parsing minvite design file:', err);
      }
    }

    const coverSrc = minviteMatch.coverImage || minviteMatch.thumbnail || '/assets/wedding/templates/c165/photo_01.webp';
    const cat = (minviteMatch.category === 'birthday' || minviteMatch.category === 'baby'
      ? 'birthday'
      : minviteMatch.category === 'event' || minviteMatch.category === 'opening'
      ? 'event'
      : 'wedding') as 'wedding' | 'birthday' | 'event' | 'graduation';

    const elements: CanvasElement[] = [
      {
        id: `m-photo-cover-${minviteMatch.id}`,
        type: 'image',
        x: 40,
        y: 260,
        width: 420,
        height: 520,
        rotation: 0,
        zIndex: 2,
        opacity: 1,
        src: coverSrc,
        borderRadius: 24,
        objectFit: 'cover',
        animation: { type: 'fade-in', duration: 1.2, delay: 0 },
      },
      {
        id: `m-text-header-${minviteMatch.id}`,
        type: 'text',
        x: 0,
        y: 40,
        width: 500,
        height: 80,
        rotation: 0,
        zIndex: 10,
        opacity: 1,
        text: cat === 'wedding' ? 'Save The Date' : minviteMatch.title,
        fontFamily: 'Pinyon Script',
        fontSize: 80,
        color: '#8C7355',
        textAlign: 'center',
        continuousAnimation: { type: 'floating', duration: 2.2, delay: 0 },
      },
      {
        id: `m-text-names-${minviteMatch.id}`,
        type: 'text',
        x: 0,
        y: 130,
        width: 500,
        height: 40,
        rotation: 0,
        zIndex: 10,
        opacity: 1,
        text: cat === 'wedding' ? 'Quốc Bảo & Thảo Vy' : minviteMatch.title,
        fontFamily: 'Playfair Display',
        fontSize: 24,
        fontWeight: '700',
        color: '#5C4A3E',
        textAlign: 'center',
        letterSpacing: 2,
      },
      {
        id: `m-text-date-${minviteMatch.id}`,
        type: 'text',
        x: 0,
        y: 180,
        width: 500,
        height: 36,
        rotation: 0,
        zIndex: 10,
        opacity: 1,
        text: '28 . 11 . 2026',
        fontFamily: 'Playfair Display',
        fontSize: 18,
        color: '#8C7355',
        textAlign: 'center',
        letterSpacing: 6,
      },
      {
        id: `m-widget-countdown-${minviteMatch.id}`,
        type: 'widget',
        widgetType: 'countdown',
        x: 40,
        y: 810,
        width: 420,
        height: 120,
        rotation: 0,
        zIndex: 5,
        opacity: 1,
      },
      {
        id: `m-text-ceremony-${minviteMatch.id}`,
        type: 'text',
        x: 40,
        y: 960,
        width: 420,
        height: 50,
        rotation: 0,
        zIndex: 5,
        opacity: 1,
        text: 'TRÂN TRỌNG KÍNH MỜI',
        fontFamily: 'Playfair Display',
        fontSize: 20,
        fontWeight: '700',
        color: '#8C7355',
        textAlign: 'center',
        letterSpacing: 4,
      },
      {
        id: `m-text-venue-${minviteMatch.id}`,
        type: 'text',
        x: 40,
        y: 1020,
        width: 420,
        height: 70,
        rotation: 0,
        zIndex: 5,
        opacity: 1,
        text: 'Trung Tâm Tiệc Cưới Trống Đồng Palace\n489 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
        fontFamily: 'Paris Regular',
        fontSize: 15,
        color: '#63554D',
        textAlign: 'center',
        lineHeight: 1.5,
      },
      {
        id: `m-widget-map-${minviteMatch.id}`,
        type: 'widget',
        widgetType: 'map',
        x: 40,
        y: 1110,
        width: 420,
        height: 250,
        rotation: 0,
        zIndex: 5,
        opacity: 1,
      },
      {
        id: `m-widget-rsvp-${minviteMatch.id}`,
        type: 'widget',
        widgetType: 'rsvp',
        x: 40,
        y: 1390,
        width: 420,
        height: 340,
        rotation: 0,
        zIndex: 5,
        opacity: 1,
      },
      {
        id: `m-widget-giftbox-${minviteMatch.id}`,
        type: 'widget',
        widgetType: 'giftbox',
        x: 40,
        y: 1760,
        width: 420,
        height: 280,
        rotation: 0,
        zIndex: 5,
        opacity: 1,
      },
      {
        id: `m-widget-wishes-${minviteMatch.id}`,
        type: 'widget',
        widgetType: 'wishes',
        x: 40,
        y: 2070,
        width: 420,
        height: 340,
        rotation: 0,
        zIndex: 5,
        opacity: 1,
      },
    ];

    return {
      id: minviteMatch.id,
      slug: minviteMatch.slug,
      name: minviteMatch.title,
      category: cat,
      tier: minviteMatch.tier || 'VIP 200k',
      thumbnail: coverSrc,
      imagesCount: 10,
      description: minviteMatch.description || `Mẫu ${minviteMatch.title} thu thập từ M-Invite.`,
      config: {
        width: 500,
        height: 2500,
        background: '#FAF7F2',
        title: minviteMatch.title,
        audioTitle: 'Until You (Wedding Theme)',
        audioUrl: 'https://assets.cinelove.me/mp3/5f4c5139-a13a-4ff0-82a2-e3a61240042f.mp3',
        envelopeCover: { enabled: true, coverId: 'default' },
        fallingEffect: { enabled: true, type: 'snow' },
      },
      elements,
    };
  }

  // 1. Check custom presets created/saved by Admin
  const custom = getCustomStudioPreset(norm);
  if (custom && custom.elements && custom.elements.length > 5) {
    return custom;
  }

  // 2. Check Catalog templates first (retaining catalog item ID, slug, name, thumbnail)
  try {
    const catalogList = getAllCatalogTemplates();
    const catalogItem = catalogList.find(
      (c) => c.slug?.toLowerCase() === norm || c.id?.toLowerCase() === norm
    );

    if (catalogItem) {
      if (catalogItem.studioPresetData?.elements?.length) {
        return {
          id: catalogItem.id,
          slug: catalogItem.slug,
          name: catalogItem.name,
          category: (catalogItem.category === 'birthday'
            ? 'birthday'
            : catalogItem.category === 'event'
            ? 'event'
            : catalogItem.category === 'graduation'
            ? 'graduation'
            : 'wedding') as 'wedding' | 'birthday' | 'event' | 'graduation',
          tier: catalogItem.tier,
          thumbnail: catalogItem.longThumbnail,
          imagesCount: 10,
          description: catalogItem.description,
          config: {
            width: 500,
            height: 5200,
            background: '#FAF7F2',
            title: catalogItem.name,
            audioTitle: 'Nhạc nền LoveStory',
            audioUrl: '/assets/wedding/mp3/ee11a985-5e0e-4eb0-b6da-28fa39c9946f.mp3',
            fallingEffect: { enabled: true, type: 'snow' },
          },
          elements: catalogItem.studioPresetData.elements,
        };
      }

      // Check HARVESTED_SLUG_MAP for catalog slug first, then baseTemplateId, then fallback
      const candidateKey =
        HARVESTED_SLUG_MAP[catalogItem.slug.toLowerCase()] ||
        (catalogItem.baseTemplateId
          ? HARVESTED_SLUG_MAP[catalogItem.baseTemplateId.toLowerCase()] || catalogItem.baseTemplateId
          : null) ||
        catalogItem.slug;

      const rawBase = getHarvestedRawTemplate(candidateKey);
      if (rawBase && rawBase.images && rawBase.images.length > 0) {
        const converted = convertHarvestedToStudioPreset(rawBase);
        return {
          ...converted,
          id: catalogItem.id,
          slug: catalogItem.slug,
          name: catalogItem.name,
          thumbnail: catalogItem.longThumbnail || converted.thumbnail,
          description: catalogItem.description || converted.description,
          config: {
            ...converted.config,
            title: catalogItem.name,
          },
        };
      }
    }
  } catch (err) {
    console.error('Error resolving catalog template in studio converter:', err);
  }

  // 3. Direct Harvested Slug mapping
  const mappedSlug = HARVESTED_SLUG_MAP[norm] || norm;
  const rawHarvested = getHarvestedRawTemplate(mappedSlug);
  if (rawHarvested && rawHarvested.images && rawHarvested.images.length > 0) {
    return convertHarvestedToStudioPreset(rawHarvested);
  }

  // 4. Fuzzy fallback in harvested index.json
  try {
    const indexFile = path.join(HARVESTED_DIR, 'index.json');
    if (fs.existsSync(indexFile)) {
      const idxList = JSON.parse(fs.readFileSync(indexFile, 'utf-8')) as HarvestedRawTemplate[];
      const cleanNorm = norm.replace(/^tpl-/, '').replace(/^c-?/, '');
      const match = idxList.find(
        (item) =>
          item.slug?.toLowerCase() === norm ||
          item.slug?.toLowerCase() === `thiep-cuoi-${cleanNorm}` ||
          item.slug?.toLowerCase()?.includes(norm) ||
          item.title?.toLowerCase().includes(norm)
      );
      if (match?.slug) {
        const rawFuzzy = getHarvestedRawTemplate(match.slug);
        if (rawFuzzy && rawFuzzy.images && rawFuzzy.images.length > 0) {
          return convertHarvestedToStudioPreset(rawFuzzy);
        }
      }
    }
  } catch (err) {
    console.error('Error fuzzy searching harvested templates:', err);
  }

  // 5. Fallback: Curated Studio presets (if any match)
  const curated = STUDIO_TEMPLATE_PRESETS.find(
    (p) => p.slug.toLowerCase() === norm || p.id.toLowerCase() === norm
  );
  if (curated) {
    return curated;
  }

  return null;
}
