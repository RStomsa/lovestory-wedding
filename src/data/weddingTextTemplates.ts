import { WeddingProfileData } from '@/components/editor/studio/studioTypes';

export interface WeddingTextTemplate {
  id: string;
  title: string; // e.g. "Tên cặp đôi", "Tên cặp đôi (Thanh lịch)"
  category: 'couple' | 'date' | 'title' | 'invitation' | 'family' | 'quote';
  sampleText: string;
  fontFamily: string;
  fontSize: number;
  previewFontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  color: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  defaultWidth?: number;
  defaultHeight?: number;
  getDynamicText?: (profile: WeddingProfileData) => string;
}

export const WEDDING_TEXT_TEMPLATES: WeddingTextTemplate[] = [
  {
    id: 'couple-script',
    title: 'Tên cặp đôi',
    category: 'couple',
    sampleText: 'Minh & Ngọc',
    fontFamily: 'Paris Regular',
    fontSize: 48,
    previewFontSize: 34,
    color: '#7A1E28', // Quý tộc đỏ rượu burgundy
    textAlign: 'center',
    defaultWidth: 420,
    defaultHeight: 70,
    getDynamicText: (p) => {
      const g = p.groom?.shortName || p.groom?.fullName;
      const b = p.bride?.shortName || p.bride?.fullName;
      if (g && b) {
        return `${g} & ${b}`;
      }
      return 'Minh & Ngọc';
    },
  },
  {
    id: 'couple-elegant',
    title: 'Tên cặp đôi (Thanh lịch)',
    category: 'couple',
    sampleText: 'M I N H  ♥  N G Ọ C',
    fontFamily: 'Cinzel',
    fontSize: 22,
    previewFontSize: 18,
    fontWeight: '600',
    letterSpacing: 4,
    color: '#2B2523',
    textAlign: 'center',
    defaultWidth: 440,
    defaultHeight: 50,
    getDynamicText: (p) => {
      const g = p.groom?.shortName || p.groom?.fullName;
      const b = p.bride?.shortName || p.bride?.fullName;
      if (g && b) {
        const gSpaced = g.toUpperCase().split('').join(' ');
        const bSpaced = b.toUpperCase().split('').join(' ');
        return `${gSpaced}  ♥  ${bSpaced}`;
      }
      return 'M I N H  ♥  N G Ọ C';
    },
  },
  {
    id: 'couple-modern',
    title: 'Tên cặp đôi (Hiện đại)',
    category: 'couple',
    sampleText: 'Minh & Ngọc',
    fontFamily: 'Playfair Display',
    fontSize: 34,
    previewFontSize: 24,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
    defaultWidth: 400,
    defaultHeight: 55,
    getDynamicText: (p) => {
      const g = p.groom?.shortName || p.groom?.fullName;
      const b = p.bride?.shortName || p.bride?.fullName;
      if (g && b) {
        return `${g} & ${b}`;
      }
      return 'Minh & Ngọc';
    },
  },
  {
    id: 'date-spaced',
    title: 'Ngày cưới',
    category: 'date',
    sampleText: '19 . 06 . 2027',
    fontFamily: 'Cinzel',
    fontSize: 24,
    previewFontSize: 18,
    letterSpacing: 4,
    color: '#9C4131', // Terracotta đỏ gạch ấm
    textAlign: 'center',
    defaultWidth: 360,
    defaultHeight: 45,
    getDynamicText: (p) => {
      const c = p.ceremonies?.find((x) => x.isMain) || p.ceremonies?.[0];
      if (c?.date) {
        const parts = c.date.split('-');
        if (parts.length === 3) {
          return `${parts[2]} . ${parts[1]} . ${parts[0]}`;
        }
      }
      return '19 . 06 . 2027';
    },
  },
  {
    id: 'date-formal',
    title: 'Ngày cưới (Trang trọng)',
    category: 'date',
    sampleText: 'Thứ Bảy, ngày 19 tháng 06 năm 2027',
    fontFamily: 'Cormorant Garamond',
    fontSize: 18,
    previewFontSize: 13,
    fontStyle: 'italic',
    color: '#4A3E39',
    textAlign: 'center',
    defaultWidth: 440,
    defaultHeight: 45,
    getDynamicText: (p) => {
      const c = p.ceremonies?.find((x) => x.isMain) || p.ceremonies?.[0];
      if (c?.date) {
        const parts = c.date.split('-');
        if (parts.length === 3) {
          return `Thứ Bảy, ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
        }
      }
      return 'Thứ Bảy, ngày 19 tháng 06 năm 2027';
    },
  },
  {
    id: 'title-save-the-date',
    title: 'Tiêu đề Save The Date',
    category: 'title',
    sampleText: 'SAVE THE DATE',
    fontFamily: 'Cinzel',
    fontSize: 26,
    previewFontSize: 19,
    fontWeight: '600',
    letterSpacing: 6,
    color: '#8C7355',
    textAlign: 'center',
    defaultWidth: 380,
    defaultHeight: 50,
  },
  {
    id: 'ceremony-thanh-hon',
    title: 'Nghi lễ thành hôn',
    category: 'title',
    sampleText: 'LỄ THÀNH HÔN',
    fontFamily: 'Playfair Display',
    fontSize: 28,
    previewFontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#8B261F',
    textAlign: 'center',
    defaultWidth: 360,
    defaultHeight: 50,
  },
  {
    id: 'ceremony-vu-quy',
    title: 'Nghi lễ vu quy',
    category: 'title',
    sampleText: 'LỄ VU QUY',
    fontFamily: 'Playfair Display',
    fontSize: 28,
    previewFontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#8B261F',
    textAlign: 'center',
    defaultWidth: 360,
    defaultHeight: 50,
  },
  {
    id: 'invitation-intimate',
    title: 'Lời mời thân mật',
    category: 'invitation',
    sampleText: 'Trân trọng kính mời quý khách tới tham dự bữa cơm thân mật chung vui cùng gia đình chúng tôi',
    fontFamily: 'Playfair Display',
    fontSize: 15,
    previewFontSize: 11,
    fontStyle: 'italic',
    lineHeight: 1.6,
    color: '#5C5248',
    textAlign: 'center',
    defaultWidth: 420,
    defaultHeight: 70,
  },
  {
    id: 'family-nha-trai',
    title: 'Hôn trường Nhà Trai',
    category: 'family',
    sampleText: 'TIỆC CƯỚI NHÀ TRAI',
    fontFamily: 'Cinzel',
    fontSize: 20,
    previewFontSize: 15,
    fontWeight: '600',
    letterSpacing: 3,
    color: '#5C5248',
    textAlign: 'center',
    defaultWidth: 380,
    defaultHeight: 45,
  },
  {
    id: 'time-venue',
    title: 'Thời gian & Địa điểm',
    category: 'date',
    sampleText: 'Vào lúc 11:00 • 19 . 06 . 2027',
    fontFamily: 'Cinzel',
    fontSize: 18,
    previewFontSize: 14,
    letterSpacing: 2,
    color: '#78350F',
    textAlign: 'center',
    defaultWidth: 400,
    defaultHeight: 45,
    getDynamicText: (p) => {
      const c = p.ceremonies?.find((x) => x.isMain) || p.ceremonies?.[0];
      const time = c?.time || '11:00';
      if (c?.date) {
        const parts = c.date.split('-');
        if (parts.length === 3) {
          return `Vào lúc ${time} • ${parts[2]} . ${parts[1]} . ${parts[0]}`;
        }
      }
      return 'Vào lúc 11:00 • 19 . 06 . 2027';
    },
  },
  {
    id: 'thank-you-celebrating',
    title: 'Lời cảm ơn',
    category: 'quote',
    sampleText: 'Thank you for celebrating with us',
    fontFamily: 'Pinyon Script',
    fontSize: 34,
    previewFontSize: 24,
    color: '#8C7355',
    textAlign: 'center',
    defaultWidth: 440,
    defaultHeight: 60,
  },
];
