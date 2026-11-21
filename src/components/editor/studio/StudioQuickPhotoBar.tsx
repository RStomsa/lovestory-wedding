'use client';

import React, { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { useStudioStore } from './studioStore';

export default function StudioQuickPhotoBar() {
  const { elements, selectedId, selectElement, updateElement } = useStudioStore();
  const [isOpen, setIsOpen] = useState(true);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all image elements on the canvas
  const imageElements = elements.filter((el) => el.type === 'image' && el.src);

  const handlePhotoClick = (elId: string) => {
    selectElement(elId);
    // Smooth scroll the canvas to this element
    const node = document.getElementById(`canvas-node-${elId}`);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDoubleClick = (elId: string) => {
    setReplacingId(elId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateElement(replacingId, { src: reader.result as string }, true);
      setReplacingId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (imageElements.length === 0) return null;

  return (
    <div className="w-full z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-xl transition-all flex-shrink-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="px-4 py-1.5 flex items-center justify-between border-b border-stone-100 dark:border-stone-800">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-rose-600 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
          <span>Thay ảnh nhanh</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronUp className="w-3.5 h-3.5 text-stone-400" />}
        </button>

        <span className="text-[11px] font-medium text-stone-400">
          {imageElements.length} ảnh
        </span>
      </div>

      {/* Thumbnail Strip (Screenshots 1, 2, 3, 4) */}
      {isOpen && (
        <div className="p-3 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {imageElements.map((imgEl, idx) => {
            const isSelected = selectedId === imgEl.id;
            return (
              <div
                key={imgEl.id}
                onClick={() => handlePhotoClick(imgEl.id)}
                onDoubleClick={() => handleDoubleClick(imgEl.id)}
                className={`group relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shadow-xs ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-400/40 scale-105'
                    : 'border-stone-200 hover:border-rose-400'
                }`}
                title="Bấm để chọn & cuộn đến ảnh; Nháy đúp để thay ảnh mới"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgEl.src}
                  alt={`photo-${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-white bg-black/60 px-1 rounded">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
