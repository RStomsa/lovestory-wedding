import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

export type WidgetCategory = 'event_info' | 'guest_interaction' | 'media';

export interface WidgetStylePreset {
  id: string;
  name: string;
  desc: string;
  previewBadge?: string;
  defaultConfig?: Record<string, any>;
}

export interface SystemWidgetDefinition {
  id: string;
  type: string;
  name: string;
  category: WidgetCategory;
  categoryLabel: string;
  description: string;
  iconType: string;
  defaultWidth: number;
  defaultHeight: number;
  status: 'ACTIVE' | 'DISABLED';
  order: number;
  availableStyles: WidgetStylePreset[];
  defaultConfig: Record<string, any>;
  usageCount: number; // Thực tế từ Database Sites
  updatedAt?: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const WIDGET_SETTINGS_FILE = path.join(DATA_DIR, 'widgetSettings.json');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// 14 TIỆN ÍCH TIÊU CHUẨN CỦA HỆ THỐNG LOVESTORY STUDIO
export const SYSTEM_WIDGETS_CATALOG: Omit<SystemWidgetDefinition, 'usageCount'>[] = [
  {
    id: 'calendar',
    type: 'calendar',
    name: 'Lịch Ngày Cưới',
    category: 'event_info',
    categoryLabel: 'Thông tin sự kiện',
    description: 'Hiển thị lịch tháng với ngày cưới nổi bật, kèm nút đánh dấu lịch và đếm ngày',
    iconType: 'calendar',
    defaultWidth: 420,
    defaultHeight: 330,
    status: 'ACTIVE',
    order: 1,
    availableStyles: [
      { id: 'classic-grid', name: 'Lưới Tháng Cổ Điển', desc: 'Trọn vẹn 31 ngày dạng lưới tháng truyền thống' },
      { id: 'mini-strip', name: 'Thanh Ngang Tối Giản', desc: 'Tuần lễ đám cưới mini thanh lịch ngang' },
      { id: 'card-pin', name: 'Bưu Thiếp Vintage', desc: 'Giấy Kraft cổ điển đính ghim và tem thư' },
      { id: 'frosted-glass', name: 'Pha Lê Kính Mờ', desc: 'Hiệu ứng kính mờ viền ánh kim sang trọng' },
    ],
    defaultConfig: {
      style: 'classic-grid',
      selectedDay: 28,
      selectedMonth: 12,
      selectedYear: 2026,
      markerColor: '#e11d48',
      monthTitle: 'THÁNG 12 / 2026',
      subtitle: 'SAVE THE DATE',
    },
  },
  {
    id: 'countdown',
    type: 'countdown',
    name: 'Đếm Ngược Ngày Cưới',
    category: 'event_info',
    categoryLabel: 'Thông tin sự kiện',
    description: 'Đồng hồ đếm ngược từng ngày, giờ, phút, giây đến thời khắc trao nhau lời thề',
    iconType: 'countdown',
    defaultWidth: 420,
    defaultHeight: 120,
    status: 'ACTIVE',
    order: 2,
    availableStyles: [
      { id: 'boxes', name: 'Hộp Số Hiện Đại', desc: 'Khối hộp số bo góc nổi bật' },
      { id: 'minimal', name: 'Tối Giản Tinh Tế', desc: 'Dãy số thanh mảnh không viền hộp' },
      { id: 'circles', name: 'Vòng Tròn Đồng Hồ', desc: 'Hình tròn hiển thị thời gian' },
      { id: 'flip-card', name: 'Thẻ Lật Cổ Điển', desc: 'Hiệu ứng đồng hồ lật vintage' },
      { id: 'glass', name: 'Pha Lê Kính Mờ', desc: 'Hiệu ứng kính mờ ánh kim hiện đại' },
      { id: 'romantic', name: 'Trái Tim Lãng Mạn', desc: 'Hộp số nhịp đập trái tim tình yêu' },
    ],
    defaultConfig: {
      style: 'boxes',
      quote: 'Cùng đếm ngược đến khoảnh khắc trọng đại của chúng mình',
      targetDate: '2026-12-28T18:00',
      accentColor: '#d97706',
    },
  },
  {
    id: 'map',
    type: 'map',
    name: 'Bản Đồ & Chỉ Đường',
    category: 'event_info',
    categoryLabel: 'Thông tin sự kiện',
    description: 'Bản đồ vị trí tổ chức tiệc cưới, tích hợp Google Maps 1-chạm mở điều hướng GPS',
    iconType: 'map',
    defaultWidth: 420,
    defaultHeight: 250,
    status: 'ACTIVE',
    order: 3,
    availableStyles: [
      { id: 'interactive-card', name: 'Thẻ Tương Tác Kèm Nút', desc: 'Hiển thị bản đồ kèm nút chỉ đường Google Maps & Hotline' },
      { id: 'minimal-pin', name: 'Ghim Vị Trí Tối Giản', desc: 'Tên địa điểm và nút mở ứng dụng bản đồ trên điện thoại' },
      { id: 'directions-card', name: 'Chỉ Đường Chi Tiết', desc: 'Thẻ thông tin dẫn đường sang trọng kèm ảnh địa điểm' },
    ],
    defaultConfig: {
      venueName: 'Trung Tâm Tiệc Cưới Trống Đồng Palace',
      address: 'Số 489 Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội',
      googleMapsUrl: 'https://maps.google.com',
      hotline: '0988 888 888',
    },
  },
  {
    id: 'story_timeline',
    type: 'story_timeline',
    name: 'Dòng Thời Gian Tình Yêu',
    category: 'event_info',
    categoryLabel: 'Thông tin sự kiện',
    description: 'Kể lại hành trình tình yêu ngọt ngào qua các mốc thời gian đặc biệt của cặp đôi',
    iconType: 'timeline',
    defaultWidth: 420,
    defaultHeight: 340,
    status: 'ACTIVE',
    order: 4,
    availableStyles: [
      { id: 'vertical-dots', name: 'Trục Dọc Điểm Chấm', desc: 'Đường line dọc thanh thoát với các điểm mốc tình yêu' },
      { id: 'milestone-cards', name: 'Thẻ Cột Mốc Xen Kẽ', desc: 'Các thẻ mốc thời gian bố trí ziczac trái phải' },
    ],
    defaultConfig: {
      title: 'Hành Trình Yêu Thương',
      milestones: [
        { year: '2022', title: 'Lần Đầu Gặp Gỡ', desc: 'Một buổi chiều thu Hà Nội tại quán cà phê quen' },
        { year: '2024', title: 'Lời Cầu Hôn', desc: 'Dưới bầu trời hoàng hôn rực rỡ ở Đà Lạt' },
        { year: '2026', title: 'Ngày Về Chung Một Nhà', desc: 'Khởi đầu cho một chương mới đong đầy yêu thương' },
      ],
    },
  },
  {
    id: 'dresscode',
    type: 'dresscode',
    name: 'Bảng Màu Trang Phục (Dresscode)',
    category: 'event_info',
    categoryLabel: 'Thông tin sự kiện',
    description: 'Gợi ý bảng màu trang phục để khách mời có những bức hình đồng điệu tuyệt đẹp',
    iconType: 'dresscode',
    defaultWidth: 420,
    defaultHeight: 180,
    status: 'ACTIVE',
    order: 5,
    availableStyles: [
      { id: 'color-swatches', name: 'Bảng Mẫu Tròn Màu', desc: 'Các chấm tròn màu sắc kèm tên gọi gợi ý' },
      { id: 'palette-cards', name: 'Thẻ Bảng Màu Thời Trang', desc: 'Thẻ phối màu thời trang kèm hướng dẫn' },
    ],
    defaultConfig: {
      title: 'Gợi Ý Trang Phục (Dress Code)',
      note: 'Quý khách vui lòng chọn trang phục theo tông màu để ngày vui thêm phần đồng điệu',
      colors: ['#FFFFFF', '#FDF2E9', '#E8D5C4', '#A89F91', '#D4AF37'],
    },
  },
  {
    id: 'family_info',
    type: 'family_info',
    name: 'Thông Tin Hai Bên Gia Đình',
    category: 'event_info',
    categoryLabel: 'Thông tin sự kiện',
    description: 'Hôn phối trang trọng kính báo, danh tính thân phụ thân mẫu nhà trai và nhà gái',
    iconType: 'family',
    defaultWidth: 420,
    defaultHeight: 220,
    status: 'ACTIVE',
    order: 6,
    availableStyles: [
      { id: 'two-column-card', name: 'Hai Cột Trang Trọng', desc: 'Nhà trai bên trái, Nhà gái bên phải cân xứng chuẩn lễ nghi' },
      { id: 'crest-classic', name: 'Huy Hiệu Hoàng Gia', desc: 'Bố cục phong cách thiệp cưới hoàng gia cổ điển' },
      { id: 'minimalist-row', name: 'Dòng Tối Giản', desc: 'Thẻ ngang tối giản thanh lịch hiện đại' },
    ],
    defaultConfig: {
      style: 'two-column-card',
      header: 'HÔN PHỐI TRÂN TRỌNG KÍNH BÁO',
      subheader: 'Gia Đình Hai Bên',
      invitationNote: 'Kính mời quý quan viên hai họ và bạn bè thân hữu tới dự',
      groomFather: 'Ông: Nguyễn Văn An',
      groomMother: 'Bà: Trần Thị Mai',
      groomTitle: 'Trưởng Nam',
      groomName: 'Minh Trí',
      brideFather: 'Ông: Lê Hoàng Long',
      brideMother: 'Bà: Phạm Thu Cúc',
      brideTitle: 'Út Nữ',
      brideName: 'Ngọc Anh',
      accentColor: '#be185d',
    },
  },
  {
    id: 'reminder',
    type: 'reminder',
    name: 'Lời Nhắc Lịch (Add to Calendar)',
    category: 'event_info',
    categoryLabel: 'Thông tin sự kiện',
    description: 'Nút bấm 1-chạm lưu tự động sự kiện cưới vào Google Calendar, Apple Calendar, Outlook',
    iconType: 'reminder',
    defaultWidth: 420,
    defaultHeight: 70,
    status: 'ACTIVE',
    order: 7,
    availableStyles: [
      { id: 'pill-button', name: 'Nút Bo Tròn Nổi Bật', desc: 'Nút icon chuông kèm chữ Thêm vào lịch' },
    ],
    defaultConfig: {
      buttonText: 'Thêm Lịch Nhắc Sự Kiện Cưới',
      accentColor: '#e11d48',
    },
  },
  {
    id: 'call',
    type: 'call',
    name: 'Nút Gọi Hotline Đón Tiếp',
    category: 'event_info',
    categoryLabel: 'Thông tin sự kiện',
    description: 'Nút gọi điện thoại trực tiếp cho chú rể, cô dâu hoặc phụ trách đón tiếp khách',
    iconType: 'call',
    defaultWidth: 420,
    defaultHeight: 70,
    status: 'ACTIVE',
    order: 8,
    availableStyles: [
      { id: 'hotline-bar', name: 'Thanh Hotline Nhanh', desc: 'Thanh số điện thoại kèm icon gọi thoại' },
    ],
    defaultConfig: {
      label: 'Liên Hệ Đón Tiếp: 0988 888 888',
      phone: '0988888888',
    },
  },
  {
    id: 'rsvp',
    type: 'rsvp',
    name: 'Form Xác Nhận Tham Dự (RSVP)',
    category: 'guest_interaction',
    categoryLabel: 'Tương tác khách mời',
    description: 'Thu thập thông tin khách tham dự tiệc, số người đi cùng, yêu cầu ăn uống và xe đưa đón',
    iconType: 'rsvp',
    defaultWidth: 420,
    defaultHeight: 340,
    status: 'ACTIVE',
    order: 9,
    availableStyles: [
      { id: 'elegant-form', name: 'Form Sang Trọng Bo Góc', desc: 'Thiết kế form tinh tế kèm nút xác nhận nổi bật' },
      { id: 'compact-modal', name: 'Thanh Nút Bật Nhanh', desc: 'Thanh nút xác nhận mini kèm số lượng người tham dự' },
      { id: 'classic-card', name: 'Thẻ Cổ Điển Viền Vàng', desc: 'Phong cách thiệp cưới hoàng gia Châu Âu viền vàng' },
      { id: 'glass-morphism', name: 'Kính Mờ Hiện Đại', desc: 'Mặt kính xuyên thấu ánh sáng hiện đại tinh tế' },
    ],
    defaultConfig: {
      title: 'Xác Nhận Tham Dự (RSVP)',
      subtitle: 'Sự hiện diện của quý khách là niềm vinh hạnh lớn của gia đình chúng tôi',
      enablePartySize: true,
      enableDietary: true,
    },
  },
  {
    id: 'wishes',
    type: 'wishes',
    name: 'Sổ Lưu Bút & Lời Chúc',
    category: 'guest_interaction',
    categoryLabel: 'Tương tác khách mời',
    description: 'Nơi khách mời để lại những lời chúc phúc ấm áp và xem lời chúc của bạn bè người thân',
    iconType: 'wishes',
    defaultWidth: 420,
    defaultHeight: 340,
    status: 'ACTIVE',
    order: 10,
    availableStyles: [
      { id: 'bubble-wall', name: 'Tường Lời Chúc Bong Bóng', desc: 'Hiển thị các lời chúc dạng bong bóng tin nhắn mềm mại' },
      { id: 'glass-card', name: 'Pha Lê Kính Mờ', desc: 'Hiệu ứng kính mờ ánh kim sang trọng hiện đại' },
      { id: 'vintage-scroll', name: 'Thiệp Giấy Thư Tay', desc: 'Giấy Kraft cổ điển hoài niệm kèm con dấu sáp đỏ' },
      { id: 'minimal-list', name: 'Danh Sách Tinh Gọn', desc: 'Giao diện phẳng tối giản hiện đại với đường phân cách' },
    ],
    defaultConfig: {
      title: 'Sổ Lưu Bút Mừng Cưới',
      placeholder: 'Gửi lời chúc phúc tốt đẹp nhất đến cô dâu & chú rể...',
    },
  },
  {
    id: 'giftbox',
    type: 'giftbox',
    name: 'Hộp Mừng Cưới & QR VietQR',
    category: 'guest_interaction',
    categoryLabel: 'Tương tác khách mời',
    description: 'Hộp mừng cưới trực tuyến tích hợp mã QR ngân hàng VietQR chuyển khoản nhanh chóng',
    iconType: 'giftbox',
    defaultWidth: 420,
    defaultHeight: 280,
    status: 'ACTIVE',
    order: 11,
    availableStyles: [
      { id: 'qr-card', name: 'Thẻ Mã QR VietQR', desc: 'Thẻ hiển thị QR code chuyển khoản mừng cưới 1-chạm' },
      { id: 'dual-qr', name: '2 Mã QR Nhà Trai & Gái', desc: 'Tách biệt tài khoản mừng cưới bên Nhà Trai và Nhà Gái' },
      { id: 'red-envelope', name: 'Bao Lì Xì May Mắn', desc: 'Phong bao đỏ chữ Hỷ truyền thống may mắn' },
      { id: 'bank-card', name: 'Thẻ Ngân Hàng Sang Trọng', desc: 'Phong cách thẻ kim loại VIP mạ vàng' },
    ],
    defaultConfig: {
      title: 'Hộp Mừng Cưới Chúc Phúc',
      bankName: 'MB Bank',
      accountNumber: '9999888866',
      accountName: 'NGUYEN MINH TRI',
    },
  },
  {
    id: 'guest_name',
    type: 'guest_name',
    name: 'Tên Khách Mời Tự Động (?to=)',
    category: 'guest_interaction',
    categoryLabel: 'Tương tác khách mời',
    description: 'Tự động hiển thị tên khách mời đích danh khi mở thiệp từ link cá nhân hóa (?to=Tên+Khách)',
    iconType: 'guest_name',
    defaultWidth: 420,
    defaultHeight: 100,
    status: 'ACTIVE',
    order: 12,
    availableStyles: [
      { id: 'gold-badge', name: 'Huy Hiệu Mạ Vàng', desc: 'Khung mạ vàng trang trọng hiển thị Thân gửi: [Tên khách]' },
      { id: 'calligraphy', name: 'Thư Pháp Bay Bổng', desc: 'Chữ viết tay nghệ thuật bay bổng mềm mại' },
      { id: 'ticket-seal', name: 'Vé Mời Vintage Đóng Dấu', desc: 'Vé mời cổ điển có tem niêm phong và mã số khách' },
    ],
    defaultConfig: {
      prefix: 'Thân gửi:',
      defaultName: 'Quý Khách & Người Thương',
    },
  },
  {
    id: 'music_player',
    type: 'music_player',
    name: 'Đĩa Than Phát Nhạc (Vinyl Player)',
    category: 'media',
    categoryLabel: 'Âm thanh & Video',
    description: 'Trình phát nhạc phong cách đĩa than cổ điển, xoay 360 độ khi phát nhạc kèm sóng âm thanh',
    iconType: 'music_player',
    defaultWidth: 420,
    defaultHeight: 240,
    status: 'ACTIVE',
    order: 13,
    availableStyles: [
      { id: 'vinyl-retro', name: 'Đĩa Than Retro Xoay 360', desc: 'Đĩa than vinyl có cần gạt và chuyển động xoay sống động' },
      { id: 'cassette', name: 'Băng Cassette Vintage', desc: 'Băng từ cổ điển cuộn băng quay liên tục vintage' },
      { id: 'compact-bar', name: 'Thanh Mini Nổi Tối Giản', desc: 'Thanh sóng âm thanh waveform thanh mảnh' },
    ],
    defaultConfig: {
      autoPlay: false,
      trackTitle: 'Until I Found You - Stephen Sanchez',
    },
  },
  {
    id: 'video',
    type: 'video',
    name: 'Video Kỷ Niệm Cưới (Youtube / Clip)',
    category: 'media',
    categoryLabel: 'Âm thanh & Video',
    description: 'Khung phát video Youtube đám cưới, video pre-wedding hoặc clip kỷ niệm tình yêu',
    iconType: 'video',
    defaultWidth: 420,
    defaultHeight: 280,
    status: 'ACTIVE',
    order: 14,
    availableStyles: [
      { id: 'cinema-frame', name: 'Khung Phim Điện Ảnh', desc: 'Khung video bo góc phong cách phim màn ảnh rộng' },
    ],
    defaultConfig: {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      aspectRatio: '16:9',
    },
  },
];

export async function getAllSystemWidgets(): Promise<SystemWidgetDefinition[]> {
  const customSettings = readJsonFile<Record<string, Partial<SystemWidgetDefinition>>>(WIDGET_SETTINGS_FILE, {});

  // Thống kê thật từ Database (Zero-mock policy)
  const widgetUsageCounts: Record<string, number> = {};
  try {
    const allSites = await prisma.site.findMany({
      select: { draftData: true },
    });

    for (const site of allSites) {
      if (!site.draftData) continue;
      try {
        const parsed = JSON.parse(site.draftData);
        const elements = parsed.elements || [];
        for (const el of elements) {
          if (el.type === 'widget' && el.widgetType) {
            widgetUsageCounts[el.widgetType] = (widgetUsageCounts[el.widgetType] || 0) + 1;
          }
        }
      } catch {
        // Ignored
      }
    }
  } catch (err) {
    console.warn('Error querying site widgets usage from DB:', err);
  }

  const baseWidgets = SYSTEM_WIDGETS_CATALOG.map((base) => {
    const override = customSettings[base.id] || {};
    // Kết hợp thông minh: Giữ trọn bộ kiểu dáng gốc của hệ thống và bổ sung/ghi đè các kiểu dáng tuỳ biến
    const baseStyleMap = new Map((base.availableStyles || []).map((s) => [s.id, s]));
    if (override.availableStyles && Array.isArray(override.availableStyles)) {
      for (const s of override.availableStyles) {
        baseStyleMap.set(s.id, { ...(baseStyleMap.get(s.id) || {}), ...s });
      }
    }
    const mergedStyles = Array.from(baseStyleMap.values());

    return {
      ...base,
      ...override,
      availableStyles: mergedStyles,
      usageCount: widgetUsageCounts[base.type] || 0,
      defaultConfig: {
        ...base.defaultConfig,
        ...(override.defaultConfig || {}),
      },
    };
  });

  // Nạp thêm các tiện ích tuỳ chỉnh do Quản trị viên tự thêm mới
  const baseIds = new Set(SYSTEM_WIDGETS_CATALOG.map((b) => b.id));
  const customList: SystemWidgetDefinition[] = [];
  for (const [id, def] of Object.entries(customSettings)) {
    if (!baseIds.has(id) && (def as any).name) {
      customList.push({
        id,
        type: (def as any).type || id,
        name: def.name || 'Tiện ích tuỳ chỉnh',
        category: def.category || 'event_info',
        categoryLabel: def.categoryLabel || 'Thông tin sự kiện',
        description: def.description || '',
        iconType: def.iconType || 'calendar',
        defaultWidth: def.defaultWidth || 420,
        defaultHeight: def.defaultHeight || 250,
        status: def.status || 'ACTIVE',
        order: def.order || 99,
        availableStyles: def.availableStyles || [
          { id: 'standard', name: 'Tiêu Chuẩn', desc: 'Kiểu hiển thị mặc định' },
        ],
        defaultConfig: def.defaultConfig || {},
        usageCount: widgetUsageCounts[(def as any).type || id] || 0,
        updatedAt: def.updatedAt,
      });
    }
  }

  return [...baseWidgets, ...customList];
}

export async function updateSystemWidget(
  widgetId: string,
  updates: Partial<SystemWidgetDefinition>
): Promise<SystemWidgetDefinition | null> {
  const customSettings = readJsonFile<Record<string, Partial<SystemWidgetDefinition>>>(WIDGET_SETTINGS_FILE, {});
  customSettings[widgetId] = {
    ...(customSettings[widgetId] || {}),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(WIDGET_SETTINGS_FILE, customSettings);

  const all = await getAllSystemWidgets();
  return all.find((w) => w.id === widgetId) || null;
}

export async function addOrUpdateWidgetStyle(
  widgetId: string,
  style: WidgetStylePreset
): Promise<SystemWidgetDefinition | null> {
  const all = await getAllSystemWidgets();
  const target = all.find((w) => w.id === widgetId);
  if (!target) return null;

  const currentStyles = [...(target.availableStyles || [])];
  const existingIdx = currentStyles.findIndex((s) => s.id === style.id);

  if (existingIdx >= 0) {
    currentStyles[existingIdx] = { ...currentStyles[existingIdx], ...style };
  } else {
    currentStyles.push(style);
  }

  return updateSystemWidget(widgetId, { availableStyles: currentStyles });
}

export async function deleteWidgetStyle(
  widgetId: string,
  styleId: string
): Promise<SystemWidgetDefinition | null> {
  const all = await getAllSystemWidgets();
  const target = all.find((w) => w.id === widgetId);
  if (!target) return null;

  const filteredStyles = (target.availableStyles || []).filter((s) => s.id !== styleId);
  if (filteredStyles.length === 0) {
    throw new Error('Không thể xóa kiểu hiển thị duy nhất còn lại của tiện ích');
  }

  return updateSystemWidget(widgetId, { availableStyles: filteredStyles });
}

export async function createCustomWidget(
  widgetData: Partial<SystemWidgetDefinition>
): Promise<SystemWidgetDefinition> {
  const customSettings = readJsonFile<Record<string, Partial<SystemWidgetDefinition>>>(WIDGET_SETTINGS_FILE, {});
  const id = widgetData.id || `custom_${Date.now()}`;

  const newWidget: SystemWidgetDefinition = {
    id,
    type: widgetData.type || id,
    name: widgetData.name || 'Tiện ích mới',
    category: widgetData.category || 'event_info',
    categoryLabel: widgetData.categoryLabel || 'Thông tin sự kiện',
    description: widgetData.description || '',
    iconType: widgetData.iconType || 'calendar',
    defaultWidth: widgetData.defaultWidth || 420,
    defaultHeight: widgetData.defaultHeight || 250,
    status: widgetData.status || 'ACTIVE',
    order: widgetData.order || 99,
    availableStyles: widgetData.availableStyles || [
      { id: 'standard', name: 'Tiêu Chuẩn', desc: 'Kiểu hiển thị mặc định' },
    ],
    defaultConfig: widgetData.defaultConfig || {},
    usageCount: 0,
    updatedAt: new Date().toISOString(),
  };

  customSettings[id] = newWidget;
  writeJsonFile(WIDGET_SETTINGS_FILE, customSettings);
  return newWidget;
}
