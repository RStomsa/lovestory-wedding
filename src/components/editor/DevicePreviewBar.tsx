'use client';

import React from 'react';
import { Smartphone, Monitor, ExternalLink, Save, RotateCcw, Crown } from 'lucide-react';
import UserDropdown from '@/components/auth/UserDropdown';
import { useAuth } from '@/context/AuthContext';

interface Props {
  viewMode: 'mobile' | 'desktop';
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  onSave: () => void;
  onReset: () => void;
  slug: string;
}

export default function DevicePreviewBar({
  viewMode,
  setViewMode,
  onSave,
  onReset,
  slug,
}: Props) {
  const { user, openUpgradeModal } = useAuth();
  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between z-30 sticky top-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-serif font-bold text-lg text-rose-600">
          <span>💍 LoveStory</span>
          <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
            Studio
          </span>
        </div>
      </div>

      {/* Device View Toggles */}
      <div className="hidden sm:flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
        <button
          onClick={() => setViewMode('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'mobile'
              ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-900 dark:text-white font-semibold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile (Khách xem 99%)</span>
        </button>
        <button
          onClick={() => setViewMode('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'desktop'
              ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-900 dark:text-white font-semibold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Desktop Toàn Màn Hình</span>
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-xs font-medium flex items-center gap-1"
          title="Khôi phục lại dữ liệu gốc"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">Đặt Lại</span>
        </button>

        <a
          href={`/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mở Tab Mới</span>
        </a>

        {(!user || user.plan !== 'LIFETIME_VIP_200K') && (
          <button
            onClick={() => openUpgradeModal({ defaultType: 'PLAN_LIFETIME_VIP_200K' })}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Nâng VIP 200k</span>
          </button>
        )}

        <button
          onClick={onSave}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Lưu Thiệp</span>
        </button>

        <div className="pl-1 border-l border-stone-200 dark:border-stone-800 ml-1">
          <UserDropdown variant="compact" />
        </div>
      </div>
    </header>
  );
}
