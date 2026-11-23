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
  Heart,
  UserCheck,
  Crown,
  Cloud,
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
        setError(
          details
            ? `Đăng nhập Google thất bại: ${decodeURIComponent(details)}`
            : 'Đăng nhập bằng Google gặp lỗi phản hồi từ máy chủ. Vui lòng thử lại hoặc đăng nhập bằng Email bên dưới.'
        );
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

    if (user.role === 'ADMIN') {
      window.location.href = redirectParam || '/admin';
      return;
    }

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
        const targetUrl = redirectParam || '/dashboard';
        window.location.href = `/api/auth/google?redirect=${encodeURIComponent(targetUrl)}`;
        return;
      }
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
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Top back link */}
      <div className="w-full max-w-md mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ</span>
        </Link>

        {isAccessingAdmin && (
          <Link
            href="/login"
            className="text-xs font-medium text-rose-600 hover:underline"
          >
            Đăng nhập khách hàng
          </Link>
        )}
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-stone-200/90 shadow-xs">
          {/* Brand & Headline */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4 fill-rose-600" />
              </div>
              <span className="font-serif font-bold text-2xl text-stone-900 tracking-tight">
                LoveStory
              </span>
            </Link>
            <h1 className="text-lg font-serif font-bold text-stone-900">
              {isAccessingAdmin
                ? 'Đăng nhập Quản trị hệ thống'
                : mode === 'login'
                ? 'Chào mừng bạn trở lại'
                : 'Tạo tài khoản thiệp cưới'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {isAccessingAdmin
                ? 'Khu vực quản trị hệ thống. Khách hàng vui lòng đăng nhập tài khoản thường.'
                : 'Đồng bộ dữ liệu thiệp cưới, quản lý khách mời và sổ lưu bút'}
            </p>
          </div>

          {/* Alert: Forbidden Role when trying to access Admin */}
          {isForbiddenUser && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
                <span>Tài khoản khách hàng không có quyền truy cập Quản trị</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Tài khoản <strong>{user?.email}</strong> là tài khoản người dùng thông thường.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/dashboard"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs text-center transition-colors"
                >
                  Vào Bảng điều khiển
                </Link>
                <Link
                  href="/editor/studio"
                  className="flex-1 py-1.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs text-center transition-colors"
                >
                  Vào Studio
                </Link>
              </div>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-stone-100 rounded-xl mb-4 text-xs">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('register');
              }}
              className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full py-2.5 px-4 mb-4 rounded-xl border border-stone-200 hover:bg-stone-50 bg-white flex items-center justify-center gap-2.5 text-xs font-medium text-stone-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
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
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative px-3 bg-white text-[11px] font-medium text-stone-400">
              hoặc bằng email
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-1">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Số điện thoại (tùy chọn)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Địa chỉ email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-9 pr-10 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-stone-200/90 space-y-3">
            <span className="text-[11px] font-medium text-stone-500 block text-center">
              Đăng nhập nhanh mẫu thử nghiệm:
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('chure')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50/80 bg-white flex flex-col items-center justify-center text-center transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 mb-1 group-hover:text-stone-900">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-stone-800">
                  Chú Rể
                </span>
                <span className="text-[10px] text-stone-400">Gói Free</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('codau')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50/80 bg-white flex flex-col items-center justify-center text-center transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 mb-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-600" />
                </div>
                <span className="text-xs font-medium text-stone-800">
                  Cô Dâu
                </span>
                <span className="text-[10px] text-stone-400">Gói 50k</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50/80 bg-white flex flex-col items-center justify-center text-center transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-900 flex items-center justify-center text-white mb-1">
                  <Crown className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-stone-800">
                  Admin
                </span>
                <span className="text-[10px] text-stone-400">VIP 200k</span>
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 space-y-1.5">
              <span className="font-medium text-stone-700 block">
                Hoặc tự điền tài khoản mẫu:
              </span>
              <div className="flex items-center justify-between">
                <span>Admin: <code className="bg-stone-200/70 text-stone-800 px-1 py-0.5 rounded font-mono text-[10px]">admin@lovestory.me</code></span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@lovestory.me', 'Admin@LoveStory2026')}
                  className="text-stone-900 hover:underline font-medium text-[11px]"
                >
                  Điền
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>User: <code className="bg-stone-200/70 text-stone-800 px-1 py-0.5 rounded font-mono text-[10px]">chure@lovestory.me</code></span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('chure@lovestory.me', '123456')}
                  className="text-stone-900 hover:underline font-medium text-[11px]"
                >
                  Điền
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-center gap-4 text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" /> Miễn phí tạo thiệp
            </span>
            <span className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-stone-400" /> Đồng bộ đám mây
            </span>
          </div>
        </div>
      </div>

      {/* Google Sign-In Quick Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200/90 p-6 relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <h3 className="text-sm font-semibold text-stone-900">
                  Chọn tài khoản Google để đăng nhập
                </h3>
                <p className="text-[11px] text-stone-500">
                  Môi trường phát triển cục bộ
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('vinhtaithan@gmail.com', 'Vĩnh Tài (Admin)')}
                className="w-full p-3 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <span>Vĩnh Tài</span>
                    <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono">Admin</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">vinhtaithan@gmail.com</div>
                </div>
                <span className="text-xs text-stone-400">&rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('khachhang.demo@gmail.com', 'Khách Hàng (Demo)')}
                className="w-full p-3 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-stone-900">Khách Hàng Demo</div>
                  <div className="text-[11px] text-stone-500 font-mono">khachhang.demo@gmail.com</div>
                </div>
                <span className="text-xs text-stone-400">&rarr;</span>
              </button>
            </div>

            <div className="pt-3 border-t border-stone-200/80">
              <label className="block text-[11px] font-medium text-stone-600 mb-1">
                Hoặc nhập địa chỉ Gmail khác:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                />
                <button
                  type="button"
                  disabled={!customGoogleEmail.includes('@')}
                  onClick={() =>
                    handleSelectGoogleAccount(
                      customGoogleEmail.trim(),
                      customGoogleEmail.split('@')[0]
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-medium transition-colors"
                >
                  Xác nhận
                </button>
              </div>
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
        <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
