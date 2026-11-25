import { CanvasElement, CanvasConfig } from '@/components/editor/studio/studioTypes';
import { WEDDING_SAMPLE_IMAGES } from '@/lib/studioUtils';

export interface AiDesignRequest {
  mode: 'generate_template' | 'restyle_palette' | 'rewrite_wording' | 'smart_align';
  prompt: string;
  stylePreset?: string;
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  venue?: string;
  targetPalette?: string;
  wordingTone?: 'formal' | 'romantic' | 'modern' | 'minimal';
  currentElements?: CanvasElement[];
  currentConfig?: Partial<CanvasConfig>;
}

export interface AiDesignResult {
  success: boolean;
  message: string;
  name?: string;
  description?: string;
  config?: Partial<CanvasConfig>;
  elements?: CanvasElement[];
  generatedText?: string;
  paletteName?: string;
  aiEngineUsed: 'gemini' | 'algorithmic_studio_engine';
}

// Curated Wedding Color Schemes for AI
export const AI_COLOR_PALETTES: Record<string, {
  name: string;
  bg: string;
  primaryText: string;
  secondaryText: string;
  accent: string;
  cardBg: string;
  fallingType: 'petals' | 'snow' | 'stars' | 'hearts' | 'confetti';
}> = {
  korean_pastel: {
    name: 'Hàn Quốc Pastel & Be Kem',
    bg: '#FAF7F2',
    primaryText: '#4A3E3D',
    secondaryText: '#8C7A6B',
    accent: '#B08968',
    cardBg: '#FFFFFF',
    fallingType: 'petals',
  },
  royal_burgundy: {
    name: 'Đỏ Rượu Hoàng Gia & Vàng Gold',
    bg: '#4A0E17',
    primaryText: '#FFFFFF',
    secondaryText: '#F5D0A9',
    accent: '#D4AF37',
    cardBg: '#380B12',
    fallingType: 'petals',
  },
  sage_botanical: {
    name: 'Xanh Rêu Botanical & Mộc Mạc',
    bg: '#F4F7F4',
    primaryText: '#2D3E35',
    secondaryText: '#556B2F',
    accent: '#3E5C49',
    cardBg: '#FFFFFF',
    fallingType: 'petals',
  },
  minimal_parisian: {
    name: 'Tối Giản Hiện Đại & Đen Trắng Parisian',
    bg: '#FFFFFF',
    primaryText: '#1A1A1A',
    secondaryText: '#666666',
    accent: '#999999',
    cardBg: '#F8F9FA',
    fallingType: 'stars',
  },
  terracotta_sunset: {
    name: 'Cam Đất Hoàng Hôn & Vintage Ấm Áp',
    bg: '#FBF5F0',
    primaryText: '#5A2A18',
    secondaryText: '#9E5B42',
    accent: '#C86D51',
    cardBg: '#FFFFFF',
    fallingType: 'petals',
  },
  midnight_navy: {
    name: 'Xanh Navy Ánh Kim & Dạ Tiệc Sang Trọng',
    bg: '#0F172A',
    primaryText: '#F8FAFC',
    secondaryText: '#CBD5E1',
    accent: '#E2B13C',
    cardBg: '#1E293B',
    fallingType: 'stars',
  },
};

/**
 * Intelligent Wedding Layout Engine (Fallback & Instant local engine)
 * Generates an end-to-end 6-screen cinematic wedding template with exact geometry,
 * rich widgets, real wedding photos, and perfect typographic hierarchy.
 */
