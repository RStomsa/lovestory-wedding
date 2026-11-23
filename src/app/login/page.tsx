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
  const { isAuthenticated, user, login, register, loginWithGoogle, loginDemoUser, logout } = useAuth();
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Capture URL error parameters (e.g. from Google OAuth callback)
  useEffect(() => {
    if (errorParam) {
      if (errorParam === 'google_callback_exception') {
        const details = searchParams.get('details');
        setError(details ? `Đăng nhập Google thất bại: ${decodeURIComponent(details)}` : 'Đăng nhập bằng Google gặp lỗi xử lý. Vui lòng thử lại hoặc đăng nhập bằng Email / Demo bên dưới.');
      } else if (errorParam === 'google_token_exchange_failed') {
        setError('Không thể xác thực mã từ Google. Vui lòng kiểm tra lại cấu hình.');
      } else if (errorParam === 'google_config_missing') {
        setError('Chưa cấu hình GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET trên server.');
      } else if (errorParam === 'forbidden') {
        setError('Tài khoản của bạn không có quyền truy cập trang quản trị.');
      } else {
        setError(`Đăng nhập thất bại (${errorParam}).`);
      }
    }
  }, [errorParam, searchParams]);

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

  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google?action=status');
      const data = await res.json();
      if (data.configured) {
        const targetUrl = redirectParam || (mode === 'login' ? '/dashboard' : '/dashboard');
        window.location.href = `/api/auth/google?redirect=${encodeURIComponent(targetUrl)}`;
        return;
      }
      // If client ID not configured in .env yet, open Google sign-in helper
      setShowGoogleModal(true);
    } catch {
      setShowGoogleModal(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (selectedEmail: string, selectedName: string) => {
    setIsSubmitting(true);
    setError(null);
    setShowGoogleModal(false);
    try {
      const result = await loginWithGoogle({ email: selectedEmail, name: selectedName });
      if (!result.success) {
        setError(result.error || 'Đăng nhập bằng Google thất bại.');
        setIsSubmitting(false);
        return;
      }
      const isUserAdmin = result.user?.role === 'ADMIN' || selectedEmail.toLowerCase().includes('admin') || selectedEmail === 'vinhtaithan@gmail.com';
      if (isUserAdmin) {
        window.location.href = redirectParam || '/admin';
      } else {
        const safeTarget = redirectParam && !redirectParam.startsWith('/admin') ? redirectParam : '/dashboard';
        window.location.href = safeTarget;
      }
    } catch {
      setError('Đã xảy ra lỗi kết nối Google.');
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
          <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl mb-4">
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

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full py-2.5 px-4 mb-4 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 bg-white dark:bg-stone-900 flex items-center justify-center gap-3 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-all shadow-xs hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-stone-400 border-t-rose-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{mode === 'login' ? 'Đăng nhập bằng Google' : 'Đăng ký bằng Google'}</span>
          </button>

          {/* Divider: Hoặc bằng Email */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <div className="relative px-3 bg-white dark:bg-stone-900 text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Hoặc bằng email
            </div>
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

      {/* Google Sign-In Quick Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 dark:text-white text-base">
                  Đăng Nhập Bằng Google
                </h3>
                <p className="text-[11px] text-stone-500">
                  Chọn tài khoản để tạo phiên và đăng nhập ngay:
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {/* Account 1: Admin Owner Account */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('vinhtaithan@gmail.com', 'Vĩnh Tài (Admin)')}
                className="w-full p-3 rounded-2xl border border-purple-200 dark:border-purple-900 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    VT
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-purple-600 transition-colors">
                      vinhtaithan@gmail.com
                    </h5>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                      👑 Tài khoản Chủ sở hữu / Quản Trị Viên VIP
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">
                  Chọn
                </span>
              </button>

              {/* Account 2: Standard Wedding User */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('khachhang.cuoi@gmail.com', 'Khách Hàng Google')}
                className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-rose-400 bg-stone-50 dark:bg-stone-800 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                    KH
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-rose-600 transition-colors">
                      khachhang.cuoi@gmail.com
                    </h5>
                    <p className="text-[10px] text-stone-400">
                      💍 Tài khoản Khách hàng (Tạo thiệp cưới miễn phí)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-full">
                  Chọn
                </span>
              </button>
            </div>

            {/* Custom Google Email Input */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                Hoặc nhập địa chỉ Gmail cá nhân của bạn:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="vi_du@gmail.com"
                  className="flex-1 px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail && customGoogleEmail.includes('@')) {
                      handleSelectGoogleAccount(customGoogleEmail, customGoogleEmail.split('@')[0]);
                    } else {
                      setError('Vui lòng nhập địa chỉ Gmail hợp lệ');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-all whitespace-nowrap cursor-pointer"
                >
                  Đăng nhập
                </button>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
              💡 <strong>Lưu ý cấu hình:</strong> Để chuyển sang màn hình chọn tài khoản Google chuẩn quốc tế (Google OAuth Consent Screen), chỉ cần cấu hình <code>GOOGLE_CLIENT_ID</code> và <code>GOOGLE_CLIENT_SECRET</code> trong file <code>.env</code> hoặc Vercel Environment Variables.
            </div>
          </div>
        </div>
      )}
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
