'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Undo,
  Redo,
  Eye,
  Rocket,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  UserCheck,
  UserPlus,
  X,
  Sparkles,
  FolderPlus,
  Camera,
  ExternalLink,
  AlertCircle,
  Save,
  ShieldCheck,
  Sliders,
  QrCode,
  Check,
  Copy,
  Crown,
  Menu,
  Home,
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import StudioPreviewModal from './StudioPreviewModal';
import StudioAiDesignerModal from './StudioAiDesignerModal';
import { useAuth } from '@/context/AuthContext';

interface StudioTopBarProps {
  mode?: 'admin' | 'user';
}

export default function StudioTopBar({ mode = 'user' }: StudioTopBarProps) {
  const { user, openUpgradeModal } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const {
    undo,
    redo,
    past,
    future,
    markSaved,
    elements,
    canvas,
    selectedId,
    selectElement,
    isInspectorOpen,
    toggleInspector,
    weddingProfile,
    setProfileModalOpen,
    setMobileDrawerOpen,
    realtimeStatus,
    lastSyncedFrom,
    lastSyncedAt,
    dispatchRealtimeUpdate,
    currentTemplateSlug,
    setCurrentTemplateSlug,
    setCanvasTitle,
    isAiDesignerModalOpen,
    setAiDesignerModalOpen,
  } = useStudioStore();

  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (searchParams && searchParams.get('ai') === '1') {
      setAiDesignerModalOpen(true);
    }
  }, [searchParams, setAiDesignerModalOpen]);

  // Helper function to turn a human title into a clean SEO-friendly slug
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // ==========================================
  // ADMIN SAVE TO TEMPLATE WAREHOUSE STATE
  // ==========================================
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [saveMode, setSaveMode] = useState<'overwrite' | 'new'>('overwrite');
  const [tplName, setTplName] = useState('Thiệp Cưới Hoàng Gia LoveStory');
  const [tplSlug, setTplSlug] = useState('thiep-cuoi-hoang-gia');
  const [tplCategory, setTplCategory] = useState<'wedding' | 'birthday' | 'event' | 'graduation'>('wedding');
  const [tplTier, setTplTier] = useState<'FREE' | 'BASIC' | 'PREMIUM'>('PREMIUM');
  const [tplPrice, setTplPrice] = useState<number>(30000);
  const [tplBadge, setTplBadge] = useState('Hot VIP');
  const [tplDescription, setTplDescription] = useState('Mẫu thiệp cưới scrollytelling hoàng gia sang trọng được thiết kế bởi LoveStory Studio.');
  const [tplThumbnail, setTplThumbnail] = useState(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  );
  const [isCapturingThumb, setIsCapturingThumb] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string; savedSlug?: string } | null>(null);

  const SAMPLE_THUMBS = [
    { label: 'Váy Cưới Trắng', url: '/assets/wedding/samples/sample_01.jpg' },
    { label: 'Hoàng Hôn Biển', url: '/assets/wedding/samples/sample_02.jpg' },
    { label: 'Cổ Điển Đèn Lồng', url: '/assets/wedding/samples/sample_03.jpg' },
    { label: 'Hoa Hồng & Rượu Vang', url: '/assets/wedding/samples/sample_04.jpg' },
  ];

  // Open Save Modal with strictly synchronized Name and Slug
  const handleOpenSavePresetModal = () => {
    setSaveStatus(null);
    const activeName = canvas?.title || 'Mẫu Thiệp Cưới LoveStory';
    setTplName(activeName);

    if (currentTemplateSlug) {
      setSaveMode('overwrite');
      setTplSlug(currentTemplateSlug);
    } else {
      setSaveMode('new');
      setTplSlug(slugify(activeName) || `mau-thiep-${Date.now().toString(36)}`);
    }
    setShowSavePresetModal(true);
  };

  const handleNameChange = (val: string) => {
    setTplName(val);
    // When creating a new template, automatically sync slug from title
    if (saveMode === 'new') {
      setTplSlug(slugify(val));
    }
  };

  const handleCaptureThumbnail = async () => {
    const node = document.getElementById('studio-main-canvas');
    if (!node) return;
    setIsCapturingThumb(true);

    // Save previous selection and deselect so handles & toolbars are completely hidden from the thumbnail
    const prevSelectedId = selectedId;
    if (prevSelectedId) {
      selectElement(null);
      await new Promise((r) => setTimeout(r, 150));
    }

    try {
      const { domToPng } = await import('modern-screenshot');
      const dataUrl = await domToPng(node, {
        scale: 1.5,
        filter: (el) => {
          if (el instanceof HTMLElement) {
            if (
              el.getAttribute('data-export-ignore') === 'true' ||
              el.classList?.contains('moveable-control-box') ||
              el.classList?.contains('moveable-line') ||
              el.classList?.contains('moveable-control') ||
              el.classList?.contains('moveable-guideline') ||
              el.getAttribute('data-moveable') ||
              el.classList?.contains('selection-toolbar')
            ) {
              return false;
            }
          }
          return true;
        },
      });

      // Crop exclusively to Screen 1 (0 to 850px) so thumbnail shows only the gorgeous cover (Trang bìa & Save The Date)
      const croppedScreen1Url = await new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const offscreen = document.createElement('canvas');
            const baseW = canvas.width || 500;
            const scaleRatio = img.width / baseW;
            const SCREEN_1_HEIGHT = 850;
            const cropH = Math.min(img.height, Math.round(SCREEN_1_HEIGHT * scaleRatio));

            offscreen.width = img.width;
            offscreen.height = cropH;
            const ctx = offscreen.getContext('2d');
            if (!ctx) {
              resolve(dataUrl);
              return;
            }
            ctx.drawImage(img, 0, 0, img.width, cropH, 0, 0, img.width, cropH);
            resolve(offscreen.toDataURL('image/png', 0.95));
          } catch (e) {
            console.warn('Crop screen 1 error:', e);
            resolve(dataUrl);
          }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      });

      setTplThumbnail(croppedScreen1Url);
    } catch (err) {
      console.error('Thumbnail capture error:', err);
      alert('Không thể chụp tự động, vui lòng dùng link ảnh mẫu bên dưới.');
    } finally {
      if (prevSelectedId) {
        selectElement(prevSelectedId);
      }
      setIsCapturingThumb(false);
    }
  };

  const handleSaveToWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) {
      alert('Vui lòng nhập tên mẫu thiệp');
      return;
    }

    setIsSavingPreset(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/admin/templates/save-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tplName.trim(),
          slug: tplSlug.trim() || undefined,
          category: tplCategory,
          tier: tplTier,
          price: tplTier === 'FREE' ? 0 : Number(tplPrice) || 30000,
          badge: tplBadge.trim() || undefined,
          description: tplDescription.trim(),
          thumbnail: tplThumbnail.trim(),
          elements,
          config: {
            width: canvas.width,
            height: canvas.height,
            background: canvas.background,
            audioTitle: canvas.audioTitle,
            audioUrl: canvas.audioUrl,
            fallingEffect: canvas.fallingEffect,
            envelopeCover: canvas.envelopeCover,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lưu mẫu thiệp thất bại');
      }

      const savedSlug = data.preset?.slug || tplSlug.trim();
      markSaved();
      setCurrentTemplateSlug(savedSlug);
      setCanvasTitle(tplName.trim());

      // Update browser URL query string without reloading
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?template=${encodeURIComponent(savedSlug)}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      }

      if (data.preset?.thumbnail) {
        setTplThumbnail(data.preset.thumbnail);
      }

      // Broadcast realtime event
      dispatchRealtimeUpdate('create', {
        name: tplName.trim(),
        slug: savedSlug,
        category: tplCategory,
        tier: tplTier,
        price: tplTier === 'FREE' ? 0 : Number(tplPrice) || 30000,
        badge: tplBadge.trim() || undefined,
        description: tplDescription.trim(),
        thumbnail: data.preset?.thumbnail || tplThumbnail.trim(),
      }).catch((e) => console.warn('Realtime update broadcast error:', e));

      setSaveStatus({
        type: 'success',
        message: data.message || `Đã lưu mẫu "${tplName}" vào kho mẫu thiệp thành công!`,
        savedSlug,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi lưu mẫu thiệp vào hệ thống';
      setSaveStatus({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleExportPNG = async () => {
    const node = document.getElementById('studio-main-canvas');
    if (!node) return;
    setIsExporting(true);

    // Save previous selection and deselect so handles & toolbars are completely hidden from the exported image
    const prevSelectedId = selectedId;
    if (prevSelectedId) {
      selectElement(null);
      // Wait for React to flush DOM state
      await new Promise((r) => setTimeout(r, 150));
    }

    try {
      const { domToPng } = await import('modern-screenshot');
      const dataUrl = await domToPng(node, {
        scale: 2,
        filter: (el) => {
          if (el instanceof HTMLElement) {
            if (
              el.getAttribute('data-export-ignore') === 'true' ||
              el.classList?.contains('moveable-control-box') ||
              el.classList?.contains('moveable-line') ||
              el.classList?.contains('moveable-control') ||
              el.classList?.contains('moveable-guideline') ||
              el.getAttribute('data-moveable') ||
              el.classList?.contains('selection-toolbar')
            ) {
              return false;
            }
          }
          return true;
        },
      });
      const link = document.createElement('a');
      link.download = `${(canvas.title || 'thiep-cuoi-lovestory')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'thiep-cuoi-lovestory'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Có lỗi khi xuất ảnh thiệp cưới.');
    } finally {
      if (prevSelectedId) {
        selectElement(prevSelectedId);
      }
      setIsExporting(false);
    }
  };

  // ==========================================
  // CUSTOMER PUBLISH STATE & HANDLERS
  // ==========================================
  const [showUserPublishModal, setShowUserPublishModal] = useState(false);
  const [userSiteTitle, setUserSiteTitle] = useState('');
  const [userSiteSlug, setUserSiteSlug] = useState('');
  const [isPublishingUser, setIsPublishingUser] = useState(false);
  const [publishSuccessData, setPublishSuccessData] = useState<{ slug: string; url: string; title: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishRequiresUpgrade, setPublishRequiresUpgrade] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleOpenUserPublish = () => {
    const defaultTitle = weddingProfile.isLinked
      ? `Lễ Thành Hôn ${weddingProfile.groom.shortName || 'Chú Rể'} & ${weddingProfile.bride.shortName || 'Cô Dâu'}`
      : canvas.title || 'Thiệp Cưới LoveStory';
    setUserSiteTitle(defaultTitle);

    const generatedSlug = defaultTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setUserSiteSlug(generatedSlug || `thiep-cuoi-${Date.now().toString().slice(-6)}`);
    setPublishSuccessData(null);
    setPublishError(null);
    setPublishRequiresUpgrade(false);
    setShowUserPublishModal(true);
  };

  const handleConfirmUserPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSiteSlug.trim()) {
      alert('Vui lòng nhập đường dẫn thiệp cưới');
      return;
    }
    setIsPublishingUser(true);
    setPublishError(null);
    setPublishRequiresUpgrade(false);

    try {
      // 1. Save Site to Database
      const saveRes = await fetch('/api/sites/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: userSiteSlug.trim(),
          title: userSiteTitle.trim() || 'Thiệp Cưới LoveStory',
          templateId: currentTemplateSlug || 'thiep-cuoi-165',
          data: {
            elements,
            canvas,
            weddingProfile,
          },
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || 'Lỗi khi lưu thiệp cưới');
      }

      // 2. Publish Site
      const pubRes = await fetch('/api/sites/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: userSiteSlug.trim(),
        }),
      });

      const pubData = await pubRes.json();
      if (!pubRes.ok) {
        if (pubData.requiresUpgrade) {
          setPublishRequiresUpgrade(true);
          throw new Error(pubData.error || 'Mẫu thiệp này yêu cầu nâng cấp gói');
        }
        throw new Error(pubData.error || 'Lỗi khi xuất bản thiệp cưới');
      }

      markSaved();
      setPublishSuccessData({
        slug: userSiteSlug.trim(),
        url: pubData.site?.url || `/${userSiteSlug.trim()}`,
        title: userSiteTitle.trim(),
      });
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : 'Có lỗi khi xuất bản thiệp cưới');
    } finally {
      setIsPublishingUser(false);
    }
  };

  const handleCopyPublishedLink = () => {
    if (!publishSuccessData) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    navigator.clipboard.writeText(`${origin}/${publishSuccessData.slug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <>
      <header className="h-14 px-3 sm:px-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between z-30 select-none shadow-xs shrink-0">
        {/* Left: Home & Brand & Undo/Redo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Nút Về Trang Chủ - luôn hiển thị trên cả mobile và desktop */}
          <Link
            href="/"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-stone-700 dark:text-stone-200 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs font-semibold border border-stone-200 dark:border-stone-700 active:scale-95 shrink-0"
            title="Quay về trang chủ LoveStory"
          >
            <Home className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="hidden xs:inline">Trang chủ</span>
          </Link>

          {/* Mobile Hamburger Menu Button (Mở bảng công cụ) */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 active:scale-95 shrink-0"
            title="Mở bảng công cụ chỉnh sửa"
          >
            <Menu className="w-4 h-4" />
          </button>

          {mode === 'admin' ? (
            <Link
              href="/admin"
              className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 transition-colors items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Quay lại Bảng Điều Khiển Admin"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Về Quản Trị</span>
            </Link>
          ) : (
            <Link
              href="/templates"
              className="hidden sm:flex p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
              title="Quay lại danh mục mẫu thiệp"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}

          {/* Brand Logo - click để về trang chủ */}
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:opacity-85 transition-opacity"
            title="LoveStory - Về trang chủ"
          >
            <span className="font-serif font-bold text-base text-rose-600 tracking-tight">💍 LoveStory</span>
            {mode === 'admin' ? (
              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold uppercase tracking-wider">
                Admin
              </span>
            ) : (
              <span className="hidden sm:inline-block text-[10px] font-sans px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold uppercase tracking-wider">
                Studio
              </span>
            )}
          </Link>

          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-0.5 pl-3 border-l border-stone-200 dark:border-stone-800">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className={`p-1.5 rounded-lg transition-colors ${
                past.length > 0
                  ? 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                  : 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
              }`}
              title="Hoàn tác (Undo)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className={`p-1.5 rounded-lg transition-colors ${
                future.length > 0
                  ? 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                  : 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
              }`}
              title="Làm lại (Redo)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Contextual Status Indicator */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs">
          {/* Active Loaded Template Badge */}
          {currentTemplateSlug ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-medium truncate max-w-[200px]" title={canvas.title || currentTemplateSlug}>
                {canvas.title || currentTemplateSlug}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800">
              <span>Chưa nạp mẫu từ kho</span>
            </div>
          )}

          {/* Wedding Profile Link Button */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              weddingProfile.isLinked
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
            }`}
            title="Gắn thông tin cô dâu chú rể để tự động điền nhanh"
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-500" />
            <span className="max-w-[130px] truncate">
              {weddingProfile.isLinked
                ? `${weddingProfile.groom.shortName || 'Bảo'} & ${weddingProfile.bride.shortName || 'Vy'}`
                : 'Hồ sơ cưới'}
            </span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Realtime Sync Status: compact dot with tooltip & instant sync */}
          <button
            onClick={() => dispatchRealtimeUpdate('update')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              realtimeStatus === 'connected'
                ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                : realtimeStatus === 'syncing'
                ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30'
                : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={
              realtimeStatus === 'connected'
                ? lastSyncedFrom === 'desktop'
                  ? 'Realtime: Đồng bộ Web ↔ Desktop (Bấm để đồng bộ ngay)'
                  : 'Realtime: Đã kết nối (Bấm để đồng bộ ngay)'
                : realtimeStatus === 'syncing'
                ? 'Đang đồng bộ...'
                : 'Offline (Bấm để kết nối lại)'
            }
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                realtimeStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : realtimeStatus === 'syncing'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-stone-400'
              }`}
            />
            <span className="hidden 2xl:inline text-[11px]">
              {realtimeStatus === 'connected' ? 'Đã kết nối' : 'Đang kết nối'}
            </span>
          </button>

          {/* Toggle Inspector Button */}
          <button
            onClick={toggleInspector}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium items-center gap-1.5 transition-colors hidden md:flex ${
              isInspectorOpen
                ? 'border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
            title={isInspectorOpen ? 'Thu gọn bảng thuộc tính' : 'Mở bảng thuộc tính'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{isInspectorOpen ? 'Ẩn thuộc tính' : 'Hiện thuộc tính'}</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium items-center gap-1.5 transition-colors hidden sm:flex"
            title="Xuất thiệp thành ảnh PNG sắc nét"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">Xuất ảnh</span>
          </button>

          {/* ✨ AI Studio Designer Button */}
          <button
            onClick={() => setAiDesignerModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0"
            title="Trợ lý AI thiết kế mẫu thiệp & phối bảng màu thông minh"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
            <span>AI Thiết Kế</span>
          </button>

          {/* Preview Button */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            title="Xem trước trực tiếp thiệp cưới trên điện thoại"
          >
            <Eye className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="hidden sm:inline">Xem trước</span>
          </button>

          {mode === 'admin' ? (
            /* ADMIN: Save To Master Template Warehouse Button */
            <button
              onClick={handleOpenSavePresetModal}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 whitespace-nowrap shrink-0"
              title="Lưu mẫu vào kho thiệp LoveStory"
            >
              <FolderPlus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Lưu Vào Kho Mẫu</span>
              <span className="sm:hidden">Lưu Mẫu</span>
            </button>
          ) : (
            /* USER: Publish personal wedding card */
            <button
              onClick={handleOpenUserPublish}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0"
              title="Xuất bản thiệp cưới để chia sẻ cho khách mời"
            >
              <Rocket className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="hidden sm:inline">Xuất Bản Thiệp</span>
              <span className="sm:hidden">Xuất bản</span>
            </button>
          )}

          {/* Link to Admin if logged in as Admin and in User mode */}
          {isAdmin && mode !== 'admin' && (
            <Link
              href="/admin"
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title="Mở Bảng Điều Khiển Quản Trị Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden xl:inline">Quản Trị</span>
            </Link>
          )}

          {/* Profile badge */}
          <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 overflow-hidden flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xs ml-0.5 cursor-pointer shadow-2xs">
            <span>{mode === 'admin' ? 'AD' : 'LS'}</span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* ADMIN: SAVE TO TEMPLATE WAREHOUSE MODAL */}
      {/* ======================================================== */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in-95 duration-150 text-stone-900">
            <button
              onClick={() => setShowSavePresetModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900 font-serif flex items-center gap-2">
                  Lưu Thiết Kế Vào Kho Mẫu Thiệp
                </h3>
                <p className="text-xs text-stone-500">
                  Mẫu này sẽ được lưu vào kho dữ liệu và hiển thị công khai trên danh mục LoveStory cho khách hàng chọn làm thiệp.
                </p>
              </div>
            </div>

            {/* Notification alert */}
            {saveStatus && (
              <div
                className={`p-3.5 rounded-2xl text-xs mb-4 flex items-center gap-2.5 ${
                  saveStatus.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {saveStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{saveStatus.message}</p>
                  {saveStatus.type === 'success' && saveStatus.savedSlug && (
                    <div className="mt-2 flex items-center gap-3">
                      <Link
                        href="/admin/templates"
                        className="text-[11px] underline text-purple-700 hover:text-purple-900 font-semibold"
                      >
                        Quản lý trong Kho Templates →
                      </Link>
                      <Link
                        href={`/templates`}
                        target="_blank"
                        className="text-[11px] underline text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                      >
                        <span>Xem trang khách hàng</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveToWarehouse} className="space-y-4 text-xs">
              {/* Hình thức lưu: Cập nhật đè mẫu hiện tại hay Tạo mẫu mới */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Chọn hình thức lưu kho</span>
                  </span>
                  {currentTemplateSlug && (
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-mono border border-purple-200 font-semibold">
                      Đang mở: {currentTemplateSlug}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSaveMode('overwrite');
                      if (currentTemplateSlug) {
                        setTplSlug(currentTemplateSlug);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      saveMode === 'overwrite'
                        ? 'border-purple-600 bg-purple-50/80 text-purple-900 font-semibold ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                      <span>🔄 Cập nhật mẫu đang mở</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                      Ghi đè thay đổi trực tiếp lên slug: <strong className="font-mono text-purple-700">{currentTemplateSlug || tplSlug}</strong>
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSaveMode('new');
                      const newSlug = slugify(tplName) || `mau-thiep-${Date.now().toString(36)}`;
                      setTplSlug(newSlug);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      saveMode === 'new'
                        ? 'border-purple-600 bg-purple-50/80 text-purple-900 font-semibold ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <span>✨ Lưu thành MẪU MỚI</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                      Tạo bản ghi mới độc lập, tự động sinh slug theo tên mẫu
                    </p>
                  </button>
                </div>
              </div>

              {/* Tên mẫu thiệp & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-700 block">
                      Tên Mẫu Thiệp <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={tplName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 font-medium transition-colors"
                    placeholder="VD: Thiệp Cưới Burgundy Cinema"
                  />
                  <span className="text-[10px] text-stone-400 block">
                    Tên hiển thị công khai trên danh mục cho khách hàng.
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-700 block">
                      Đường dẫn mẫu (Slug) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTplSlug(slugify(tplName))}
                      className="text-[10px] text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
                      title="Tự động đồng bộ Slug khớp 100% với Tên mẫu"
                    >
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      <span>Đồng bộ theo Tên</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={tplSlug}
                    onChange={(e) => setTplSlug(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 font-mono transition-colors"
                    placeholder="thiep-cuoi-burgundy-cinema"
                  />
                  <span className="text-[10px] text-stone-500 block truncate">
                    URL: <code className="text-purple-700 font-mono font-medium">/mau-thiep/{tplSlug || '...'}</code>
                  </span>
                </div>
              </div>

              {/* Cảnh báo nếu Tên và Slug bị lệch nhau khi lưu mẫu mới */}
              {saveMode === 'new' && tplSlug && slugify(tplName) !== tplSlug && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center justify-between gap-2">
                  <span>
                    💡 Tên mẫu và Slug đang khác nhau (Tên: <code className="font-mono font-semibold">{slugify(tplName)}</code> ≠ Slug: <code className="font-mono font-semibold">{tplSlug}</code>).
                  </span>
                  <button
                    type="button"
                    onClick={() => setTplSlug(slugify(tplName))}
                    className="px-2 py-0.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 font-bold shrink-0 text-amber-900"
                  >
                    Khớp ngay
                  </button>
                </div>
              )}

              {/* Thể loại & Hạng mẫu (Tier) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Thể loại</label>
                  <select
                    value={tplCategory}
                    onChange={(e) => setTplCategory(e.target.value as 'wedding' | 'birthday' | 'event' | 'graduation')}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                  >
                    <option value="wedding">Đám Cưới (Wedding)</option>
                    <option value="birthday">Sinh Nhật (Birthday)</option>
                    <option value="event">Sự Kiện (Event)</option>
                    <option value="graduation">Tốt Nghiệp (Graduation)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Hạng mẫu (Tier)</label>
                  <select
                    value={tplTier}
                    onChange={(e) => {
                      const newTier = e.target.value as 'FREE' | 'BASIC' | 'PREMIUM';
                      setTplTier(newTier);
                      if (newTier === 'FREE') setTplPrice(0);
                      else if (newTier === 'BASIC') setTplPrice(50000);
                      else setTplPrice(30000);
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                  >
                    <option value="PREMIUM">VIP (Mua lẻ 30k / Gói VIP 200k)</option>
                    <option value="BASIC">Chuẩn 1 Năm (50.000đ)</option>
                    <option value="FREE">Miễn Phí (300 views, 30 ngày)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Giá Bán Lẻ (VNĐ)</label>
                  <input
                    type="number"
                    disabled={tplTier === 'FREE'}
                    value={tplPrice}
                    onChange={(e) => setTplPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 disabled:opacity-50 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Huy hiệu (Badge) & Ảnh xem trước (Thumbnail) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Huy hiệu hiển thị</label>
                  <input
                    type="text"
                    value={tplBadge}
                    onChange={(e) => setTplBadge(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 transition-colors"
                    placeholder="Hot VIP, Mới, Nổi Bật"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-700">Ảnh Thumbnail Xem Trước</label>
                    <button
                      type="button"
                      onClick={handleCaptureThumbnail}
                      disabled={isCapturingThumb}
                      className="text-[11px] text-purple-600 hover:text-purple-800 flex items-center gap-1 font-semibold"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isCapturingThumb ? 'Đang chụp Màn 1...' : '📸 Chụp Màn 1 (Trang bìa) làm Thumbnail'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={tplThumbnail.startsWith('data:image/') ? '[Ảnh chụp Màn 1 từ Canvas - Sẽ lưu vào public/assets/uploads/thumbnails/]' : tplThumbnail}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val.startsWith('[')) {
                          setTplThumbnail(val);
                        }
                      }}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 font-mono truncate transition-colors"
                      placeholder="https://... hoặc bấm nút chụp Màn 1"
                    />
                    {tplThumbnail && (
                      <div className="w-12 h-18 rounded-xl border-2 border-purple-200 overflow-hidden shrink-0 bg-stone-50 flex flex-col items-center justify-center shadow-xs relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tplThumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/wedding/samples/sample_01.jpg';
                          }}
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-[8px] text-white font-medium text-center py-0.5 leading-none">
                          Màn 1
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    📁 Vị trí lưu: <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded border border-purple-200">public/assets/uploads/thumbnails/</code>
                  </span>
                </div>
              </div>

              {/* Quick Preset Thumbnails */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-stone-500 font-medium block">Chọn nhanh ảnh bìa mẫu:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_THUMBS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTplThumbnail(s.url)}
                      className={`p-1.5 rounded-xl border text-left text-[10px] transition-all flex items-center gap-2 ${
                        tplThumbnail === s.url
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold shadow-2xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.url} alt={s.label} className="w-7 h-7 rounded-lg object-cover" />
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mô tả mẫu thiệp */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Mô tả mẫu thiệp</label>
                <textarea
                  rows={2}
                  value={tplDescription}
                  onChange={(e) => setTplDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                  placeholder="Mô tả phong cách, hiệu ứng nổi bật của mẫu thiệp này..."
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowSavePresetModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSavingPreset}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSavingPreset ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{saveMode === 'overwrite' ? 'Đang cập nhật mẫu...' : 'Đang tạo mẫu mới...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span>{saveMode === 'overwrite' ? 'Ghi Đè & Cập Nhật Mẫu Này' : 'Xác Nhận Lưu Thành Mẫu Mới'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOMER: PUBLISH PERSONAL WEDDING CARD MODAL */}
      {/* ======================================================== */}
      {showUserPublishModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-150 text-stone-900 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowUserPublishModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {publishSuccessData ? (
              /* Success State */
              <div className="text-center space-y-5 py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    Xuất bản thành công
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 pt-2">
                    Thiệp Cưới Của Bạn Đã Sẵn Sàng!
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                    Thiệp cưới đã được lưu vào hệ thống LoveStory và có thể chia sẻ cho người thân, bạn bè ngay bây giờ.
                  </p>
                </div>

                {/* QR Code */}
                <div className="p-4 bg-white rounded-2xl inline-block mx-auto border border-stone-200 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${publishSuccessData.slug}`
                    )}`}
                    alt="QR Code Thiệp Cưới"
                    className="w-36 h-36 mx-auto"
                  />
                  <span className="text-[10px] font-semibold text-stone-500 block mt-2">
                    Quét mở trên điện thoại
                  </span>
                </div>

                {/* URL display */}
                <div className="p-3 rounded-2xl bg-stone-50 font-mono text-xs text-rose-700 border border-stone-200 flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">
                    {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/{publishSuccessData.slug}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPublishedLink}
                    className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shrink-0 text-xs flex items-center gap-1 font-semibold transition-colors shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Đã chép' : 'Chép'}</span>
                  </button>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={`/${publishSuccessData.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-transform active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Xem Thiệp Trực Tiếp</span>
                  </a>

                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Về Bảng Điều Khiển</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Publish Form */
              <form onSubmit={handleConfirmUserPublish} className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-rose-600 font-bold">
                    Xuất Bản Thiệp Cưới
                  </span>
                  <h3 className="text-xl font-serif font-bold text-stone-900">
                    Phát Hành Thiệp Cưới Online
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Thiết lập tên và đường dẫn công khai cho thiệp cưới của hai bạn.
                  </p>
                </div>

                {publishError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <span>{publishError}</span>
                      {publishRequiresUpgrade && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserPublishModal(false);
                            openUpgradeModal({ defaultType: 'PLAN_LIFETIME_VIP_200K' });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>Nâng Cấp Gói VIP Ngay</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  {/* Tên thiệp cưới */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-700 block">
                      Tên Thiệp Cưới
                    </label>
                    <input
                      type="text"
                      required
                      value={userSiteTitle}
                      onChange={(e) => {
                        setUserSiteTitle(e.target.value);
                        const generated = e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '');
                        setUserSiteSlug(generated);
                      }}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 font-medium transition-colors"
                      placeholder="vd: Lễ Thành Hôn Bảo & Vy"
                    />
                  </div>

                  {/* Slug đường dẫn */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-stone-700 block">
                        Đường Dẫn Công Khai (Slug)
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {typeof window !== 'undefined' ? window.location.host : 'lovestory.vn'}/{userSiteSlug || '...'}
                      </span>
                    </div>

                    <div className="flex items-center rounded-xl bg-stone-50 border border-stone-200 overflow-hidden focus-within:bg-white focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500/20 transition-all">
                      <span className="px-3 py-2.5 bg-stone-100 text-stone-600 font-mono text-xs border-r border-stone-200 shrink-0 font-medium">
                        {typeof window !== 'undefined' ? `${window.location.host}/` : 'lovestory.vn/'}
                      </span>
                      <input
                        type="text"
                        required
                        value={userSiteSlug}
                        onChange={(e) =>
                          setUserSiteSlug(
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                          )
                        }
                        className="w-full bg-transparent px-3 py-2 text-xs text-stone-900 font-mono outline-none"
                        placeholder="bao-va-vy-2026"
                      />
                    </div>

                    {/* Gợi ý nhanh đường dẫn đẹp từ Hồ sơ cưới hoặc Tên thiệp */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-stone-500 font-medium">Gợi ý nhanh:</span>
                      {(() => {
                        const groomRaw = weddingProfile?.groom?.shortName || weddingProfile?.groom?.fullName || 'bao';
                        const brideRaw = weddingProfile?.bride?.shortName || weddingProfile?.bride?.fullName || 'vy';
                        const groomS = groomRaw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
                        const brideS = brideRaw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
                        const chips = [
                          `${groomS}-${brideS}-wedding`,
                          `${groomS}-${brideS}-2026`,
                          `thiep-cuoi-${groomS}-${brideS}`,
                        ];
                        return chips.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setUserSiteSlug(chip)}
                            className="px-2 py-0.5 rounded-full bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-200 hover:border-rose-200 text-[10px] font-mono transition-colors active:scale-95"
                          >
                            +{chip}
                          </button>
                        ));
                      })()}
                    </div>

                    <span className="text-[10px] text-stone-500 block">
                      💡 Khách mời sẽ truy cập vào liên kết này trên trình duyệt hoặc quét mã QR. Chỉ gồm chữ cái thường không dấu, số và dấu gạch nối (-).
                    </span>
                  </div>

                  {/* Quyền lợi gói */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Tài khoản của bạn:</span>
                      <span className="font-bold text-stone-900">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Giới hạn lượt xem:</span>
                      <span className="font-bold text-amber-700">
                        {user?.plan === 'LIFETIME_VIP_200K' || user?.plan === 'ANNUAL_50K' || user?.role === 'ADMIN'
                          ? 'Không giới hạn'
                          : '300 lượt xem (Gói Free)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowUserPublishModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={isPublishingUser}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isPublishingUser ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Đang xuất bản thiệp...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 text-white" />
                        <span>Xác Nhận &amp; Xuất Bản Ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Live Guest Preview Modal */}
      <StudioPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />

      {/* AI Studio Designer Modal */}
      <StudioAiDesignerModal
        isAdmin={isAdmin || mode === 'admin'}
      />
    </>
  );
}
