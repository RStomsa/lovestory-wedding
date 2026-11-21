export interface StudioFont {
  id: string;
  name: string;
  family: string;
  googleFont: string;
  desc: string;
  category: 'script' | 'serif' | 'sans';
  fileUrl?: string;
  isCustom?: boolean;
}

export const STUDIO_FONTS: StudioFont[] = [
  {
    id: 'paris-regular',
    name: 'Paris Regular',
    family: "'Parisienne', 'Paris Regular', cursive, serif",
    googleFont: 'Parisienne',
    desc: 'Mềm mại thanh lịch quý phái',
    category: 'script',
  },
  {
    id: 'pinyon-script',
    name: 'Pinyon Script',
    family: "'Pinyon Script', cursive, serif",
    googleFont: 'Pinyon+Script',
    desc: 'Cổ điển hoàng gia sang trọng',
    category: 'script',
  },
  {
    id: 'great-vibes',
    name: 'Great Vibes',
    family: "'Great Vibes', cursive, serif",
    googleFont: 'Great+Vibes',
    desc: 'Lãng mạn bay bổng',
    category: 'script',
  },
  {
    id: 'alex-brush',
    name: 'Alex Brush',
    family: "'Alex Brush', cursive, serif",
    googleFont: 'Alex+Brush',
    desc: 'Nét cọ tự nhiên phóng khoáng',
    category: 'script',
  },
  {
    id: 'chillatos',
    name: 'Chillatos',
    family: "'Alex Brush', 'Chillatos', cursive, serif",
    googleFont: 'Alex+Brush',
    desc: 'Thư pháp nghệ thuật',
    category: 'script',
  },
  {
    id: 'edwardian',
    name: 'Edwardian',
    family: "'Great Vibes', 'EdwardianKT', cursive, serif",
    googleFont: 'Great+Vibes',
    desc: 'Uốn lượn phong cách Châu Âu',
    category: 'script',
  },
  {
    id: 'allura',
    name: 'Allura',
    family: "'Allura', cursive, serif",
    googleFont: 'Allura',
    desc: 'Nhẹ nhàng duyên dáng',
    category: 'script',
  },
  {
    id: 'monte-carlo',
    name: 'MonteCarlo',
    family: "'MonteCarlo', cursive, serif",
    googleFont: 'MonteCarlo',
    desc: 'Cổ tích trang trọng',
    category: 'script',
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    family: "'Dancing Script', cursive, serif",
    googleFont: 'Dancing+Script:wght@500;700',
    desc: 'Trẻ trung tươi vui',
    category: 'script',
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    googleFont: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400',
    desc: 'Serif hiện đại tinh tế',
    category: 'serif',
  },
  {
    id: 'ephesis',
    name: 'Ephesis',
    family: "'Ephesis', cursive, serif",
    googleFont: 'Ephesis',
    desc: 'Uốn lượn mềm mại thướt tha',
    category: 'script',
  },
  {
    id: 'lovers-quarrel',
    name: 'Lovers Quarrel',
    family: "'Lovers Quarrel', cursive, serif",
    googleFont: 'Lovers+Quarrel',
    desc: 'Thư pháp hoàng gia cực kỳ bay bổng',
    category: 'script',
  },
  {
    id: 'marck-script',
    name: 'Marck Script',
    family: "'Marck Script', cursive, serif",
    googleFont: 'Marck+Script',
    desc: 'Thanh mảnh tự nhiên',
    category: 'script',
  },
  {
    id: 'italianno',
    name: 'Italianno',
    family: "'Italianno', cursive, serif",
    googleFont: 'Italianno',
    desc: 'Thư pháp Ý cổ điển',
    category: 'script',
  },
  {
    id: 'rouge-script',
    name: 'Rouge Script',
    family: "'Rouge Script', cursive, serif",
    googleFont: 'Rouge+Script',
    desc: 'Chữ ký nghệ thuật quý tộc',
    category: 'script',
  },
  {
    id: 'sacramento',
    name: 'Sacramento',
    family: "'Sacramento', cursive, serif",
    googleFont: 'Sacramento',
    desc: 'Nét bút mảnh mai tinh tế',
    category: 'script',
  },
  {
    id: 'windsong',
    name: 'WindSong',
    family: "'WindSong', cursive, serif",
    googleFont: 'WindSong:wght@400;500',
    desc: 'Nét cọ bay bổng tự do',
    category: 'script',
  },
  {
    id: 'prata',
    name: 'Prata',
    family: "'Prata', serif",
    googleFont: 'Prata',
    desc: 'Serif thanh tao cổ điển',
    category: 'serif',
  },
  {
    id: 'bodoni-moda',
    name: 'Bodoni Moda',
    family: "'Bodoni Moda', serif",
    googleFont: 'Bodoni+Moda:ital,wght@0,400;0,600;1,400',
    desc: 'Serif thời trang cao cấp Vogue',
    category: 'serif',
  },
  {
    id: 'cormorant-garamond',
    name: 'Cormorant Garamond',
    family: "'Cormorant Garamond', serif",
    googleFont: 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400',
    desc: 'Cổ điển thơ mộng',
    category: 'serif',
  },
  {
    id: 'cinzel-decorative',
    name: 'Cinzel Decorative',
    family: "'Cinzel Decorative', serif",
    googleFont: 'Cinzel+Decorative:wght@400;700',
    desc: 'Tiêu đề La Mã kiêu sa',
    category: 'serif',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    googleFont: 'Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,400',
    desc: 'Không chân tối giản dễ đọc',
    category: 'sans',
  },
  {
    id: 'sans-serif',
    name: 'Mặc định (Sans)',
    family: 'var(--font-sans), system-ui, -apple-system, sans-serif',
    googleFont: '',
    desc: 'Hệ thống chuẩn',
    category: 'sans',
  },
];

