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
  Heart,
  Cpu,
  AppWindow,
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
    { label: 'Quản Lý Tiện Ích', href: '/admin/widgets', icon: AppWindow },
    { label: 'Công Cụ Rust (Hiệu Năng)', href: '/admin/tools', icon: Cpu },
    { label: 'Admin Studio (Soạn Mẫu)', href: '/admin/studio', icon: LayoutTemplate },
    { label: 'Quản Lý Thiệp Cưới', href: '/admin/sites', icon: HeartHandshake },
    { label: 'Đơn Hàng & VietQR', href: '/admin/orders', icon: CreditCard },
    { label: 'Người Dùng', href: '/admin/users', icon: Users },
    { label: 'Quản Lý Đăng Nhập', href: '/admin/sessions', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col md:flex-row font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200/90 flex flex-col justify-between shrink-0 shadow-[1px_0_0_0_rgba(0,0,0,0.03)]">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4 fill-rose-600" />
              </div>
              <div>
                <span className="font-serif font-bold text-base text-stone-900 tracking-tight block leading-none">
                  LoveStory
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-600 block mt-1">
                  Admin Console
                </span>
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-mono font-medium">
              v2.0
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 transition-colors group"
                >
                  <Icon className="w-4 h-4 text-stone-600 group-hover:text-stone-800 transition-colors" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Info */}
        <div className="p-4 border-t border-stone-200/80 bg-stone-50/60">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-stone-200 shrink-0 shadow-2xs">
                {admin.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-stone-500 m-auto mt-2" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-stone-900 truncate">{admin.name}</p>
                <p className="text-[10px] text-stone-600 truncate font-mono">{admin.email}</p>
              </div>
            </div>
            <AdminLogoutButton />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60">
            <Link
              href="/"
              target="_blank"
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-stone-200/80 hover:bg-stone-100/80 text-stone-700 text-[11px] font-medium flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-stone-400" />
              <span>Xem Web</span>
            </Link>
            <Link
              href="/editor"
              className="flex-1 py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-rose-700 text-[11px] font-medium flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>Studio</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#fafaf9]">
        {/* Top Header */}
        <header className="h-14 border-b border-stone-200/80 px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span>Admin</span>
            <span>/</span>
            <span className="text-stone-800 font-medium">Bảng Điều Khiển</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Cơ sở dữ liệu: Trực tuyến (Supabase)
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
