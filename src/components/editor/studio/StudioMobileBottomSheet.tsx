'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Type,
  Image as ImageIcon,
  Palette,
  Calendar,
  Square,
  Sparkles,
  UploadCloud,
  Layers,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Sliders,
  Play,
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import { STUDIO_FONTS, resolveFontFamily } from '@/lib/studioFonts';
import { GRAPHICS_CATALOG } from '@/data/graphicsCatalog';
import StudioPreviewModal from './StudioPreviewModal';
import {
  CalendarWidgetIcon,
  CountdownWidgetIcon,
  MapWidgetIcon,
  ReminderWidgetIcon,
  CallWidgetIcon,
  RsvpWidgetIcon,
  GiftboxWidgetIcon,
} from './StudioWidgetIcons';

export default function StudioMobileBottomSheet() {
  const {
    elements,
    selectedId,
    activeMobileSheet,
    setActiveMobileSheet,
    updateElement,
    removeElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    addElement,
    canvas,
    setCanvasBackground,
    setFallingEffect,
    triggerPreviewAnim,
  } = useStudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedEl = elements.find((e) => e.id === selectedId);

  // Sub tab for the 'add' drawer: 'text' | 'image' | 'graphic' | 'widget' | 'shape'
  const [addCategory, setAddCategory] = useState<'text' | 'image' | 'graphic' | 'widget' | 'shape'>('text');

  // Map sheet aliases to categories
  React.useEffect(() => {
    if (activeMobileSheet === 'add-text') setAddCategory('text');
    if (activeMobileSheet === 'add-graphic') setAddCategory('graphic');
    if (activeMobileSheet === 'add-widget') setAddCategory('widget');
  }, [activeMobileSheet]);

  const isAddSheet =
    activeMobileSheet === 'add' ||
    activeMobileSheet === 'add-text' ||
    activeMobileSheet === 'add-graphic' ||
    activeMobileSheet === 'add-widget';

  if (!activeMobileSheet) return null;

  // Helper to place newly inserted elements in the user's visible viewport
  const getSmartInsertY = (elemHeight: number = 150) => {
    const canvasNode = document.getElementById('studio-main-canvas');
    const scrollContainer = canvasNode?.parentElement?.parentElement;
    if (scrollContainer && scrollContainer.scrollTop > 50) {
      return Math.round(scrollContainer.scrollTop + 140);
    }
    const maxY = elements.reduce((max, e) => Math.max(max, e.y + e.height), 0);
    return maxY > 0 ? maxY + 30 : 350;
  };

  const close = () => setActiveMobileSheet(null);

  const WEDDING_COLORS = [
    '#8C7355', '#63554D', '#B26B27', '#E4D1B9', '#FAF7F2', '#FFFFFF',
    '#BE185D', '#E11D48', '#FB7185', '#9F1239', '#881337', '#F43F5E',
    '#1E293B', '#334155', '#64748B', '#0F172A', '#000000', '#F59E0B',
    '#D97706', '#059669', '#10B981', '#047857', '#0284C7', '#4F46E5',
  ];

  const BACKGROUND_COLORS = [
    '#FAF7F2', '#FDFBF7', '#F5EFE6', '#EADBCE', '#E8DFD8', '#FFFFFF',
    '#FFF1F2', '#FEE2E2', '#FEF2F2', '#FFF7ED', '#FEFCE8', '#F0FDF4',
    '#F8FAFC', '#F1F5F9', '#E2E8F0', '#1C1917', '#18181B', '#0F172A',
  ];

  const FALLING_EFFECT_OPTIONS: { id: any; name: string; icon: string }[] = [
    { id: 'snow', name: 'Tuyết', icon: '❄️' },
    { id: 'hearts', name: 'Trái tim', icon: '❤️' },
    { id: 'petals', name: 'Hoa đào', icon: '🌸' },
    { id: 'stars', name: 'Sao vàng', icon: '⭐' },
    { id: 'confetti', name: 'Pháo giấy', icon: '🎉' },
    { id: 'butterfly', name: 'Bướm', icon: '🦋' },
    { id: 'heart-snow', name: 'Tim và tuyết', icon: '💖❄️' },
  ];

  // All template image elements on the canvas
  const imageElements = elements.filter((el) => el.type === 'image' && el.src);

  if (activeMobileSheet === 'preview') {
    return <StudioPreviewModal isOpen={true} onClose={() => setActiveMobileSheet(null)} />;
  }

  return (
    <AnimatePresence>
      <div className="md:hidden fixed inset-0 z-50 pointer-events-none flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs pointer-events-auto"
        />

        {/* Sheet Content Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative pointer-events-auto w-full bg-white dark:bg-stone-900 rounded-t-3xl shadow-2xl border-t border-stone-200 dark:border-stone-800 flex flex-col max-h-[75vh] overflow-hidden safe-area-bottom select-none"
        >
          {/* Grab Bar */}
          <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto my-2.5 shrink-0" />

          {/* Sheet Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white capitalize">
              {activeMobileSheet === 'edit-text' && 'Chỉnh sửa nội dung chữ'}
              {activeMobileSheet === 'font' && 'Chọn phông chữ đám cưới'}
              {activeMobileSheet === 'fontSize' && 'Cỡ chữ & Kiểu dáng'}
              {activeMobileSheet === 'color' && 'Bảng màu sắc'}
              {activeMobileSheet === 'photos' && 'Thay ảnh thiệp cưới'}
              {activeMobileSheet === 'widgetConfig' && `Cài đặt tiện ích: ${selectedEl?.widgetType || ''}`}
              {activeMobileSheet === 'filter' && 'Bộ lọc màu & Ánh sáng'}
              {activeMobileSheet === 'effects' && 'Hiệu ứng rơi trên thiệp'}
              {activeMobileSheet === 'background' && 'Chọn màu nền thiệp'}
              {activeMobileSheet === 'layers' && 'Sắp xếp thứ tự lớp'}
              {activeMobileSheet === 'anim' && 'Hiệu ứng chuyển động'}
              {isAddSheet && 'Thêm phần tử vào thiệp'}
            </h3>
            <button
              onClick={close}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sheet Body with Scroll */}
          <div className="p-4 overflow-y-auto max-h-[65vh] space-y-4 text-xs text-stone-800 dark:text-stone-200">
            {/* =========================================================================
                1. EDIT TEXT SHEET
            ========================================================================= */}
            {activeMobileSheet === 'edit-text' && selectedEl && selectedEl.type === 'text' && (
              <div className="space-y-3">
                <textarea
                  autoFocus
                  rows={4}
                  value={selectedEl.text || ''}
                  onChange={(e) => updateElement(selectedEl.id, { text: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-rose-500 font-sans"
                  placeholder="Nhập nội dung chữ..."
                />

                {/* Quick Wedding Text Snippets */}
                <div>
                  <span className="text-[10px] text-stone-400 block mb-1.5 uppercase font-medium">Gợi ý câu chữ</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Save The Date', 'Trân Trọng Kính Mời', 'Lễ Thành Hôn', 'Vu Quy', 'Happy Wedding', 'Together Forever'].map(
                      (snippet) => (
                        <button
                          key={snippet}
                          onClick={() => updateElement(selectedEl.id, { text: snippet }, true)}
                          className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 text-[11px] font-medium"
                        >
                          {snippet}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <button
                  onClick={close}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-transform"
                >
                  Xong &amp; Lưu thay đổi
                </button>
              </div>
            )}

            {/* =========================================================================
                2. FONT PICKER SHEET
            ========================================================================= */}
            {activeMobileSheet === 'font' && selectedEl && selectedEl.type === 'text' && (
              <div className="space-y-1.5">
                {STUDIO_FONTS.map((font) => {
                  const fontVal = font.name === 'Mặc định (Sans)' ? 'sans-serif' : font.name;
                  const isSelected = (selectedEl.fontFamily || 'sans-serif') === fontVal;
                  return (
                    <button
                      key={font.id}
                      onClick={() => updateElement(selectedEl.id, { fontFamily: fontVal }, true)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-sans font-medium text-stone-500">{font.name}</span>
                          <span className="text-[9px] uppercase tracking-wider px-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-400">
                            {font.category}
                          </span>
                        </div>
                        <span className="block text-xl leading-snug truncate" style={{ fontFamily: font.family }}>
                          Save the Date • Thư Mời
                        </span>
                        <span className="text-[10px] text-stone-400 font-sans block">{font.desc}</span>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* =========================================================================
                3. FONT SIZE & CURVED TEXT SHEET
            ========================================================================= */}
            {activeMobileSheet === 'fontSize' && selectedEl && selectedEl.type === 'text' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-600 dark:text-stone-300">Cỡ chữ</span>
                    <span className="font-mono font-bold text-sm text-rose-600">{selectedEl.fontSize || 16}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="140"
                    value={selectedEl.fontSize || 16}
                    onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                    onBlur={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) }, true)}
                    className="w-full accent-rose-500 h-2 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between gap-1 pt-1">
                    {[16, 22, 32, 48, 64, 90].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => updateElement(selectedEl.id, { fontSize: sz }, true)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-mono border ${
                          selectedEl.fontSize === sz ? 'bg-rose-500 text-white border-rose-500' : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Curved Text Toggle */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-700 dark:text-stone-300">Uốn cong chữ (Curved Text)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEl.isCurved || false}
                        onChange={(e) => updateElement(selectedEl.id, { isCurved: e.target.checked, curvature: 40 }, true)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  </div>

                  {selectedEl.isCurved && (
                    <div className="space-y-1 bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl">
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>Độ cong</span>
                        <span className="font-mono">{selectedEl.curvature ?? 40}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="5"
                        value={selectedEl.curvature ?? 40}
                        onChange={(e) => updateElement(selectedEl.id, { curvature: Number(e.target.value) }, true)}
                        className="w-full accent-rose-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                4. COLOR PICKER SHEET
            ========================================================================= */}
            {activeMobileSheet === 'color' && selectedEl && (
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Bảng màu tiêu chuẩn</span>
                <div className="grid grid-cols-6 gap-2.5">
                  {WEDDING_COLORS.map((hex) => {
                    const isCurrent = (selectedEl.type === 'text' ? selectedEl.color : selectedEl.fillColor) === hex;
                    return (
                      <button
                        key={hex}
                        onClick={() => {
                          if (selectedEl.type === 'text') {
                            updateElement(selectedEl.id, { color: hex }, true);
                          } else {
                            updateElement(selectedEl.id, { fillColor: hex }, true);
                          }
                        }}
                        className={`aspect-square rounded-2xl border-2 transition-transform active:scale-90 flex items-center justify-center shadow-xs ${
                          isCurrent ? 'border-rose-500 scale-110 shadow-md ring-2 ring-rose-300' : 'border-stone-200 dark:border-stone-700'
                        }`}
                        style={{ backgroundColor: hex }}
                      >
                        {isCurrent && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <span className="font-medium text-stone-600 dark:text-stone-300">Tùy chọn màu tự do</span>
                  <input
                    type="color"
                    value={selectedEl.type === 'text' ? selectedEl.color || '#000000' : selectedEl.fillColor || '#FAF7F2'}
                    onChange={(e) => {
                      if (selectedEl.type === 'text') {
                        updateElement(selectedEl.id, { color: e.target.value }, true);
                      } else {
                        updateElement(selectedEl.id, { fillColor: e.target.value }, true);
                      }
                    }}
                    className="w-9 h-9 rounded-xl border border-stone-300 cursor-pointer overflow-hidden"
                  />
                </div>
              </div>
            )}

            {/* =========================================================================
                5. QUICK PHOTO SWAP & UPLOAD SHEET
            ========================================================================= */}
            {activeMobileSheet === 'photos' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result as string;
                      if (selectedEl && selectedEl.type === 'image') {
                        updateElement(selectedEl.id, { src: dataUrl }, true);
                      } else {
                        addElement({
                          type: 'image',
                          x: 40,
                          y: getSmartInsertY(480),
                          width: 420,
                          height: 480,
                          rotation: 0,
                          opacity: 1,
                          src: dataUrl,
                          borderRadius: 20,
                          objectFit: 'cover',
                        });
                      }
                      close();
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />

                {/* Camera / Library Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Chụp ảnh / Tải từ điện thoại</span>
                </button>

                {/* Existing Card Photos Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    {selectedEl && selectedEl.type === 'image' ? 'Chạm vào ảnh để thay thế ảnh đang chọn' : 'Ảnh mẫu thiệp (Bấm để thêm)'}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {imageElements.map((imgEl, idx) => (
                      <button
                        key={imgEl.id}
                        onClick={() => {
                          if (selectedEl && selectedEl.type === 'image') {
                            updateElement(selectedEl.id, { src: imgEl.src }, true);
                          } else {
                            addElement({
                              type: 'image',
                              x: 40,
                              y: getSmartInsertY(480),
                              width: 420,
                              height: 480,
                              rotation: 0,
                              opacity: 1,
                              src: imgEl.src,
                              borderRadius: 20,
                              objectFit: 'cover',
                            });
                          }
                          close();
                        }}
                        className="aspect-square rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 relative group active:scale-95 transition-transform shadow-2xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgEl.src} alt={`img-${idx}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                6. WIDGET CONFIG SHEET
            ========================================================================= */}
            {activeMobileSheet === 'widgetConfig' && selectedEl && selectedEl.type === 'widget' && (
              <div className="space-y-3">
                {selectedEl.widgetType === 'countdown' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-stone-500 block">Câu đề tựa đếm ngược</label>
                    <input
                      type="text"
                      value={selectedEl.widgetConfig?.quote || 'Cùng đếm ngược đến khoảnh khắc trọng đại của chúng mình'}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          widgetConfig: { ...selectedEl.widgetConfig, quote: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedEl.id,
                          { widgetConfig: { ...selectedEl.widgetConfig, quote: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>
                )}

                {selectedEl.widgetType === 'calendar' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-500 block mb-1">Tháng / Năm</label>
                      <input
                        type="text"
                        value={selectedEl.widgetConfig?.monthYear || 'Tháng 12 / 2026'}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            widgetConfig: { ...selectedEl.widgetConfig, monthYear: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-500 block mb-1">Ngày cưới (1 - 31)</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={selectedEl.widgetConfig?.selectedDay ?? 28}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            widgetConfig: { ...selectedEl.widgetConfig, selectedDay: Number(e.target.value) },
                          }, true)
                        }
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedEl.widgetType === 'rsvp' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-500 block mb-1">Tiêu đề xác nhận</label>
                      <input
                        type="text"
                        value={selectedEl.widgetConfig?.title || 'Xác Nhận Tham Dự Tiệc Cưới'}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            widgetConfig: { ...selectedEl.widgetConfig, title: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-500 block mb-1">Mô tả phụ</label>
                      <input
                        type="text"
                        value={selectedEl.widgetConfig?.subtitle || 'Để gia đình chuẩn bị đón tiếp quý khách chu đáo nhất'}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            widgetConfig: { ...selectedEl.widgetConfig, subtitle: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedEl.widgetType === 'giftbox' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-500 block mb-1">Ngân hàng</label>
                      <input
                        type="text"
                        value={selectedEl.widgetConfig?.bankName || 'Ngân hàng Quân Đội (MB Bank)'}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            widgetConfig: { ...selectedEl.widgetConfig, bankName: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 rounded-xl p-2.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-500 block mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        value={selectedEl.widgetConfig?.accountNumber || '1903678888'}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            widgetConfig: { ...selectedEl.widgetConfig, accountNumber: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 rounded-xl p-2.5 text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-500 block mb-1">Chủ tài khoản</label>
                      <input
                        type="text"
                        value={selectedEl.widgetConfig?.accountHolder || 'NGUYEN VAN A'}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            widgetConfig: { ...selectedEl.widgetConfig, accountHolder: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 rounded-xl p-2.5 text-xs uppercase outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={close}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-transform"
                >
                  Xong
                </button>
              </div>
            )}

            {/* =========================================================================
                7. FALLING EFFECTS SHEET
            ========================================================================= */}
            {activeMobileSheet === 'effects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <span className="font-semibold text-sm">Hiện hiệu ứng trên thiệp</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canvas.fallingEffect?.enabled || false}
                      onChange={(e) =>
                        setFallingEffect({
                          enabled: e.target.checked,
                          type: canvas.fallingEffect?.type || 'snow',
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FALLING_EFFECT_OPTIONS.map((opt) => {
                    const isSelected = canvas.fallingEffect?.type === opt.id && !!canvas.fallingEffect?.enabled;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setFallingEffect({ enabled: true, type: opt.id })}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 shadow-xs'
                            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{opt.icon}</span>
                        <span className="text-xs font-semibold">{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                8. BACKGROUND SHEET
            ========================================================================= */}
            {activeMobileSheet === 'background' && (
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Màu nền thiệp cưới
                </span>
                <div className="grid grid-cols-6 gap-2.5">
                  {BACKGROUND_COLORS.map((hex) => {
                    const isCurrent = canvas.background === hex;
                    return (
                      <button
                        key={hex}
                        onClick={() => setCanvasBackground(hex)}
                        className={`aspect-square rounded-2xl border-2 transition-transform active:scale-90 flex items-center justify-center shadow-xs ${
                          isCurrent ? 'border-rose-500 scale-110 shadow-md ring-2 ring-rose-300' : 'border-stone-200 dark:border-stone-700'
                        }`}
                        style={{ backgroundColor: hex }}
                      >
                        {isCurrent && <Check className="w-3.5 h-3.5 text-stone-800 drop-shadow-md" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                9. LAYERS SHEET
            ========================================================================= */}
            {activeMobileSheet === 'layers' && selectedEl && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    bringToFront(selectedEl.id);
                    close();
                  }}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 border border-stone-200 dark:border-stone-700 flex items-center gap-3 text-left font-medium"
                >
                  <ArrowUp className="w-4 h-4 text-stone-600" />
                  <span>Đưa lên trên cùng (Front)</span>
                </button>

                <button
                  onClick={() => {
                    sendToBack(selectedEl.id);
                    close();
                  }}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 border border-stone-200 dark:border-stone-700 flex items-center gap-3 text-left font-medium"
                >
                  <ArrowDown className="w-4 h-4 text-stone-600" />
                  <span>Đưa xuống dưới cùng (Back)</span>
                </button>

                <button
                  onClick={() => {
                    duplicateElement(selectedEl.id);
                    close();
                  }}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 border border-stone-200 dark:border-stone-700 flex items-center gap-3 text-left font-medium"
                >
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>Nhân bản phần tử (Duplicate)</span>
                </button>

                <button
                  onClick={() => {
                    removeElement(selectedEl.id);
                    close();
                  }}
                  className="w-full p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 flex items-center gap-3 text-left font-bold"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Xóa phần tử khỏi thiệp</span>
                </button>
              </div>
            )}

            {/* =========================================================================
                9B. ELEMENT ANIMATION SHEET
            ========================================================================= */}
            {activeMobileSheet === 'anim' && selectedEl && (
              <div className="space-y-4">
                {/* 1. Entrance Animation */}
                <div className="space-y-2 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <span className="font-bold text-xs text-stone-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hiệu ứng xuất hiện (Entrance)</span>
                  </span>

                  <select
                    value={selectedEl.animation?.type || 'none'}
                    onChange={(e) => {
                      updateElement(
                        selectedEl.id,
                        {
                          animation: {
                            type: e.target.value as any,
                            duration: selectedEl.animation?.duration || 1.0,
                            delay: selectedEl.animation?.delay || 0.0,
                          },
                        },
                        true
                      );
                      triggerPreviewAnim();
                    }}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs font-medium"
                  >
                    <option value="none">Không có</option>
                    <option value="slide-up">Trượt lên (Slide Up)</option>
                    <option value="slide-down">Trượt xuống (Slide Down)</option>
                    <option value="slide-left">Trượt từ phải sang (Slide Left)</option>
                    <option value="slide-right">Trượt từ trái sang (Slide Right)</option>
                    <option value="zoom-in">Phóng to (Zoom In)</option>
                    <option value="zoom-out">Thu nhỏ dần (Zoom Out)</option>
                    <option value="fade-in">Mờ dần (Fade In)</option>
                    <option value="rotate-in">Xoay vào (Rotate In)</option>
                    <option value="bounce-in">Nảy vào (Bounce In)</option>
                  </select>

                  {selectedEl.animation?.type && selectedEl.animation.type !== 'none' && (
                    <button
                      onClick={() => triggerPreviewAnim()}
                      className="w-full py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      <span>Phát thử hiệu ứng xuất hiện</span>
                    </button>
                  )}
                </div>

                {/* 2. Continuous Animation */}
                <div className="space-y-2 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <span className="font-bold text-xs text-stone-900 dark:text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-500" />
                    <span>Chuyển động liên tục (Continuous)</span>
                  </span>

                  <select
                    value={selectedEl.continuousAnimation?.type || 'none'}
                    onChange={(e) =>
                      updateElement(
                        selectedEl.id,
                        {
                          continuousAnimation: {
                            type: e.target.value as any,
                            duration: selectedEl.continuousAnimation?.duration || 2.0,
                            delay: selectedEl.continuousAnimation?.delay || 0.0,
                          },
                        },
                        true
                      )
                    }
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs font-medium"
                  >
                    <option value="none">Không có</option>
                    <option value="floating">Bồng bềnh lơ lửng (Floating)</option>
                    <option value="heartbeat">Nhịp tim đập (Heartbeat)</option>
                    <option value="wobble">Đung đưa nhẹ (Wobble)</option>
                  </select>
                </div>
              </div>
            )}

            {/* =========================================================================
                10. ADD ELEMENT SHEET (+)
            ========================================================================= */}
            {isAddSheet && (
              <div className="space-y-4">
                {/* Horizontal Category Nav */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'text', label: 'Văn bản', icon: <Type className="w-3.5 h-3.5" /> },
                    { id: 'image', label: 'Hình ảnh', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                    { id: 'graphic', label: 'Đồ họa', icon: <Palette className="w-3.5 h-3.5" /> },
                    { id: 'widget', label: 'Tiện ích', icon: <Calendar className="w-3.5 h-3.5" /> },
                    { id: 'shape', label: 'Hình dạng', icon: <Square className="w-3.5 h-3.5" /> },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setAddCategory(cat.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        addCategory === cat.id
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab: Text */}
                {addCategory === 'text' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        addElement({
                          type: 'text',
                          x: 40,
                          y: getSmartInsertY(80),
                          width: 420,
                          height: 80,
                          rotation: 0,
                          opacity: 1,
                          text: 'Thêm Tiêu Đề Lớn',
                          fontFamily: 'Pinyon Script',
                          fontSize: 64,
                          color: '#8C7355',
                          textAlign: 'center',
                        });
                        close();
                      }}
                      className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 text-left hover:border-rose-400"
                    >
                      <span className="font-serif text-xl block text-stone-900 dark:text-white">Thêm Tiêu Đề Lớn</span>
                      <span className="text-[10px] text-stone-400">Pinyon Script • Cỡ 64px</span>
                    </button>

                    <button
                      onClick={() => {
                        addElement({
                          type: 'text',
                          x: 40,
                          y: getSmartInsertY(40),
                          width: 420,
                          height: 40,
                          rotation: 0,
                          opacity: 1,
                          text: 'Hoàng Long & Mai Chi',
                          fontFamily: 'Playfair Display',
                          fontSize: 22,
                          color: '#63554D',
                          textAlign: 'center',
                          letterSpacing: 2,
                        });
                        close();
                      }}
                      className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 text-left hover:border-rose-400"
                    >
                      <span className="font-serif text-base block text-stone-900 dark:text-white">Tên Cô Dâu Chú Rể</span>
                      <span className="text-[10px] text-stone-400">Playfair Display • Cỡ 22px</span>
                    </button>

                    <button
                      onClick={() => {
                        addElement({
                          type: 'text',
                          x: 40,
                          y: getSmartInsertY(60),
                          width: 420,
                          height: 60,
                          rotation: 0,
                          opacity: 1,
                          text: 'Trân trọng kính mời quý khách tới tham dự buổi tiệc thành hôn chung vui cùng gia đình chúng tôi',
                          fontFamily: 'sans-serif',
                          fontSize: 14,
                          color: '#555555',
                          textAlign: 'center',
                          lineHeight: 1.4,
                        });
                        close();
                      }}
                      className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 text-left hover:border-rose-400"
                    >
                      <span className="text-xs block text-stone-900 dark:text-white">Đoạn văn bản lời mời cưới</span>
                      <span className="text-[10px] text-stone-400">Sans-serif • Cỡ 14px</span>
                    </button>
                  </div>
                )}

                {/* Tab: Graphic */}
                {addCategory === 'graphic' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto p-1">
                      {GRAPHICS_CATALOG.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            addElement({
                              type: 'graphic',
                              x: 180,
                              y: getSmartInsertY(item.defaultHeight || 100),
                              width: item.defaultWidth || 100,
                              height: item.defaultHeight || 100,
                              rotation: 0,
                              opacity: 1,
                              src: item.src,
                              objectFit: 'contain',
                            });
                            close();
                          }}
                          className="aspect-square p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center hover:border-rose-400 active:scale-95 transition-all shadow-2xs"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.src} alt={item.name} className="w-12 h-12 object-contain mb-1" />
                          <span className="text-[10px] text-stone-600 dark:text-stone-300 truncate w-full text-center">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Widget */}
                {addCategory === 'widget' && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'countdown', title: 'Đếm ngược', iconNode: <CountdownWidgetIcon />, height: 120 },
                      { type: 'calendar', title: 'Lịch cưới', iconNode: <CalendarWidgetIcon />, height: 330 },
                      { type: 'rsvp', title: 'Form RSVP', iconNode: <RsvpWidgetIcon />, height: 340 },
                      { type: 'map', title: 'Bản đồ', iconNode: <MapWidgetIcon />, height: 250 },
                      { type: 'giftbox', title: 'QR mừng cưới', iconNode: <GiftboxWidgetIcon />, height: 280 },
                      { type: 'call', title: 'Nút gọi', iconNode: <CallWidgetIcon />, height: 70 },
                      { type: 'reminder', title: 'Lời nhắc', iconNode: <ReminderWidgetIcon />, height: 70 },
                    ].map((w, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          addElement({
                            type: 'widget',
                            widgetType: w.type as any,
                            x: 40,
                            y: getSmartInsertY(w.height),
                            width: 420,
                            height: w.height,
                            rotation: 0,
                            opacity: 1,
                          });
                          close();
                        }}
                        className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center active:scale-95"
                      >
                        <div className="h-8 flex items-center justify-center mb-1">{w.iconNode}</div>
                        <span className="font-semibold text-xs">{w.title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab: Shape */}
                {addCategory === 'shape' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        addElement({
                          type: 'shape',
                          shapeType: 'line',
                          x: 50,
                          y: getSmartInsertY(2),
                          width: 400,
                          height: 2,
                          rotation: 0,
                          opacity: 1,
                          fillColor: '#8C7355',
                        });
                        close();
                      }}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center font-medium"
                    >
                      Đường kẻ ngang
                    </button>
                    <button
                      onClick={() => {
                        addElement({
                          type: 'shape',
                          shapeType: 'rectangle',
                          x: 50,
                          y: getSmartInsertY(160),
                          width: 400,
                          height: 160,
                          rotation: 0,
                          opacity: 1,
                          fillColor: '#FAF7F2',
                          borderRadius: 16,
                          borderColor: '#EADBCE',
                          borderWidth: 1,
                        });
                        close();
                      }}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center font-medium"
                    >
                      Khung viền thiệp
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
