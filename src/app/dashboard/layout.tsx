import React from 'react';
import Link from 'next/link';
import { Sparkles, Palette, ShieldCheck, Heart } from 'lucide-react';
import UserDropdown from '@/components/auth/UserDropdown';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata = {
  title: 'Bảng Điều Khiển Khách Hàng — LoveStory',
  description: 'Quản lý thiệp cưới, khách mời RSVP, lời chúc và gói dịch vụ cưới tại LoveStory.',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-rose-500 selection:text-white flex flex-col">
      {/* Navigation Top Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">💍</span>
              <div>
                <span className="font-serif font-bold text-xl text-rose-600 block leading-tight">
                  LoveStory
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block leading-none">
                  Customer Portal
                </span>
              </div>
            </Link>

            {/* Quick Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <Link
                href="/dashboard"
                className="hover:text-rose-600 transition-colors py-1"
              >
                Bảng Điều Khiển
              </Link>
              <Link
                href="/templates"
                className="hover:text-rose-600 transition-colors py-1 flex items-center gap-1"
              >
                <Palette className="w-3.5 h-3.5 text-stone-400" />
                <span>Kho Mẫu Thiệp</span>
              </Link>
              <Link
                href="/editor/studio"
                className="hover:text-rose-600 transition-colors py-1 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Soạn Thiệp Trong Studio</span>
              </Link>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
                title="Bảng Điều Khiển Quản Trị Hệ Thống"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>Quản Trị Admin</span>
              </Link>
            )}

            <Link
              href="/templates"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo Thiệp Mới</span>
            </Link>

            <UserDropdown variant="compact" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800/80 bg-white dark:bg-stone-900/50 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span>💍</span>
            <span className="font-serif font-bold text-stone-700 dark:text-stone-300">LoveStory</span>
            <span>— Nền tảng thiệp cưới scrollytelling điện ảnh số 1 Việt Nam.</span>
          </div>
          <div>
            <span>Bảo lưu mọi quyền © {new Date().getFullYear()} LoveStory.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
