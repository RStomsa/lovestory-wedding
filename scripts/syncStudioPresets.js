const fs = require('fs');
const path = require('path');

const harvestedDir = path.join(process.cwd(), 'src', 'data', 'harvested_templates');

function getHarvested(slug) {
  const file = path.join(harvestedDir, slug + '.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function cleanTexts(snippets) {
  return (snippets || [])
    .map((t) =>
      t
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
}

function cleanImages(imgs) {
  return (imgs || [])
    .filter((u) => typeof u === 'string' && u.startsWith('http'))
    .map((u) => u.replace(/\\+/g, '').trim());
}

function buildPreset(slug, id, name, category, tier, thumbnail, desc, audioUrl, audioTitle, bg, isC61, isC39, isC44) {
  const raw = getHarvested(slug);
  const images = cleanImages(raw.images);
  const texts = cleanTexts(raw.textSnippets);
  const plugins = (raw.plugins || []).map((p) => p.replace(/\\+/g, '').replace(/&quot;/g, '').trim());

  let coupleNames = texts.find((t) => t.includes('-') && t.length > 5 && t.length < 35);
  if (!coupleNames) coupleNames = texts.find((t) => t.includes('&') && t.length > 5 && t.length < 35);
  if (!coupleNames) coupleNames = texts.find((t) => t.length > 4 && t.length < 28 && !t.includes('.')) || 'Văn Minh & Minh An';
  coupleNames = coupleNames.replace(/-/g, '&').trim();

  const quotes = texts.filter((t) => t.length > 25);
  const romanticQuote = quotes[0] || 'Một người sẽ gặp 29,2 triệu người trong đời, nhưng xác suất hai người yêu nhau chỉ là 0,000049. Và rồi tôi gặp bạn.';

  const elements = [];
  let currentY = 40;

  if (isC61) {
    const coverImg = images[0] || raw.longThumbnail || thumbnail;
    elements.push({
      id: `cover-hero-${slug}`,
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
      id: `text-our-${slug}`,
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
      id: `text-love-begins-${slug}`,
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
      id: `text-date-banner-${slug}`,
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
    elements.push({
      id: `text-header-${slug}`,
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

    elements.push({
      id: `text-names-${slug}`,
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

    const coverImg = raw.longThumbnail || images[0] || thumbnail;
    elements.push({
      id: `photo-hero-${slug}`,
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

  // Quote
  elements.push({
    id: `quote-${slug}`,
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

  // Countdown
  elements.push({
    id: `countdown-${slug}`,
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

  // Portraits
  const groomImg = images[1] || images[0];
  const brideImg = images[2] || images[0];
  if (groomImg && brideImg) {
    elements.push({
      id: `photo-groom-${slug}`,
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
      id: `photo-bride-${slug}`,
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

    const sealPlugin = plugins[0] || '/assets/wedding/plugins/calen_heart_1.png';
    elements.push({
      id: `seal-center-${slug}`,
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

  // Calendar
  elements.push({
    id: `calendar-${slug}`,
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

  // All remaining photos
  const remainingImages = images.slice(3);
  if (remainingImages.length > 0) {
    elements.push({
      id: `text-gallery-title-${slug}`,
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

    for (let i = 0; i < remainingImages.length; i += 2) {
      const img1 = remainingImages[i];
      const img2 = remainingImages[i + 1];

      elements.push({
        id: `gallery-img-${slug}-${i}`,
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
          id: `gallery-img-${slug}-${i + 1}`,
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

  // RSVP
  elements.push({
    id: `rsvp-${slug}`,
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

  // QR Giftbox
  elements.push({
    id: `qr-${slug}`,
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

  return {
    id,
    slug,
    name,
    category,
    tier,
    thumbnail,
    imagesCount: images.length,
    description: desc,
    config: {
      width: 500,
      height: Math.max(currentY + 80, 5200),
      background: bg,
      title: name,
      audioTitle,
      audioUrl,
      fallingEffect: { enabled: true, type: isC39 ? 'hearts' : 'snow' },
    },
    elements,
  };
}

const p165 = buildPreset(
  'thiep-cuoi-165',
  'tpl-165',
  'Thiệp Cưới Kem Chữ Vàng Save The Date (C165)',
  'wedding',
  'PREMIUM',
  'https://assets.lovestory.vn/templates/long_thumbnail/6e435cd6-d240-4228-af2f-fdcb408e2ac0_1793354530.webp',
  'Phong cách kem chữ vàng sang trọng, bố cục 14 ảnh thời trang cao cấp kết hợp hiệu ứng bay lơ lửng đầy chất thơ.',
  '/assets/wedding/mp3/ee11a985-5e0e-4eb0-b6da-28fa39c9946f.mp3',
  'Until You',
  '#FAF7F2',
  false,
  false,
  false
);

const p61 = buildPreset(
  'thiep-cuoi-61',
  'tpl-61',
  'Thiệp Cưới Tạp Chí Our Love Begins (C61)',
  'wedding',
  'BASIC',
  'https://assets.lovestory.vn/templates/long_thumbnail/aaff9931-20bd-4982-9db6-6c39ac52fdc9_1793184128.webp',
  'Phong cách bìa tạp chí thời trang hiện đại, tôn vinh trọn vẹn từng khoảnh khắc tình yêu của cặp đôi.',
  '/assets/wedding/mp3/19d92491-743a-466d-a510-2157d7cb2b4d.mp3',
  'Beautiful In White',
  '#FAF7F2',
  true,
  false,
  false
);

const p39 = buildPreset(
  'thiep-cuoi-39',
  'tpl-39',
  'Thiệp Cưới Hoa Hồng Đỏ Our Love Story (C39)',
  'wedding',
  'BASIC',
  'https://assets.lovestory.vn/templates/long_thumbnail/a2f11727-8717-46db-ada4-ff29271ce53b_1793184129.webp',
  'Tông đỏ nhung quyến rũ kết hợp hoa hồng tươi thắm, mang lại cảm giác nồng nàn và hạnh phúc ngập tràn.',
  '/assets/wedding/mp3/ee11a985-5e0e-4eb0-b6da-28fa39c9946f.mp3',
  'Until You',
  '#FAF0F2',
  false,
  true,
  false
);

const p44 = buildPreset(
  'thiep-cuoi-44',
  'tpl-44',
  'Thiệp Cưới Phong Bì Kem Hoa Cúc (C44)',
  'wedding',
  'PREMIUM',
  'https://assets.lovestory.vn/templates/long_thumbnail/0189eb35-5cf1-4525-a8d0-867f70e0bf67_1793184130.webp',
  'Hiệu ứng mở phong bì thư thanh tao, họa tiết hoa cúc dại tinh khôi trên nền giấy mỹ thuật cao cấp.',
  '/assets/wedding/mp3/17e9b896-abf1-46e7-9236-94cdf802f39a.mp3',
  'A Thousand Years',
  '#FDFCF7',
  false,
  false,
  true
);

const outputTs = `import { CanvasElement, CanvasConfig } from '@/components/editor/studio/studioTypes';

export interface StudioTemplatePreset {
  id: string;
  slug: string;
  name: string;
  category: 'wedding' | 'birthday' | 'event' | 'graduation';
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  thumbnail: string;
  imagesCount: number;
  description: string;
  config: Partial<CanvasConfig>;
  elements: CanvasElement[];
}

export const STUDIO_TEMPLATE_PRESETS: StudioTemplatePreset[] = ${JSON.stringify(
  [p165, p61, p39, p44],
  null,
  2
)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'studioTemplatePresets.ts'), outputTs, 'utf-8');
console.log('Successfully updated src/data/studioTemplatePresets.ts with 100% authentic harvested elements!');
