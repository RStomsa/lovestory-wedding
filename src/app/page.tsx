'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Music,
  CreditCard,
  CalendarCheck,
  Check,
  Share2,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  Film,
} from 'lucide-react';
import UserDropdown from '@/components/auth/UserDropdown';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold text-rose-600 flex items-center gap-2">
            <span>💍 LoveStory</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600 dark:text-stone-300">
            <Link href="/templates" className="hover:text-rose-600 transition-colors">Kho Giao Diện</Link>
            <Link href="#features" className="hover:text-rose-600 transition-colors">Tính Năng</Link>
            <Link href="#pricing" className="hover:text-rose-600 transition-colors">Bảng Giá</Link>
            <Link href="/chu-re-va-co-dau" className="text-rose-600 hover:underline">Xem Thiệp Mẫu Demo</Link>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản Trị Admin</span>
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Bảng Điều Khiển</span>
              </Link>
            )}
            <UserDropdown variant="navbar" />
            <Link
              href="/templates"
              className="hidden sm:flex px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 items-center gap-1.5 transition-transform active:scale-95"
            >
              <span>Chọn Mẫu Thiệp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Nền Tảng Thiệp Cưới Điện Ảnh Độc Bản 2026</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-stone-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          Biến Câu Chuyện Tình Yêu Thành Thước Phim Lãng Mạn
        </h1>

        <p className="mt-6 text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Không chỉ là một tấm thiệp ảnh thông thường. Nền tảng tạo nên trải nghiệm scrollytelling đậm chất điện ảnh: nhạc nền du dương, đĩa than xoay, hiệu ứng cánh hoa bay, đếm ngược và mã VietQR nhận tiền mừng thông minh.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/templates"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>Khám Phá Kho Mẫu Thiệp (Miễn Phí)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/chu-re-va-co-dau"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Film className="w-4 h-4 text-rose-500" />
            <span>Trải Nghiệm Thiệp Demo Thực Tế</span>
          </Link>
        </div>

        {/* Live Mockup Showcase */}
        <div className="mt-16 max-w-5xl mx-auto relative group">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-800/10 dark:border-stone-700/30 bg-stone-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"
              alt="Wedding Invitation Preview"
              className="w-full aspect-[16/9] object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-left text-white">
              <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1">
                Giao Diện Burgundy Cinema
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold">
                Chú Rể &amp; Cô Dâu • Save The Date
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl mt-2">
                Được thiết kế tối ưu với tỷ lệ cuộn mượt mà trên iPhone &amp; Android.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section id="features" className="py-24 bg-white dark:bg-stone-900 border-y border-stone-200/60 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest text-rose-600 font-bold">
              Tính Năng Độc Bản
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
              Những Tiện Ích Thông Minh Vượt Trội
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Không chỉ để ngắm, mỗi tính năng đều sinh ra để phục vụ nhu cầu thực tế của ngày trọng đại.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">Đĩa Than Phát Nhạc</h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Nút nghe nhạc hình đĩa than xoay tròn lãng mạn, có cơ chế bypass chính sách chặn tự động phát âm thanh trên Safari iOS.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">Mã VietQR Mừng Cưới</h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Tự động tạo mã QR Napas247 chuẩn cho cả Chú rể và Cô dâu, khách ở xa quét mã bằng app ngân hàng là điền sẵn tài khoản.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">Xác Nhận Tham Dự (RSVP)</h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Khách mời dễ dàng đăng ký số người đi dự và để lại lời nhắn. Thống kê số lượng khách cỗ bàn chính xác đến từng bàn.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">Cá Nhân Hóa Tên Khách</h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Tạo link riêng cho từng người: &ldquo;Kính mời Anh Tuấn (Bạn Chú Rể)&rdquo;. Khách mở link cảm nhận được sự tôn trọng tuyệt đối.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">Dòng Thời Gian Tình Yêu</h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Kể lại hành trình từ lần đầu gặp mặt, buổi hẹn hò đầu tiên đến khoảnh khắc cầu hôn thiêng liêng bằng hình ảnh và lời dẫn.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">Tối Ưu 100% Cho Mobile</h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Khách mở qua Zalo, Messenger chạy mượt mà tức thì, không bị vỡ bố cục, không giật lag ngay cả trên máy cấu hình yếu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-rose-600 font-bold">Bảng Giá Hợp Lý</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
            Đơn Giản, Minh Bạch, Không Phí Ẩn
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Thanh toán một lần duy nhất, lưu trữ thiệp trọn đời cho kỷ niệm ngày cưới.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free */}
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-serif">Gói Dùng Thử</h3>
              <div className="text-3xl font-bold">0đ</div>
              <p className="text-xs text-stone-500">Tự do trải nghiệm đầy đủ các công cụ thiết kế</p>
              <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300 pt-4 border-t border-stone-100 dark:border-stone-800">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Tạo 1 thiệp cưới</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Tối đa 6 ảnh kỷ niệm</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Nhạc nền có sẵn</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Lưu trữ 3 tháng</li>
              </ul>
            </div>
            <Link
              href="/editor"
              className="w-full py-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-center transition-colors block"
            >
              Trải Nghiệm Miễn Phí
            </Link>
          </div>

          {/* Premium (Featured) */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-rose-900 to-[#3f0c15] text-white shadow-2xl border-2 border-rose-500 flex flex-col justify-between space-y-6 scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-stone-900 text-[11px] font-bold tracking-wider uppercase shadow-md">
              Khuyên Dùng • Phổ Biến Nhất
            </div>
            <div className="space-y-4 pt-2">
              <h3 className="text-xl font-bold font-serif">Gói VIP Điện Ảnh</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-serif text-amber-300">199.000đ</span>
                <span className="text-xs text-stone-300 line-through">450.000đ</span>
              </div>
              <p className="text-xs text-stone-200">Trọn bộ tính năng scrollytelling điện ảnh</p>
              <ul className="space-y-2.5 text-xs text-stone-200 pt-4 border-t border-rose-800">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Mở khóa tất cả 4 mẫu giao diện</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Không giới hạn ảnh gallery</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Tự tải nhạc MP3 tùy chọn</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Hộp mừng cưới VietQR tự động</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Cá nhân hóa link từng khách mời</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Lưu trữ vĩnh viễn (Kỷ niệm ngày cưới)</li>
              </ul>
            </div>
            <Link
              href="/editor"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-900 text-xs font-bold text-center transition-transform active:scale-95 shadow-lg block"
            >
              Chọn Gói Này &amp; Bắt Đầu
            </Link>
          </div>

          {/* B2B Studio Partner */}
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-serif">Đối Tác Studio Cưới</h3>
              <div className="text-3xl font-bold">Liên Hệ</div>
              <p className="text-xs text-stone-500">Dành cho Studio áo cưới &amp; Wedding Planner</p>
              <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300 pt-4 border-t border-stone-100 dark:border-stone-800">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Tài khoản đại lý xuất thiệp sỉ</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Đóng logo riêng của Studio</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Tên miền tùy chỉnh riêng</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Hỗ trợ kỹ thuật 24/7</li>
              </ul>
            </div>
            <Link
              href="/editor"
              className="w-full py-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-center transition-colors block"
            >
              Đăng Ký Đối Tác
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-2 font-serif text-lg font-bold text-rose-600">
            <span>💍 LoveStory</span>
          </div>
          <p>© 2026 LoveStory Platform. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link href="/templates" className="hover:underline">Kho Mẫu</Link>
            <Link href="/editor" className="hover:underline">Studio Thiết Kế</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
