'use client';

import React, { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';
import { WeddingData } from '@/types/wedding';

interface Props {
  data: WeddingData;
  onChange: (newData: WeddingData) => void;
}

export default function QuickPhotoBar({ data, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Build photo slots from current wedding data
  const photoSlots = [
    { id: 'cover', label: 'Ảnh bìa', url: data.coverImage },
    { id: 'groom', label: 'Chú rể', url: data.groom.avatar },
    { id: 'bride', label: 'Cô dâu', url: data.bride.avatar },
    ...data.gallery.map((g, idx) => ({
      id: `gallery-${idx}`,
      label: `Ảnh cưới ${idx + 1}`,
      url: g.url,
      galleryIndex: idx,
    })),
  ];

  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSlot) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      const clone: WeddingData = JSON.parse(JSON.stringify(data));

      if (selectedSlot === 'cover') {
        clone.coverImage = resultUrl;
      } else if (selectedSlot === 'groom') {
        clone.groom.avatar = resultUrl;
      } else if (selectedSlot === 'bride') {
        clone.bride.avatar = resultUrl;
      } else if (selectedSlot.startsWith('gallery-')) {
        const idx = parseInt(selectedSlot.split('-')[1], 10);
        if (clone.gallery[idx]) {
          clone.gallery[idx].url = resultUrl;
        }
      }

      onChange(clone);
      setSelectedSlot(null);
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = '';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-2xl transition-all">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Bar Header Toggle */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-rose-600 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
          <span>Thay ảnh nhanh</span>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-semibold">
            {photoSlots.length} vị trí ảnh
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[11px] text-stone-400 hidden sm:inline">
          Bấm vào ô ảnh bất kỳ để tải ảnh cưới thật lên thay thế
        </span>
      </div>

      {/* Horizontal Strip of Thumbnails */}
      {isOpen && (
        <div className="p-3 overflow-x-auto flex items-center gap-3 scrollbar-thin">
          {photoSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot.id)}
              className="group relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 border-stone-200 dark:border-stone-700 hover:border-rose-500 transition-all shadow-xs active:scale-95 bg-stone-100 dark:bg-stone-800"
              title={`Thay đổi: ${slot.label}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slot.url}
                alt={slot.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1">
                <Upload className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-medium leading-tight text-center">Đổi ảnh</span>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 px-1 text-center">
                <span className="text-[9px] text-white truncate block font-sans">
                  {slot.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
