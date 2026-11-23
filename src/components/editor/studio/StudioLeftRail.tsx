'use client';

import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Palette,
  Square,
  PaintBucket,
  Music,
  Calendar,
  Layers,
  LayoutTemplate,
  Sparkles,
  FileText,
  Plus,
  Minus,
  Circle,
  Triangle,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  Loader2,
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import { SidebarTab } from './studioTypes';
import { STUDIO_TEMPLATE_PRESETS } from '@/data/studioTemplatePresets';
import { GRAPHICS_CATALOG, GraphicSticker } from '@/data/graphicsCatalog';
import weddingMusicCatalog from '@/data/weddingMusicCatalog.json';
import harvestedTemplates from '@/data/harvested_templates/index.json';
import { resolveFontFamily } from '@/lib/studioFonts';
import { WEDDING_TEXT_TEMPLATES } from '@/data/weddingTextTemplates';
import {
  CalendarWidgetIcon,
  CountdownWidgetIcon,
  MapWidgetIcon,
  ReminderWidgetIcon,
  CallWidgetIcon,
  RsvpWidgetIcon,
  CustomFormWidgetIcon,
  GuestNameWidgetIcon,
  GiftboxWidgetIcon,
  AlbumWidgetIcon,
  SlideshowWidgetIcon,
  WishesWidgetIcon,
  MusicPlayerWidgetIcon,
  StoryTimelineWidgetIcon,
  DressCodeWidgetIcon,
  FamilyInfoWidgetIcon,
  VideoWidgetIcon,
} from './StudioWidgetIcons';

export const ENVELOPE_COVER_PRESETS = [
  { id: 'default', name: 'Mặc định', desc: 'Bìa đỏ truyền thống, dấu sáp vàng hoàng gia', bg: '#8B1E2F', flapColor: '#751927', sealColor: '#D4AF37' },
  { id: 'pink_clouds', name: 'Mây hồng', desc: 'Sương hoa pastel mộng mơ phong cách Hàn Quốc', bg: '#FAD2E1', flapColor: '#F7CAD0', sealColor: '#E07A5F' },
  { id: 'green_envelope', name: 'Phong bì xanh', desc: 'Xanh rêu Vintage Botanical mộc mạc', bg: '#2D4A3E', flapColor: '#243D33', sealColor: '#D4AF37' },
  { id: 'white_envelope', name: 'Phong bì trắng', desc: 'Trắng sứ ngọc trai & nơ sáp thanh lịch', bg: '#F8F9FA', flapColor: '#E9ECEF', sealColor: '#8C7355' },
  { id: 'rose_garden', name: 'Vườn hoa hồng', desc: 'Vòng hoa hồng đỏ rượu vang sang trọng', bg: '#590D22', flapColor: '#470A1B', sealColor: '#FFB703' },
  { id: 'red_garden', name: 'Vườn hoa đỏ', desc: 'Sắc đỏ thắm rực rỡ hạnh phúc lứa đôi', bg: '#9B1D20', flapColor: '#7F181B', sealColor: '#E63946' },
  { id: 'pastel_garden', name: 'Vườn hoa pastel', desc: 'Hoa dại mùa xuân nhã nhặn', bg: '#FDE2E4', flapColor: '#F7CAD0', sealColor: '#B5838D' },
  { id: 'blue_garden', name: 'Vườn hoa lam', desc: 'Cẩm tú cầu xanh lam đại dương quý phái', bg: '#1D3557', flapColor: '#162942', sealColor: '#457B9D' },
];