export function generateAlgorithmicTemplate(req: AiDesignRequest): AiDesignResult {
  const prompt = req.prompt.toLowerCase();
  
  // 1. Detect Style & Palette
  let selectedPaletteKey = 'korean_pastel';
  if (prompt.includes('đỏ') || prompt.includes('burgundy') || prompt.includes('hoàng gia') || req.stylePreset === 'royal_burgundy') {
    selectedPaletteKey = 'royal_burgundy';
  } else if (prompt.includes('rêu') || prompt.includes('xanh') || prompt.includes('botanical') || req.stylePreset === 'sage_botanical') {
    selectedPaletteKey = 'sage_botanical';
  } else if (prompt.includes('tối giản') || prompt.includes('trắng') || prompt.includes('minimal') || req.stylePreset === 'minimal_parisian') {
    selectedPaletteKey = 'minimal_parisian';
  } else if (prompt.includes('cam') || prompt.includes('sunset') || prompt.includes('ấm') || req.stylePreset === 'terracotta_sunset') {
    selectedPaletteKey = 'terracotta_sunset';
  } else if (prompt.includes('navy') || prompt.includes('đêm') || prompt.includes('dạ tiệc') || req.stylePreset === 'midnight_navy') {
    selectedPaletteKey = 'midnight_navy';
  }

  const palette = AI_COLOR_PALETTES[selectedPaletteKey] || AI_COLOR_PALETTES.korean_pastel;

  // 2. Extract or Default Wedding Info
  const groom = req.groomName?.trim() || 'Minh Quân';
  const bride = req.brideName?.trim() || 'Thùy Dung';
  const weddingDateStr = req.weddingDate?.trim() || '20/10/2026';
  const venueStr = req.venue?.trim() || 'Trung Tâm Hội Nghị & Tiệc Cưới LoveStory';

  const templateName = `Thiệp Cưới ${palette.name} — ${groom} & ${bride}`;
  const templateDescription = `Mẫu thiệp cưới scrollytelling điện ảnh phong cách ${palette.name}, phối màu tinh tế chuẩn tỉ lệ smartphone, bố cục 6 màn hoàn chỉnh sinh bởi LoveStory AI.`;

  // 3. Construct Elements Across 6 Screens (500px width, 5200px height)
  const elements: CanvasElement[] = [
    // ==========================================
    // SCREEN 1: BÌA NGHỆ THUẬT (0 - 850px)
    // ==========================================
    {
      id: `ai-text-std-${Date.now()}-1`,
      type: 'text',
      x: 0,
      y: 40,
      width: 500,
      height: 60,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'Save The Date',
      fontFamily: 'Pinyon Script',
      fontSize: 68,
      color: palette.accent,
      textAlign: 'center',
      continuousAnimation: { type: 'floating', duration: 2.4, delay: 0 },
    },
    {
      id: `ai-text-invitation-${Date.now()}-2`,
      type: 'text',
      x: 20,
      y: 110,
      width: 460,
      height: 35,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'THE WEDDING OF',
      fontFamily: 'Playfair Display',
      fontSize: 16,
      fontWeight: '700',
      color: palette.secondaryText,
      textAlign: 'center',
      letterSpacing: 6,
    },
    {
      id: `ai-img-cover-${Date.now()}-3`,
      type: 'image',
      x: 40,
      y: 160,
      width: 420,
      height: 540,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
      src: WEDDING_SAMPLE_IMAGES[0] || '/assets/wedding/samples/sample_01.jpg',
      borderRadius: 24,
      objectFit: 'cover',
    },
    {
      id: `ai-text-couple-hero-${Date.now()}-4`,
      type: 'text',
      x: 20,
      y: 720,
      width: 460,
      height: 60,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: `${groom}  &  ${bride}`,
      fontFamily: 'Great Vibes',
      fontSize: 44,
      fontWeight: '600',
      color: palette.primaryText,
      textAlign: 'center',
    },
    {
      id: `ai-text-date-hero-${Date.now()}-5`,
      type: 'text',
      x: 20,
      y: 785,
      width: 460,
      height: 30,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: `♥ ${weddingDateStr} ♥`,
      fontFamily: 'Playfair Display',
      fontSize: 15,
      fontWeight: '600',
      color: palette.accent,
      textAlign: 'center',
      letterSpacing: 3,
    },

    // ==========================================
    // SCREEN 2: LỜI MỜI & THÔNG TIN 2 HỌ (850 - 1700px)
    // ==========================================
    {
      id: `ai-text-s2-title-${Date.now()}-6`,
      type: 'text',
      x: 20,
      y: 910,
      width: 460,
      height: 40,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'TRÂN TRỌNG KÍNH MỜI',
      fontFamily: 'Playfair Display',
      fontSize: 22,
      fontWeight: '700',
      color: palette.primaryText,
      textAlign: 'center',
      letterSpacing: 4,
    },
    {
      id: `ai-text-s2-guest-${Date.now()}-7`,
      type: 'text',
      x: 20,
      y: 960,
      width: 460,
      height: 45,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'Quý Khách & Người Thương',
      fontFamily: 'Great Vibes',
      fontSize: 34,
      color: palette.accent,
      textAlign: 'center',
    },
    {
      id: `ai-text-s2-wording-${Date.now()}-8`,
      type: 'text',
      x: 45,
      y: 1015,
      width: 410,
      height: 110,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'Tình yêu không phải là tìm một ai đó hoàn hảo, mà là cùng nhau vun đắp những khoảnh khắc trọn vẹn nhất. Sự hiện diện và lời chúc phúc của Quý vị là niềm hạnh phúc lớn lao nhất của chúng mình!',
      fontFamily: 'Be Vietnam Pro',
      fontSize: 13,
      lineHeight: 1.6,
      color: palette.secondaryText,
      textAlign: 'center',
    },
    {
      id: `ai-widget-parents-${Date.now()}-9`,
      type: 'widget',
      widgetType: 'family_info',
      x: 35,
      y: 1140,
      width: 430,
      height: 230,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
    },
    {
      id: `ai-img-s2-photo-${Date.now()}-10`,
      type: 'image',
      x: 45,
      y: 1390,
      width: 410,
      height: 260,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
      src: WEDDING_SAMPLE_IMAGES[1] || '/assets/wedding/samples/sample_02.jpg',
      borderRadius: 18,
      objectFit: 'cover',
    },

    // ==========================================
    // SCREEN 3: LỊCH TRÌNH & ĐẾM NGƯỢC (1700 - 2550px)
    // ==========================================
    {
      id: `ai-text-s3-title-${Date.now()}-11`,
      type: 'text',
      x: 20,
      y: 1760,
      width: 460,
      height: 40,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'LỊCH TRÌNH TIỆC CƯỚI',
      fontFamily: 'Playfair Display',
      fontSize: 22,
      fontWeight: '700',
      color: palette.primaryText,
      textAlign: 'center',
      letterSpacing: 3,
    },
    {
      id: `ai-text-s3-sub-${Date.now()}-12`,
      type: 'text',
      x: 20,
      y: 1805,
      width: 460,
      height: 30,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'WEDDING TIMELINE',
      fontFamily: 'Playfair Display',
      fontSize: 12,
      fontWeight: '600',
      color: palette.accent,
      textAlign: 'center',
      letterSpacing: 4,
    },
    {
      id: `ai-widget-timeline-${Date.now()}-13`,
      type: 'widget',
      widgetType: 'story_timeline',
      x: 35,
      y: 1850,
      width: 430,
      height: 340,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
    },
    {
      id: `ai-widget-countdown-${Date.now()}-14`,
      type: 'widget',
      widgetType: 'countdown',
      x: 35,
      y: 2220,
      width: 430,
      height: 180,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
    },
    {
      id: `ai-widget-calendar-${Date.now()}-15`,
      type: 'widget',
      widgetType: 'calendar',
      x: 35,
      y: 2420,
      width: 430,
      height: 190,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
    },

    // ==========================================
    // SCREEN 4: ALBUM KỶ NIỆM CƯỚI (2550 - 3400px)
    // ==========================================
    {
      id: `ai-text-s4-title-${Date.now()}-16`,
      type: 'text',
      x: 20,
      y: 2650,
      width: 460,
      height: 40,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'ALBUM KỶ NIỆM',
      fontFamily: 'Playfair Display',
      fontSize: 22,
      fontWeight: '700',
      color: palette.primaryText,
      textAlign: 'center',
      letterSpacing: 4,
    },
    {
      id: `ai-text-s4-sub-${Date.now()}-17`,
      type: 'text',
      x: 20,
      y: 2695,
      width: 460,
      height: 30,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'OUR SWEETEST MEMORIES',
      fontFamily: 'Playfair Display',
      fontSize: 12,
      fontWeight: '600',
      color: palette.accent,
      textAlign: 'center',
      letterSpacing: 4,
    },
    {
      id: `ai-widget-album-${Date.now()}-18`,
      type: 'widget',
      widgetType: 'album',
      x: 35,
      y: 2740,
      width: 430,
      height: 600,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
      widgetConfig: {
        title: 'Bộ Sưu Tập Tình Yêu',
        albumLayout: 'grid-2',
        gap: 12,
        borderRadius: 16,
        images: [
          WEDDING_SAMPLE_IMAGES[2] || '/assets/wedding/samples/sample_03.jpg',
          WEDDING_SAMPLE_IMAGES[3] || '/assets/wedding/samples/sample_04.jpg',
          WEDDING_SAMPLE_IMAGES[4] || '/assets/wedding/samples/sample_05.jpg',
          WEDDING_SAMPLE_IMAGES[5] || '/assets/wedding/samples/sample_06.jpg',
          WEDDING_SAMPLE_IMAGES[6] || '/assets/wedding/samples/sample_07.jpg',
          WEDDING_SAMPLE_IMAGES[7] || '/assets/wedding/samples/sample_08.jpg',
        ],
      },
    },

    // ==========================================
    // SCREEN 5: BẢN ĐỒ & RSVP XÁC NHẬN (3400 - 4250px)
    // ==========================================
    {
      id: `ai-text-s5-title-${Date.now()}-19`,
      type: 'text',
      x: 20,
      y: 3450,
      width: 460,
      height: 40,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'ĐỊA ĐIỂM TỔ CHỨC',
      fontFamily: 'Playfair Display',
      fontSize: 22,
      fontWeight: '700',
      color: palette.primaryText,
      textAlign: 'center',
      letterSpacing: 3,
    },
    {
      id: `ai-widget-map-${Date.now()}-20`,
      type: 'widget',
      widgetType: 'map',
      x: 35,
      y: 3500,
      width: 430,
      height: 290,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
      widgetConfig: {
        venueName: venueStr,
        address: 'Sảnh tiệc Hoàng Gia — Tầng 3',
      },
    },
    {
      id: `ai-widget-rsvp-${Date.now()}-21`,
      type: 'widget',
      widgetType: 'rsvp',
      x: 35,
      y: 3820,
      width: 430,
      height: 380,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
    },

    // ==========================================
    // SCREEN 6: VIETQR MỪNG CƯỚI & SỔ LƯU BÚT (4250 - 5200px)
    // ==========================================
    {
      id: `ai-text-s6-title-${Date.now()}-22`,
      type: 'text',
      x: 20,
      y: 4280,
      width: 460,
      height: 40,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: 'HỘP MỪNG CƯỚI',
      fontFamily: 'Playfair Display',
      fontSize: 22,
      fontWeight: '700',
      color: palette.primaryText,
      textAlign: 'center',
      letterSpacing: 4,
    },
    {
      id: `ai-widget-giftbox-${Date.now()}-23`,
      type: 'widget',
      widgetType: 'giftbox',
      x: 35,
      y: 4330,
      width: 430,
      height: 290,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
    },
    {
      id: `ai-widget-wishes-${Date.now()}-24`,
      type: 'widget',
      widgetType: 'wishes',
      x: 35,
      y: 4650,
      width: 430,
      height: 360,
      rotation: 0,
      zIndex: 5,
      opacity: 1,
    },
    {
      id: `ai-text-s6-thanks-${Date.now()}-25`,
      type: 'text',
      x: 20,
      y: 5040,
      width: 460,
      height: 80,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
      text: `Thank You\n${groom} & ${bride}`,
      fontFamily: 'Great Vibes',
      fontSize: 36,
      color: palette.accent,
      textAlign: 'center',
    },
  ];

  return {
    success: true,
    message: `Đã thiết kế thành công mẫu thiệp cưới "${templateName}"!`,
    name: templateName,
    description: templateDescription,
    config: {
      width: 500,
      height: 5200,
      background: palette.bg,
      title: templateName,
      audioTitle: 'Until You',
      audioUrl: '/assets/wedding/mp3/ee11a985-5e0e-4eb0-b6da-28fa39c9946f.mp3',
      fallingEffect: {
        enabled: true,
        type: palette.fallingType,
      },
    },
    elements,
    paletteName: palette.name,
    aiEngineUsed: 'algorithmic_studio_engine',
  };
}

