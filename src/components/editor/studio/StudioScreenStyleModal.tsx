'use client';

import React from 'react';
import {
  X,
  Sparkles,
  Check,
  LayoutGrid,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import { SCREEN_BLOCKS_CATALOG, ScreenBlockItem } from '@/data/screenBlocksCatalog';

const FOLD_LABELS = [
  'Trang bìa & Mở đầu (0 - 850px)',
  'Thư mời & Song thân (850 - 1700px)',
  'Lịch trình & Đếm ngược (1700 - 2550px)',
  'Album kỷ niệm cưới (2550 - 3400px)',
  'Bản đồ & Xác nhận RSVP (3400 - 4250px)',
  'Hộp mừng cưới & Sổ lưu bút (4250 - 5200px)',
];

export default function StudioScreenStyleModal() {
  const {
    activeScreenPickerIndex,
    setActiveScreenPickerIndex,
    replaceScreenElements,
    weddingProfile,
    canvas,
  } = useStudioStore();

  if (activeScreenPickerIndex === null) return null;

  const screenIdx = activeScreenPickerIndex;
  const screenTitle = FOLD_LABELS[screenIdx] || `Màn ${screenIdx + 1}`;
  const startY = screenIdx * 850;

  // Filter available blocks for this screen
  const availableBlocks = SCREEN_BLOCKS_CATALOG.filter(
    (b) => b.screenIndex === screenIdx
  );

  // Extract couple info for personalized preview
  const groom =
    weddingProfile?.groom?.shortName || weddingProfile?.groom?.fullName || 'Minh Thành';
  const bride =
    weddingProfile?.bride?.shortName || weddingProfile?.bride?.fullName || 'Bảo Ngọc';
  const mainCeremony =
    weddingProfile?.ceremonies?.find((c) => c.isMain) || weddingProfile?.ceremonies?.[0];
  const date = mainCeremony?.date || '28 . 11 . 2026';
  const venue = mainCeremony?.venue || 'Trung Tâm Tiệc Cưới Trống Đồng Palace';
  const paletteColor = '#8C7355';

  const handleApplyBlock = (block: ScreenBlockItem) => {
    const newElements = block.generateElements(
      startY,
      groom,
      bride,
      date,
      venue,
      paletteColor
    );

    replaceScreenElements(screenIdx, newElements);
    setActiveScreenPickerIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-white">
                  Đổi Kiểu Thiết Kế Màn {screenIdx + 1}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  Lego Block
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {screenTitle} • Thay đổi kiểu dáng chuẩn tỷ lệ vàng mà không làm ảnh hưởng các màn khác
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveScreenPickerIndex(null)}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              Hệ thống sẽ thay thế phần bố cục trong <strong>Màn {screenIdx + 1} ({startY}px - {startY + 850}px)</strong>, tự động bảo toàn tên cô dâu ({bride}), chú rể ({groom}) và địa điểm cưới của bạn!
            </span>
          </div>

          {availableBlocks.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              Đang cập nhật thêm các kiểu mẫu cho màn hình này...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableBlocks.map((block) => (
                <div
                  key={block.id}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 overflow-hidden shadow-xs hover:shadow-md hover:border-purple-500 transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/10] bg-stone-100 dark:bg-stone-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.thumbnail}
                      alt={block.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-900/80 text-white backdrop-blur-xs">
                        {block.styleName}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 dark:text-white line-clamp-1">
                        {block.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                        {block.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyBlock(block)}
                      className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Áp Dụng Kiểu Này Vào Màn {screenIdx + 1}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
