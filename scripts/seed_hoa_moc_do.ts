import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma';
import { StudioTemplatePreset } from '../src/data/studioTemplatePresets';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CUSTOM_PRESETS_FILE = path.join(DATA_DIR, 'customStudioPresets.json');
const CUSTOM_TEMPLATES_FILE = path.join(DATA_DIR, 'customTemplates.json');

const preset: StudioTemplatePreset = {
  id: 'thiep-cuoi-hoa-moc-do-027',
  slug: 'thiep-cuoi-hoa-moc-do-027',
  name: '027 - Hoa Mộc Đỏ & Dấu Sáp Hoàng Gia',
  category: 'wedding',
  tier: 'PREMIUM',
  thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  imagesCount: 3,
  description: 'Phong cách Burgundy mộc đỏ kết hợp nền kem ấm áp, điểm xuyết con dấu sáp hoàng gia dập nổi và nơ lụa cổ điển.',
  config: {
    width: 500,
    height: 3100,
    background: '#FAF6F0',
    title: '027 - Hoa Mộc Đỏ & Dấu Sáp Hoàng Gia',
    audioTitle: 'Until You - Wedding Acoustic',
    audioUrl: '/assets/wedding/mp3/ee11a985-5e0e-4eb0-b6da-28fa39c9946f.mp3',
    fallingEffect: { enabled: true, type: 'petals' },
  },
  elements: [
    // 1. Left deep burgundy side border
    {
      id: 'border-left-burgundy',
      type: 'shape',
      shapeType: 'rectangle',
      x: 0,
      y: 0,
      width: 22,
      height: 3100,
      fillColor: '#701026',
      rotation: 0,
      zIndex: 10,
      opacity: 1,
    },
    // 2. Right deep burgundy side border
    {
      id: 'border-right-burgundy',
      type: 'shape',
      shapeType: 'rectangle',
      x: 478,
      y: 0,
      width: 22,
      height: 3100,
      fillColor: '#701026',
      rotation: 0,
      zIndex: 10,
      opacity: 1,
    },
    // 3. Top Botanical Floral border
    {
      id: 'top-floral-border',
      type: 'graphic',
      src: 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 300 75\'><defs><linearGradient id=\'leafGrad\' x1=\'0%\' y1=\'0%\' x2=\'100%\' y2=\'0%\'><stop offset=\'0%\' stop-color=\'%23881337\'/><stop offset=\'50%\' stop-color=\'%239f1239\'/><stop offset=\'100%\' stop-color=\'%234c0519\'/></linearGradient></defs><path d=\'M10 38 Q80 18 150 38 T290 38\' fill=\'none\' stroke=\'url(%23leafGrad)\' stroke-width=\'2.5\' stroke-linecap=\'round\'/><g fill=\'%23fff1f2\' stroke=\'%23881337\' stroke-width=\'1.2\'><circle cx=\'50\' cy=\'35\' r=\'10\'/><circle cx=\'150\' cy=\'38\' r=\'12\'/><circle cx=\'250\' cy=\'35\' r=\'10\'/><circle cx=\'50\' cy=\'35\' r=\'3\' fill=\'%23f59e0b\'/><circle cx=\'150\' cy=\'38\' r=\'3.5\' fill=\'%23f59e0b\'/><circle cx=\'250\' cy=\'35\' r=\'3\' fill=\'%23f59e0b\'/></g><path d=\'M35 32 C25 24 18 30 25 38 C32 36 34 33 35 32 Z\' fill=\'%23881337\'/><path d=\'M65 32 C75 24 82 30 75 38 C68 36 66 33 65 32 Z\' fill=\'%23881337\'/><path d=\'M135 32 C125 22 115 28 125 38 Z\' fill=\'%23881337\'/><path d=\'M165 32 C175 22 185 28 175 38 Z\' fill=\'%23881337\'/><path d=\'M235 32 C225 24 218 30 225 38 Z\' fill=\'%23881337\'/><path d=\'M265 32 C275 24 282 30 275 38 Z\' fill=\'%23881337\'/></svg>',
      x: 50,
      y: 40,
      width: 400,
      height: 90,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
    },
    // 4. Royal Burgundy Wax Seal Stamp with Olive Leaves
    {
      id: 'wax-seal-top',
      type: 'graphic',
      src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><radialGradient id='waxGrad' cx='40%' cy='35%' r='65%'><stop offset='0%' stop-color='%23b91c1c'/><stop offset='45%' stop-color='%23881337'/><stop offset='85%' stop-color='%234c0519'/><stop offset='100%' stop-color='%2327030d'/></radialGradient><radialGradient id='innerGrad' cx='35%' cy='35%' r='55%'><stop offset='0%' stop-color='%239f1239'/><stop offset='70%' stop-color='%235f0822'/><stop offset='100%' stop-color='%23360413'/></radialGradient></defs><path d='M60 8 C72 6 82 12 91 19 C101 27 110 39 112 52 C114 66 108 79 101 90 C93 101 81 109 68 112 C54 114 40 110 29 102 C18 94 10 82 8 68 C6 54 11 41 20 30 C29 19 45 10 60 8 Z' fill='url(%23waxGrad)'/><circle cx='60' cy='60' r='42' fill='url(%23innerGrad)' stroke='%23fda4af' stroke-opacity='0.25' stroke-width='2.5'/><g fill='none' stroke='%23fecdd3' stroke-linecap='round' stroke-linejoin='round'><path d='M42 82 C48 70 56 50 78 38' stroke-width='3'/><path d='M50 70 C44 67 43 60 48 57 C53 54 56 61 50 70 Z' fill='%23fecdd3' stroke-width='1'/><path d='M58 60 C64 57 66 50 61 47 C56 44 53 51 58 60 Z' fill='%23fecdd3' stroke-width='1'/><path d='M68 40 C75 38 77 31 72 28 C67 25 64 32 68 40 Z' fill='%23fecdd3' stroke-width='1'/></g></svg>",
      x: 195,
      y: 135,
      width: 110,
      height: 110,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
    },
    // 5. Header Title
    {
      id: 'txt-save-the-date',
      type: 'text',
      text: 'SAVE OUR DATE',
      fontFamily: 'Cinzel Decorative',
      fontSize: 14,
      fontWeight: 'bold',
      color: '#881337',
      letterSpacing: 4,
      textAlign: 'center',
      x: 50,
      y: 260,
      width: 400,
      height: 28,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    // 6. Bride & Groom names
    {
      id: 'txt-names-couple',
      type: 'text',
      text: 'Hoàng Long & Mai Chi',
      fontFamily: 'Great Vibes',
      fontSize: 48,
      fontWeight: 'normal',
      color: '#6e1124',
      textAlign: 'center',
      x: 40,
      y: 295,
      width: 420,
      height: 70,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    // 7. Wedding date
    {
      id: 'txt-wedding-date',
      type: 'text',
      text: '28 . 11 . 2026',
      fontFamily: 'Playfair Display',
      fontSize: 22,
      fontWeight: 'bold',
      color: '#292524',
      letterSpacing: 3,
      textAlign: 'center',
      x: 50,
      y: 370,
      width: 400,
      height: 32,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    // 8. Main Photo
    {
      id: 'photo-main-couple',
      type: 'image',
      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      x: 45,
      y: 425,
      width: 410,
      height: 520,
      borderRadius: 24,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
    },
    // 9. Middle silk ribbon bow
    {
      id: 'ribbon-bow-middle',
      type: 'graphic',
      src: 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 160 120\'><defs><linearGradient id=\'bowGrad\' x1=\'0%\' y1=\'0%\' x2=\'100%\' y2=\'100%\'><stop offset=\'0%\' stop-color=\'%23be123c\'/><stop offset=\'50%\' stop-color=\'%23881337\'/><stop offset=\'100%\' stop-color=\'%234c0519\'/></linearGradient></defs><g><path d=\'M75 52 C50 35 15 32 20 62 C24 82 58 66 75 56 Z\' fill=\'url(%23bowGrad)\'/><path d=\'M85 52 C110 35 145 32 140 62 C136 82 102 66 85 56 Z\' fill=\'url(%23bowGrad)\'/><path d=\'M72 58 C65 80 40 108 30 115 C45 110 70 88 78 60 Z\' fill=\'%239f1239\'/><path d=\'M88 58 C95 80 120 108 130 115 C115 110 90 88 82 60 Z\' fill=\'%239f1239\'/><ellipse cx=\'80\' cy=\'55\' rx=\'10\' ry=\'12\' fill=\'%23e11d48\'/></g></svg>',
      x: 175,
      y: 965,
      width: 150,
      height: 100,
      rotation: 0,
      zIndex: 4,
      opacity: 1,
    },
    // 10. Invitation Poem
    {
      id: 'txt-poem-quote',
      type: 'text',
      text: '“Gặp gỡ là duyên phận, bên nhau là sự lựa chọn. Chúng mình trân trọng kính mời bạn đến chung vui trong ngày trọng đại nhất!”',
      fontFamily: 'Cormorant Garamond',
      fontSize: 18,
      fontStyle: 'italic',
      color: '#57534e',
      textAlign: 'center',
      lineHeight: 1.5,
      x: 50,
      y: 1075,
      width: 400,
      height: 80,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    // 11. Ceremony Details Card
    {
      id: 'card-ceremony-bg',
      type: 'shape',
      shapeType: 'rectangle',
      x: 45,
      y: 1180,
      width: 410,
      height: 260,
      fillColor: '#FFFFFF',
      borderRadius: 20,
      rotation: 0,
      zIndex: 2,
      opacity: 0.95,
    },
    {
      id: 'txt-ceremony-title',
      type: 'text',
      text: 'TIỆC CƯỚI & LỄ THÀNH HÔN',
      fontFamily: 'Cinzel Decorative',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#881337',
      textAlign: 'center',
      x: 50,
      y: 1205,
      width: 400,
      height: 30,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    {
      id: 'txt-ceremony-details',
      type: 'text',
      text: 'Vào lúc 11:30 | Thứ Bảy, ngày 28/11/2026\n(Nhằm ngày 20 tháng 10 năm Bính Ngọ)\n\nTrung tâm Hội nghị Tiệc cưới Trống Đồng Palace\nSố 489 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
      fontFamily: 'Montserrat',
      fontSize: 13,
      color: '#292524',
      textAlign: 'center',
      lineHeight: 1.6,
      x: 55,
      y: 1245,
      width: 390,
      height: 120,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    // 12. Countdown Widget
    {
      id: 'widget-countdown-main',
      type: 'widget',
      widgetType: 'countdown',
      x: 45,
      y: 1470,
      width: 410,
      height: 140,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    // 13. Gallery Photos
    {
      id: 'photo-gallery-1',
      type: 'image',
      src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      x: 45,
      y: 1640,
      width: 195,
      height: 270,
      borderRadius: 16,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
    },
    {
      id: 'photo-gallery-2',
      type: 'image',
      src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      x: 260,
      y: 1640,
      width: 195,
      height: 270,
      borderRadius: 16,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
    },
    // 14. Gold Wax Seal Stamp
    {
      id: 'wax-seal-rings-middle',
      type: 'graphic',
      src: 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 120\'><defs><radialGradient id=\'goldWax\' cx=\'38%\' cy=\'35%\' r=\'65%\'><stop offset=\'0%\' stop-color=\'%23fef08a\'/><stop offset=\'25%\' stop-color=\'%23eab308\'/><stop offset=\'65%\' stop-color=\'%23a16207\'/><stop offset=\'95%\' stop-color=\'%23713f12\'/></radialGradient></defs><path d=\'M58 7 C73 5 85 13 94 21 C103 30 112 43 113 57 C114 71 107 83 98 93 C89 103 76 111 62 113 C47 114 34 109 23 99 C13 90 7 77 7 62 C7 48 14 35 24 24 C34 14 46 8 58 7 Z\' fill=\'url(%23goldWax)\'/><circle cx=\'60\' cy=\'60\' r=\'42\' fill=\'%23ca8a04\' stroke=\'%23fef08a\' stroke-width=\'2\'/><g stroke=\'%23fef9c3\' fill=\'none\' stroke-width=\'3\'><circle cx=\'52\' cy=\'60\' r=\'14\'/><circle cx=\'68\' cy=\'60\' r=\'14\'/></g></svg>',
      x: 195,
      y: 1935,
      width: 110,
      height: 110,
      rotation: 0,
      zIndex: 4,
      opacity: 1,
    },
    // 15. RSVP Widget
    {
      id: 'widget-rsvp-box',
      type: 'widget',
      widgetType: 'rsvp',
      x: 45,
      y: 2070,
      width: 410,
      height: 290,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    // 16. Giftbox Widget
    {
      id: 'widget-giftbox-box',
      type: 'widget',
      widgetType: 'giftbox',
      x: 45,
      y: 2390,
      width: 410,
      height: 310,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
    // 17. Thank you message
    {
      id: 'txt-thank-you',
      type: 'text',
      text: 'Rất Hân Hạnh Được Đón Tiếp Quý Khách!',
      fontFamily: 'Great Vibes',
      fontSize: 34,
      fontWeight: 'normal',
      color: '#6e1124',
      textAlign: 'center',
      x: 50,
      y: 2750,
      width: 400,
      height: 60,
      rotation: 0,
      zIndex: 3,
      opacity: 1,
    },
  ],
};

async function main() {
  console.log('Seeding 027 - Hoa Mộc Đỏ & Dấu Sáp Hoàng Gia...');

  // 1. Update customStudioPresets.json
  let presets: StudioTemplatePreset[] = [];
  if (fs.existsSync(CUSTOM_PRESETS_FILE)) {
    presets = JSON.parse(fs.readFileSync(CUSTOM_PRESETS_FILE, 'utf-8'));
  }
  const idx = presets.findIndex((p) => p.slug === preset.slug);
  if (idx >= 0) {
    presets[idx] = preset;
  } else {
    presets.unshift(preset);
  }
  fs.writeFileSync(CUSTOM_PRESETS_FILE, JSON.stringify(presets, null, 2), 'utf-8');
  console.log('✓ Saved to customStudioPresets.json');

  // 2. Update customTemplates.json
  let customTemplates: any[] = [];
  if (fs.existsSync(CUSTOM_TEMPLATES_FILE)) {
    customTemplates = JSON.parse(fs.readFileSync(CUSTOM_TEMPLATES_FILE, 'utf-8'));
  }
  const catIdx = customTemplates.findIndex((t) => t.id === preset.slug || t.slug === preset.slug);
  const catalogEntry = {
    id: preset.slug,
    name: preset.name,
    slug: preset.slug,
    category: preset.category,
    tier: preset.tier,
    price: 30000,
    badge: 'Hot VIP',
    longThumbnail: preset.thumbnail,
    baseTemplateId: preset.slug,
    description: preset.description,
    isCustom: true,
    views: 0,
    likes: 0,
  };
  if (catIdx >= 0) {
    customTemplates[catIdx] = catalogEntry;
  } else {
    customTemplates.unshift(catalogEntry);
  }
  fs.writeFileSync(CUSTOM_TEMPLATES_FILE, JSON.stringify(customTemplates, null, 2), 'utf-8');
  console.log('✓ Saved to customTemplates.json');

  // 3. Upsert into Prisma SQLite Database Template table
  await prisma.template.upsert({
    where: { id: preset.slug },
    update: {
      name: preset.name,
      description: preset.description,
      tier: 'VIP',
      price: 30000,
      badge: 'Hot VIP',
      thumbnail: preset.thumbnail,
      isActive: true,
    },
    create: {
      id: preset.slug,
      name: preset.name,
      slug: preset.slug,
      description: preset.description,
      tier: 'VIP',
      price: 30000,
      badge: 'Hot VIP',
      thumbnail: preset.thumbnail,
      isActive: true,
      displayOrder: 0,
    },
  });
  console.log('✓ Upserted to Prisma SQLite Template DB!');
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
