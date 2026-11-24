export interface WeddingShapeItem {
  id: string;
  name: string;
  category: 'frame' | 'divider' | 'ornament' | 'geometry';
  categoryLabel: string;
  svgPath: string;
  viewBox: string;
  defaultWidth: number;
  defaultHeight: number;
  strokeColor?: string;
  fillColor?: string;
}

export const WEDDING_SHAPES_CATALOG: WeddingShapeItem[] = [
  {
    id: 'shape-arch-frame',
    name: 'Khung Vòm Cung Cổ Điển',
    category: 'frame',
    categoryLabel: 'Khung Viền',
    viewBox: '0 0 300 400',
    defaultWidth: 260,
    defaultHeight: 350,
    strokeColor: '#8B1E2D',
    fillColor: 'transparent',
    svgPath: 'M 15 390 L 15 150 A 135 135 0 0 1 285 150 L 285 390 Z',
  },
  {
    id: 'shape-double-border-rect',
    name: 'Khung Viền Đôi Hoàng Gia',
    category: 'frame',
    categoryLabel: 'Khung Viền',
    viewBox: '0 0 300 400',
    defaultWidth: 280,
    defaultHeight: 380,
    strokeColor: '#B45309',
    fillColor: 'transparent',
    svgPath: 'M 10 10 L 290 10 L 290 390 L 10 390 Z M 20 20 L 280 20 L 280 380 L 20 380 Z',
  },
  {
    id: 'shape-divider-flourish',
    name: 'Đường Phân Cách Uốn Lượn',
    category: 'divider',
    categoryLabel: 'Đường Phân Cách',
    viewBox: '0 0 400 40',
    defaultWidth: 320,
    defaultHeight: 32,
    strokeColor: '#8B1E2D',
    fillColor: 'transparent',
    svgPath: 'M 10 20 Q 100 5, 190 20 T 390 20 M 190 10 A 10 10 0 1 1 210 10 A 10 10 0 1 1 190 10',
  },
  {
    id: 'shape-delicate-heart',
    name: 'Trái Tim Nét Mảnh Tình Yêu',
    category: 'ornament',
    categoryLabel: 'Họa Tiết',
    viewBox: '0 0 100 100',
    defaultWidth: 80,
    defaultHeight: 80,
    strokeColor: '#E11D48',
    fillColor: '#FFE4E6',
    svgPath: 'M 50 85 C 10 50, 0 20, 25 10 C 40 5, 50 25, 50 25 C 50 25, 60 5, 75 10 C 100 20, 90 50, 50 85 Z',
  },
  {
    id: 'shape-corner-filigree',
    name: 'Hoa Văn Góc Cưới Hoàng Gia',
    category: 'ornament',
    categoryLabel: 'Họa Tiết',
    viewBox: '0 0 120 120',
    defaultWidth: 90,
    defaultHeight: 90,
    strokeColor: '#8B1E2D',
    fillColor: 'transparent',
    svgPath: 'M 10 110 L 10 10 L 110 10 M 10 10 Q 50 50, 90 10 M 10 10 Q 50 50, 10 90',
  },
];
