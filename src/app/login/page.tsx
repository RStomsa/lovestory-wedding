'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Wand2,
} from 'lucide-react';

function LoginFormContent() {
  const { isAuthenticated, user, login, register, loginDemoUser, logout } = useAuth();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAccessingAdmin = redirectParam === '/admin' || redirectParam?.startsWith('/admin');
  const isForbiddenUser = isAuthenticated && user && user.role !== 'ADMIN' && (isAccessingAdmin || errorParam === 'forbidden');

  // Handle auto-redirection when already authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Admin goes to requested admin path or /admin
    if (user.role === 'ADMIN') {
      window.location.href = redirectParam || '/admin';
      return;
    }

    // Customer / Normal User: If target is valid and NOT admin, redirect immediately
    if (redirectParam && !redirectParam.startsWith('/admin')) {
      window.location.href = redirectParam;
    } else {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, user, redirectParam]);

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setMode('login');
    setEmail(presetEmail);
    setPassword(presetPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const result = await login({ email, password });
        if (!result.success) {
          setError(result.error || 'Email hoặc mật khẩu không chính xác.');
          setIsSubmitting(false);
          return;
        }

        const isUserAdmin = result.user?.role === 'ADMIN' || email.toLowerCase().includes('admin');
        if (isUserAdmin) {
          window.location.href = redirectParam || '/admin';
        } else {
          // Customers are NEVER redirected into /admin
          const safeTarget = redirectParam && !redirectParam.startsWith('/admin') ? redirectParam : '/dashboard';
          window.location.href = safeTarget;
        }
      } else {
        if (!name.trim()) {
          setError('Vui lòng nhập họ và tên.');
          setIsSubmitting(false);
          return;
        }
        const result = await register({ name, email, password, phone });
        if (!result.success) {
          setError(result.error || 'Đăng ký không thành công.');
          setIsSubmitting(false);
          return;
        }
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Đã xảy ra lỗi kết nối, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async (role: 'chure' | 'codau' | 'admin') => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isAuthenticated) {
        await logout();
      }

      const res = await loginDemoUser(role);
      if (res && !res.success) {
        setError(res.error || 'Đăng nhập thất bại');
        setIsSubmitting(false);
        return;
      }

      if (role === 'admin') {
        window.location.href = '/admin';
      } else {
        // Customers go to customer dashboard
        const safeTarget = redirectParam && !redirectParam.startsWith('/admin') ? redirectParam : '/dashboard';
        window.location.href = safeTarget;
      }
    } catch {
      setError('Không thể kết nối đến máy chủ.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>

        {isAccessingAdmin && (
          <Link
            href="/login"
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Đăng nhập khách hàng
          </Link>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-stone-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-stone-200/80 dark:border-stone-800">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 font-serif font-bold text-3xl text-rose-600 mb-2">
              <span>💍 LoveStory</span>
            </Link>
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
              {isAccessingAdmin
                ? 'Đăng Nhập Quản Trị Hệ Thống'
                : mode === 'login'
                ? 'Chào mừng bạn trở lại'
                : 'Tạo tài khoản thiệp cưới'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isAccessingAdmin
                ? 'Khu vực dành cho Quản Trị Viên. Nếu bạn là khách hàng, hãy đăng nhập để vào Studio.'
                : 'Đồng bộ dữ liệu thiệp cưới, lưu danh sách khách mời và sổ lưu bút'}
            </p>
          </div>

          {/* Alert: Forbidden Role when trying to access Admin */}
          {isForbiddenUser && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3 shadow-inner">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Bạn đang đăng nhập tài khoản Khách Hàng</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                Tài khoản <strong className="text-white">{user?.email}</strong> là tài khoản người dùng, không có quyền truy cập trang Quản Trị Admin.
              </p>

              {/* Clear Action Buttons for Customers */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Vào Bảng Điều Khiển Khách Hàng (Dashboard)</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href="/editor/studio"
                    className="flex-1 py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>Vào Studio Soạn Thiệp</span>
                  </Link>

                  <Link
                    href="/"
                    className="flex-1 py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Về Trang Chủ</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('register');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium space-y-1">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Họ và Tên
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Số Điện Thoại (Tùy chọn)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Địa Chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-9 pr-10 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800 space-y-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block text-center">
              ⚡ Đăng nhập nhanh 1-Click:
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('chure')}
                className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-rose-400 bg-stone-50 dark:bg-stone-800 flex flex-col items-center justify-center text-center transition-all group"
              >
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-rose-600">
                  🤵 Chú Rể
                </span>
                <span className="text-[9px] text-stone-400">Gói Free</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('codau')}
                className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-rose-400 bg-stone-50 dark:bg-stone-800 flex flex-col items-center justify-center text-center transition-all group"
              >
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-rose-600">
                  👰 Cô Dâu
                </span>
                <span className="text-[9px] text-stone-400">Gói 50k</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="p-2 rounded-xl border border-purple-200 dark:border-purple-900 hover:border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 group-hover:text-purple-600">
                  👑 Admin
                </span>
                <span className="text-[9px] text-purple-500">VIP 200k</span>
              </button>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-[11px] text-stone-500 space-y-1.5">
              <span className="font-semibold text-stone-700 dark:text-stone-300 block">
                💡 Hoặc tự điền thông tin:
              </span>
              <div className="flex items-center justify-between">
                <span>Admin: <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">admin@lovestory.me</code> / <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">Admin@LoveStory2026</code></span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@lovestory.me', 'Admin@LoveStory2026')}
                  className="text-purple-600 hover:underline font-bold text-[10px]"
                >
                  Điền
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>User: <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">chure@lovestory.me</code> / <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">123456</code></span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('chure@lovestory.me', '123456')}
                  className="text-rose-600 hover:underline font-bold text-[10px]"
                >
                  Điền
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-center gap-4 text-[10px] text-stone-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Miễn phí trọn đời
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Đồng bộ đám mây
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
