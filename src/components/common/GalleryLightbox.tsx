'use client';

import React, { useState } from 'react';
import { GalleryPhoto } from '@/types/wedding';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface Props {
  photos: GalleryPhoto[];
}

export default function GalleryLightbox({ photos }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % photos.length);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mb-3">
          <Camera className="w-6 h-6" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold">Khoảnh Khắc Hạnh Phúc</h3>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">
          Những khung hình ghi dấu kỷ niệm tình yêu của chúng mình
        </p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer bg-stone-200 dark:bg-stone-800 shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption || `Ảnh cưới ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-xs text-white font-medium drop-shadow-md">
                {photo.caption || 'Xem ảnh phóng to'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevPhoto}
            className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].caption || 'Ảnh cưới'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            {photos[selectedIndex].caption && (
              <p className="text-sm text-stone-200 mt-3 font-serif">
                {photos[selectedIndex].caption}
              </p>
            )}
          </div>

          <button
            onClick={nextPhoto}
            className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
