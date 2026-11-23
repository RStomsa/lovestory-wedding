'use client';

import React, { useState, useRef } from 'react';
import { X, UploadCloud, Check, Plus, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useStudioStore } from './studioStore';

export default function StudioMobilePhotoModal() {
  const {
    photoPickerModalElementId,
    setPhotoPickerModalElementId,
    elements,
    updateElement,
    photoQuality,
    setPhotoQuality,
  } = useStudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showQualityStep, setShowQualityStep] = useState(false);

  // Default wedding samples + session uploaded photos
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    '/assets/wedding/templates/c165/photo_01.webp',
    '/assets/wedding/templates/c165/photo_02.jpg',
    '/assets/wedding/templates/c165/photo_03.jpg',
    '/assets/wedding/templates/c165/photo_04.png',
    '/assets/wedding/templates/c165/photo_05.jpg',
    '/assets/wedding/templates/c165/photo_06.jpg',
    '/assets/wedding/templates/c165/photo_07.jpg',
    '/assets/wedding/templates/c165/photo_08.jpg',
    '/assets/wedding/templates/c165/photo_09.jpg',
    '/assets/wedding/templates/c165/photo_10.jpg',
  ]);

  if (!photoPickerModalElementId) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', photoQuality);

      try {
        const res = await fetch('/api/admin/assets/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          newUrls.push(data.url);
        } else {
          // Fallback to local DataURL for 0ms offline preview
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newUrls.push(dataUrl);
        }
      } catch {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newUrls.push(dataUrl);
      }
    }

    if (newUrls.length > 0) {
      setUploadedPhotos((prev) => [...newUrls, ...prev]);

      // If a specific element was selected, apply the first uploaded image directly
      if (photoPickerModalElementId !== 'all') {
        updateElement(photoPickerModalElementId, { src: newUrls[0] }, true);
        setPhotoPickerModalElementId(null);
      }
    }

    setIsUploading(false);
    e.target.value = '';
  };

  const handleSelectPhoto = (src: string) => {
    if (photoPickerModalElementId && photoPickerModalElementId !== 'all') {
      updateElement(photoPickerModalElementId, { src }, true);
    }
    setPhotoPickerModalElementId(null);
  };

  // Feature: "Tự động thêm tất cả ảnh vào chỗ trống"
  const handleAutoFillAllSlots = () => {
    const imageElements = elements.filter((e) => e.type === 'image');
    if (imageElements.length === 0 || uploadedPhotos.length === 0) return;

    imageElements.forEach((el, index) => {
      const photoSrc = uploadedPhotos[index % uploadedPhotos.length];
      updateElement(el.id, { src: photoSrc }, true);
    });

    alert(`✨ Đã tự động điền ${Math.min(imageElements.length, uploadedPhotos.length)} ảnh vào toàn bộ khung ảnh của thiệp!`);
    setPhotoPickerModalElementId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
        onClick={() => setPhotoPickerModalElementId(null)}
      />

      {/* Bottom Sheet Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 z-10 animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col space-y-4">
        {/* Top Handle bar for mobile gesture */}
        <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">
              {showQualityStep ? 'Chọn kích thước ảnh tải lên' : 'Chọn ảnh cưới'}
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {showQualityStep ? 'Tối ưu tốc độ tải và độ sắc nét của thiệp' : 'Chạm vào ảnh để thay ngay vào khung'}
            </p>
          </div>
          <button
            onClick={() => {
              if (showQualityStep) setShowQualityStep(false);
              else setPhotoPickerModalElementId(null);
            }}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quality Options Step (Matches Screenshot 4) */}
        {showQualityStep ? (
          <div className="space-y-3 py-2">
            {[
              {
                id: '1920',
                title: '1920px Nét nhất',
                badge: 'Gói VIP',
                desc: 'Cho màn hình lớn, máy tính. Dung lượng ảnh nặng nhất.',
              },
              {
                id: '1200',
                title: '1200px Khuyên dùng',
                badge: 'Chuẩn nét',
                desc: 'Vừa nét trên điện thoại, vừa đủ nhẹ mở mượt mà.',
              },
              {
                id: '900',
                title: '900px Nhẹ nhất',
                badge: 'Mở siêu nhanh',
                desc: 'Mở nhanh trên điện thoại đời thấp, mạng 3G/4G yếu.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                onClick={() => setPhotoQuality(opt.id as any)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  photoQuality === opt.id
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-1 ring-rose-500'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="photoQuality"
                  checked={photoQuality === opt.id}
                  onChange={() => setPhotoQuality(opt.id as any)}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900 dark:text-white">
                      {opt.title}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 uppercase">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {opt.desc}
                  </p>
                </div>
              </label>
            ))}

            <button
              onClick={() => {
                setShowQualityStep(false);
                fileInputRef.current?.click();
              }}
              className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              Tiếp tục tải ảnh lên
            </button>
          </div>
        ) : (
          /* Main Photo Gallery Step (Matches Screenshot 3) */
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowQualityStep(true)}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>Tải thêm ảnh</span>
              </button>

              <span className="text-[11px] text-stone-400 font-mono">
                {uploadedPhotos.length} ảnh trong kho
              </span>
            </div>

            {/* Photo Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 pr-1 max-h-[45vh]">
              {uploadedPhotos.map((src, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPhoto(src)}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer hover:border-rose-500 transition-all active:scale-95 shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="p-1 rounded-full bg-rose-600 text-white shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Feature: "Tự động thêm tất cả ảnh vào chỗ trống" (Screenshot 3) */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={handleAutoFillAllSlots}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Tự động thêm tất cả ảnh vào chỗ trống</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
