'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Crown,
  Zap,
  Gift,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'ANNUAL_50K' | 'LIFETIME_VIP_200K';
  createdAt: string;
  sites: { id: string; title: string; slug: string; status: string; viewCount: number }[];
  purchasedTemplates: { templateId: string }[];
  sessions: {
    id: string;
    createdAt: string;
    expiresAt: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }[];
}

export default function UsersManagerClient({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  const now = new Date();

  const handleUpdate = async (userId: string, data: { plan?: string; role?: string }) => {
    setLoadingId(userId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Cập nhật thất bại');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? ({ ...u, ...data } as UserData) : u))
      );
      setMessage({ text: 'Cập nhật tài khoản thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRevokeUserSessions = async (userId: string, userName: string) => {
    if (!confirm(`Bạn có chắc muốn đăng xuất tất cả thiết bị của người dùng "${userName}"?`)) return;

    setLoadingId(userId);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/sessions/revoke-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi thu hồi');

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, sessions: [] } : u))
      );
      setMessage({ text: `✓ ${data.message}`, type: 'success' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-800 bg-stone-900/60 text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span>
            Hiển thị: <span className="font-bold text-white">{filteredUsers.length}</span> / {users.length} thành viên
          </span>
          <Link
            href="/admin/sessions"
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-semibold transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Xem Toàn Bộ Phiên Đăng Nhập &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Message notification */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-stone-900/60 border border-stone-800/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/40 text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Thành Viên</th>
                <th className="py-3 px-4">Gói Dịch Vụ</th>
                <th className="py-3 px-4">Vai Trò</th>
                <th className="py-3 px-4">Thiệp Đã Tạo</th>
                <th className="py-3 px-4">Trạng Thái Đăng Nhập</th>
                <th className="py-3 px-4 text-right">Tác Vụ Nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/50">
              {filteredUsers.map((u) => {
                const isLoading = loadingId === u.id;
                const activeSessions = u.sessions.filter((s) => new Date(s.expiresAt) > now);
                const latestSession = u.sessions[0];

                return (
                  <tr key={u.id} className="hover:bg-stone-800/20 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-200">{u.name}</div>
                          <div className="text-[11px] text-stone-400 font-mono">{u.email}</div>
                          {u.phone && (
                            <div className="text-[10px] text-stone-500 font-mono mt-0.5">{u.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        disabled={isLoading}
                        value={u.plan}
                        onChange={(e) => handleUpdate(u.id, { plan: e.target.value })}
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none ${
                          u.plan === 'LIFETIME_VIP_200K'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : u.plan === 'ANNUAL_50K'
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                            : 'bg-stone-800/60 border-stone-700 text-stone-300'
                        }`}
                      >
                        <option value="FREE" className="bg-stone-900 text-stone-300">
                          🎁 FREE (300 views)
                        </option>
                        <option value="ANNUAL_50K" className="bg-stone-900 text-blue-300">
                          ⚡ GÓI 1 NĂM (50.000đ)
                        </option>
                        <option value="LIFETIME_VIP_200K" className="bg-stone-900 text-amber-300">
                          👑 VIP TRỌN ĐỜI (200.000đ)
                        </option>
                      </select>
                    </td>

                    {/* Role Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        disabled={isLoading}
                        value={u.role}
                        onChange={(e) => handleUpdate(u.id, { role: e.target.value })}
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : 'bg-stone-800/60 border-stone-700 text-stone-400'
                        }`}
                      >
                        <option value="USER" className="bg-stone-900 text-stone-400">
                          USER (Cặp đôi)
                        </option>
                        <option value="ADMIN" className="bg-stone-900 text-purple-300">
                          ADMIN (Quản trị)
                        </option>
                      </select>
                    </td>

                    {/* Sites Count */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-300">
                        {u.sites.length} thiệp
                      </span>
                    </td>

                    {/* Login & Session Status */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {activeSessions.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-emerald-400 font-bold text-[11px]">
                              {activeSessions.length} thiết bị online
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-500 text-[11px]">
                            Offline
                          </span>
                        )}

                        {latestSession && (
                          <div className="text-[10px] text-stone-500">
                            Gần nhất: {new Date(latestSession.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {activeSessions.length > 0 && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleRevokeUserSessions(u.id, u.name)}
                            title="Đăng xuất khỏi tất cả thiết bị"
                            className="px-2 py-1 rounded-lg bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/25 text-[10px] font-semibold flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Đăng xuất ({activeSessions.length})</span>
                          </button>
                        )}

                        {u.plan === 'FREE' && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleUpdate(u.id, { plan: 'LIFETIME_VIP_200K' })}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                          >
                            <Crown className="w-3 h-3" />
                            <span>Nâng VIP</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
