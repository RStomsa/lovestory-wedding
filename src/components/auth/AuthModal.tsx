'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register, loginWithGoogle, loginDemoUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleModalClick = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google?action=status');
      const data = await res.json();
      if (data.configured) {
        window.location.href = `/api/auth/google?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error || 'Đăng nhập Google thất bại');
      } else if (result.user?.role === 'ADMIN') {
        window.location.href = '/admin';
      }
    } catch {
      setError('Đã xảy ra lỗi kết nối Google.');
    } finally {
      setIsSubmitting(false);
    }
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
      if (authModalMode === 'login') {
        const result = await login({ email, password });
        if (!result.success) {
          setError(result.error || 'Đăng nhập không thành công.');
        } else if (email.toLowerCase().includes('admin')) {
          window.location.href = '/admin';
        }
      } else {
        if (!name.trim()) {
          setError('Vui lòng nhập họ và tên của bạn.');
          setIsSubmitting(false);
          return;
        }
        const result = await register({ name, email, password, phone });
        if (!result.success) {
          setError(result.error || 'Đăng ký không thành công.');
        }
      }
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 z-10 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Intro */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 font-serif font-bold text-2xl text-rose-600 mb-1">
              <span>💍 LoveStory</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {authModalMode === 'login'
                ? 'Đăng nhập để lưu và quản lý thiệp cưới của bạn'
                : 'Tạo tài khoản miễn phí để xuất bản thiệp cưới'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setError(null);
                openAuthModal('login');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                authModalMode === 'login'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                openAuthModal('register');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                authModalMode === 'register'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Google 1-Click Login */}
          <button
            type="button"
            onClick={handleGoogleModalClick}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 mb-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-center gap-2.5 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-stone-400 border-t-rose-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Tiếp tục với Google</span>
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <span className="relative bg-white dark:bg-stone-900 px-3 text-[11px] uppercase tracking-wider text-stone-400">
              Hoặc với email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Họ và Tên
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Địa Chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
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

            {authModalMode === 'register' && (
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
                    placeholder="0901234567"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-lg shadow-rose-600/25 transition-transform active:scale-95 disabled:opacity-60"
            >
              {isSubmitting
                ? 'Đang xử lý...'
                : authModalMode === 'login'
                ? 'Đăng Nhập'
                : 'Đăng Ký Tài Khoản'}
            </button>
          </form>

          {/* Quick Demo Login Cards */}
          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <span className="block text-[11px] text-stone-500 dark:text-stone-400 text-center mb-2 font-bold uppercase tracking-wider">
              ⚡ Đăng nhập 1-Click tài khoản mẫu:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={async () => {
                  await loginDemoUser('chure');
                  closeAuthModal();
                }}
                className="py-2 px-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 text-[10px] font-bold text-amber-800 dark:text-amber-300 transition-all flex flex-col items-center justify-center gap-0.5"
              >
                <span>🤵 Chú Rể</span>
                <span className="text-[8px] font-normal opacity-75">Free</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await loginDemoUser('codau');
                  closeAuthModal();
                }}
                className="py-2 px-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 text-[10px] font-bold text-rose-800 dark:text-rose-300 transition-all flex flex-col items-center justify-center gap-0.5"
              >
                <span>👰 Cô Dâu</span>
                <span className="text-[8px] font-normal opacity-75">50k</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await loginDemoUser('admin');
                  closeAuthModal();
                  window.location.href = '/admin';
                }}
                className="py-2 px-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 text-[10px] font-bold text-purple-800 dark:text-purple-300 transition-all flex flex-col items-center justify-center gap-0.5"
              >
                <span>👑 Admin</span>
                <span className="text-[8px] font-normal opacity-75">VIP 200k</span>
              </button>
            </div>

            {/* Quick-fill credentials */}
            <div className="mt-3 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 text-[10px] space-y-1 text-stone-600 dark:text-stone-300">
              <div className="flex items-center justify-between">
                <span>Admin: <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">admin@lovestory.me</code> / <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">Admin@LoveStory2026</code></span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@lovestory.me');
                    setPassword('Admin@LoveStory2026');
                  }}
                  className="text-rose-600 hover:underline font-bold"
                >
                  Điền
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>User: <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">chure@lovestory.me</code> / <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">123456</code></span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('chure@lovestory.me');
                    setPassword('123456');
                  }}
                  className="text-rose-600 hover:underline font-bold"
                >
                  Điền
                </button>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="mt-4 pt-3 flex items-center justify-center gap-4 text-[10px] text-stone-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Miễn phí trọn đời
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Đồng bộ đám mây
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