/**
 * AI Palette Restyler: Changes the entire color tone of the currently active canvas
 */
export function restyleCanvasPalette(
  elements: CanvasElement[],
  paletteKey: string
): { elements: CanvasElement[]; background: string; paletteName: string } {
  const palette = AI_COLOR_PALETTES[paletteKey] || AI_COLOR_PALETTES.korean_pastel;

  const restyled = elements.map((el) => {
    if (el.type === 'text') {
      // Determine if title/accent or body
      const isAccent = (el.fontSize && el.fontSize > 28) || el.fontFamily?.includes('Script') || el.fontFamily?.includes('Vibes');
      return {
        ...el,
        color: isAccent ? palette.accent : palette.primaryText,
      };
    }
    return el;
  });

  return {
    elements: restyled,
    background: palette.bg,
    paletteName: palette.name,
  };
}

/**
 * AI Wording Rewriter: Generates touching wedding invitations
 */
export function generateWeddingWording(
  tone: 'formal' | 'romantic' | 'modern' | 'minimal',
  groom?: string,
  bride?: string
): string {
  const g = groom || 'chú rể';
  const b = bride || 'cô dâu';

  switch (tone) {
    case 'romantic':
      return `Hành trình tình yêu của ${g} và ${b} bắt đầu từ những điều giản đơn nhất, và hôm nay sẽ đơm hoa kết trái thành một mái ấm trọn đời. Chúng mình rất mong được đón tiếp bạn trong ngày vui ngọt ngào này!`;
    case 'formal':
      return `Trân trọng kính mời Quý khách đến tham dự và chứng kiến khoảnh khắc kết duyên thiêng liêng của hai gia đình chúng tôi. Sự hiện diện quý báu của Quý vị là lời chúc phúc đong đầy ý nghĩa nhất cho hai con.`;
    case 'minimal':
      return `Một ngày đặc biệt. Hai trái tim chung nhịp đập. Trân trọng kính mời bạn đến chung vui cùng ${g} & ${b}.`;
    case 'modern':
    default:
      return `Tình yêu là hành trình cùng nhau chia sẻ mọi khoảnh khắc thanh xuân. Rất hân hạnh được mời Bạn cùng nâng ly, sẻ chia niềm vui và lưu giữ kỷ niệm đẹp trong ngày chung đôi của chúng mình!`;
  }
}
