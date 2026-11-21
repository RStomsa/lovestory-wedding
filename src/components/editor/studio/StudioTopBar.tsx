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
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import StudioPreviewModal from './StudioPreviewModal';
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
    isInspectorOpen,
    toggleInspector,
    weddingProfile,
    setProfileModalOpen,
  } = useStudioStore();

  const [isExporting, setIsExporting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // ==========================================
  // ADMIN SAVE TO TEMPLATE WAREHOUSE STATE
  // ==========================================
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
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
    { label: 'Váy Cưới Trắng', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' },
    { label: 'Hoàng Hôn Biển', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80' },
    { label: 'Cổ Điển Đèn Lồng', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80' },
    { label: 'Hoa Hồng & Rượu Vang', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80' },
  ];

  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template') || searchParams.get('preset');

  useEffect(() => {
    if (canvas?.title) {
      setTplName(canvas.title);
      if (templateParam) {
        setTplSlug(templateParam);
      } else {
        const generated = canvas.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        setTplSlug(generated);
      }
    }
  }, [canvas?.title, templateParam]);

  const handleNameChange = (val: string) => {
    setTplName(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setTplSlug(generated);
  };

  const handleCaptureThumbnail = async () => {
    const node = document.getElementById('studio-main-canvas');
    if (!node) return;
    setIsCapturingThumb(true);
    try {
      const { domToPng } = await import('modern-screenshot');
      const dataUrl = await domToPng(node, { scale: 1.2 });
      setTplThumbnail(dataUrl);
    } catch (err) {
      console.error('Thumbnail capture error:', err);
      alert('Không thể chụp tự động, vui lòng dùng link ảnh mẫu bên dưới.');
    } finally {
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
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lưu mẫu thiệp thất bại');
      }

      markSaved();
      setSaveStatus({
        type: 'success',
        message: data.message || `Đã lưu mẫu "${tplName}" vào kho mẫu thiệp thành công!`,
        savedSlug: data.preset?.slug || tplSlug,
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
    try {
      const { domToPng } = await import('modern-screenshot');
      const dataUrl = await domToPng(node, { scale: 2 });
      const link = document.createElement('a');
      link.download = 'thiep-cuoi-lovestory.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Có lỗi khi xuất ảnh thiệp cưới.');
    } finally {
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
          templateId: templateParam || 'thiep-cuoi-165',
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
      <header className="h-14 px-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between z-30 select-none shadow-xs">
        {/* Left: Brand & Undo/Redo */}
        <div className="flex items-center gap-3">
          {mode === 'admin' ? (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Quay lại Bảng Điều Khiển Admin"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Về Quản Trị</span>
            </Link>
          ) : (
            <Link
              href="/templates"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Quay lại danh mục mẫu thiệp"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}

          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-base text-rose-600">💍 LoveStory</span>
            {mode === 'admin' ? (
              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold uppercase tracking-wider">
                Admin Master Studio
              </span>
            ) : (
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold uppercase tracking-wider">
                Studio
              </span>
            )}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 pl-3 border-l border-stone-200 dark:border-stone-800">
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
        <div className="hidden lg:flex items-center gap-5 text-xs">
          {mode === 'admin' ? (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Chế độ Soạn Mẫu Hệ Thống</span>
              </span>

              {/* Admin test profile button */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  weddingProfile.isLinked
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-700'
                }`}
                title="Tạo nhanh hồ sơ cưới để thử nghiệm mẫu"
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {weddingProfile.isLinked
                    ? `Hồ sơ: ${weddingProfile.groom.shortName || 'Bảo'} & ${weddingProfile.bride.shortName || 'Vy'}`
                    : 'Tạo hồ sơ cưới'}
                </span>
              </button>
            </div>
          ) : (
            <>
              <span className="text-stone-400 text-[11px]">
                Xuất bản để lưu thiết kế vào hệ thống
              </span>

              {/* Save status */}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-stone-600 dark:text-stone-300 text-[11px] font-medium">
                  Đã lưu tạm thời
                </span>
              </div>

              {/* Wedding Profile Link Button */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  weddingProfile.isLinked
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                }`}
              >
                {weddingProfile.isLinked ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Hồ sơ: {weddingProfile.groom.shortName || weddingProfile.groom.fullName || 'Bảo'} &{' '}
                      {weddingProfile.bride.shortName || weddingProfile.bride.fullName || 'Vy'}
                    </span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5 text-stone-500" />
                    <span>Hồ sơ cưới: Chưa gắn, bấm để gắn</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle Inspector Button */}
          <button
            onClick={toggleInspector}
            className={`hidden md:flex px-3 py-1.5 rounded-xl border text-xs font-semibold items-center gap-1.5 transition-colors ${
              isInspectorOpen
                ? 'border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                : 'border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
            title={isInspectorOpen ? 'Thu gọn bảng thuộc tính công cụ' : 'Hiện bảng thuộc tính công cụ'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{isInspectorOpen ? 'Ẩn công cụ' : 'Hiện công cụ'}</span>
          </button>

          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="hidden sm:flex px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold items-center gap-1.5 transition-colors"
            title="Xuất thiệp thành ảnh PNG"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" /> : <Download className="w-3.5 h-3.5" />}
            <span>Xuất ảnh</span>
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Xem trước trực tiếp thiệp cưới"
          >
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            <span>Xem trước</span>
          </button>

          {mode === 'admin' ? (
            /* ADMIN: Save To Master Template Warehouse Button */
            <button
              onClick={() => {
                setSaveStatus(null);
                setShowSavePresetModal(true);
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/25 transition-transform active:scale-95 whitespace-nowrap"
            >
              <FolderPlus className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Lưu Vào Kho Mẫu Thiệp</span>
            </button>
          ) : (
            /* USER: Publish personal wedding card */
            <button
              onClick={handleOpenUserPublish}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-transform active:scale-95"
            >
              <Rocket className="w-3.5 h-3.5 text-white" />
              <span>Xuất Bản Thiệp</span>
            </button>
          )}

          {/* Link to Admin if logged in as Admin and in User mode */}
          {isAdmin && mode !== 'admin' && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Mở Bảng Điều Khiển Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden md:inline">Quản Trị Admin</span>
            </Link>
          )}

          {/* Profile badge */}
          <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 overflow-hidden flex items-center justify-center text-rose-600 font-bold text-xs ml-1 cursor-pointer shadow-xs">
            <span>{mode === 'admin' ? 'AD' : 'LS'}</span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* ADMIN: SAVE TO TEMPLATE WAREHOUSE MODAL */}
      {/* ======================================================== */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in-95 duration-200 text-stone-100">
            <button
              onClick={() => setShowSavePresetModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  Lưu Thiết Kế Vào Kho Mẫu Thiệp
                </h3>
                <p className="text-xs text-stone-400">
                  Mẫu này sẽ được lưu vào kho dữ liệu và hiển thị công khai trên danh mục LoveStory cho khách hàng chọn làm thiệp.
                </p>
              </div>
            </div>

            {/* Notification alert */}
            {saveStatus && (
              <div
                className={`p-3.5 rounded-2xl text-xs mb-4 flex items-center gap-2.5 ${
                  saveStatus.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {saveStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{saveStatus.message}</p>
                  {saveStatus.type === 'success' && saveStatus.savedSlug && (
                    <div className="mt-2 flex items-center gap-3">
                      <Link
                        href="/admin/templates"
                        className="text-[11px] underline text-purple-300 hover:text-white font-semibold"
                      >
                        Quản lý trong Kho Templates →
                      </Link>
                      <Link
                        href={`/templates`}
                        target="_blank"
                        className="text-[11px] underline text-emerald-300 hover:text-white font-semibold flex items-center gap-1"
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
              {/* Tên mẫu thiệp & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300 block">
                    Tên Mẫu Thiệp <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tplName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    placeholder="VD: Thiệp Cưới Burgundy Cinema"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300 block">
                    Đường dẫn mẫu (Slug) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tplSlug}
                    onChange={(e) => setTplSlug(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    placeholder="thiep-cuoi-burgundy-cinema"
                  />
                </div>
              </div>

              {/* Thể loại & Hạng mẫu (Tier) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300 block">Thể loại</label>
                  <select
                    value={tplCategory}
                    onChange={(e) => setTplCategory(e.target.value as 'wedding' | 'birthday' | 'event' | 'graduation')}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="wedding">Đám Cưới (Wedding)</option>
                    <option value="birthday">Sinh Nhật (Birthday)</option>
                    <option value="event">Sự Kiện (Event)</option>
                    <option value="graduation">Tốt Nghiệp (Graduation)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300 block">Hạng mẫu (Tier)</label>
                  <select
                    value={tplTier}
                    onChange={(e) => {
                      const newTier = e.target.value as 'FREE' | 'BASIC' | 'PREMIUM';
                      setTplTier(newTier);
                      if (newTier === 'FREE') setTplPrice(0);
                      else if (newTier === 'BASIC') setTplPrice(50000);
                      else setTplPrice(30000);
                    }}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="PREMIUM">VIP (Mua lẻ 30k / Gói VIP 200k)</option>
                    <option value="BASIC">Chuẩn 1 Năm (50.000đ)</option>
                    <option value="FREE">Miễn Phí (300 views, 30 ngày)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300 block">Giá Bán Lẻ (VNĐ)</label>
                  <input
                    type="number"
                    disabled={tplTier === 'FREE'}
                    value={tplPrice}
                    onChange={(e) => setTplPrice(Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500 font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Huy hiệu (Badge) & Ảnh xem trước (Thumbnail) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300 block">Huy hiệu hiển thị</label>
                  <input
                    type="text"
                    value={tplBadge}
                    onChange={(e) => setTplBadge(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Hot VIP, Mới, Nổi Bật"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-300">Ảnh Thumbnail Xem Trước</label>
                    <button
                      type="button"
                      onClick={handleCaptureThumbnail}
                      disabled={isCapturingThumb}
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isCapturingThumb ? 'Đang chụp...' : 'Chụp Canvas làm ảnh'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={tplThumbnail}
                    onChange={(e) => setTplThumbnail(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500 font-mono truncate"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Quick Preset Thumbnails */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-stone-400 block">Chọn nhanh ảnh bìa mẫu:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_THUMBS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTplThumbnail(s.url)}
                      className={`p-1.5 rounded-xl border text-left text-[10px] transition-all flex items-center gap-2 ${
                        tplThumbnail === s.url
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-stone-800 bg-stone-850 hover:border-stone-700 text-stone-400'
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
                <label className="font-semibold text-stone-300 block">Mô tả mẫu thiệp</label>
                <textarea
                  rows={2}
                  value={tplDescription}
                  onChange={(e) => setTplDescription(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Mô tả phong cách, hiệu ứng nổi bật của mẫu thiệp này..."
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowSavePresetModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 font-medium"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSavingPreset}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSavingPreset ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Đang lưu vào kho mẫu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span>Xác Nhận Lưu Vào Kho Mẫu</span>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200 text-stone-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowUserPublishModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {publishSuccessData ? (
              /* Success State */
              <div className="text-center space-y-5 py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Xuất bản thành công
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white pt-2">
                    Thiệp Cưới Của Bạn Đã Sẵn Sàng!
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                    Thiệp cưới đã được lưu vào hệ thống LoveStory và có thể chia sẻ cho người thân, bạn bè ngay bây giờ.
                  </p>
                </div>

                {/* QR Code */}
                <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${publishSuccessData.slug}`
                    )}`}
                    alt="QR Code Thiệp Cưới"
                    className="w-36 h-36 mx-auto"
                  />
                  <span className="text-[10px] font-semibold text-stone-600 block mt-2">
                    Quét mở trên điện thoại
                  </span>
                </div>

                {/* URL display */}
                <div className="p-3 rounded-2xl bg-stone-950 font-mono text-xs text-rose-300 border border-stone-800 flex items-center justify-between gap-2">
                  <span className="truncate">
                    {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/{publishSuccessData.slug}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPublishedLink}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white shrink-0 text-xs flex items-center gap-1 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Đã chép' : 'Chép'}</span>
                  </button>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={`/${publishSuccessData.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-transform active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Xem Thiệp Trực Tiếp</span>
                  </a>

                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Về Bảng Điều Khiển</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Publish Form */
              <form onSubmit={handleConfirmUserPublish} className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-rose-400 font-bold">
                    Xuất Bản Thiệp Cưới
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white">
                    Phát Hành Thiệp Cưới Online
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Thiết lập tên và đường dẫn công khai cho thiệp cưới của hai bạn.
                  </p>
                </div>

                {publishError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
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
                    <label className="font-semibold text-stone-300 block">
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
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-rose-500"
                      placeholder="vd: Lễ Thành Hôn Bảo & Vy"
                    />
                  </div>

                  {/* Slug đường dẫn */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-300 block">
                      Đường Dẫn Công Khai (Slug)
                    </label>
                    <div className="flex items-center rounded-xl bg-stone-800 border border-stone-700 overflow-hidden focus-within:ring-1 focus-within:ring-rose-500">
                      <span className="px-3 py-2.5 bg-stone-950 text-stone-500 font-mono text-xs border-r border-stone-700 shrink-0">
                        lovestory.me/
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
                        className="w-full bg-transparent px-3 py-2 text-xs text-white font-mono outline-none"
                        placeholder="bao-va-vy-2026"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500">
                      Chỉ dùng chữ cái thường, số và dấu gạch nối (-).
                    </span>
                  </div>

                  {/* Quyền lợi gói */}
                  <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 text-[11px] text-stone-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Tài khoản của bạn:</span>
                      <span className="font-bold text-white">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Giới hạn lượt xem:</span>
                      <span className="font-semibold text-amber-400">
                        {user?.plan === 'LIFETIME_VIP_200K' || user?.plan === 'ANNUAL_50K' || user?.role === 'ADMIN'
                          ? 'Không giới hạn'
                          : '300 lượt xem (Gói Free)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowUserPublishModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 font-medium text-xs"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={isPublishingUser}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
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
    </>
  );
}