export const GOOGLE_FONTS_STYLESHEET_URL =
  'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Bodoni+Moda:ital,wght@0,400;0,600;1,400&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Dancing+Script:wght@500;700&family=Ephesis&family=Great+Vibes&family=Italianno&family=Lovers+Quarrel&family=Marck+Script&family=MonteCarlo&family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Prata&family=Rouge+Script&family=Sacramento&family=WindSong:wght@400;500&display=swap';

export function resolveFontFamily(family?: string): string {
  if (!family) {
    return 'var(--font-sans), system-ui, -apple-system, sans-serif';
  }
  const clean = family.trim().replace(/^['"]+|['"]+$/g, '');

  if (clean === 'sans-serif') {
    return 'var(--font-sans), system-ui, -apple-system, sans-serif';
  }
  if (clean === 'serif') {
    return 'var(--font-playfair), Georgia, serif';
  }
  if (clean === 'Paris Regular' || clean === 'Parisienne') {
    return "'Parisienne', 'Paris Regular', cursive, serif";
  }
  if (clean === 'Chillatos') {
    return "'Alex Brush', 'Chillatos', cursive, serif";
  }
  if (clean === 'EdwardianKT' || clean === 'Edwardian') {
    return "'Great Vibes', 'EdwardianKT', cursive, serif";
  }
  if (clean === 'Pinyon Script') {
    return "'Pinyon Script', cursive, serif";
  }
  if (clean === 'Playfair Display') {
    return "'Playfair Display', serif";
  }
  if (clean === 'Great Vibes') {
    return "'Great Vibes', cursive, serif";
  }
  if (clean === 'Cormorant Garamond') {
    return "'Cormorant Garamond', serif";
  }
  if (clean === 'Alex Brush') {
    return "'Alex Brush', cursive, serif";
  }
  if (clean === 'Cinzel Decorative') {
    return "'Cinzel Decorative', serif";
  }
  if (clean === 'Dancing Script') {
    return "'Dancing Script', cursive, serif";
  }
  if (clean === 'Montserrat') {
    return "'Montserrat', sans-serif";
  }
  if (clean === 'Allura') {
    return "'Allura', cursive, serif";
  }
  if (clean === 'MonteCarlo') {
    return "'MonteCarlo', cursive, serif";
  }
  if (clean === 'Ephesis') {
    return "'Ephesis', cursive, serif";
  }
  if (clean === 'Lovers Quarrel') {
    return "'Lovers Quarrel', cursive, serif";
  }
  if (clean === 'Marck Script') {
    return "'Marck Script', cursive, serif";
  }
  if (clean === 'Italianno') {
    return "'Italianno', cursive, serif";
  }
  if (clean === 'Rouge Script') {
    return "'Rouge Script', cursive, serif";
  }
  if (clean === 'Sacramento') {
    return "'Sacramento', cursive, serif";
  }
  if (clean === 'WindSong') {
    return "'WindSong', cursive, serif";
  }
  if (clean === 'Prata') {
    return "'Prata', serif";
  }
  if (clean === 'Bodoni Moda') {
    return "'Bodoni Moda', serif";
  }

  // Fallback
  return `'${clean}', cursive, serif`;
}

/**
 * Dynamically loads and registers a custom font file (.ttf, .otf, .woff, .woff2) in the browser
 * so that both the DOM and Canvas export render it immediately without reload.
 */
export async function loadCustomFontFile(fontName: string, fileUrl: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const cleanFamily = fontName.trim().replace(/^['"]+|['"]+$/g, '');
    
    // 1. Inject @font-face CSS rule for reliable DOM rendering
    const styleId = `font-face-${cleanFamily.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @font-face {
          font-family: '${cleanFamily}';
          src: url('${fileUrl}') format('woff2'),
               url('${fileUrl}') format('woff'),
               url('${fileUrl}') format('truetype'),
               url('${fileUrl}') format('opentype');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }

    // 2. Use document.fonts FontFace API so canvas contexts acknowledge it
    if ('fonts' in document && typeof FontFace !== 'undefined') {
      const font = new FontFace(cleanFamily, `url('${fileUrl}')`);
      const loadedFont = await font.load();
      document.fonts.add(loadedFont);
      await document.fonts.ready;
    }

    return true;
  } catch (err) {
    console.error(`Failed to load custom font "${fontName}":`, err);
    return false;
  }
}