export default function StudioLeftRail() {
  const {
    canvas,
    activeTab,
    setActiveTab,
    addElement,
    setCanvasBackground,
    setFallingEffect,
    setEnvelopeCover,
    elements,
    selectedId,
    updateElement,
    loadTemplateData,
    setProfileModalOpen,
    weddingProfile,
  } = useStudioStore();

  // Collapsible sub-panel drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isEnvelopeModalOpen, setIsEnvelopeModalOpen] = useState(false);

  // Background sub-tabs: Màu nền | Hình nền
  const [bgSubTab, setBgSubTab] = useState<'color' | 'image'>('color');

  // Text Template Category Filter
  const [textTemplateCategory, setTextTemplateCategory] = useState<string>('all');

  // Replace mode state for image tab
  const [isReplaceMode, setIsReplaceMode] = useState(false);

  // Uploaded images state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Dynamic Assets (Graphics & Music) loaded from server + Admin uploads
  const [graphicsList, setGraphicsList] = useState<GraphicSticker[]>(GRAPHICS_CATALOG);
  const [musicCatalog, setMusicCatalog] = useState<any[]>(weddingMusicCatalog as any[]);
  const [isUploadingGfx, setIsUploadingGfx] = useState(false);
  const gfxFileInputRef = React.useRef<HTMLInputElement>(null);

  // Helper to place newly inserted elements in the user's visible viewport
  const getSmartInsertY = (_elemHeight: number = 120) => {
    // 1. If an element is currently selected, place right below it
    const { selectedId, elements: currentElements, zoom = 1 } = useStudioStore.getState();
    if (selectedId) {
      const selected = currentElements.find((e) => e.id === selectedId);
      if (selected) {
        return Math.round(selected.y + selected.height + 20);
      }
    }

    // 2. Otherwise calculate current viewport center on canvas
    const scrollContainer =
      document.getElementById('studio-canvas-scroll-container') ||
      document.getElementById('studio-main-canvas')?.parentElement?.parentElement;

    if (scrollContainer) {
      const scrollTop = scrollContainer.scrollTop || 0;
      const clientHeight = scrollContainer.clientHeight || 700;
      const centerCanvasY = Math.round((scrollTop + clientHeight / 2 - _elemHeight / 2) / Math.max(zoom, 0.2));
      return Math.max(40, centerCanvasY);
    }

    // 3. Fallback to upper section of canvas (never at bottom!)
    return 300;
  };

  const handleUploadGraphics = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGfx(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const formData = new FormData();
        formData.append('file', file);

        let gfxUrl = '';
        try {
          const res = await fetch('/api/admin/assets/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (res.ok && data.success && data.url) {
            gfxUrl = data.url;
            fetch('/api/admin/assets/graphics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: cleanName,
                src: data.url,
                category: 'Yếu tố đám cưới',
                subCategory: 'Đồ họa của tôi',
                defaultWidth: 140,
                defaultHeight: 140,
              }),
            }).catch(() => {});
          }
        } catch (uploadErr) {
          console.warn('Upload graphic server error:', uploadErr);
        }

        if (!gfxUrl) {
          gfxUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        const uniqueGfxId = `custom-gfx-${file.lastModified.toString(36)}-${file.size.toString(36)}-${i}`;
        const newGfxItem: GraphicSticker = {
          id: uniqueGfxId,
          name: cleanName,
          src: gfxUrl,
          category: 'Yếu tố đám cưới',
          subCategory: 'Đồ họa của tôi',
          defaultWidth: 140,
          defaultHeight: 140,
        };

        setGraphicsList((prev) => [newGfxItem, ...prev]);

        // Smart insert into canvas immediately
        const targetY = getSmartInsertY(140);
        addElement({
          type: 'graphic',
          x: 170 + i * 20,
          y: targetY + i * 20,
          width: 140,
          height: 140,
          rotation: 0,
          opacity: 1,
          src: gfxUrl,
          objectFit: 'contain',
          continuousAnimation: { type: 'floating', duration: 2.0, delay: 0 },
        });
      }
    } catch (err) {
      console.error('Failed to upload custom graphic:', err);
    } finally {
      setIsUploadingGfx(false);
      if (gfxFileInputRef.current) gfxFileInputRef.current.value = '';
    }
  };

  // Fetch dynamic assets on mount
  React.useEffect(() => {
    let isCancelled = false;
    fetch('/api/studio/assets')
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled || !data.success) return;
        if (Array.isArray(data.graphics) && data.graphics.length > 0) {
          const map = new Map();
          data.graphics.forEach((g: any) => map.set(g.id, g));
          GRAPHICS_CATALOG.forEach((g) => {
            if (!map.has(g.id)) map.set(g.id, g);
          });
          setGraphicsList(Array.from(map.values()));
        }
        if (Array.isArray(data.music) && data.music.length > 0) {
          const map = new Map();
          data.music.forEach((m: any) => map.set(m.id || m.url, m));
          weddingMusicCatalog.forEach((m) => {
            if (!map.has(m.id || m.url)) map.set(m.id || m.url, m);
          });
          setMusicCatalog(Array.from(map.values()));
        }
      })
      .catch((err) => console.error('Failed to load dynamic studio assets:', err));

    return () => {
      isCancelled = true;
    };
  }, []);

  // State for Graphics Category filter (Screenshot 9: "Tất cả", "Yếu tố đám cưới", "Văn hóa Việt", "Nhân vật"...)
  const [graphicCategory, setGraphicCategory] = useState<string>('Tất cả');

  // Sub-filter for Lễ hội nổi bật (Screenshot 8: "Nổi bật", "Ngôi sao", "Trái tim", "Mùa cưới")
  const [festiveSubTab, setFestiveSubTab] = useState<string>('Nổi bật');

  // State for Templates tab filter & search
  const [templateFilter, setTemplateFilter] = useState<'all' | 'wedding' | 'birthday' | 'event'>('all');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [loadingTemplateSlug, setLoadingTemplateSlug] = useState<string | null>(null);
  const [marketTemplates, setMarketTemplates] = useState<any[]>([]);

  React.useEffect(() => {
    let isCancelled = false;
    fetch('/api/templates/studio')
      .then((r) => r.json())
      .then((d) => {
        if (!isCancelled && d.success && Array.isArray(d.catalog)) {
          setMarketTemplates(d.catalog);
        }
      })
      .catch((e) => console.warn('Fetch market templates error:', e));
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleApplyTemplate = async (slug: string, fallbackPreset?: any, title?: string) => {
    const tName = title || fallbackPreset?.name || slug;
    if (
      !confirm(
        `Áp dụng mẫu "${tName}" lên Canvas?\nThao tác này sẽ nạp 100% dữ liệu hình ảnh thật và bố cục thiết kế hoàn chỉnh của mẫu.`
      )
    ) {
      return;
    }

    setLoadingTemplateSlug(slug);
    try {
      const res = await fetch(`/api/templates/studio?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.success && data.preset && Array.isArray(data.preset.elements) && data.preset.elements.length > 0) {
        loadTemplateData(data.preset.elements, data.preset.config);
      } else if (fallbackPreset && fallbackPreset.elements) {
        loadTemplateData(fallbackPreset.elements, fallbackPreset.config);
      } else {
        alert('Không thể nạp dữ liệu chi tiết của mẫu này.');
      }
    } catch (err) {
      console.error('Lỗi khi nạp mẫu studio:', err);
      if (fallbackPreset && fallbackPreset.elements) {
        loadTemplateData(fallbackPreset.elements, fallbackPreset.config);
      } else {
        alert('Lỗi kết nối khi nạp mẫu.');
      }
    } finally {
      setLoadingTemplateSlug(null);
    }
  };

  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'text', label: 'Văn bản', icon: <Type className="w-5 h-5" /> },
    { id: 'image', label: 'Hình ảnh', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'graphic', label: 'Đồ họa', icon: <Palette className="w-5 h-5" /> },
    { id: 'shape', label: 'Hình dạng', icon: <Square className="w-5 h-5" /> },
    { id: 'background', label: 'Nền', icon: <PaintBucket className="w-5 h-5" /> },
    { id: 'music', label: 'Âm nhạc', icon: <Music className="w-5 h-5" /> },
    { id: 'widget', label: 'Tiện ích', icon: <Calendar className="w-5 h-5" /> },
    { id: 'block', label: 'Khối mẫu', icon: <Layers className="w-5 h-5" /> },
    { id: 'template', label: 'Mẫu', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 'effect', label: 'Hiệu ứng', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'pages', label: 'Trang', icon: <FileText className="w-5 h-5" /> },
  ];

  // Graphic categories
  const graphicCategories = [
    'Tất cả',
    'Đồ họa của tôi',
    'Yếu tố đám cưới',
    'Văn hóa Việt',
    'Nhân vật',
    'Hoa & Họa tiết',
    'Lễ hội nổi bật',
    'Trái tim',
    'Ngôi sao',
    'Khung viền',
  ];

  const filteredGraphics =
    graphicCategory === 'Tất cả'
      ? graphicsList
      : graphicCategory === 'Đồ họa của tôi'
      ? graphicsList.filter((item) => (item as GraphicSticker & { isCustom?: boolean }).isCustom || item.subCategory === 'Đồ họa của tôi' || item.id.startsWith('custom-'))
      : graphicsList.filter((item) => item.category === graphicCategory);

  return (
    <div className="flex h-full select-none z-20 relative">
      {/* 1. Narrow Vertical Icon Rail (Screenshot 1, 2, 3, 4) */}
      <div className="w-16 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col items-center py-2.5 gap-0.5 z-20 shadow-xs flex-shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsDrawerOpen(true);
              }}
              className={`w-14 py-2 flex flex-col items-center justify-center rounded-xl transition-all ${
                isActive
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span className="mb-0.5">{tab.icon}</span>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Flyout Drawer Panel with Toggle Tab */}
      {isDrawerOpen ? (
        <div className="relative w-72 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col h-full overflow-y-auto p-4 space-y-4 shadow-sm text-xs flex-shrink-0">
          {/* Pill Collapse Button on right edge (as seen in screenshots) */}
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-r-full shadow-md flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all cursor-pointer"
            title="Thu gọn thanh công cụ"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        {/* =========================================================================
            PAGES / TRANG (SCREENSHOT 2: "XEM NHANH - BẤM ĐỂ TỚI CHỖ ĐÓ")
        ========================================================================= */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Xem nhanh</h3>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                Bấm hoặc kéo trên thiệp thu nhỏ để tới chỗ đó.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Bìa Save The Date', y: 0, img: '/assets/wedding/templates/c165/photo_01.webp' },
                { title: 'Lịch tháng & Đếm ngược', y: 700, img: '/assets/wedding/plugins/calen_heart_1.png' },
                { title: 'Thông tin Cô dâu & Chú rể', y: 1500, img: '/assets/wedding/templates/c165/photo_02.jpg' },
                { title: 'Album ảnh cưới nghệ thuật', y: 2400, img: '/assets/wedding/templates/c165/photo_05.jpg' },
                { title: 'Địa điểm & Xác nhận RSVP', y: 3500, img: '/assets/wedding/templates/c165/photo_09.jpg' },
              ].map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const canvasEl = document.getElementById('studio-main-canvas');
                    if (canvasEl) {
                      canvasEl.parentElement?.parentElement?.scrollTo({ top: card.y, behavior: 'smooth' });
                    }
                  }}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex items-center gap-3"
                >
                  <div className="relative w-14 h-18 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider block">
                      Trang 0{idx + 1}
                    </span>
                    <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-xs mt-0.5 group-hover:text-rose-600 transition-colors">
                      {card.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SHAPES / HÌNH DẠNG (SCREENSHOT 3: "ĐƯỜNG KẺ, HÌNH VUÔNG, HÌNH CHỮ NHẬT, HÌNH TRÒN, TAM GIÁC")
        ========================================================================= */}
        {activeTab === 'shape' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Hình dạng</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Chọn hình để thêm vào thiệp cưới</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() =>
                  addElement({
                    type: 'shape',
                    shapeType: 'line',
                    x: 50,
                    y: 400,
                    width: 400,
                    height: 2,
                    rotation: 0,
                    opacity: 1,
                    fillColor: '#9c5a1a',
                  })
                }
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-rose-400 flex items-center gap-3 transition-all"
              >
                <Minus className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                <span className="font-medium text-stone-800 dark:text-stone-200">Đường kẻ</span>
              </button>

              <button
                onClick={() =>
                  addElement({
                    type: 'shape',
                    shapeType: 'square',
                    x: 175,
                    y: 400,
                    width: 150,
                    height: 150,
                    rotation: 0,
                    opacity: 1,
                    fillColor: '#EADBCE',
                    borderRadius: 8,
                  })
                }
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-rose-400 flex items-center gap-3 transition-all"
              >
                <Square className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                <span className="font-medium text-stone-800 dark:text-stone-200">Hình vuông</span>
              </button>

              <button
                onClick={() =>
                  addElement({
                    type: 'shape',
                    shapeType: 'rectangle',
                    x: 50,
                    y: 400,
                    width: 400,
                    height: 200,
                    rotation: 0,
                    opacity: 1,
                    fillColor: '#FAF7F2',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#EADBCE',
                  })
                }
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-rose-400 flex items-center gap-3 transition-all"
              >
                <Square className="w-4 h-4 text-stone-600 dark:text-stone-300 aspect-[2/1]" />
                <span className="font-medium text-stone-800 dark:text-stone-200">Hình chữ nhật</span>
              </button>

              <button
                onClick={() =>
                  addElement({
                    type: 'shape',
                    shapeType: 'circle',
                    x: 180,
                    y: 400,
                    width: 140,
                    height: 140,
                    rotation: 0,
                    opacity: 1,
                    fillColor: '#FAF7F2',
                    borderColor: '#C5A880',
                    borderWidth: 2,
                  })
                }
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-rose-400 flex items-center gap-3 transition-all"
              >
                <Circle className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                <span className="font-medium text-stone-800 dark:text-stone-200">Hình tròn</span>
              </button>

              <button
                onClick={() =>
                  addElement({
                    type: 'shape',
                    shapeType: 'triangle',
                    x: 180,
                    y: 400,
                    width: 140,
                    height: 140,
                    rotation: 0,
                    opacity: 1,
                    fillColor: '#EADBCE',
                  })
                }
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-rose-400 flex items-center gap-3 transition-all"
              >
                <Triangle className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                <span className="font-medium text-stone-800 dark:text-stone-200">Tam giác</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            GRAPHICS / ĐỒ HỌA (EXACT MATCH TO SCREENSHOT 8 & SCREENSHOT 9)
        ========================================================================= */}
        {activeTab === 'graphic' && (
          <div className="space-y-3">
            {/* Upload Graphic Dropzone from Computer (Always Visible in Graphics Tab) */}
            <div className="p-3 bg-blue-50/50 dark:bg-stone-800/80 rounded-2xl border-2 border-dashed border-blue-200 dark:border-stone-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <button
                type="button"
                onClick={() => gfxFileInputRef.current?.click()}
                disabled={isUploadingGfx}
                className="w-full flex flex-col items-center justify-center cursor-pointer text-center group"
              >
                <UploadCloud className="w-5 h-5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
                  {isUploadingGfx ? 'Đang tải đồ họa lên...' : 'Tải đồ họa từ máy tính'}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                  PNG trong suốt, SVG, WebP
                </span>
              </button>
              <input
                type="file"
                ref={gfxFileInputRef}
                accept="image/png,image/svg+xml,image/webp,image/jpeg"
                multiple
                className="hidden"
                onChange={handleUploadGraphics}
              />
            </div>

            {graphicCategory === 'Tất cả' ? (
              /* SCREENSHOT 9: Root Category View */
              <>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">Đồ họa</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    Bấm hoặc kéo vào thiệp để thêm
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {graphicCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGraphicCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                        graphicCategory === cat
                          ? 'bg-blue-600 text-white font-medium shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Section 1: Yếu tố đám cưới */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Yếu tố đám cưới</h4>
                    <button
                      onClick={() => setGraphicCategory('Yếu tố đám cưới')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {graphicsList.filter((i) => i.category === 'Yếu tố đám cưới')
                      .slice(0, 6)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            const targetY = getSmartInsertY(item.defaultHeight || 100);
                            addElement({
                              type: 'graphic',
                              x: 190,
                              y: targetY,
                              width: item.defaultWidth || 100,
                              height: item.defaultHeight || 100,
                              rotation: 0,
                              opacity: 1,
                              src: item.src,
                              objectFit: 'contain',
                              continuousAnimation: { type: 'floating', duration: 2.0, delay: 0 },
                            });
                          }}
                          className="aspect-square p-2 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center hover:border-blue-400 hover:shadow-md transition-all group shadow-2xs"
                          title={item.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.src}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </button>
                      ))}
                  </div>
                </div>

                {/* Section 2: Văn hóa Việt */}
                <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Văn hóa Việt</h4>
                    <button
                      onClick={() => setGraphicCategory('Văn hóa Việt')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {graphicsList.filter((i) => i.category === 'Văn hóa Việt')
                      .slice(0, 6)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            const targetY = getSmartInsertY(item.defaultHeight || 100);
                            addElement({
                              type: 'graphic',
                              x: 190,
                              y: targetY,
                              width: item.defaultWidth || 100,
                              height: item.defaultHeight || 100,
                              rotation: 0,
                              opacity: 1,
                              src: item.src,
                              objectFit: 'contain',
                              continuousAnimation: { type: 'floating', duration: 2.0, delay: 0 },
                            });
                          }}
                          className="aspect-square p-2 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center hover:border-blue-400 hover:shadow-md transition-all group shadow-2xs"
                          title={item.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.src}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </button>
                      ))}
                  </div>
                </div>

                {/* Section 3: Nhân vật */}
                <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Nhân vật</h4>
                    <button
                      onClick={() => setGraphicCategory('Nhân vật')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {graphicsList.filter((i) => i.category === 'Nhân vật')
                      .slice(0, 6)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            const targetY = getSmartInsertY(item.defaultHeight || 100);
                            addElement({
                              type: 'graphic',
                              x: 190,
                              y: targetY,
                              width: item.defaultWidth || 100,
                              height: item.defaultHeight || 100,
                              rotation: 0,
                              opacity: 1,
                              src: item.src,
                              objectFit: 'contain',
                              continuousAnimation: { type: 'floating', duration: 2.0, delay: 0 },
                            });
                          }}
                          className="aspect-square p-2 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center hover:border-blue-400 hover:shadow-md transition-all group shadow-2xs"
                          title={item.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.src}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </button>
                      ))}
                  </div>
                </div>
              </>
            ) : graphicCategory === 'Lễ hội nổi bật' ? (
              /* SCREENSHOT 8: Lễ hội nổi bật Detail View */
              <>
                <div className="flex items-center gap-2">
                  <ChevronLeft
                    onClick={() => setGraphicCategory('Tất cả')}
                    className="w-4 h-4 cursor-pointer text-stone-500 hover:text-stone-900 transition-colors"
                  />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">Lễ hội nổi bật</h3>
                </div>

                {/* Sub-filter Pills (Screenshot 8: [Nổi bật] [Ngôi sao] [Trái tim] [Mùa cưới]) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['Nổi bật', 'Ngôi sao', 'Trái tim', 'Mùa cưới'].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setFestiveSubTab(sub)}
                      className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                        festiveSubTab === sub
                          ? 'bg-stone-900 text-white font-medium shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* 2-Column Card Grid with Names (Screenshot 8) */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {graphicsList.filter((i) => {
                    if (festiveSubTab === 'Ngôi sao') return i.category === 'Ngôi sao' || i.name.toLowerCase().includes('sao');
                    if (festiveSubTab === 'Trái tim') return i.category === 'Trái tim' || i.name.toLowerCase().includes('tim');
                    if (festiveSubTab === 'Mùa cưới') return i.category === 'Yếu tố đám cưới';
                    return i.category === 'Lễ hội nổi bật';
                  }).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        const targetY = getSmartInsertY(item.defaultHeight || 100);
                        addElement({
                          type: 'graphic',
                          x: 190,
                          y: targetY,
                          width: item.defaultWidth || 100,
                          height: item.defaultHeight || 100,
                          rotation: 0,
                          opacity: 1,
                          src: item.src,
                          objectFit: 'contain',
                          continuousAnimation: { type: 'floating', duration: 2.0, delay: 0 },
                        });
                      }}
                      className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col items-center hover:border-blue-400 hover:shadow-md transition-all group shadow-2xs"
                    >
                      <div className="w-16 h-16 flex items-center justify-center mb-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.src}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300 truncate w-full text-center">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Specific Category Detail View */
              <>
                <div className="flex items-center gap-2">
                  <ChevronLeft
                    onClick={() => setGraphicCategory('Tất cả')}
                    className="w-4 h-4 cursor-pointer text-stone-500 hover:text-stone-900 transition-colors"
                  />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">{graphicCategory}</h3>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {graphicCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGraphicCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                        graphicCategory === cat
                          ? 'bg-blue-600 text-white font-medium shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* 3-Column Card Grid */}
                {filteredGraphics.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400">
                    Chưa có đồ họa nào trong mục này. Bấm &quot;Tải đồ họa từ máy tính&quot; ở trên để thêm!
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {filteredGraphics.map((item) => (
                      <button
                      key={item.id}
                      onClick={() => {
                        const targetY = getSmartInsertY(item.defaultHeight || 100);
                        addElement({
                          type: 'graphic',
                          x: 190,
                          y: targetY,
                          width: item.defaultWidth || 100,
                          height: item.defaultHeight || 100,
                          rotation: 0,
                          opacity: 1,
                          src: item.src,
                          objectFit: 'contain',
                          continuousAnimation: { type: 'floating', duration: 2.0, delay: 0 },
                        });
                      }}
                      className="aspect-square p-2 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center hover:border-blue-400 hover:shadow-md transition-all group shadow-2xs"
                      title={item.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
                )}
              </>
            )}
          </div>
        )}

        {/* =========================================================================
            IMAGES / HÌNH ẢNH (SCREENSHOT 1: "CHỌN ẢNH ĐỂ THÊM VÀO THIỆP...")
        ========================================================================= */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Hình ảnh</h3>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                Chọn ảnh để thêm vào thiệp, hoặc kéo đến vị trí bạn muốn.
              </p>
            </div>

            {/* Replace Mode Notice Banner (Screenshot 2) */}
            <div className="flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {isReplaceMode ? 'Đang chọn ảnh thay thế...' : 'Chọn ảnh để thay thế'}
              </span>
              <button
                onClick={() => setIsReplaceMode(!isReplaceMode)}
                className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 transition-colors"
              >
                {isReplaceMode ? 'Xong' : 'Hủy'}
              </button>
            </div>

            {/* Upload Zone (Screenshot 2: "Tải ảnh lên hoặc kéo tối đa 15 ảnh vào đây") */}
            <label className="w-full p-5 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-stone-800/40 transition-colors shadow-2xs">
              <UploadCloud className="w-6 h-6 text-blue-500 mb-1" />
              <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">Tải ảnh lên</span>
              <span className="text-[10px] text-stone-400 mt-0.5">hoặc kéo tối đa 15 ảnh vào đây</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  Array.from(files).forEach((file, idx) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result as string;
                      setUploadedImages((prev) => [dataUrl, ...prev]);
                      if (isReplaceMode && selectedId) {
                        updateElement(selectedId, { src: dataUrl }, true);
                        setIsReplaceMode(false);
                      } else {
                        addElement({
                          type: 'image',
                          x: 50 + idx * 20,
                          y: 350 + idx * 20,
                          width: 400,
                          height: 500,
                          rotation: 0,
                          opacity: 1,
                          src: dataUrl,
                          borderRadius: 16,
                          objectFit: 'cover',
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
            </label>

            {/* Counter (Screenshot 1: "0/10 ảnh - 0 MB") */}
            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
              <span>{uploadedImages.length} / 10 ảnh • {Math.round(uploadedImages.length * 1.2)} MB</span>
              <span>Đang lưu trữ</span>
            </div>

            {/* Library Section (Screenshot 1: Empty state or gallery) */}
            <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block">
                Thư viện ảnh
              </span>

              {uploadedImages.length === 0 ? (
                /* Empty state matching Screenshot 1 */
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 border border-stone-100 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-800/20">
                  <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-500 mb-1">
                    <ImageIcon className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <h4 className="font-bold text-stone-800 dark:text-stone-200 text-xs">Chưa có ảnh nào</h4>
                  <p className="text-[11px] text-stone-400">Tải ảnh lên để dùng trong thiệp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (isReplaceMode && selectedId) {
                          updateElement(selectedId, { src: url }, true);
                          setIsReplaceMode(false);
                        } else {
                          addElement({
                            type: 'image',
                            x: 50 + (i % 3) * 20,
                            y: 350 + (i % 3) * 20,
                            width: 400,
                            height: 500,
                            rotation: 0,
                            opacity: 1,
                            src: url,
                            borderRadius: 16,
                            objectFit: 'cover',
                          });
                        }
                      }}
                      className="aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 hover:border-rose-500 transition-all shadow-xs relative group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`uploaded-${i}`} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition-opacity">
                        {isReplaceMode ? 'Thay vào ảnh chọn' : 'Thêm vào thiệp'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Template Stock Photos */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <span className="text-[11px] font-semibold text-stone-500 block">Ảnh mẫu thiệp hiện tại</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '/assets/wedding/templates/c165/photo_01.webp',
                    '/assets/wedding/templates/c165/photo_02.jpg',
                    '/assets/wedding/templates/c165/photo_03.jpg',
                    '/assets/wedding/templates/c165/photo_05.jpg',
                  ].map((url, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (isReplaceMode && selectedId) {
                          updateElement(selectedId, { src: url }, true);
                          setIsReplaceMode(false);
                        } else {
                          addElement({
                            type: 'image',
                            x: 50,
                            y: 300,
                            width: 400,
                            height: 520,
                            rotation: 0,
                            opacity: 1,
                            src: url,
                            borderRadius: 16,
                            objectFit: 'cover',
                          });
                        }
                      }}
                      className="aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 hover:border-rose-500 transition-all shadow-xs relative group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`photo-${i}`} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition-opacity">
                        {isReplaceMode ? 'Thay vào ảnh chọn' : 'Thêm vào thiệp'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TEXT / VĂN BẢN (MẪU VĂN BẢN CHUẨN ĐỒ HỌA + TYPOGRAPHY PRESETS)
        ========================================================================= */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Quick Wedding Profile Creator Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-stone-850 dark:to-stone-800 border border-rose-200/80 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Điền nhanh thông tin cưới</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                  Nhanh 1-chạm
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                Tạo hồ sơ cưới để tự động điền tên cô dâu, chú rể, ngày cưới, địa điểm và các lễ lên thiệp.
              </p>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white dark:bg-white dark:text-stone-900 font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{weddingProfile.isLinked ? 'Sửa hồ sơ cưới' : 'Tạo hồ sơ cưới'}</span>
              </button>
            </div>

            {/* MẪU VĂN BẢN (Exact Match to User Screenshot) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">Mẫu văn bản</h3>
                <span className="text-[10px] text-stone-400 font-medium">Chạm để chèn</span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'couple', label: 'Tên cặp đôi' },
                  { id: 'date', label: 'Ngày cưới' },
                  { id: 'title', label: 'Nghi lễ' },
                  { id: 'invitation', label: 'Lời mời' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTextTemplateCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors font-medium text-[10px] cursor-pointer ${
                      textTemplateCategory === cat.id
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-bold shadow-2xs'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Preset Cards List */}
              <div className="space-y-3">
                {WEDDING_TEXT_TEMPLATES.filter(
                  (t) => textTemplateCategory === 'all' || t.category === textTemplateCategory
                ).map((item) => {
                  const displayText =
                    item.getDynamicText && weddingProfile.isLinked
                      ? item.getDynamicText(weddingProfile)
                      : item.sampleText;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const targetY = getSmartInsertY(item.defaultHeight || 60);
                        addElement({
                          type: 'text',
                          x: Math.max(20, Math.round((canvas.width - (item.defaultWidth || 400)) / 2)),
                          y: targetY,
                          width: item.defaultWidth || 400,
                          height: item.defaultHeight || 60,
                          rotation: 0,
                          opacity: 1,
                          text: displayText,
                          fontFamily: item.fontFamily,
                          fontSize: item.fontSize,
                          fontWeight: item.fontWeight || 'normal',
                          fontStyle: item.fontStyle || 'normal',
                          color: item.color,
                          letterSpacing: item.letterSpacing || 0,
                          lineHeight: item.lineHeight || 1.3,
                          textAlign: item.textAlign || 'center',
                        });
                      }}
                      className="w-full text-left p-4 rounded-2xl bg-[#FBF1EA] dark:bg-stone-850 border border-[#EDDCD2] dark:border-stone-700/80 shadow-2xs hover:shadow-md hover:border-rose-400/80 dark:hover:border-rose-500/50 hover:bg-[#F8EAE1] transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[96px] relative overflow-hidden"
                    >
                      {/* Typography Preview (Center) */}
                      <div
                        className="w-full flex items-center justify-center text-center px-2 py-1 leading-tight select-none transition-transform group-hover:scale-[1.02]"
                        style={{
                          fontFamily: resolveFontFamily(item.fontFamily),
                          fontSize: `${item.previewFontSize || Math.round(item.fontSize * 0.7)}px`,
                          fontWeight: item.fontWeight || 'normal',
                          fontStyle: item.fontStyle || 'normal',
                          color: item.color,
                          letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
                          lineHeight: item.lineHeight || 1.3,
                        }}
                      >
                        {displayText}
                      </div>

                      {/* Subtitle Caption (Bottom) */}
                      <span className="text-[11px] text-[#8C7A6B] dark:text-stone-400 font-sans mt-2.5 text-center group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Blank Text Options */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Văn bản tùy chỉnh</h4>
              <button
                type="button"
                onClick={() =>
                  addElement({
                    type: 'text',
                    x: 50,
                    y: getSmartInsertY(60),
                    width: 400,
                    height: 60,
                    rotation: 0,
                    opacity: 1,
                    text: 'Thêm Tiêu Đề',
                    fontFamily: 'Playfair Display',
                    fontSize: 34,
                    fontWeight: '700',
                    color: '#8C7355',
                    textAlign: 'center',
                  })
                }
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700/60 text-left font-serif font-bold text-sm text-stone-800 dark:text-stone-200 transition-colors border border-stone-200 dark:border-stone-700 flex items-center justify-between"
              >
                <span>Thêm tiêu đề lớn</span>
                <Plus className="w-4 h-4 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  addElement({
                    type: 'text',
                    x: 50,
                    y: getSmartInsertY(80),
                    width: 400,
                    height: 80,
                    rotation: 0,
                    opacity: 1,
                    text: 'Nhập nội dung đoạn văn bản lời mời cưới hoặc thông điệp của bạn tại đây.',
                    fontFamily: 'Paris Regular',
                    fontSize: 15,
                    color: '#5C5248',
                    textAlign: 'center',
                    lineHeight: 1.6,
                  })
                }
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700/60 text-left text-xs text-stone-600 dark:text-stone-300 transition-colors border border-stone-200 dark:border-stone-700 flex items-center justify-between"
              >
                <span>Thêm đoạn văn bản</span>
                <Plus className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            BACKGROUND / MÀU NỀN (EXACT MATCH TO SCREENSHOT 0)
        ========================================================================= */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Nền</h3>
            </div>

            {/* Current Active Background Card (Screenshot 0) */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl border border-stone-300 dark:border-stone-600 shadow-inner flex-shrink-0"
                style={{ background: canvas.background }}
              />
              <div className="overflow-hidden">
                <span className="text-[10px] text-stone-400 block font-medium">Nền đang dùng</span>
                <h4 className="font-bold text-stone-800 dark:text-stone-100 text-xs">
                  {canvas.background.includes('gradient') ? 'Hiệu ứng Gradient' : 'Màu trơn'}
                </h4>
                <p className="font-mono text-[11px] text-stone-500 uppercase truncate">
                  {canvas.background.includes('gradient') ? 'Đa sắc dải màu' : canvas.background}
                </p>
              </div>
            </div>

            {/* Sub-tabs: Màu nền | Hình nền */}
            <div className="flex border-b border-stone-200 dark:border-stone-700 text-xs font-semibold">
              <button
                onClick={() => setBgSubTab('color')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  bgSubTab === 'color'
                    ? 'border-stone-900 dark:border-white text-stone-900 dark:text-white'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                Màu nền
              </button>
              <button
                onClick={() => setBgSubTab('image')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  bgSubTab === 'image'
                    ? 'border-stone-900 dark:border-white text-stone-900 dark:text-white'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                Hình nền
              </button>
            </div>

            {bgSubTab === 'color' ? (
              <>
                {/* Section: Màu trơn with "Màu tùy chỉnh" button */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Màu trơn</span>
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] font-medium cursor-pointer transition-colors shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full border border-blue-400" />
                      <span>Màu tùy chỉnh</span>
                      <input
                        type="color"
                        value={canvas.background.startsWith('#') ? canvas.background : '#F8F8F7'}
                        onChange={(e) => setCanvasBackground(e.target.value)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 42-color swatch grid (7 rows x 6 cols) - Exact match to Screenshot 0 */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      'transparent', '#000000', '#4A4A4A', '#7D7D7D', '#D0D0D0', '#FFFFFF',
                      '#8B261F', '#722F91', '#1E70BA', '#0E8575', '#2B8A3E', '#D96B00',
                      '#E03131', '#9C36B5', '#1971C2', '#0CA678', '#37B24D', '#F59F00',
                      '#FFB3BA', '#D7C4EB', '#74C0FC', '#8CE99A', '#A9E34B', '#FFD8A8',
                      '#FFD1DC', '#C5E2F6', '#B2D8B2', '#C3A6C9', '#FFF3BF', '#FFC4A4',
                      '#FFE8E8', '#D8D4F2', '#B9F5D0', '#E5C3ED', '#FFF9DB', '#F8E5D0',
                      '#FFF5F5', '#EBE6F8', '#D3F9D8', '#F3D9FA', '#FFFFE0', '#F8F8F7',
                    ].map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setCanvasBackground(color === 'transparent' ? '#F8F8F7' : color)}
                        className={`aspect-square rounded-lg border transition-transform hover:scale-110 active:scale-95 shadow-2xs ${
                          color === 'transparent' ? 'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:8px_8px] bg-[position:0_0,0_4px,4px_-4px,-4px_0px]' : ''
                        } ${canvas.background.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-blue-500 border-white' : 'border-stone-200 dark:border-stone-700'}`}
                        style={color !== 'transparent' ? { backgroundColor: color } : {}}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Section: Gradient with "Gradient tùy chỉnh" */}
                <div className="space-y-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Gradient</span>
                    <button
                      onClick={() => setCanvasBackground('linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)')}
                      className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-[11px] font-medium"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Gradient tùy chỉnh</span>
                    </button>
                  </div>

                  {/* 12 Gradient presets in 2x6 grid - Screenshot 1 */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      'linear-gradient(135deg, #FF6B4A 0%, #FE8C00 100%)',
                      'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
                      'linear-gradient(135deg, #38A2D7 0%, #56CCF2 100%)',
                      'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
                      'linear-gradient(135deg, #A8FF78 0%, #78FFD6 100%)',
                      'linear-gradient(135deg, #F857A6 0%, #FF5858 100%)',
                      'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
                      'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                      'linear-gradient(135deg, #0082C8 0%, #667DB6 100%)',
                      'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
                      'linear-gradient(135deg, #2193B0 0%, #6DD5ED 100%)',
                      'linear-gradient(135deg, #B993D6 0%, #8CA6DB 100%)',
                    ].map((grad, i) => (
                      <button
                        key={i}
                        onClick={() => setCanvasBackground(grad)}
                        className="aspect-square rounded-lg border border-stone-200 dark:border-stone-700 transition-transform hover:scale-110 active:scale-95 shadow-2xs"
                        style={{ background: grad }}
                        title={`Gradient ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Subtab: Hình nền & Họa tiết giấy texture */
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Họa tiết giấy cao cấp
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Giấy Ivory Sang Trọng', color: '#F8F8F7' },
                    { name: 'Giấy Kraft Mộc', color: '#F4ECE1' },
                    { name: 'Lụa Hồng Phấn', color: '#FFF5F5' },
                    { name: 'Tím Hoa Cà Nhẹ', color: '#F8F4FA' },
                    { name: 'Xanh Bạc Hà Dịu', color: '#F2FAF5' },
                    { name: 'Trắng Sứ Tinh Khôi', color: '#FFFFFF' },
                  ].map((tex, i) => (
                    <button
                      key={i}
                      onClick={() => setCanvasBackground(tex.color)}
                      className="p-3 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-rose-500 transition-all flex flex-col items-center justify-center text-center shadow-xs"
                      style={{ backgroundColor: tex.color }}
                    >
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-900">
                        {tex.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MUSIC / KHO ÂM NHẠC CƯỚI (15 BÀI HÁT TẢI CỤC BỘ)
        ========================================================================= */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Âm nhạc</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Chọn bài hát phát nền khi khách mở thiệp</p>
            </div>

            {/* Now Playing card */}
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] text-rose-500 font-semibold block uppercase">Đang phát</span>
                  <h4 className="font-bold text-xs truncate text-stone-900 dark:text-stone-100">
                    {canvas.audioTitle || 'Until You'}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-mono text-stone-400 bg-white/80 dark:bg-stone-900 px-2 py-0.5 rounded">
                MP3
              </span>
            </div>

            {/* Music list from 15 downloaded tracks */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Kho bài hát cưới ({musicCatalog.length} bài)
              </span>
              <div className="space-y-1.5">
                {musicCatalog.map((song) => {
                  const isSelected = canvas.audioUrl === song.url;
                  return (
                    <div
                      key={song.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-1 ring-rose-500'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div className="overflow-hidden mr-2">
                        <h5 className="font-semibold text-xs text-stone-800 dark:text-stone-200 truncate">
                          {song.title}
                        </h5>
                        <p className="text-[10px] text-stone-400">{song.artist}</p>
                      </div>
                      <button
                        onClick={() =>
                          loadTemplateData(elements, {
                            ...canvas,
                            audioTitle: song.title,
                            audioUrl: song.url,
                          })
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
                          isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                        }`}
                      >
                        {isSelected ? 'Đang dùng' : 'Chọn'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            WIDGET / TIỆN ÍCH (EXACT MATCH TO SCREENSHOT 4)
        ========================================================================= */}
        {activeTab === 'widget' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Tiện ích</h3>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                Bấm hoặc kéo vào thiệp để thêm. Gói Miễn phí thêm mỗi tiện ích 1 lần.
              </p>
            </div>

            {/* Nhóm 1: Thông tin sự kiện */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                Thông tin sự kiện
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'calendar', title: 'Lịch', iconNode: <CalendarWidgetIcon />, height: 330 },
                  { type: 'countdown', title: 'Đếm ngược', iconNode: <CountdownWidgetIcon />, height: 120 },
                  { type: 'map', title: 'Bản đồ', iconNode: <MapWidgetIcon />, height: 250 },
                  { type: 'story_timeline', title: 'Dòng thời gian tình yêu', iconNode: <StoryTimelineWidgetIcon />, height: 340 },
                  { type: 'dresscode', title: 'Bảng màu trang phục', iconNode: <DressCodeWidgetIcon />, height: 180 },
                  { type: 'family_info', title: 'Thông tin hai bên gia đình', iconNode: <FamilyInfoWidgetIcon />, height: 220 },
                  { type: 'reminder', title: 'Lời nhắc lịch', iconNode: <ReminderWidgetIcon />, height: 70 },
                  { type: 'call', title: 'Nút gọi', iconNode: <CallWidgetIcon />, height: 70 },
                ].map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const targetY = getSmartInsertY(w.height);
                      addElement({
                        type: 'widget',
                        widgetType: w.type as any,
                        x: 40,
                        y: targetY,
                        width: 420,
                        height: w.height,
                        rotation: 0,
                        opacity: 1,
                      });
                    }}
                    className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 flex flex-col items-center justify-center hover:border-blue-400 hover:shadow-xs transition-all text-center group shadow-2xs"
                  >
                    <div className="h-10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      {w.iconNode}
                    </div>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">{w.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nhóm 2: Khách mời */}
            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                Khách mời
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'rsvp', title: 'Form xác nhận tham dự', iconNode: <RsvpWidgetIcon />, height: 340 },
                  { type: 'wishes', title: 'Sổ lưu bút & Lời chúc', iconNode: <WishesWidgetIcon />, height: 340 },
                  { type: 'giftbox', title: 'QR nhận quà', iconNode: <GiftboxWidgetIcon />, height: 280 },
                  { type: 'guest_name', title: 'Tên khách mời tự động', iconNode: <GuestNameWidgetIcon />, height: 100 },
                  { type: 'custom_form', title: 'Form tùy chỉnh', iconNode: <CustomFormWidgetIcon />, height: 340 },
                ].map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const targetY = getSmartInsertY(w.height);
                      addElement({
                        type: 'widget',
                        widgetType: w.type as any,
                        x: 40,
                        y: targetY,
                        width: 420,
                        height: w.height,
                        rotation: 0,
                        opacity: 1,
                      });
                    }}
                    className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 flex flex-col items-center justify-center hover:border-blue-400 hover:shadow-xs transition-all text-center group shadow-2xs"
                  >
                    <div className="h-10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      {w.iconNode}
                    </div>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                      {w.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nhóm 3: Âm thanh và video */}
            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                Âm thanh và video
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'music_player', title: 'Đĩa than phát nhạc', iconNode: <MusicPlayerWidgetIcon />, height: 240 },
                  { type: 'video', title: 'Video kỷ niệm cưới', iconNode: <VideoWidgetIcon />, height: 280 },
                  { type: 'album', title: 'Album ảnh', iconNode: <AlbumWidgetIcon />, height: 300 },
                  { type: 'slideshow', title: 'Trình chiếu ảnh', iconNode: <SlideshowWidgetIcon />, height: 300 },
                ].map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const targetY = getSmartInsertY(w.height);
                      addElement({
                        type: 'widget',
                        widgetType: w.type as any,
                        x: 40,
                        y: targetY,
                        width: 420,
                        height: w.height,
                        rotation: 0,
                        opacity: 1,
                      });
                    }}
                    className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 flex flex-col items-center justify-center hover:border-blue-400 hover:shadow-xs transition-all text-center group shadow-2xs"
                  >
                    <div className="h-10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      {w.iconNode}
                    </div>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">{w.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TEMPLATES / KHO MẪU THIỆP (TÍCH HỢP 188 MẪU VÀO TRÌNH SOẠN THẢO)
        ========================================================================= */}
        {activeTab === 'template' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Kho Mẫu Thiệp</h3>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                Chọn mẫu để áp dụng trực tiếp lên Canvas biên tập.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên mẫu thiệp..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'wedding', label: 'Thiệp cưới' },
                { id: 'birthday', label: 'Sinh nhật' },
                { id: 'event', label: 'Sự kiện' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTemplateFilter(cat.id as any)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                    templateFilter === cat.id
                      ? 'bg-stone-900 text-white font-medium shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Curated Presets Section (4 Mẫu Thiết Kế Nổi Bật) */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Mẫu Thiết Kế Nổi Bật ({STUDIO_TEMPLATE_PRESETS.length})
              </span>

              <div className="space-y-3">
                {STUDIO_TEMPLATE_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="group rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 overflow-hidden shadow-xs hover:shadow-md hover:border-rose-400 transition-all"
                  >
                    <div className="relative aspect-[16/10] bg-stone-200 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs">
                        {preset.tier}
                      </span>
                      <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/90 text-stone-800 font-semibold shadow-xs">
                        {preset.imagesCount} ảnh
                      </span>
                    </div>

                    <div className="p-3">
                      <h4 className="font-bold text-xs text-stone-800 dark:text-stone-100 line-clamp-1">
                        {preset.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                        {preset.description}
                      </p>

                      <button
                        disabled={loadingTemplateSlug === preset.slug}
                        onClick={() => handleApplyTemplate(preset.slug, preset, preset.name)}
                        className="w-full mt-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-[11px] font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {loadingTemplateSlug === preset.slug ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                            <span>Đang nạp dữ liệu thật...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Áp dụng mẫu này</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Templates Section (26 Mẫu Thị Trường) */}
            {marketTemplates.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Kho Mẫu Thị Trường ({marketTemplates.length})
                  </span>
                  <span className="text-[10px] text-rose-600 font-medium">LoveStory Market</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {marketTemplates
                    .filter((m: any) => {
                      const matchCat =
                        templateFilter === 'all'
                          ? true
                          : templateFilter === 'wedding'
                          ? m.category === 'wedding' || m.slug?.includes('cuoi')
                          : templateFilter === 'birthday'
                          ? m.category === 'birthday' || m.slug?.includes('sinh-nhat')
                          : m.category === 'event' || m.slug?.includes('su-kien');
                      const matchSearch = templateSearch
                        ? (m.name || '').toLowerCase().includes(templateSearch.toLowerCase()) ||
                          (m.slug || '').toLowerCase().includes(templateSearch.toLowerCase())
                        : true;
                      return matchCat && matchSearch;
                    })
                    .map((m: any) => (
                      <div
                        key={m.id || m.slug}
                        className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:border-rose-400 transition-all flex items-center justify-between gap-2"
                      >
                        <div className="w-12 h-16 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0 relative">
                          {m.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.thumbnail} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                              Ảnh
                            </div>
                          )}
                        </div>

                        <div className="overflow-hidden flex-1 min-w-0">
                          <h5 className="font-semibold text-xs text-stone-800 dark:text-stone-200 truncate">
                            {m.name}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 uppercase">
                              {m.badge || m.tier || 'VIP'}
                            </span>
                            <span className="text-[10px] font-medium text-stone-500">
                              {m.price ? `${m.price.toLocaleString('vi-VN')} đ` : '50.000 đ'}
                            </span>
                          </div>
                        </div>

                        <button
                          disabled={loadingTemplateSlug === m.slug}
                          onClick={() => handleApplyTemplate(m.slug || m.id, null, m.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-[10px] font-semibold transition-all flex-shrink-0 flex items-center gap-1 disabled:opacity-50"
                        >
                          {loadingTemplateSlug === m.slug ? (
                            <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          <span>Áp dụng</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Harvested LoveStory Templates Collection (188 templates) */}
            <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Toàn Bộ Thư Viện ({harvestedTemplates.length} Mẫu)
              </span>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {harvestedTemplates
                  .filter((t: any) => {
                    const matchCat =
                      templateFilter === 'all'
                        ? true
                        : templateFilter === 'wedding'
                        ? t.slug.includes('cuoi')
                        : templateFilter === 'birthday'
                        ? t.slug.includes('sinh-nhat')
                        : !t.slug.includes('cuoi') && !t.slug.includes('sinh-nhat');
                    const matchSearch = templateSearch
                      ? t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
                        t.slug.toLowerCase().includes(templateSearch.toLowerCase())
                      : true;
                    return matchCat && matchSearch;
                  })
                  .slice(0, 30)
                  .map((t: any, idx: number) => (
                    <div
                      key={t.slug || idx}
                      className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:border-rose-400 transition-all flex items-center justify-between"
                    >
                      <div className="overflow-hidden mr-2">
                        <h5 className="font-semibold text-xs text-stone-800 dark:text-stone-200 truncate">
                          {t.title ? t.title.split('-')[0].trim() : t.slug}
                        </h5>
                        <p className="text-[10px] text-stone-400 font-mono">
                          Mã: {t.slug} • {t.imagesCount || 10} ảnh
                        </p>
                      </div>

                      <button
                        disabled={loadingTemplateSlug === t.slug}
                        onClick={() => handleApplyTemplate(t.slug, null, t.title ? t.title.split('-')[0].trim() : t.slug)}
                        className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-900 hover:text-white text-stone-700 dark:text-stone-300 text-[10px] font-semibold transition-colors flex-shrink-0 flex items-center gap-1 disabled:opacity-50"
                      >
                        {loadingTemplateSlug === t.slug ? (
                          <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                        ) : null}
                        <span>Nạp mẫu</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            EFFECTS / MỞ THIỆP BÌA & HIỆU ỨNG RƠI (EXACT MATCH TO SCREENSHOT 4 & 5)
        ========================================================================= */}
        {activeTab === 'effect' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ChevronLeft
                onClick={() => setActiveTab('template')}
                className="w-4 h-4 cursor-pointer text-stone-500 hover:text-stone-900 transition-colors"
              />
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Mở thiệp bìa &amp; Hiệu ứng</h3>
            </div>

            {/* Mở thiệp bìa (Envelope opening cover) Section - Screenshot 4 */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block">Mở màn phong bì</span>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">Mở thiệp bìa</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canvas.envelopeCover?.enabled ?? true}
                    onChange={(e) =>
                      setEnvelopeCover({
                        enabled: e.target.checked,
                        coverId: canvas.envelopeCover?.coverId || 'default',
                        rememberOpened: canvas.envelopeCover?.rememberOpened ?? false,
                        autoOpen: canvas.envelopeCover?.autoOpen ?? false,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                <div
                  className="w-8 h-10 rounded shadow-xs border border-stone-300 flex items-center justify-center shrink-0 relative overflow-hidden"
                  style={{
                    backgroundColor:
                      ENVELOPE_COVER_PRESETS.find((c) => c.id === (canvas.envelopeCover?.coverId || 'default'))?.bg || '#8B1E2F',
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full border border-white/60 shadow-xs"
                    style={{
                      backgroundColor:
                        ENVELOPE_COVER_PRESETS.find((c) => c.id === (canvas.envelopeCover?.coverId || 'default'))?.sealColor || '#D4AF37',
                    }}
                  />
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="text-[10px] text-stone-400 block">Bìa phong bì đang dùng:</span>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-100 truncate block">
                    {ENVELOPE_COVER_PRESETS.find((c) => c.id === (canvas.envelopeCover?.coverId || 'default'))?.name || 'Mặc định'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEnvelopeModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <span>Tùy chỉnh &amp; Xem bìa mở thiệp</span>
              </button>
            </div>

            {/* Hiệu ứng rơi trên thiệp (Screenshot 5) */}
            <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Hoạt cảnh rơi</span>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">Hiệu ứng rơi</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canvas.fallingEffect?.enabled ?? true}
                    onChange={(e) =>
                      setFallingEffect({
                        enabled: e.target.checked,
                        type: canvas.fallingEffect?.type || 'snow',
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Subheader: Kiểu hiệu ứng */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Kiểu hiệu ứng
                </span>

                {/* 7 Effect cards in 3-column grid (Screenshot 5) */}
                <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'snow',
                    label: 'Tuyết',
                    icon: (
                      <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="12" y1="2" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                      </svg>
                    ),
                  },
                  {
                    id: 'hearts',
                    label: 'Trái tim',
                    icon: (
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#F43F5E">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ),
                  },
                  {
                    id: 'petals',
                    label: 'Hoa',
                    icon: (
                      <svg className="w-7 h-7 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="7" r="3" />
                        <circle cx="17" cy="10" r="3" />
                        <circle cx="16" cy="16" r="3" />
                        <circle cx="8" cy="16" r="3" />
                        <circle cx="7" cy="10" r="3" />
                        <circle cx="12" cy="12" r="2" fill="#FDE047" />
                      </svg>
                    ),
                  },
                  {
                    id: 'stars',
                    label: 'Sao',
                    icon: (
                      <svg className="w-7 h-7 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ),
                  },
                  {
                    id: 'confetti',
                    label: 'Pháo giấy',
                    icon: (
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                        <path d="M4 20 L10 14 L14 18 Z" fill="#F59E0B" />
                        <circle cx="14" cy="6" r="1.5" fill="#EF4444" />
                        <circle cx="18" cy="10" r="1.5" fill="#3B82F6" />
                        <circle cx="8" cy="8" r="1.5" fill="#10B981" />
                        <path d="M12 4 Q14 2 16 5" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
                        <path d="M18 14 Q20 12 22 15" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    id: 'butterfly',
                    label: 'Bướm',
                    icon: (
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#F97316">
                        <ellipse cx="7" cy="9" rx="5" ry="4" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
                        <ellipse cx="17" cy="9" rx="5" ry="4" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
                        <ellipse cx="8" cy="15" rx="3.5" ry="3" fill="#FDBA74" stroke="#EA580C" strokeWidth="1" />
                        <ellipse cx="16" cy="15" rx="3.5" ry="3" fill="#FDBA74" stroke="#EA580C" strokeWidth="1" />
                        <line x1="12" y1="5" x2="12" y2="19" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    id: 'heart-snow',
                    label: 'Tim và tuyết',
                    icon: (
                      <div className="flex items-center justify-center gap-1">
                        <svg className="w-3.5 h-3.5 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="12" y1="2" x2="12" y2="22" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
                        </svg>
                      </div>
                    ),
                  },
                ].map((item) => {
                  const isSelected = (canvas.fallingEffect?.type || 'snow') === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        setFallingEffect({
                          enabled: true,
                          type: item.id as any,
                        })
                      }
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div className="h-8 flex items-center justify-center mb-1">
                        {item.icon}
                      </div>
                      <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-stone-700 dark:text-stone-300'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
        )}
        </div>
      ) : (
        /* Expand Pill Button when Drawer is collapsed */
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="absolute left-16 top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-r-full shadow-md flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all cursor-pointer"
          title="Mở rộng thanh công cụ"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* MỞ THIỆP BÌA MODAL (EXACT MATCH TO SCREENSHOT 4) */}
      {isEnvelopeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-sm">
                  👁
                </div>
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  Mở thiệp bìa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEnvelopeModalOpen(false)}
                className="w-7 h-7 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
              {/* Section 1: Chọn bìa có sẵn */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span>≡</span> Chọn bìa có sẵn
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ENVELOPE_COVER_PRESETS.map((cover) => {
                    const isSelected = (canvas.envelopeCover?.coverId || 'default') === cover.id;
                    return (
                      <button
                        key={cover.id}
                        type="button"
                        onClick={() =>
                          setEnvelopeCover({
                            enabled: true,
                            coverId: cover.id,
                            rememberOpened: canvas.envelopeCover?.rememberOpened ?? false,
                            autoOpen: canvas.envelopeCover?.autoOpen ?? false,
                          })
                        }
                        className={`group relative p-2 rounded-2xl border text-center transition-all flex flex-col items-center cursor-pointer ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500 shadow-md'
                            : 'border-stone-200 dark:border-stone-700 hover:border-rose-300 bg-stone-50/50 dark:bg-stone-800/60'
                        }`}
                      >
                        {/* Cover preview mini envelope */}
                        <div
                          className="w-full aspect-[9/16] rounded-xl shadow-inner mb-2 relative overflow-hidden flex flex-col items-center justify-center border border-black/10 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: cover.bg }}
                        >
                          {/* Flap shape */}
                          <div
                            className="absolute top-0 inset-x-0 h-1/3 [clip-path:polygon(0_0,100%_0,50%_100%)] opacity-90 shadow-sm"
                            style={{ backgroundColor: cover.flapColor }}
                          />
                          {/* Wax seal */}
                          <div
                            className="w-6 h-6 rounded-full border border-white/50 shadow-md z-10 flex items-center justify-center text-[8px] font-bold text-white/90"
                            style={{ backgroundColor: cover.sealColor }}
                          >
                            LS
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate w-full">
                          {cover.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Cài đặt */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span>⚙</span> Cài đặt
                </span>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={canvas.envelopeCover?.enabled ?? true}
                      onChange={(e) =>
                        setEnvelopeCover({
                          enabled: e.target.checked,
                          coverId: canvas.envelopeCover?.coverId || 'default',
                          rememberOpened: canvas.envelopeCover?.rememberOpened ?? false,
                          autoOpen: canvas.envelopeCover?.autoOpen ?? false,
                        })
                      }
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 dark:border-stone-600"
                    />
                    <span className="font-medium">Bật màn hình mở thiệp</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={canvas.envelopeCover?.rememberOpened ?? false}
                      onChange={(e) =>
                        setEnvelopeCover({
                          enabled: canvas.envelopeCover?.enabled ?? true,
                          coverId: canvas.envelopeCover?.coverId || 'default',
                          rememberOpened: e.target.checked,
                          autoOpen: canvas.envelopeCover?.autoOpen ?? false,
                        })
                      }
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 dark:border-stone-600"
                    />
                    <span>Nhớ đã mở (tắt để reload lần nào cũng hiện bìa)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={canvas.envelopeCover?.autoOpen ?? false}
                      onChange={(e) =>
                        setEnvelopeCover({
                          enabled: canvas.envelopeCover?.enabled ?? true,
                          coverId: canvas.envelopeCover?.coverId || 'default',
                          rememberOpened: canvas.envelopeCover?.rememberOpened ?? false,
                          autoOpen: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 dark:border-stone-600"
                    />
                    <span>Tự động mở thiệp</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEnvelopeModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
