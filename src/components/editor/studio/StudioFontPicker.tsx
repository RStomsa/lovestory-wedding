'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Check,
  Sparkles,
  X,
  Upload,
  Loader2,
} from 'lucide-react';
import { STUDIO_FONTS, resolveFontFamily, StudioFont, loadCustomFontFile } from '@/lib/studioFonts';

interface StudioFontPickerProps {
  currentFont?: string;
  onSelect: (fontFamily: string) => void;
  onPreview?: (fontFamily: string) => void;
  onResetPreview?: () => void;
}

export default function StudioFontPicker({
  currentFont = 'sans-serif',
  onSelect,
  onPreview,
  onResetPreview,
}: StudioFontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'script' | 'serif' | 'sans'>('all');
  const [fontsList, setFontsList] = useState<StudioFont[]>(STUDIO_FONTS);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalFontRef = useRef(currentFont);
  const fontFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFont, setIsUploadingFont] = useState(false);
  const [isScanningLocalFonts, setIsScanningLocalFonts] = useState(false);
  const [localFontsCount, setLocalFontsCount] = useState<number | null>(null);

  // Scan local fonts installed on the user's OS via window.queryLocalFonts()
  const handleScanLocalFonts = async () => {
    if (typeof window === 'undefined') return;
    if (!('queryLocalFonts' in window)) {
      alert('Trình duyệt của bạn hiện chưa hỗ trợ Local Font Access API trực tiếp. Hãy dùng trình duyệt Google Chrome hoặc Microsoft Edge trên máy tính, hoặc bấm nút "+ Tải tệp font" bên cạnh để tải file font chữ lên.');
      return;
    }

    setIsScanningLocalFonts(true);
    try {
      const win = window as unknown as { queryLocalFonts?: () => Promise<Array<{ family: string }>> };
      const localFonts = win.queryLocalFonts ? await win.queryLocalFonts() : [];
      if (!Array.isArray(localFonts) || localFonts.length === 0) {
        setIsScanningLocalFonts(false);
        return;
      }

      const seenFamilies = new Set<string>();
      const customLocalFonts: StudioFont[] = [];
      const priorityPrefixes = ['utm', 'svn', 'iciel', 'uvn', 'vni', 'script', 'font', 'hand', 'brush'];

      localFonts.forEach((f) => {
        const fam = f.family;
        if (!fam || seenFamilies.has(fam.toLowerCase())) return;
        seenFamilies.add(fam.toLowerCase());

        const lowerFam = fam.toLowerCase();
        const isPriority = priorityPrefixes.some((p) => lowerFam.includes(p));

        customLocalFonts.push({
          id: `sys-local-${fam.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: fam,
          family: `"${fam}", cursive, serif`,
          googleFont: '',
          desc: isPriority ? 'Phông Việt hóa từ máy tính' : 'Phông hệ thống máy tính',
          category: isPriority ? 'script' : 'sans',
          isCustom: true,
        });
      });

      customLocalFonts.sort((a, b) => {
        const aPri = priorityPrefixes.some((p) => a.name.toLowerCase().includes(p)) ? 1 : 0;
        const bPri = priorityPrefixes.some((p) => b.name.toLowerCase().includes(p)) ? 1 : 0;
        return bPri - aPri;
      });

      setLocalFontsCount(customLocalFonts.length);
      setFontsList((prev) => {
        const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
        const uniqueNew = customLocalFonts.filter((f) => !existingNames.has(f.name.toLowerCase()));
        return [...uniqueNew, ...prev];
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('Query local fonts error:', err);
      }
    } finally {
      setIsScanningLocalFonts(false);
    }
  };

  // Fetch dynamic fonts added by Admin
  useEffect(() => {
    let isCancelled = false;
    fetch('/api/studio/assets')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && Array.isArray(data.fonts) && data.fonts.length > 0) {
          const map = new Map<string, StudioFont>();
          data.fonts.forEach((f: StudioFont) => {
            map.set(f.id, f);
            // If font has uploaded fileUrl, preload it into browser
            if (f.fileUrl) {
              loadCustomFontFile(f.name, f.fileUrl).catch(() => {});
            }
          });
          STUDIO_FONTS.forEach((f) => {
            if (!map.has(f.id)) map.set(f.id, f);
          });
          setFontsList(Array.from(map.values()));
        }
      })
      .catch((err) => console.error('Failed to load dynamic fonts:', err));

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleUploadLocalFont = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFont(true);

    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const formData = new FormData();
      formData.append('file', file);

      let fontUrl = '';
      try {
        const res = await fetch('/api/admin/assets/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          fontUrl = data.url;
          // Register in system assets if admin/authorized
          fetch('/api/admin/assets/fonts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: cleanName,
              fileUrl: data.url,
              desc: 'Phông chữ tải từ máy tính',
              category: 'script',
            }),
          }).catch(() => {});
        }
      } catch (uploadErr) {
        console.warn('Server upload failed, falling back to local file reader:', uploadErr);
      }

      if (!fontUrl) {
        fontUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // Register font in browser
      await loadCustomFontFile(cleanName, fontUrl);

      const uniqueId = `local-font-${file.lastModified.toString(36)}-${file.size.toString(36)}`;
      const newFontObj: StudioFont = {
        id: uniqueId,
        name: cleanName,
        family: `'${cleanName}', cursive, serif`,
        googleFont: '',
        fileUrl: fontUrl,
        desc: 'Tải từ máy tính',
        category: 'script',
        isCustom: true,
      };

      setFontsList((prev) => [newFontObj, ...prev]);
      handleSelectFont(newFontObj);
    } catch (err) {
      console.error('Lỗi khi tải font từ máy tính:', err);
    } finally {
      setIsUploadingFont(false);
      if (fontFileInputRef.current) fontFileInputRef.current.value = '';
    }
  };

  // Sync original font on prop changes when closed
  useEffect(() => {
    if (!isOpen) {
      originalFontRef.current = currentFont;
    }
  }, [currentFont, isOpen]);

  // Handle outside click & escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          onResetPreview?.();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onResetPreview?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onResetPreview]);

  // Find current font metadata
  const currentFontMeta = fontsList.find(
    (f) =>
      f.name === currentFont ||
      (currentFont === 'sans-serif' && f.id === 'sans-serif') ||
      resolveFontFamily(f.name) === resolveFontFamily(currentFont)
  ) || {
    id: 'custom',
    name: currentFont || 'Tùy chọn',
    family: resolveFontFamily(currentFont),
    desc: 'Phông chữ hiện tại',
    category: 'script' as const,
  };

  // Filter fonts by search and category
  const filteredFonts = fontsList.filter((font) => {
    const matchesCategory = activeTab === 'all' || font.category === activeTab;
    const matchesSearch =
      font.name.toLowerCase().includes(search.toLowerCase()) ||
      font.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectFont = (font: StudioFont) => {
    const fontValue = font.name === 'Mặc định (Sans)' ? 'sans-serif' : font.name;
    originalFontRef.current = fontValue;

    // Dynamically inject font file if uploaded
    if (font.fileUrl) {
      loadCustomFontFile(font.name, font.fileUrl).catch(() => {});
    } else if (font.googleFont) {
      const linkId = `google-font-${font.id}`;
      if (typeof document !== 'undefined' && !document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.googleFont)}:wght@400;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }

    onSelect(fontValue);
    setIsOpen(false);
  };

  const handleHoverFont = (font: StudioFont) => {
    const fontValue = font.name === 'Mặc định (Sans)' ? 'sans-serif' : font.name;
    onPreview?.(fontValue);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button: Shows current font name in its own typeface */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-stone-50 dark:bg-stone-800/80 border rounded-xl px-3 py-2 flex items-center justify-between transition-all select-none text-left shadow-2xs ${
          isOpen
            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-white dark:bg-stone-800'
            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
        }`}
        title="Bấm để chọn phông chữ cưới"
      >
        <div className="flex flex-col min-w-0 pr-2">
          <span
            className="text-sm font-semibold truncate leading-tight text-stone-900 dark:text-stone-100"
            style={{ fontFamily: resolveFontFamily(currentFont) }}
          >
            {currentFontMeta.name}
          </span>
          <span className="text-[10px] text-stone-400 font-sans truncate">{currentFontMeta.desc}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-stone-400">
          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-300">
            {currentFontMeta.category}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-rose-500' : ''}`} />
        </div>
      </button>

      {/* Popover Dropdown with Real Typography Previews */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 z-50 w-full min-w-[280px] max-w-[340px] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-2.5 animate-in fade-in zoom-in-95 duration-150"
          onMouseLeave={() => {
            onResetPreview?.();
          }}
        >
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm phông chữ cưới..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-rose-500 font-sans"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Action Row: Upload Font File or Scan Local OS Fonts */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => fontFileInputRef.current?.click()}
              disabled={isUploadingFont}
              className="py-1.5 px-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:border-purple-400 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all shadow-2xs hover:bg-purple-100 cursor-pointer"
              title="Tải tệp .ttf, .otf, .woff2 từ máy tính"
            >
              {isUploadingFont ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  <span className="truncate">Đang tải...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 shrink-0" />
                  <span className="truncate">+ Tải tệp font</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleScanLocalFonts}
              disabled={isScanningLocalFonts}
              className="py-1.5 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:border-blue-400 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all shadow-2xs hover:bg-blue-100 cursor-pointer"
              title="Quét toàn bộ phông chữ đã cài trên Windows/Mac (UTM, SVN, VNI...)"
            >
              {isScanningLocalFonts ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  <span className="truncate">Đang quét...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 shrink-0 text-amber-500" />
                  <span className="truncate">{localFontsCount ? `Đã có ${localFontsCount} font` : 'Quét font máy'}</span>
                </>
              )}
            </button>
            <input
              type="file"
              ref={fontFileInputRef}
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleUploadLocalFont}
              className="hidden"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 pb-2 mb-2 border-b border-stone-100 dark:border-stone-800 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'script', label: 'Viết tay (Script)' },
              { id: 'serif', label: 'Có chân (Serif)' },
              { id: 'sans', label: 'Hiện đại' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'all' | 'script' | 'serif' | 'sans')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Font List with Each Font Rendered in Its True Typeface */}
          <div className="max-h-[320px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredFonts.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                Không tìm thấy phông chữ phù hợp
              </div>
            ) : (
              filteredFonts.map((font) => {
                const fontValue = font.name === 'Mặc định (Sans)' ? 'sans-serif' : font.name;
                const isSelected =
                  currentFont === fontValue ||
                  resolveFontFamily(currentFont) === resolveFontFamily(fontValue);

                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleSelectFont(font)}
                    onMouseEnter={() => handleHoverFont(font)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 font-bold shadow-2xs'
                        : 'border-transparent hover:border-stone-200 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/70'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      {/* Font Name */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-sans font-medium text-stone-500 dark:text-stone-400">
                          {font.name}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider px-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-400">
                          {font.category}
                        </span>
                      </div>

                      {/* Visual Sample Text in THAT EXACT FONT */}
                      <span
                        className="block text-xl leading-snug truncate"
                        style={{ fontFamily: font.family }}
                      >
                        Save the Date • Thư Mời
                      </span>

                      {/* Font Description */}
                      <span className="text-[9px] text-stone-400 font-sans block leading-tight">
                        {font.desc}
                      </span>
                    </div>

                    {/* Active Checkmark */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Helper Text */}
          <div className="pt-2 mt-1 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Rê chuột để xem trước trực tiếp trên thiệp</span>
          </div>
        </div>
      )}
    </div>
  );
}
