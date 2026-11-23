'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, Clock, Palette, Sparkles, Pipette } from 'lucide-react';
import { CanvasElement } from './studioTypes';

export interface StudioColorPaletteProps {
  currentColor: string;
  onChange: (hex: string) => void;
  elements?: CanvasElement[];
  canvasBackground?: string;
  label?: string;
}

const RECENT_COLORS_KEY = 'lovestory_recent_colors';
const MAX_RECENT = 14;

// Bảng màu chuẩn phối đám cưới LoveStory
const WEDDING_THEME_PALETTES = [
  { name: 'Đỏ rượu Burgundy', colors: ['#7B1113', '#8B1E2D', '#A52A2A', '#590D22'] },
  { name: 'Vàng Gold Hoàng Gia', colors: ['#D4AF37', '#C5A059', '#E8D29B', '#B8860B'] },
  { name: 'Kem & Be Tinh Khôi', colors: ['#FAF7F2', '#F5EFEB', '#EFE8DE', '#FFFFFF'] },
  { name: 'Hồng Pastel Ngọt Ngào', colors: ['#F7CAD0', '#FFB3BA', '#DE6B88', '#B74462'] },
  { name: 'Xanh Rêu & Mộc', colors: ['#2C3E2D', '#4A5D4E', '#1B3B2B', '#859B88'] },
  { name: 'Đen Trầm & Xám Khói', colors: ['#000000', '#1C1917', '#44403C', '#78716C'] },
];

function normalizeHex(c?: string | null): string | null {
  if (!c || typeof c !== 'string') return null;
  const s = c.trim().toLowerCase();
  if (s === 'transparent' || s === 'none' || s === 'inherit') return null;
  if (s.startsWith('#')) {
    if (s.length === 4) {
      // #abc -> #aabbcc
      return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`.toUpperCase();
    }
    if (s.length >= 7) {
      return s.slice(0, 7).toUpperCase();
    }
  }
  return null;
}

export default function StudioColorPalette({
  currentColor,
  onChange,
  elements = [],
  canvasBackground,
  label = 'Màu sắc',
}: StudioColorPaletteProps) {
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const activeNormalized = normalizeHex(currentColor) || '#000000';

  // Load recent colors from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_COLORS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentColors(parsed.slice(0, MAX_RECENT));
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveRecentColor = useCallback((hex: string) => {
    const norm = normalizeHex(hex);
    if (!norm) return;
    setRecentColors((prev) => {
      const next = [norm, ...prev.filter((c) => c !== norm)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleSelectColor = (hex: string) => {
    onChange(hex);
    saveRecentColor(hex);
  };

  // 1. Trích xuất tất cả màu đang có trên thiết kế (Document Colors)
  const documentColors = useMemo(() => {
    const colorSet = new Set<string>();

    // Nền canvas
    const bg = normalizeHex(canvasBackground);
    if (bg) colorSet.add(bg);

    // Thu thập từ elements
    elements.forEach((el) => {
      if (el.color) {
        const c = normalizeHex(el.color);
        if (c) colorSet.add(c);
      }
      if (el.fillColor) {
        const c = normalizeHex(el.fillColor);
        if (c) colorSet.add(c);
      }
      if (el.borderColor) {
        const c = normalizeHex(el.borderColor);
        if (c) colorSet.add(c);
      }
    });

    return Array.from(colorSet);
  }, [elements, canvasBackground]);

  return (
    <div className="space-y-3 p-3 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-700/80 shadow-2xs">
      {/* Header with Custom Hex & Native Color Picker */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-rose-500" />
          <span>{label}</span>
        </span>

        <div className="flex items-center gap-2">
          {/* Native Color Picker Circle */}
          <label
            className="w-7 h-7 rounded-lg border-2 border-stone-300 dark:border-stone-600 shadow-xs cursor-pointer relative overflow-hidden flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
            style={{ backgroundColor: activeNormalized }}
            title="Mở bảng chọn màu tự do"
          >
            <input
              type="color"
              value={activeNormalized}
              onChange={(e) => handleSelectColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>

          {/* Hex display & input */}
          <input
            type="text"
            value={activeNormalized}
            maxLength={7}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('#') && val.length <= 7) {
                onChange(val);
                if (val.length === 7) saveRecentColor(val);
              }
            }}
            className="w-20 px-2 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-xs text-center font-bold text-stone-800 dark:text-stone-200 outline-none uppercase focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* 1. MÀU TRÊN THIẾT KẾ (DOCUMENT COLORS - 1 CLICK ĐỒNG BỘ MÀU) */}
      <div className="space-y-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Màu trên thiệp ({documentColors.length} màu)</span>
          </span>
          <span className="text-[9px] text-stone-400">Chạm để đồng bộ</span>
        </div>

        {documentColors.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {documentColors.map((hex) => {
              const isSelected = activeNormalized === hex;
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => handleSelectColor(hex)}
                  title={`Đồng bộ màu: ${hex}`}
                  className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center relative hover:scale-110 active:scale-95 ${
                    isSelected
                      ? 'ring-2 ring-rose-500 ring-offset-1 border-white dark:border-stone-900 z-10 shadow-sm scale-105'
                      : 'border-stone-300 dark:border-stone-600 hover:border-rose-400 shadow-2xs'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 drop-shadow-sm ${
                        hex === '#FFFFFF' || hex === '#FAF7F2' || hex === '#FFF' ? 'text-stone-900' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-stone-400 italic">Chưa có màu nào trên các phần tử.</p>
        )}
      </div>

      {/* 2. MÀU VỪA DÙNG GẦN ĐÂY (RECENT COLORS) */}
      {recentColors.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>Màu vừa dùng gần đây</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setRecentColors([]);
                try {
                  localStorage.removeItem(RECENT_COLORS_KEY);
                } catch {}
              }}
              className="text-[9px] text-stone-400 hover:text-rose-500 transition-colors"
            >
              Xóa
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {recentColors.map((hex) => {
              const isSelected = activeNormalized === hex;
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => handleSelectColor(hex)}
                  title={`Dùng lại màu: ${hex}`}
                  className={`w-6 h-6 rounded-md border transition-all flex items-center justify-center relative hover:scale-110 active:scale-95 ${
                    isSelected
                      ? 'ring-2 ring-rose-500 ring-offset-1 border-white dark:border-stone-900 z-10 shadow-sm scale-105'
                      : 'border-stone-200 dark:border-stone-700 hover:border-blue-400 shadow-2xs'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && (
                    <Check
                      className={`w-3 h-3 drop-shadow-sm ${
                        hex === '#FFFFFF' || hex === '#FAF7F2' || hex === '#FFF' ? 'text-stone-900' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. GỢI Ý BẢNG MÀU CƯỚI CHUẨN LOVESTORY */}
      <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block">
          Bảng màu cưới thịnh hành
        </span>
        <div className="grid grid-cols-6 gap-1.5">
          {WEDDING_THEME_PALETTES.flatMap((p) => p.colors).map((hex, i) => {
            const isSelected = activeNormalized === hex;
            return (
              <button
                key={`${hex}-${i}`}
                type="button"
                onClick={() => handleSelectColor(hex)}
                title={`Màu cưới: ${hex}`}
                className={`w-full aspect-square rounded-md border transition-all flex items-center justify-center relative hover:scale-110 active:scale-95 ${
                  isSelected
                    ? 'ring-2 ring-rose-500 ring-offset-1 border-white z-10 shadow-sm'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                }`}
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-3 h-3 drop-shadow-sm ${
                      hex === '#FFFFFF' || hex === '#FAF7F2' ? 'text-stone-900' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
