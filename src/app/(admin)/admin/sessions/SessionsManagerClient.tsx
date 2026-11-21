'use client';

import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  LogOut,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Crown,
  Zap,
  Gift,
  X,
  UserX,
} from 'lucide-react';

interface SessionItem {
  id: string;
  token: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    plan: string;
  };
}

interface Props {
  initialSessions: SessionItem[];
}

export default function SessionsManagerClient({ initialSessions }: Props) {
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  // Helper function to parse user agent
  const parseDevice = (ua?: string | null) => {
    if (!ua) {
      return {
        deviceType: 'desktop',
        browser: 'Không xác định',
        os: 'Không xác định',
      };
    }

    const isMobile = /mobile|iphone|android|phone/i.test(ua);
    const isTablet = /ipad|tablet/i.test(ua);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    let browser = 'Trình duyệt khác';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';

    let os = 'HĐH khác';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/linux/i.test(ua)) os = 'Linux';

    return { deviceType, browser, os };
  };

  const now = new Date();

  // Compute stats
  const stats = useMemo(() => {
    const active = sessions.filter((s) => new Date(s.expiresAt) > now);
    const expired = sessions.filter((s) => new Date(s.expiresAt) <= now);
    const uniqueActiveUsers = new Set(active.map((s) => s.userId)).size;
    const mobileCount = sessions.filter((s) => parseDevice(s.userAgent).deviceType === 'mobile').length;
    const desktopCount = sessions.filter((s) => parseDevice(s.userAgent).deviceType === 'desktop').length;

    return {
      total: sessions.length,
      activeCount: active.length,
      expiredCount: expired.length,
      uniqueActiveUsers,
      mobileCount,
      desktopCount,
    };
  }, [sessions, now]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const isActive = new Date(s.expiresAt) > now;
      if (statusFilter === 'active' && !isActive) return false;
      if (statusFilter === 'expired' && isActive) return false;
      if (planFilter !== 'all' && s.user.plan !== planFilter) return false;

      const q = search.trim().toLowerCase();
      if (!q) return true;

      const { browser, os } = parseDevice(s.userAgent);
      return (
        s.user.name.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q) ||
        (s.ipAddress && s.ipAddress.toLowerCase().includes(q)) ||
        browser.toLowerCase().includes(q) ||
        os.toLowerCase().includes(q)
      );
    });
  }, [sessions, search, statusFilter, planFilter, now]);

  // Revoke single session
  const handleRevokeSession = async (sessionId: string, userName: string) => {
    if (!confirm(`Bạn có chắc muốn buộc đăng xuất phiên này của ${userName}?`)) return;

    setLoadingId(sessionId);
    setToast(null);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi hủy phiên');

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setToast({ text: `✓ ${data.message}`, type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      setToast({ text: msg, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  // Revoke all sessions for a user
  const handleRevokeAllUserSessions = async (userId: string, userName: string) => {
    if (!confirm(`Buộc đăng xuất toàn bộ thiết bị của người dùng "${userName}"?`)) return;

    setToast(null);
    try {
      const res = await fetch('/api/admin/sessions/revoke-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi thu hồi');

      setSessions((prev) => prev.filter((s) => s.userId !== userId));
      setToast({ text: `✓ ${data.message}`, type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      setToast({ text: msg, type: 'error' });
    }
  };

  // Cleanup expired sessions
  const handleCleanupExpired = async () => {
    setIsCleaning(true);
    setToast(null);
    try {
      const res = await fetch('/api/admin/sessions/cleanup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi dọn dẹp');

      setSessions((prev) => prev.filter((s) => new Date(s.expiresAt) > now));
      setToast({ text: `✓ ${data.message}`, type: 'success' });
      setTimeout(() => setToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      setToast({ text: msg, type: 'error' });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-purple-950/40 border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Bảo Mật &amp; Phiên Đăng Nhập
            </span>
            <span className="text-xs text-stone-400">
              {stats.activeCount} phiên đang kết nối
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Quản Lý Khách Đăng Nhập &amp; Phiên Làm Việc
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Giám sát các thiết bị đang đăng nhập vào hệ thống, địa chỉ IP, trình duyệt, và buộc đăng xuất các phiên lạ hoặc thu hồi quyền truy cập khi cần.
          </p>
        </div>

        <button
          type="button"
          disabled={isCleaning || stats.expiredCount === 0}
          onClick={handleCleanupExpired}
          className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 shrink-0"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>{isCleaning ? 'Đang dọn dẹp...' : `Dọn Dẹp Phiên Hết Hạn (${stats.expiredCount})`}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Sessions */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Phiên Hoạt Động (Online)
            </span>
            <div className="text-2xl font-bold font-serif text-emerald-400">
              {stats.activeCount}
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">
              Trên tổng số {stats.total} phiên được lưu
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Unique Users */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Người Dùng Đang Đăng Nhập
            </span>
            <div className="text-2xl font-bold font-serif text-purple-400">
              {stats.uniqueActiveUsers}
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">
              Tài khoản có phiên còn hiệu lực
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        {/* Mobile vs Desktop */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Phân Loại Thiết Bị
            </span>
            <div className="text-sm font-bold text-white flex items-center gap-3">
              <span className="flex items-center gap-1 text-blue-400">
                <Monitor className="w-3.5 h-3.5" /> {stats.desktopCount} PC
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-pink-400">
                <Smartphone className="w-3.5 h-3.5" /> {stats.mobileCount} Mobile
              </span>
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">
              Dựa trên User Agent của trình duyệt
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* Expired Sessions */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Phiên Đã Hết Hạn
            </span>
            <div className="text-2xl font-bold font-serif text-stone-400">
              {stats.expiredCount}
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">
              Thời hạn lưu tối đa 30 ngày
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center">
            <Clock className="w-5 h-5 text-stone-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, IP, trình duyệt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả phiên</option>
            <option value="active">● Đang hoạt động (Online)</option>
            <option value="expired">○ Đã hết hạn (Offline)</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả gói tài khoản</option>
            <option value="FREE">Gói Free</option>
            <option value="ANNUAL_50K">Gói 1 Năm (50k)</option>
            <option value="LIFETIME_VIP_200K">Gói VIP Trọn Đời (200k)</option>
          </select>

          <span className="text-[11px] text-stone-500 pl-2">
            Hiển thị: <strong className="text-stone-300">{filteredSessions.length}</strong> phiên
          </span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-2xl bg-stone-900/60 border border-stone-800 overflow-hidden shadow-xs">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            Không tìm thấy phiên đăng nhập nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/50 text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Người Dùng</th>
                  <th className="py-3 px-4">Thiết Bị &amp; Trình Duyệt</th>
                  <th className="py-3 px-4">Địa Chỉ IP</th>
                  <th className="py-3 px-4">Thời Gian Đăng Nhập</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác Bảo Mật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50">
                {filteredSessions.map((s) => {
                  const isActive = new Date(s.expiresAt) > now;
                  const { deviceType, browser, os } = parseDevice(s.userAgent);
                  const isBusy = loadingId === s.id;

                  return (
                    <tr key={s.id} className="hover:bg-stone-800/20 transition-colors">
                      {/* User Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white">{s.user.name}</div>
                          {s.user.role === 'ADMIN' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">{s.user.email}</div>
                        <div className="mt-1">
                          {s.user.plan === 'LIFETIME_VIP_200K' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                              <Crown className="w-2.5 h-2.5" /> VIP 200k
                            </span>
                          )}
                          {s.user.plan === 'ANNUAL_50K' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-bold">
                              <Zap className="w-2.5 h-2.5" /> Gói 50k
                            </span>
                          )}
                          {s.user.plan === 'FREE' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-stone-400">
                              <Gift className="w-2.5 h-2.5" /> Free (300 views)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Device & Browser */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {deviceType === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-pink-400 shrink-0" />
                          ) : deviceType === 'tablet' ? (
                            <Tablet className="w-4 h-4 text-purple-400 shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
                          )}
                          <div>
                            <span className="font-medium text-stone-200">
                              {browser} on {os}
                            </span>
                            <span className="text-[10px] text-stone-500 block capitalize">
                              {deviceType === 'desktop' ? 'Máy tính để bàn/Laptop' : 'Điện thoại di động'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 font-mono text-stone-300 text-[11px]">
                        {s.ipAddress || '127.0.0.1 (Local)'}
                      </td>

                      {/* Login Time & Expiry */}
                      <td className="py-3.5 px-4">
                        <div className="text-stone-300 font-medium">
                          {new Date(s.createdAt).toLocaleString('vi-VN')}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          Hết hạn: {new Date(s.expiresAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Đang Hoạt Động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-500 border border-stone-700 text-[10px] font-medium">
                            Đã Hết Hạn
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Force Logout this session */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRevokeSession(s.id, s.user.name)}
                            title="Buộc đăng xuất khỏi thiết bị này"
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Đăng Xuất</span>
                          </button>

                          {/* Revoke all sessions of this user */}
                          <button
                            type="button"
                            onClick={() => handleRevokeAllUserSessions(s.userId, s.user.name)}
                            title="Đăng xuất khỏi tất cả thiết bị của tài khoản này"
                            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
