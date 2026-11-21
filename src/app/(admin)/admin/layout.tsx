import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import AdminLogoutButton from './AdminLogoutButton';
import {
  LayoutDashboard,
  Users,
  Palette,
  CreditCard,
  HeartHandshake,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  KeyRound,
  Music,
  LayoutTemplate,
} from 'lucide-react';

export const metadata = {
  title: 'LoveStory Admin — Quản Trị Hệ Thống',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  const navItems = [
    { label: 'Tổng Quan', href: '/admin', icon: LayoutDashboard },
    { label: 'Cá Nhân Hóa & Zalo', href: '/admin/guests', icon: Sparkles },
    { label: 'Quản Lý Cỗ Cưới & RSVP', href: '/admin/rsvps', icon: Users },
    { label: 'Kho Templates', href: '/admin/templates', icon: Palette },
    { label: 'Tài Nguyên (Font, Nhạc, Đồ họa)', href: '/admin/assets', icon: Music },
    { label: 'Admin Studio (Soạn Mẫu)', href: '/admin/studio', icon: LayoutTemplate },
    { label: 'Quản Lý Thiệp Cưới', href: '/admin/sites', icon: HeartHandshake },
    { label: 'Đơn Hàng & VietQR', href: '/admin/orders', icon: CreditCard },
    { label: 'Người Dùng', href: '/admin/users', icon: Users },
    { label: 'Quản Lý Đăng Nhập', href: '/admin/sessions', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row font-sans selection:bg-rose-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900/90 border-r border-stone-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-stone-800/80 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl">💍</span>
              <div>
                <span className="font-serif font-bold text-base text-white tracking-wide block leading-none">
                  LoveStory
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-400 block mt-1">
                  Admin Console
                </span>
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
              v2.0
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800/60 transition-all group"
                >
                  <Icon className="w-4 h-4 text-stone-400 group-hover:text-purple-400 transition-colors" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Info */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-950/40">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-900/50 border border-purple-500/30 shrink-0">
                {admin.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-purple-400 m-auto mt-2" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{admin.name}</p>
                <p className="text-[10px] text-purple-300/80 truncate font-mono">{admin.email}</p>
              </div>
            </div>
            <AdminLogoutButton />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-stone-800/50">
            <Link
              href="/"
              target="_blank"
              className="flex-1 py-1.5 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Xem Web</span>
            </Link>
            <Link
              href="/editor"
              className="flex-1 py-1.5 px-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Studio</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-stone-950">
        {/* Top Header */}
        <header className="h-16 border-b border-stone-800/80 px-6 flex items-center justify-between shrink-0 bg-stone-900/40 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-stone-200 font-medium">Bảng Điều Khiển</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Database Online (SQLite/Prisma)
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
