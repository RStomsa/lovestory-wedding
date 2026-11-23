'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Type, Palette } from 'lucide-react';
import { useStudioStore } from './studioStore';
import { STUDIO_FONTS, resolveFontFamily } from '@/lib/studioFonts';

export default function StudioMobileTextModal() {
  const {
    textEditModalElementId,
    setTextEditModalElementId,
    elements,
    updateElement,
  } = useStudioStore();

  const element = elements.find((e) => e.id === textEditModalElementId && e.type === 'text');

  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Playfair Display');
  const [fontSize, setFontSize] = useState(18);
  const [color, setColor] = useState('#8C7355');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (element) {
      setText(element.text || '');
      setFontFamily(element.fontFamily || 'Playfair Display');
      setFontSize(element.fontSize || 18);
      setColor(element.color || '#8C7355');
    }
  }, [element]);

  if (!element || !textEditModalElementId) return null;

  const handleSave = () => {
    updateElement(element.id, {
      text,
      fontFamily,
      fontSize,
      color,
    }, true);
    setTextEditModalElementId(null);
  };

  const PRESET_COLORS = [
    '#8C7355', '#B26B27', '#E8D29B', '#1E293B', '#000000', '#FFFFFF',
    '#BE185D', '#E11D48', '#9F1239', '#881337', '#059669', '#0284C7',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
        onClick={() => setTextEditModalElementId(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 z-10 animate-in zoom-in-95 duration-150 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">
              Sửa nội dung chữ
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Gõ lại nội dung hiển thị trực tiếp trên thiệp cưới
            </p>
          </div>
          <button
            onClick={() => setTextEditModalElementId(null)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Input / Textarea */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
            Nội dung hiển thị
          </label>
          <textarea
            autoFocus
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-rose-500 font-sans"
            style={{
              fontFamily: resolveFontFamily(fontFamily),
              color: color,
            }}
            placeholder="Nhập nội dung chữ..."
          />
        </div>

        {/* Quick Style Adjustments */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Font Selector */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Phông chữ
            </span>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500 truncate"
            >
              {STUDIO_FONTS.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Stepper */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Cỡ chữ
            </span>
            <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-1">
              <button
                onClick={() => setFontSize((s) => Math.max(10, s - 2))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95"
              >
                -
              </button>
              <span className="text-xs font-mono font-semibold">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(120, s + 2))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Color Palette (Matches Screenshot 2 & 7) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Màu chữ
            </span>
            <span className="text-[10px] font-mono font-semibold text-stone-600 dark:text-stone-300">
              {color}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full shrink-0 border transition-transform ${
                  color === c ? 'scale-110 ring-2 ring-rose-500 border-white' : 'border-stone-300 hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Actions (Matches Screenshot 7) */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setTextEditModalElementId(null)}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Lưu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
