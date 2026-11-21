'use client';

import React, { useRef } from 'react';
import {
  Plus,
  Image as ImageIcon,
  Type,
  Palette,
  Calendar,
  Sparkles,
  PaintBucket,
  Edit3,
  Check,
  Copy,
  Trash2,
  Layers,
  Wand2,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  FlipHorizontal,
  FolderOpen,
  Eye,
} from 'lucide-react';
import { useStudioStore } from './studioStore';

export default function StudioMobileBottomBar() {
  const {
    elements,
    selectedId,
    selectElement,
    updateElement,
    duplicateElement,
    removeElement,
    bringToFront,
    sendToBack,
    setActiveMobileSheet,
  } = useStudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedEl = elements.find((e) => e.id === selectedId);

  const handleMobilePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (selectedEl && selectedEl.type === 'image') {
        updateElement(selectedEl.id, { src: dataUrl }, true);
      } else {
        // Add new image to center of canvas
        const canvasNode = document.getElementById('studio-main-canvas');
        const scrollContainer = canvasNode?.parentElement?.parentElement;
        const currentY = scrollContainer?.scrollTop ? Math.round(scrollContainer.scrollTop + 180) : 300;
        useStudioStore.getState().addElement({
          type: 'image',
          x: 40,
          y: currentY,
          width: 420,
          height: 480,
          rotation: 0,
          opacity: 1,
          src: dataUrl,
          borderRadius: 20,
          objectFit: 'cover',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-2xl safe-area-bottom select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMobilePhotoPick}
        accept="image/*"
        className="hidden"
      />

      {/* =========================================================================
          MODE A: NO ELEMENT SELECTED -> GENERAL MOBILE TOOLS (CANVA STYLE)
      ========================================================================= */}
      {!selectedEl ? (
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar">
          {/* Big Add Button */}
          <button
            onClick={() => setActiveMobileSheet('add')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm</span>
          </button>

          {/* Quick Photo Replacement Drawer */}
          <button
            onClick={() => setActiveMobileSheet('photos')}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-200 active:scale-95 transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Đổi ảnh</span>
          </button>

          {/* Add Text */}
          <button
            onClick={() => setActiveMobileSheet('add-text')}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-200 active:scale-95 transition-all"
          >
            <Type className="w-3.5 h-3.5 text-amber-600" />
            <span>Văn bản</span>
          </button>

          {/* Add Graphic */}
          <button
            onClick={() => setActiveMobileSheet('add-graphic')}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-200 active:scale-95 transition-all"
          >
            <Palette className="w-3.5 h-3.5 text-purple-500" />
            <span>Đồ họa</span>
          </button>

          {/* Add Widget */}
          <button
            onClick={() => setActiveMobileSheet('add-widget')}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-200 active:scale-95 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tiện ích</span>
          </button>

          {/* Falling Effects */}
          <button
            onClick={() => setActiveMobileSheet('effects')}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-200 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Hiệu ứng</span>
          </button>

          {/* Background */}
          <button
            onClick={() => setActiveMobileSheet('background')}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-200 active:scale-95 transition-all"
          >
            <PaintBucket className="w-3.5 h-3.5 text-teal-500" />
            <span>Màu nền</span>
          </button>

          {/* Live Guest Preview */}
          <button
            onClick={() => setActiveMobileSheet('preview')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs active:scale-95 transition-all shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-rose-400" />
            <span>Xem trước</span>
          </button>
        </div>
      ) : (
        /* =========================================================================
            MODE B: ELEMENT SELECTED -> CONTEXTUAL MOBILE ACTION STRIP (CANVA STYLE)
        ========================================================================= */
        <div className="flex items-center justify-between px-2 py-1.5 gap-2">
          {/* Scrollable Action Buttons */}
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* 1. TEXT ACTIONS */}
            {selectedEl.type === 'text' && (
              <>
                <button
                  onClick={() => setActiveMobileSheet('edit-text')}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800 active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa chữ</span>
                </button>

                <button
                  onClick={() => setActiveMobileSheet('font')}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium active:scale-95"
                >
                  <Type className="w-3.5 h-3.5 text-stone-500" />
                  <span className="truncate max-w-[80px]">{selectedEl.fontFamily || 'Phông chữ'}</span>
                </button>

                <button
                  onClick={() => setActiveMobileSheet('fontSize')}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-medium active:scale-95"
                >
                  <span>{selectedEl.fontSize || 16}px</span>
                </button>

                <button
                  onClick={() => setActiveMobileSheet('color')}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium active:scale-95"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                    style={{ backgroundColor: selectedEl.color || '#000' }}
                  />
                  <span>Màu</span>
                </button>

                {/* Alignment cycle */}
                <button
                  onClick={() => {
                    const aligns: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
                    const nextIdx = (aligns.indexOf(selectedEl.textAlign || 'center') + 1) % aligns.length;
                    updateElement(selectedEl.id, { textAlign: aligns[nextIdx] }, true);
                  }}
                  className="flex-shrink-0 p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95"
                  title="Căn lề"
                >
                  {selectedEl.textAlign === 'left' ? (
                    <AlignLeft className="w-3.5 h-3.5" />
                  ) : selectedEl.textAlign === 'right' ? (
                    <AlignRight className="w-3.5 h-3.5" />
                  ) : (
                    <AlignCenter className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Bold toggle */}
                <button
                  onClick={() =>
                    updateElement(
                      selectedEl.id,
                      { fontWeight: selectedEl.fontWeight === 'bold' ? 'normal' : 'bold' },
                      true
                    )
                  }
                  className={`flex-shrink-0 p-2 rounded-xl active:scale-95 ${
                    selectedEl.fontWeight === 'bold'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                  title="In đậm"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* 2. IMAGE ACTIONS */}
            {selectedEl.type === 'image' && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-800 active:scale-95"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Thay ảnh</span>
                </button>

                <button
                  onClick={() => {
                    updateElement(
                      selectedEl.id,
                      { isCutout: !selectedEl.isCutout, borderRadius: 16 },
                      true
                    );
                    alert('✨ Đã áp dụng hiệu ứng tách nền AI!');
                  }}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tách nền</span>
                </button>

                <button
                  onClick={() => setActiveMobileSheet('filter')}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5 text-stone-500" />
                  <span>Bộ lọc</span>
                </button>

                <button
                  onClick={() => {
                    const currentRadius = selectedEl.borderRadius ?? 0;
                    const nextRadius = currentRadius === 0 ? 16 : currentRadius === 16 ? 28 : currentRadius === 28 ? 9999 : 0;
                    updateElement(selectedEl.id, { borderRadius: nextRadius }, true);
                  }}
                  className="flex-shrink-0 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium active:scale-95"
                >
                  <span>Bo góc: {selectedEl.borderRadius ?? 0}</span>
                </button>
              </>
            )}

            {/* 3. WIDGET ACTIONS */}
            {selectedEl.type === 'widget' && (
              <>
                <button
                  onClick={() => setActiveMobileSheet('widgetConfig')}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800 active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Cài đặt {selectedEl.widgetType}</span>
                </button>
              </>
            )}

            {/* 4. GRAPHIC & SHAPE ACTIONS */}
            {(selectedEl.type === 'graphic' || selectedEl.type === 'shape') && (
              <>
                <button
                  onClick={() => setActiveMobileSheet('color')}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium active:scale-95"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                    style={{ backgroundColor: selectedEl.fillColor || '#FAF7F2' }}
                  />
                  <span>Màu nền</span>
                </button>

                <button
                  onClick={() => updateElement(selectedEl.id, { flipX: !selectedEl.flipX }, true)}
                  className="flex-shrink-0 p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95"
                  title="Lật gương ngang"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* COMMON ACTIONS: Anim, Layers, Duplicate, Delete */}
            <button
              onClick={() => setActiveMobileSheet('anim')}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Hiệu ứng</span>
            </button>

            <button
              onClick={() => setActiveMobileSheet('layers')}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium active:scale-95"
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>Lớp</span>
            </button>

            <button
              onClick={() => duplicateElement(selectedEl.id)}
              className="flex-shrink-0 p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 active:scale-95"
              title="Nhân bản"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => removeElement(selectedEl.id)}
              className="flex-shrink-0 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 active:scale-95"
              title="Xóa phần tử"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* DONE BUTTON (Deselects element & returns to scroll mode) */}
          <button
            onClick={() => selectElement(null)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
            title="Hoàn tất và quay lại chế độ cuộn"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Xong</span>
          </button>
        </div>
      )}
    </div>
  );
}
