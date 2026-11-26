'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Type,
  Palette,
  Music,
  Plus,
  Trash2,
  Upload,
  Play,
  Pause,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Image as ImageIcon,
  Check,
  Wand2,
  X,
  Folder,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { StudioFont, resolveFontFamily } from '@/lib/studioFonts';
import { GraphicSticker } from '@/data/graphicsCatalog';
import { MusicTrack, GraphicFolder } from '@/lib/systemAssetsService';

interface Props {
  initialFonts: (StudioFont & { isCustom?: boolean })[];
  initialGraphics: (GraphicSticker & { isCustom?: boolean })[];
  initialFolders?: GraphicFolder[];
  initialMusic: MusicTrack[];
}

export default function AssetsManagerClient({
  initialFonts,
  initialGraphics,
  initialFolders = [],
  initialMusic,
}: Props) {
  const [activeTab, setActiveTab] = useState<'fonts' | 'graphics' | 'music'>('fonts');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ==========================================
  // 1. FONTS STATE & HANDLERS
  // ==========================================
  const [fonts, setFonts] = useState(initialFonts);
  const [searchFont, setSearchFont] = useState('');
  const [fontCategoryFilter, setFontCategoryFilter] = useState<'all' | 'script' | 'serif' | 'sans'>('all');
  const [showAddFontModal, setShowAddFontModal] = useState(false);
  const [newFontName, setNewFontName] = useState('');
  const [newFontGoogle, setNewFontGoogle] = useState('');
  const [newFontFileUrl, setNewFontFileUrl] = useState('');
  const [newFontDesc, setNewFontDesc] = useState('');
  const [newFontCategory, setNewFontCategory] = useState<'script' | 'serif' | 'sans'>('script');
  const [isUploadingFont, setIsUploadingFont] = useState(false);
  const [isSubmittingFont, setIsSubmittingFont] = useState(false);
  const fontFileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFontFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFont(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tải tệp phông chữ thất bại');
      }

      setNewFontFileUrl(data.url);
      if (!newFontName) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewFontName(cleanName);
      }
      setMessage({ text: 'Tải tệp phông chữ lên thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi tải phông chữ', type: 'error' });
    } finally {
      setIsUploadingFont(false);
    }
  };

  const handleAddFont = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFontName.trim()) {
      setMessage({ text: 'Vui lòng nhập tên phông chữ', type: 'error' });
      return;
    }
    setIsSubmittingFont(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/assets/fonts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFontName.trim(),
          googleFont: newFontGoogle.trim() || undefined,
          fileUrl: newFontFileUrl.trim() || undefined,
          desc: newFontDesc.trim() || undefined,
          category: newFontCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Thêm phông chữ thất bại');
      }

      setFonts((prev) => [data.font, ...prev]);
      setShowAddFontModal(false);
      setNewFontName('');
      setNewFontGoogle('');
      setNewFontFileUrl('');
      setNewFontDesc('');
      setMessage({ text: data.message, type: 'success' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi thêm phông chữ', type: 'error' });
    } finally {
      setIsSubmittingFont(false);
    }
  };

  const handleDeleteFont = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa phông chữ "${name}"?`)) return;
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/assets/fonts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Xóa phông chữ thất bại');
      }

      setFonts((prev) => prev.filter((f) => f.id !== id));
      setMessage({ text: `Đã xóa phông chữ "${name}" thành công`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi xóa phông chữ', type: 'error' });
    }
  };

  const filteredFonts = fonts.filter((f) => {
    const matchCat = fontCategoryFilter === 'all' || f.category === fontCategoryFilter;
    const matchSearch =
      f.name.toLowerCase().includes(searchFont.toLowerCase()) ||
      f.desc.toLowerCase().includes(searchFont.toLowerCase());
    return matchCat && matchSearch;
  });

  // ==========================================
  // 2. GRAPHICS & FOLDERS STATE & HANDLERS
  // ==========================================
  const [graphics, setGraphics] = useState(initialGraphics);
  const [folders, setFolders] = useState<GraphicFolder[]>(initialFolders);
  const [gfxViewMode, setGfxViewMode] = useState<'folder' | 'flat'>('folder');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const [searchGfx, setSearchGfx] = useState('');
  const [gfxCategoryFilter, setGfxCategoryFilter] = useState<string>('all');
  const [gfxVisibleLimit, setGfxVisibleLimit] = useState<number>(60);
  const [showAddGfxModal, setShowAddGfxModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [newGfxName, setNewGfxName] = useState('');
  const [newGfxSrc, setNewGfxSrc] = useState('');
  const [newGfxCategory, setNewGfxCategory] = useState<GraphicSticker['category']>('Yếu tố đám cưới');
  const [newGfxFolder, setNewGfxFolder] = useState<string>('Yếu tố đám cưới');
  const [isCreatingNewFolderInModal, setIsCreatingNewFolderInModal] = useState(false);
  const [newGfxWidth, setNewGfxWidth] = useState<number>(100);
  const [newGfxHeight, setNewGfxHeight] = useState<number>(100);
  const [isUploadingGfx, setIsUploadingGfx] = useState(false);
  const [isSubmittingGfx, setIsSubmittingGfx] = useState(false);
  const gfxFileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const res = await fetch('/api/admin/assets/graphics/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          icon: newFolderIcon.trim() || '📁',
          description: newFolderDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tạo thư mục thất bại');

      setFolders((prev) => {
        const exists = prev.some((f) => f.name.toLowerCase() === data.folder.name.toLowerCase());
        return exists ? prev : [...prev, data.folder];
      });
      setShowCreateFolderModal(false);
      setNewFolderName('');
      setNewFolderDesc('');
      setMessage({ text: data.message, type: 'success' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi tạo thư mục', type: 'error' });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folder: GraphicFolder) => {
    if (!confirm(`Bạn có chắc muốn xóa thư mục "${folder.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/assets/graphics/folders?id=${encodeURIComponent(folder.id || folder.name)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thư mục thất bại');
      setFolders((prev) => prev.filter((f) => f.id !== folder.id && f.name !== folder.name));
      if (currentFolder === folder.name) setCurrentFolder(null);
      setMessage({ text: data.message, type: 'success' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi xóa thư mục', type: 'error' });
    }
  };

  const handleUploadGfxFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGfx(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tải ảnh lên thất bại');
      }

      setNewGfxSrc(data.url);
      if (!newGfxName) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewGfxName(cleanName);
      }
      setMessage({ text: 'Tải tệp ảnh thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi tải ảnh lên', type: 'error' });
    } finally {
      setIsUploadingGfx(false);
    }
  };

  const handleAddGraphic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGfxName.trim() || !newGfxSrc.trim()) {
      setMessage({ text: 'Vui lòng nhập tên đồ họa và đường dẫn hình ảnh', type: 'error' });
      return;
    }
    setIsSubmittingGfx(true);
    setMessage(null);

    const targetFolder = newGfxFolder.trim() || newGfxCategory || 'Yếu tố đám cưới';

    try {
      const res = await fetch('/api/admin/assets/graphics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGfxName.trim(),
          src: newGfxSrc.trim(),
          category: newGfxCategory,
          folder: targetFolder,
          subCategory: targetFolder,
          defaultWidth: Number(newGfxWidth) || 100,
          defaultHeight: Number(newGfxHeight) || 100,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Thêm đồ họa thất bại');
      }

      setGraphics((prev) => [data.graphic, ...prev]);
      // Update folder count locally
      setFolders((prev) =>
        prev.map((f) =>
          f.name.toLowerCase() === targetFolder.toLowerCase()
            ? { ...f, count: (f.count || 0) + 1 }
            : f
        )
      );

      setShowAddGfxModal(false);
      setNewGfxName('');
      setNewGfxSrc('');
      setMessage({ text: data.message, type: 'success' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi thêm đồ họa', type: 'error' });
    } finally {
      setIsSubmittingGfx(false);
    }
  };

  const handleDeleteGraphic = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đồ họa "${name}"?`)) return;
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/assets/graphics?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Xóa đồ họa thất bại');
      }

      setGraphics((prev) => prev.filter((g) => g.id !== id));
      setMessage({ text: `Đã xóa đồ họa "${name}" thành công`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi xóa đồ họa', type: 'error' });
    }
  };

  const filteredGraphics = graphics.filter((g) => {
    const matchCat = gfxCategoryFilter === 'all' || g.category === gfxCategoryFilter;
    const matchSearch = g.name.toLowerCase().includes(searchGfx.toLowerCase());
    return matchCat && matchSearch;
  });

  // ==========================================
  // 3. MUSIC STATE & HANDLERS
  // ==========================================
  const [musicList, setMusicList] = useState(initialMusic);
  const [searchMusic, setSearchMusic] = useState('');
  const [showAddMusicModal, setShowAddMusicModal] = useState(false);
  const [newMusicTitle, setNewMusicTitle] = useState('');
  const [newMusicArtist, setNewMusicArtist] = useState('');
  const [newMusicUrl, setNewMusicUrl] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [isSubmittingMusic, setIsSubmittingMusic] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadMusicFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMusic(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tải tệp âm thanh thất bại');
      }

      setNewMusicUrl(data.url);
      if (!newMusicTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewMusicTitle(cleanName);
      }
      setMessage({ text: 'Tải tệp MP3 lên thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi tải âm thanh', type: 'error' });
    } finally {
      setIsUploadingMusic(false);
    }
  };

  const handleAddMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMusicTitle.trim() || !newMusicUrl.trim()) {
      setMessage({ text: 'Vui lòng nhập tên bài hát và đường dẫn âm thanh MP3', type: 'error' });
      return;
    }
    setIsSubmittingMusic(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/assets/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMusicTitle.trim(),
          artist: newMusicArtist.trim() || undefined,
          url: newMusicUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Thêm bài hát thất bại');
      }

      setMusicList((prev) => [data.track, ...prev]);
      setShowAddMusicModal(false);
      setNewMusicTitle('');
      setNewMusicArtist('');
      setNewMusicUrl('');
      setMessage({ text: data.message, type: 'success' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi thêm bài hát', type: 'error' });
    } finally {
      setIsSubmittingMusic(false);
    }
  };

  const handleDeleteMusic = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bài hát "${title}"?`)) return;
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/assets/music?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Xóa bài hát thất bại');
      }

      setMusicList((prev) => prev.filter((m) => m.id !== id));
      if (playingTrackId === id) {
        audioPlayerRef.current?.pause();
        setPlayingTrackId(null);
      }
      setMessage({ text: `Đã xóa bài hát "${title}" thành công`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi xóa bài hát', type: 'error' });
    }
  };

  const togglePlayMusic = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      audioPlayerRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = track.url;
        audioPlayerRef.current.play().then(() => {
          setPlayingTrackId(track.id);
        }).catch(() => {
          setMessage({ text: 'Không thể phát bài hát này', type: 'error' });
        });
      }
    }
  };

  const filteredMusic = musicList.filter((m) =>
    m.title.toLowerCase().includes(searchMusic.toLowerCase()) ||
    (m.artist && m.artist.toLowerCase().includes(searchMusic.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <audio ref={audioPlayerRef} onEnded={() => setPlayingTrackId(null)} />

      {/* Header with Title & Quick Link to Admin Studio */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-bold uppercase tracking-wider">
              Studio Assets Hub
            </span>
            <span className="text-xs text-stone-500">Admin Only</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Quản Lý Tài Nguyên Studio
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Thêm mới phông chữ, hình đồ họa sticker và bài hát đám cưới. Mọi cập nhật sẽ tự động hiển thị tức thì cho khách hàng trong trình thiết kế.
          </p>
        </div>

        {/* Quick action button: Go to Admin Studio */}
        <Link
          href="/admin/studio"
          className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs active:scale-95 transition-all"
        >
          <Wand2 className="w-4 h-4" />
          <span>Mở Admin Studio Soạn Mẫu</span>
        </Link>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
              : 'bg-red-950/40 border-red-800/80 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-stone-500 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200/90 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('fonts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'fonts'
              ? 'bg-stone-900 text-white shadow-2xs font-semibold'
              : 'bg-white text-stone-500 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Phông Chữ ({fonts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('graphics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'graphics'
              ? 'bg-stone-900 text-white shadow-2xs font-semibold'
              : 'bg-white text-stone-500 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Đồ Họa &amp; Sticker ({graphics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('music')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'music'
              ? 'bg-stone-900 text-white shadow-2xs font-semibold'
              : 'bg-white text-stone-500 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Kho Nhạc Cưới ({musicList.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PHÔNG CHỮ (FONTS MANAGEMENT)
      ========================================================================= */}
      {activeTab === 'fonts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/90">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchFont}
                onChange={(e) => setSearchFont(e.target.value)}
                placeholder="Tìm phông chữ theo tên hoặc mô tả..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'script', label: 'Viết tay (Script)' },
                { id: 'serif', label: 'Có chân (Serif)' },
                { id: 'sans', label: 'Hiện đại (Sans)' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFontCategoryFilter(c.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                    fontCategoryFilter === c.id
                      ? 'bg-stone-800 text-stone-700 border border-stone-900/30'
                      : 'text-stone-500 hover:text-white hover:bg-stone-800/40'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Add Font Button */}
            <button
              onClick={() => setShowAddFontModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Phông Chữ</span>
            </button>
          </div>

          {/* Fonts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFonts.map((font) => (
              <div
                key={font.id}
                className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-200/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{font.name}</span>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-500 border border-stone-200/80">
                        {font.category}
                      </span>
                      {font.isCustom && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-semibold">
                          Tùy chỉnh
                        </span>
                      )}
                    </div>

                    {font.isCustom && (
                      <button
                        onClick={() => handleDeleteFont(font.id, font.name)}
                        className="text-stone-500 hover:text-red-400 p-1 transition-colors"
                        title="Xóa phông chữ này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Visual Typeface Sample Preview */}
                  <div className="p-3 bg-stone-50/60 rounded-xl border border-stone-200/80 my-2 overflow-hidden">
                    <span
                      className="block text-2xl text-amber-200 leading-tight truncate"
                      style={{ fontFamily: font.family }}
                    >
                      Save the Date • Thư Mời Cưới
                    </span>
                    <span
                      className="block text-sm text-stone-300 mt-1 truncate"
                      style={{ fontFamily: font.family }}
                    >
                      Hoàng Long &amp; Mai Chi — 28.11.2026
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                  <span>{font.desc}</span>
                  {font.googleFont && (
                    <span className="font-mono text-stone-700/80 truncate max-w-[120px]">{font.googleFont}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ĐỒ HỌA & STICKER (GRAPHICS MANAGEMENT WITH FOLDERS)
      ========================================================================= */}
      {activeTab === 'graphics' && (
        <div className="space-y-4">
          {/* Top Control Bar: Search + View Mode Switch + Action Buttons */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchGfx}
                onChange={(e) => setSearchGfx(e.target.value)}
                placeholder="Tìm đồ họa theo tên hoặc thư mục..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
              />
            </div>

            {/* View Mode Toggle: Folder View vs Flat Grid */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => {
                  setGfxViewMode('folder');
                  setCurrentFolder(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  gfxViewMode === 'folder'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span>Theo Thư Mục</span>
              </button>
              <button
                type="button"
                onClick={() => setGfxViewMode('flat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  gfxViewMode === 'flat'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>Tất Cả ({graphics.length})</span>
              </button>
            </div>

            {/* Actions: Create Folder + Add Graphic */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateFolderModal(true)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Tạo Thư Mục Mới</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentFolder) {
                    setNewGfxFolder(currentFolder);
                  }
                  setShowAddGfxModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Đồ Họa</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: FOLDER VIEW */}
          {gfxViewMode === 'folder' && (
            <div>
              {/* Case A: Folder Grid (Overview) */}
              {currentFolder === null ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-amber-500" />
                      <span>Danh Sách Thư Mục Đồ Họa ({folders.length} thư mục)</span>
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Bấm vào thư mục để xem hoặc quản lý đồ họa bên trong
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {folders.map((folder) => {
                      const folderGraphics = graphics.filter(
                        (g) => (g.folder || g.subCategory || g.category || '').toLowerCase() === folder.name.toLowerCase()
                      );
                      const count = folderGraphics.length || folder.count || 0;

                      return (
                        <div
                          key={folder.id || folder.name}
                          onClick={() => setCurrentFolder(folder.name)}
                          className="bg-white p-4 rounded-2xl border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
                        >
                          <div>
                            <div className="flex items-start justify-between mb-2.5">
                              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                                {folder.icon || '📁'}
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                                  {count} mẫu
                                </span>
                                {!folder.isDefault && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFolder(folder);
                                    }}
                                    className="p-1 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100 transition-colors"
                                    title="Xóa thư mục này"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors">
                              {folder.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {folder.description || 'Thư mục tài nguyên đồ họa'}
                            </p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 group-hover:text-amber-600 font-semibold">
                            <span>Mở thư mục</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Case B: Inside Specific Folder */
                <div className="space-y-4">
                  {/* Breadcrumb Header */}
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentFolder(null)}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Danh sách thư mục</span>
                      </button>
                      <span className="text-stone-300">/</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">
                          {folders.find((f) => f.name.toLowerCase() === currentFolder.toLowerCase())?.icon || '📁'}
                        </span>
                        <h3 className="font-serif font-bold text-stone-900 text-sm md:text-base">
                          {currentFolder}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          {
                            graphics.filter(
                              (g) =>
                                (g.folder || g.subCategory || g.category || '').toLowerCase() ===
                                currentFolder.toLowerCase()
                            ).length
                          }{' '}
                          đồ họa
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewGfxFolder(currentFolder);
                        setShowAddGfxModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm ảnh vào thư mục này</span>
                    </button>
                  </div>

                  {/* Folder Items Grid */}
                  {(() => {
                    const currentFolderItems = graphics.filter((g) => {
                      const matchesFolder =
                        (g.folder || g.subCategory || g.category || '').toLowerCase() ===
                        currentFolder.toLowerCase();
                      const matchesSearch =
                        !searchGfx.trim() ||
                        g.name.toLowerCase().includes(searchGfx.toLowerCase());
                      return matchesFolder && matchesSearch;
                    });

                    if (currentFolderItems.length === 0) {
                      return (
                        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 space-y-3">
                          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl mx-auto">
                            📁
                          </div>
                          <h4 className="font-bold text-stone-800 text-sm">
                            Thư mục &quot;{currentFolder}&quot; chưa có đồ họa nào
                          </h4>
                          <p className="text-xs text-stone-500 max-w-sm mx-auto">
                            Bấm nút bên dưới để tải các hình ảnh PNG trong suốt hoặc vector SVG vào thư mục này.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setNewGfxFolder(currentFolder);
                              setShowAddGfxModal(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tải Đồ Họa Vào Thư Mục Ngay</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {currentFolderItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-2xl bg-white border border-stone-200/90 hover:border-amber-300 transition-all flex flex-col items-center justify-between group relative shadow-2xs"
                          >
                            {item.isCustom && (
                              <button
                                onClick={() => handleDeleteGraphic(item.id, item.name)}
                                className="absolute top-2 right-2 text-stone-400 hover:text-red-500 p-1 transition-colors z-10"
                                title="Xóa đồ họa này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <div className="w-20 h-20 flex items-center justify-center p-2 mb-2 bg-stone-50 rounded-xl border border-stone-200/80">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.src}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                className="max-w-full max-h-full object-contain pointer-events-none group-hover:scale-110 transition-transform duration-200"
                              />
                            </div>

                            <div className="w-full text-center">
                              <span className="block text-xs font-semibold text-stone-800 truncate" title={item.name}>
                                {item.name}
                              </span>
                              <span className="block text-[9px] text-stone-500 truncate mt-0.5">
                                {item.folder || item.category}
                              </span>
                              {item.isCustom && (
                                <span className="inline-block text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold mt-1">
                                  Tùy chỉnh
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: FLAT ALL GRAPHICS GRID */}
          {gfxViewMode === 'flat' && (
            <div className="space-y-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-2xs">
                {['all', ...folders.map((f) => f.name)].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setGfxCategoryFilter(c);
                      setGfxVisibleLimit(60);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                      gfxCategoryFilter === c
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {c === 'all' ? 'Tất cả' : c}
                  </button>
                ))}
              </div>

              {/* Graphics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredGraphics.slice(0, gfxVisibleLimit).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-200/80 transition-all flex flex-col items-center justify-between group relative shadow-2xs"
                  >
                    {item.isCustom && (
                      <button
                        onClick={() => handleDeleteGraphic(item.id, item.name)}
                        className="absolute top-2 right-2 text-stone-500 hover:text-red-400 p-1 transition-colors z-10"
                        title="Xóa đồ họa này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="w-20 h-20 flex items-center justify-center p-2 mb-2 bg-stone-50/60 rounded-xl border border-stone-200/80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="max-w-full max-h-full object-contain pointer-events-none group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>

                    <div className="w-full text-center">
                      <span className="block text-xs font-semibold text-stone-800 truncate" title={item.name}>
                        {item.name}
                      </span>
                      <span className="block text-[9px] text-stone-500 truncate mt-0.5">
                        {item.folder || item.category}
                      </span>
                      {item.isCustom && (
                        <span className="inline-block text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-500/20 text-stone-700 font-semibold mt-1">
                          Mới thêm
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredGraphics.length > gfxVisibleLimit && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setGfxVisibleLimit((prev) => prev + 60)}
                    className="px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-semibold text-xs hover:bg-rose-100 transition-colors shadow-xs"
                  >
                    Tải thêm 60 đồ họa ({gfxVisibleLimit} / {filteredGraphics.length.toLocaleString()})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: KHO NHẠC CƯỚI (MUSIC MANAGEMENT)
      ========================================================================= */}
      {activeTab === 'music' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/90">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchMusic}
                onChange={(e) => setSearchMusic(e.target.value)}
                placeholder="Tìm bài hát theo tên hoặc ca sĩ..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Add Music Button */}
            <button
              onClick={() => setShowAddMusicModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Bài Hát Mới</span>
            </button>
          </div>

          {/* Music Tracks List */}
          <div className="space-y-2">
            {filteredMusic.map((track) => {
              const isPlaying = playingTrackId === track.id;
              return (
                <div
                  key={track.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isPlaying
                      ? 'bg-purple-950/30 border-stone-900/50 shadow-md shadow-purple-950/20'
                      : 'bg-white border-stone-200/90 hover:border-stone-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => togglePlayMusic(track)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                      }`}
                      title={isPlaying ? 'Tạm dừng' : 'Nghe thử'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{track.title}</span>
                        {track.isCustom && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-500/20 text-stone-700 font-semibold">
                            Admin tải lên
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium block truncate">
                        {track.artist || 'LoveStory Wedding Collection'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-stone-500 truncate max-w-[200px] hidden sm:inline">
                      {track.url}
                    </span>

                    {track.isCustom && (
                      <button
                        onClick={() => handleDeleteMusic(track.id, track.title)}
                        className="text-stone-500 hover:text-red-400 p-1.5 transition-colors"
                        title="Xóa bài hát này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM PHÔNG CHỮ MỚI
      ========================================================================= */}
      {showAddFontModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  Cấu Hình Phông Chữ
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Thêm Phông Chữ Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFontModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Nhập tên phông chữ từ Google Fonts hoặc tải tệp font máy tính. Phông mới sẽ hiển thị tức thì cho toàn bộ khách hàng trong Studio.
            </p>

            <form onSubmit={handleAddFont} className="space-y-3.5">
              {/* Tải tệp font từ máy tính */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-dashed border-stone-200 hover:border-stone-400 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    Tải tệp font từ máy (.ttf, .otf, .woff, .woff2)
                  </span>
                  {newFontFileUrl && (
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">✓ Đã tải tệp</span>
                  )}
                </div>
                <input
                  type="file"
                  ref={fontFileInputRef}
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleUploadFontFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fontFileInputRef.current?.click()}
                  disabled={isUploadingFont}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-200 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  <span>{isUploadingFont ? 'Đang tải tệp lên...' : newFontFileUrl ? 'Đổi tệp font khác' : 'Chọn tệp phông chữ từ máy tính'}</span>
                </button>
                {newFontFileUrl && (
                  <p className="text-[10px] text-stone-500 font-mono mt-2 truncate bg-white p-1.5 rounded-lg border border-stone-200">
                    Đường dẫn: {newFontFileUrl}
                  </p>
                )}
              </div>

              <div className="relative flex items-center justify-center my-2">
                <span className="text-[10px] uppercase text-stone-400 bg-white px-2 z-10 font-bold tracking-wider">Hoặc dùng Google Font</span>
                <div className="absolute inset-x-0 h-px bg-stone-200"></div>
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Tên Phông Chữ (Hiển thị) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Playfair Display, Great Vibes, Allura..."
                  value={newFontName}
                  onChange={(e) => setNewFontName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Google Font ID / Family Name (nếu không tải tệp)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Playfair+Display hoặc để trống tự sinh"
                  value={newFontGoogle}
                  onChange={(e) => setNewFontGoogle(e.target.value)}
                  disabled={!!newFontFileUrl}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 disabled:opacity-40 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Phân Loại Phông Chữ *</label>
                <select
                  value={newFontCategory}
                  onChange={(e) => setNewFontCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                >
                  <option value="script">Viết tay &amp; Thư pháp (Script)</option>
                  <option value="serif">Có chân &amp; Cổ điển (Serif)</option>
                  <option value="sans">Hiện đại &amp; Không chân (Sans)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Mô Tả Kiểu Dáng</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lãng mạn bay bổng, Hoàng gia kiêu sa..."
                  value={newFontDesc}
                  onChange={(e) => setNewFontDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddFontModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFont}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                >
                  {isSubmittingFont ? 'Đang thêm...' : 'Lưu Phông Chữ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM ĐỒ HỌA MỚI (VỚI CHỌN & TẠO THƯ MỤC)
      ========================================================================= */}
      {showAddGfxModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  Cấu Hình Đồ Họa &amp; Sticker
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Thêm Đồ Họa &amp; Sticker Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddGfxModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Tải ảnh PNG không nền (transparent) hoặc dán URL SVG/hình ảnh vào thư mục trong thư viện Studio.
            </p>

            <form onSubmit={handleAddGraphic} className="space-y-3.5">
              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Tên Đồ Họa / Họa Tiết *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nơ ruy băng hoa hồng, Vòng hoa vintage..."
                  value={newGfxName}
                  onChange={(e) => setNewGfxName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                />
              </div>

              {/* Thư Mục Lưu Trữ (Folder Selection) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-stone-700 font-semibold flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                    <span>Thư Mục Lưu Trữ *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewFolderInModal(!isCreatingNewFolderInModal)}
                    className="text-[11px] text-amber-600 hover:text-amber-800 font-bold"
                  >
                    {isCreatingNewFolderInModal ? 'Chọn thư mục có sẵn' : '+ Tạo thư mục mới'}
                  </button>
                </div>

                {isCreatingNewFolderInModal ? (
                  <input
                    type="text"
                    required
                    placeholder="Gõ tên thư mục mới... (vd: Nơ lụa hoa cưới)"
                    value={newGfxFolder}
                    onChange={(e) => setNewGfxFolder(e.target.value)}
                    className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                ) : (
                  <select
                    value={newGfxFolder}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsCreatingNewFolderInModal(true);
                        setNewGfxFolder('');
                      } else {
                        setNewGfxFolder(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                  >
                    {folders.map((f) => (
                      <option key={f.id || f.name} value={f.name}>
                        {f.icon || '📁'} {f.name}
                      </option>
                    ))}
                    <option value="__NEW__">+ Tạo thư mục mới...</option>
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Danh Mục Hiển Thị *</label>
                <select
                  value={newGfxCategory}
                  onChange={(e) => setNewGfxCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                >
                  <option value="Yếu tố đám cưới">Yếu tố đám cưới</option>
                  <option value="Văn hóa Việt">Văn hóa Việt</option>
                  <option value="Nhân vật">Nhân vật</option>
                  <option value="Hoa & Họa tiết">Hoa &amp; Họa tiết</option>
                  <option value="Lễ hội nổi bật">Lễ hội nổi bật</option>
                  <option value="Trái tim">Trái tim</option>
                  <option value="Ngôi sao">Ngôi sao</option>
                  <option value="Khung viền">Khung viền</option>
                  <option value="Nền">Nền</option>
                </select>
              </div>

              {/* Upload File or Paste URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-stone-700 font-semibold">Tải Tệp Ảnh Lên (Khuyên dùng PNG trong suốt)</label>
                  <button
                    type="button"
                    onClick={() => gfxFileInputRef.current?.click()}
                    className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Chọn tệp từ máy...</span>
                  </button>
                </div>

                <input
                  ref={gfxFileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/webp,image/jpeg"
                  onChange={handleUploadGfxFile}
                  className="hidden"
                />

                <input
                  type="text"
                  required
                  placeholder="Hoặc dán URL ảnh / SVG: /assets/wedding/... hoặc https://..."
                  value={newGfxSrc}
                  onChange={(e) => setNewGfxSrc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                />

                {isUploadingGfx && (
                  <p className="text-[10px] text-stone-600 mt-1 animate-pulse">Đang tải tệp ảnh lên máy chủ...</p>
                )}

                {newGfxSrc && (
                  <div className="mt-2 p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-lg border border-stone-200 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newGfxSrc} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono truncate">{newGfxSrc}</span>
                  </div>
                )}
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-500 font-medium block mb-1">Chiều Rộng (px)</label>
                  <input
                    type="number"
                    value={newGfxWidth}
                    onChange={(e) => setNewGfxWidth(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 font-medium block mb-1">Chiều Cao (px)</label>
                  <input
                    type="number"
                    value={newGfxHeight}
                    onChange={(e) => setNewGfxHeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddGfxModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGfx}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                >
                  {isSubmittingGfx ? 'Đang thêm...' : 'Lưu Đồ Họa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TẠO THƯ MỤC ĐỒ HỌA MỚI
      ========================================================================= */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl">
                  {newFolderIcon}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    QUẢN LÝ THƯ MỤC
                  </span>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    Tạo Thư Mục Đồ Họa Mới
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateFolderModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5">
              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Tên Thư Mục *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nơ hoa cưới, Con dấu sáp 3D, Họa tiết Vintage..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Biểu Tượng Thư Mục</label>
                <div className="flex items-center gap-1.5 flex-wrap p-2 bg-stone-50 rounded-xl border border-stone-200">
                  {['📁', '🖼️', '🔲', '🎀', '🌸', '💍', '囍', '💌', '❤️', '🏮', '✨', '👫', '🕊️', '🍰', '🍷'].map(
                    (emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewFolderIcon(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                          newFolderIcon === emoji
                            ? 'bg-amber-200/80 border border-amber-400 scale-110 shadow-2xs'
                            : 'hover:bg-white'
                        }`}
                      >
                        {emoji}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Mô Tả Ngắn Gọn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Các mẫu nơ ruy băng trang trí phong bì và thiệp cưới"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                >
                  {isCreatingFolder ? 'Đang tạo...' : 'Tạo Thư Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM BÀI HÁT MỚI
      ========================================================================= */}
      {showAddMusicModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  Cấu Hình Nhạc Cưới
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Thêm Bài Hát Mới Vào Thư Viện
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMusicModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Tải tệp MP3 hoặc dán liên kết âm thanh trực tiếp. Khách hàng có thể chọn bài hát này làm nhạc nền thiệp cưới.
            </p>

            <form onSubmit={handleAddMusic} className="space-y-3.5">
              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Tên Bài Hát *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Beautiful In White, Cưới Nhau Đi, I Do..."
                  value={newMusicTitle}
                  onChange={(e) => setNewMusicTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-semibold">Nghệ Sĩ / Ca Sĩ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Shane Filan, Đức Phúc, 911..."
                  value={newMusicArtist}
                  onChange={(e) => setNewMusicArtist(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-stone-700 font-semibold">Đường Dẫn Âm Thanh MP3 *</label>
                  <button
                    type="button"
                    onClick={() => musicFileInputRef.current?.click()}
                    className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Tải tệp MP3 từ máy...</span>
                  </button>
                </div>

                <input
                  ref={musicFileInputRef}
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a"
                  onChange={handleUploadMusicFile}
                  className="hidden"
                />

                <input
                  type="text"
                  required
                  placeholder="Dán link âm thanh /assets/wedding/mp3/... hoặc https://..."
                  value={newMusicUrl}
                  onChange={(e) => setNewMusicUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors font-mono"
                />

                {isUploadingMusic && (
                  <p className="text-[10px] text-stone-600 mt-1 animate-pulse">Đang tải tệp MP3 lên máy chủ...</p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddMusicModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMusic}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                >
                  {isSubmittingMusic ? 'Đang thêm...' : 'Lưu Bài Hát'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
