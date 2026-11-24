export interface CatalogTemplate {
  id: string;
  name: string;
  code?: string;
  subtitle?: string;
  slug: string;
  category: 'wedding' | 'birthday' | 'graduation' | 'event' | 'anniversary';
  style?: 'envelope' | 'traditional' | 'minimalist' | 'korean_pastel' | 'editorial' | 'modern' | string;
  styleLabel?: string;
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  price: number;
  badge: 'Miễn phí' | 'Basic' | 'Premium' | string;
  longThumbnail: string;
  likes: number;
  views: number;
  baseTemplateId: 'burgundy' | 'pastel' | 'floral' | 'retro' | 'our-love-begins' | 'our-love-story-rose' | 'save-the-date-cream-gold' | string;
  description: string;
  isPublished?: boolean;
  studioPresetData?: {
    elements: any[];
    canvas?: any;
  };
  isCustom?: boolean;
  trashedAt?: string;
  trashedReason?: string;
}

/**
 * 4 MẪU THIẾT KẾ NỔI BẬT (SPOTLIGHT PRESETS)
 * Giữ đúng 4 mẫu thiết kế tiêu chuẩn hàng đầu của LoveStory.
 * Toàn bộ các mẫu khác đã được lưu trữ an toàn trong Thùng rác (trashedTemplates.json).
 * Admin có toàn quyền tạo mới, thêm mẫu, khôi phục hoặc tùy biến danh sách bất kỳ lúc nào.
 */
export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: 'tpl-wedding-165',
    code: 'Mẫu 01',
    name: 'Mẫu 01 — Kem Chữ Vàng Save The Date',
    subtitle: 'Kem Chữ Vàng Save The Date (C165)',
    slug: 'thiep-cuoi-165',
    category: 'wedding',
    tier: 'PREMIUM',
    price: 30000,
    badge: 'Premium',
    longThumbnail: '/assets/wedding/samples/sample_01.jpg',
    likes: 852,
    views: 18450,
    baseTemplateId: 'save-the-date-cream-gold',
    description: 'Phong cách kem chữ vàng sang trọng, bố cục 14 ảnh thời trang cao cấp kết hợp hiệu ứng bay lơ lửng đầy chất thơ.',
    isPublished: true,
  },
  {
    id: 'tpl-wedding-01',
    code: 'Mẫu 02',
    name: 'Mẫu 02 — Tạp Chí Our Love Begins',
    subtitle: 'Tạp Chí Our Love Begins',
    slug: 'our-love-begins',
    category: 'wedding',
    tier: 'BASIC',
    price: 0,
    badge: 'Basic',
    longThumbnail: '/assets/wedding/samples/sample_02.jpg',
    likes: 259,
    views: 12263,
    baseTemplateId: 'our-love-begins',
    description: 'Phong cách bìa tạp chí thời trang hiện đại, tôn vinh trọn vẹn từng khoảnh khắc tình yêu của cặp đôi.',
    isPublished: true,
  },
  {
    id: 'tpl-wedding-02',
    code: 'Mẫu 03',
    name: 'Mẫu 03 — Hoa Hồng Đỏ Our Love Story',
    subtitle: 'Hoa Hồng Đỏ Our Love Story',
    slug: 'our-love-story-rose',
    category: 'wedding',
    tier: 'BASIC',
    price: 0,
    badge: 'Basic',
    longThumbnail: '/assets/wedding/samples/sample_03.jpg',
    likes: 1004,
    views: 24973,
    baseTemplateId: 'our-love-story-rose',
    description: 'Tông đỏ nhung quyến rũ kết hợp hoa hồng tươi thắm, mang lại cảm giác nồng nàn và hạnh phúc ngập tràn.',
    isPublished: true,
  },
  {
    id: 'tpl-wedding-03',
    code: 'Mẫu 04',
    name: 'Mẫu 04 — Phong Bì Kem Hoa Cúc',
    subtitle: 'Phong Bì Kem Hoa Cúc',
    slug: 'envelope-chamomile',
    category: 'wedding',
    tier: 'PREMIUM',
    price: 30000,
    badge: 'Premium',
    longThumbnail: '/assets/wedding/samples/sample_04.jpg',
    likes: 505,
    views: 30564,
    baseTemplateId: 'pastel',
    description: 'Hiệu ứng mở phong bì thư thanh tao, họa tiết hoa cúc dại tinh khôi trên nền giấy mỹ thuật cao cấp.',
    isPublished: true,
  },
];
