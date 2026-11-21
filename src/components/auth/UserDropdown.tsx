'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon, Layout, FileText, ChevronDown, Sparkles, ShieldCheck, Crown, Zap } from 'lucide-react';

interface Props {
  variant?: 'navbar' | 'compact';
}

export default function UserDropdown({ variant = 'navbar' }: Props) {
  const { user, isAuthenticated, isAdmin, openAuthModal, openUpgradeModal, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openAuthModal('login')}
          className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-all shadow-xs"
        >
          Đăng Nhập
        </button>
        {variant === 'navbar' && (
          <button
            onClick={() => openAuthModal('register')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-transform active:scale-95 shadow-md shadow-rose-600/20"
          >
            Đăng Ký
          </button>
        )}
      </div>
    );
  }

  // Render plan badge
  const renderPlanBadge = () => {
    if (user.role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
          <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
        </span>
      );
    }
    if (user.plan === 'LIFETIME_VIP_200K') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
          <Crown className="w-2.5 h-2.5" /> VIP TRỌN ĐỜI
        </span>
      );
    }
    if (user.plan === 'ANNUAL_50K') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
          <Zap className="w-2.5 h-2.5" /> GÓI 1 NĂM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-semibold">
        <span>🎁 FREE (300 views)</span>
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-rose-300 dark:hover:border-rose-700 transition-all shadow-xs"
      >
        {/* User Avatar */}
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-rose-100 border border-stone-200 flex-shrink-0">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-4 h-4 text-rose-600 m-auto" />
          )}
        </div>

        <div className="text-left hidden sm:block max-w-[120px]">
          <span className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate block leading-tight">
            {user.name}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 py-2 z-50 animate-fade-in">
          {/* Header Profile Info */}
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-sm text-stone-900 dark:text-white truncate">
                {user.name}
              </span>
              {renderPlanBadge()}
            </div>
            <p className="text-xs text-stone-500 truncate">{user.email}</p>
          </div>

          {/* Links */}
          <div className="p-1 space-y-0.5">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Trang Quản Trị Admin</span>
              </Link>
            )}

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <Layout className="w-4 h-4 text-rose-600" />
              <span>Bảng Điều Khiển Của Tôi</span>
            </Link>

            <Link
              href="/editor/studio"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Studio Thiết Kế Thiệp</span>
            </Link>

            <Link
              href="/templates"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Kho Mẫu Giao Diện</span>
            </Link>

            <Link
              href="/chu-re-va-co-dau"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-blue-500" />
              <span>Xem Thiệp Mẫu Demo</span>
            </Link>

            {user.plan !== 'LIFETIME_VIP_200K' && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openUpgradeModal({ defaultType: 'PLAN_LIFETIME_VIP_200K' });
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 transition-colors mt-1"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Nâng Cấp Gói VIP</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                  Từ 50k
                </span>
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="p-1 pt-1 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
