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

    return { deviceType, browser, os };
  };

  const now = new Date();

  // Summary Metrics
  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => new Date(s.expiresAt) > now);
    const activeCount = active.length;
    const expiredCount = total - activeCount;

    const uniqueActiveUsers = new Set(active.map((s) => s.userId)).size;

    let desktopCount = 0;
    let mobileCount = 0;

    active.forEach((s) => {
      const { deviceType } = parseDevice(s.userAgent);
      if (deviceType === 'desktop') desktopCount++;
      else mobileCount++;
    });

    return {
      total,
      activeCount,
      expiredCount,
      uniqueActiveUsers,
      desktopCount,
      mobileCount,
    };
  }, [sessions, now]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const isActive = new Date(s.expiresAt) > now;
      if (statusFilter === 'active' && !isActive) return false;
      if (statusFilter === 'expired' && isActive) return false;

      if (planFilter !== 'all' && s.user.plan !== planFilter) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const { browser, os } = parseDevice(s.userAgent);
        const matchName = s.user.name.toLowerCase().includes(q);
        const matchEmail = s.user.email.toLowerCase().includes(q);
        const matchIp = (s.ipAddress || '').toLowerCase().includes(q);
        const matchUa = `${browser} ${os}`.toLowerCase().includes(q);
        return matchName || matchEmail || matchIp || matchUa;
      }

      return true;
    });
  }, [sessions, statusFilter, planFilter, search, now]);

  // Revoke a single session
  const handleRevokeSession = async (sessionId: string, userName: string) => {
    if (!confirm(`Xác nhận đăng xuất phiên của người dùng "${userName}"?`)) return;

    setLoadingId(sessionId);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/revoke`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi khi thu hồi phiên');

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setToast({ text: `Đã buộc đăng xuất thành công phiên của ${userName}`, type: 'success' });
      setTimeout(() => setToast(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa phiên';
      setToast({ text: msg, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  // Revoke all sessions for a user
  const handleRevokeAllUserSessions = async (userId: string, userName: string) => {
    if (!confirm(`Xác nhận đăng xuất TẤT CẢ các thiết bị của "${userName}"?`)) return;

    try {
      const res = await fetch('/api/admin/sessions/revoke-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi khi thu hồi toàn bộ phiên');

      setSessions((prev) => prev.filter((s) => s.userId !== userId));
      setToast({ text: data.message, type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      setToast({ text: msg, type: 'error' });
    }
  };

  // Cleanup expired sessions
  const handleCleanupExpired = async () => {
    if (!confirm('Dọn dẹp tất cả các phiên đăng nhập đã hết hạn khỏi cơ sở dữ liệu?')) return;

    setIsCleaning(true);
    try {
      const res = await fetch('/api/admin/sessions/cleanup', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi khi dọn dẹp');

      setSessions((prev) => prev.filter((s) => new Date(s.expiresAt) > now));
      setToast({ text: data.message, type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi dọn dẹp';
      setToast({ text: msg, type: 'error' });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 border shadow-2xs ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              Bảo mật &amp; Phiên đăng nhập
            </span>
            <span className="text-xs text-stone-400 font-mono">
              {stats.activeCount} phiên đang kết nối
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Quản Lý Khách Đăng Nhập &amp; Phiên Làm Việc
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Giám sát các thiết bị đang đăng nhập vào hệ thống, địa chỉ IP, trình duyệt và buộc đăng xuất các phiên lạ khi cần.
          </p>
        </div>

        <button
          type="button"
          disabled={isCleaning || stats.expiredCount === 0}
          onClick={handleCleanupExpired}
          className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-40 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-stone-500" />
          <span>{isCleaning ? 'Đang dọn dẹp...' : `Dọn dẹp phiên hết hạn (${stats.expiredCount})`}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Sessions */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1">
              Phiên hoạt động (Online)
            </span>
            <div className="text-2xl font-serif font-bold text-stone-900 font-mono">
              {stats.activeCount}
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Trên tổng số {stats.total} phiên được lưu
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Unique Users */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1">
              Người dùng đang đăng nhập
            </span>
            <div className="text-2xl font-serif font-bold text-stone-900 font-mono">
              {stats.uniqueActiveUsers}
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Tài khoản có phiên còn hiệu lực
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-stone-700" />
          </div>
        </div>

        {/* Mobile vs Desktop */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1">
              Phân loại thiết bị
            </span>
            <div className="text-xs font-semibold text-stone-800 flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-stone-700">
                <Monitor className="w-3.5 h-3.5 text-stone-500" /> {stats.desktopCount} PC
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-700">
                <Smartphone className="w-3.5 h-3.5 text-stone-500" /> {stats.mobileCount} Mobile
              </span>
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Theo User Agent trình duyệt
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
            <Globe className="w-4 h-4 text-stone-700" />
          </div>
        </div>

        {/* Expired Sessions */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1">
              Phiên đã hết hạn
            </span>
            <div className="text-2xl font-serif font-bold text-stone-500 font-mono">
              {stats.expiredCount}
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Thời hạn lưu tối đa 30 ngày
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, IP, trình duyệt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-700 focus:bg-white focus:outline-none focus:border-stone-900"
          >
            <option value="all">Tất cả phiên</option>
            <option value="active">Đang hoạt động (Online)</option>
            <option value="expired">Đã hết hạn (Offline)</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-700 focus:bg-white focus:outline-none focus:border-stone-900"
          >
            <option value="all">Tất cả gói tài khoản</option>
            <option value="FREE">Gói Free</option>
            <option value="ANNUAL_50K">Gói 1 Năm (50k)</option>
            <option value="LIFETIME_VIP_200K">Gói VIP Trọn Đời (200k)</option>
          </select>

          <span className="text-[11px] text-stone-500 pl-2">
            Hiển thị: <strong className="text-stone-900">{filteredSessions.length}</strong> phiên
          </span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            Không tìm thấy phiên đăng nhập nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/90 bg-stone-50/70 text-stone-600 font-medium text-[11px]">
                  <th className="py-3 px-4">Người dùng</th>
                  <th className="py-3 px-4">Thiết bị &amp; Trình duyệt</th>
                  <th className="py-3 px-4">Địa chỉ IP</th>
                  <th className="py-3 px-4">Thời gian đăng nhập</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSessions.map((s) => {
                  const isActive = new Date(s.expiresAt) > now;
                  const { deviceType, browser, os } = parseDevice(s.userAgent);
                  const isBusy = loadingId === s.id;

                  return (
                    <tr key={s.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* User Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-stone-900">{s.user.name}</div>
                          {s.user.role === 'ADMIN' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-mono">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">{s.user.email}</div>
                        <div className="mt-1">
                          {s.user.plan === 'LIFETIME_VIP_200K' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              <Crown className="w-3 h-3 text-amber-600" /> VIP 200k
                            </span>
                          )}
                          {s.user.plan === 'ANNUAL_50K' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-sky-800 font-medium bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                              <Zap className="w-3 h-3 text-sky-600" /> Gói 50k
                            </span>
                          )}
                          {s.user.plan === 'FREE' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/60">
                              <Gift className="w-3 h-3 text-stone-400" /> Free (300 views)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Device & Browser */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {deviceType === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-stone-500 shrink-0" />
                          ) : deviceType === 'tablet' ? (
                            <Tablet className="w-4 h-4 text-stone-500 shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 text-stone-500 shrink-0" />
                          )}
                          <div>
                            <span className="font-medium text-stone-800">
                              {browser} trên {os}
                            </span>
                            <span className="text-[10px] text-stone-400 block capitalize">
                              {deviceType === 'desktop' ? 'Máy tính để bàn/Laptop' : 'Điện thoại di động'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 font-mono text-stone-600 text-[11px]">
                        {s.ipAddress || '127.0.0.1 (Local)'}
                      </td>

                      {/* Login Time & Expiry */}
                      <td className="py-3.5 px-4">
                        <div className="text-stone-800 font-medium">
                          {new Date(s.createdAt).toLocaleString('vi-VN')}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          Hết hạn: {new Date(s.expiresAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200 text-[10px] font-medium">
                            Đã hết hạn
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
                            className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Đăng xuất</span>
                          </button>

                          {/* Revoke all sessions of this user */}
                          <button
                            type="button"
                            onClick={() => handleRevokeAllUserSessions(s.userId, s.user.name)}
                            title="Đăng xuất khỏi tất cả thiết bị của tài khoản này"
                            className="p-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
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
