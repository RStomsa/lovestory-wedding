'use client';

import React from 'react';
import {
  X,
  Image as ImageIcon,
  Music,
  Sparkles,
  Eye,
  EyeOff,
  Monitor,
  HelpCircle,
  RotateCcw,
  Rocket,
  ChevronRight,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { useStudioStore } from './studioStore';

export default function StudioMobileDrawer() {
  const {
    mobileDrawerOpen,
    setMobileDrawerOpen,
    elements,
    hiddenElementIds,
    toggleElementVisibility,
    desktopModeOnMobile,
    setDesktopModeOnMobile,
    setActiveMobileSheet,
    setPhotoPickerModalElementId,
    setShowOnboardingGuide,
    loadTemplateData,
    canvas,
  } = useStudioStore();

  if (!mobileDrawerOpen) return null;

  // Group elements into meaningful sections for the 👁️ visibility toggles
  const keySections = [
    {
      id: 'section-cover',
      title: 'Bìa thiệp cưới',
      elementIds: elements.filter((e) => e.y < 850).map((e) => e.id),
    },
    {
      id: 'section-couple',
      title: 'Cô dâu & Chú rể',
      elementIds: elements.filter((e) => e.y >= 850 && e.y < 1800).map((e) => e.id),
    },
    {
      id: 'section-gallery',
      title: 'Album ảnh cưới',
      elementIds: elements.filter((e) => (e.y >= 1800 && e.y < 3200) || e.type === 'image').map((e) => e.id),
    },
    {
      id: 'section-events',
      title: 'Lịch trình tiệc cưới',
      elementIds: elements.filter((e) => e.y >= 3200 && e.y < 3700).map((e) => e.id),
    },
    {
      id: 'section-giftbox',
      title: 'Mừng cưới & Lời chúc',
      elementIds: elements.filter((e) => e.y >= 3700).map((e) => e.id),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setMobileDrawerOpen(false)}
      />

      {/* Slide-out Drawer (Matches 27BigGroup Screenshot 8) */}
      <div className="relative w-[320px] max-w-[85vw] h-full bg-white dark:bg-stone-900 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="h-14 px-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
            <span>Chỉnh sửa</span>
          </h3>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* Main Tool Categories */}
          <div className="space-y-1">
            {/* 1. Hình ảnh */}
            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                setPhotoPickerModalElementId('all');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs">Hình ảnh</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* 2. Âm nhạc */}
            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                setActiveMobileSheet('music');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                  <Music className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs">Âm nhạc</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* 3. Hiệu ứng */}
            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                setActiveMobileSheet('effects');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs">Hiệu ứng rơi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* Section: Ẩn/Hiện Phần Thiệp (Exact match to 27BigGroup Screenshot 10) */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Ẩn / Hiện phần thiệp
            </span>
            <div className="space-y-1.5">
              {keySections.map((sec) => {
                const isHidden = sec.elementIds.length > 0 && sec.elementIds.every((id) => hiddenElementIds.includes(id));
                return (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60"
                  >
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      {sec.title}
                    </span>
                    <button
                      onClick={() => {
                        sec.elementIds.forEach((id) => toggleElementVisibility(id));
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isHidden
                          ? 'text-stone-400 bg-stone-200 dark:bg-stone-700'
                          : 'text-rose-600 bg-rose-50 dark:bg-rose-950/50'
                      }`}
                      title={isHidden ? 'Hiện phần này' : 'Ẩn phần này'}
                    >
                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggle: Chế độ Desktop (Exact match to 27BigGroup Screenshot 8) */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2.5">
                <Monitor className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Chế độ Desktop
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={desktopModeOnMobile}
                  onChange={(e) => setDesktopModeOnMobile(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
            {/* Warning callout (Screenshot 8) */}
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              ⚠️ Chỉ nên bật khi cần giao diện ở trên máy tính, và dùng máy tính để edit.
            </div>
          </div>

          {/* Extra Utilities */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                setShowOnboardingGuide(true);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs font-medium"
            >
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>Xem lại hướng dẫn</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Bạn có chắc muốn đặt lại toàn bộ bố cục thiệp về mặc định?')) {
                  loadTemplateData(elements);
                  setMobileDrawerOpen(false);
                }
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs font-medium"
            >
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span>Reset giao diện</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer Branding */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex flex-col items-center justify-center gap-1">
          <span className="font-serif font-bold text-sm text-rose-600">💍 LoveStory</span>
          <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
            Nền tảng thiệp cưới điện tử cao cấp
          </span>
        </div>
      </div>
    </div>
  );
}
