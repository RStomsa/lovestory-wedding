'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Crown,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  LogOut,
  Users,
  CheckCircle2,
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
      setMessage({ text: `Đã thu hồi tất cả phiên đăng nhập của ${userName}`, type: 'success' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              Quản trị người dùng
            </span>
            <span className="text-xs text-stone-400 font-mono">Cơ sở dữ liệu thực</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Quản Lý Thành Viên &amp; Phân Quyền
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Quản lý vai trò (Admin / User), nâng cấp gói thành viên trực tiếp, kiểm soát phiên đăng nhập và bảo mật tài khoản.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/sessions"
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium border border-stone-200/90 transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-stone-600" />
            <span>Xem phiên đăng nhập</span>
          </Link>
        </div>
      </div>

      {/* Search Bar & Summary */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50/60 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
          />
        </div>

        <div className="text-xs text-stone-500">
          Hiển thị <span className="font-semibold text-stone-900">{filteredUsers.length}</span> / {users.length} tài khoản
        </div>
      </div>

      {/* Message notification */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/90 bg-stone-50/70 text-stone-600 font-medium text-[11px]">
                <th className="py-3 px-4">Thành viên</th>
                <th className="py-3 px-4">Gói dịch vụ</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Thiệp đã tạo</th>
                <th className="py-3 px-4">Trạng thái đăng nhập</th>
                <th className="py-3 px-4 text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.map((u) => {
                const isLoading = loadingId === u.id;
                const activeSessions = u.sessions.filter((s) => new Date(s.expiresAt) > now);
                const latestSession = u.sessions[0];

                return (
                  <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200/60 text-rose-700 font-semibold flex items-center justify-center shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-stone-900">{u.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{u.email}</div>
                          {u.phone && (
                            <div className="text-[10px] text-stone-400 font-mono mt-0.5">{u.phone}</div>
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
                        className={`py-1 px-2.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none ${
                          u.plan === 'LIFETIME_VIP_200K'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : u.plan === 'ANNUAL_50K'
                            ? 'bg-sky-50 border-sky-200 text-sky-900'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        <option value="FREE">Miễn phí (300 views)</option>
                        <option value="ANNUAL_50K">Gói 1 Năm (50.000 đ)</option>
                        <option value="LIFETIME_VIP_200K">VIP Trọn Đời (200.000 đ)</option>
                      </select>
                    </td>

                    {/* Role Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        disabled={isLoading}
                        value={u.role}
                        onChange={(e) => handleUpdate(u.id, { role: e.target.value })}
                        className={`py-1 px-2.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none ${
                          u.role === 'ADMIN'
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        <option value="USER">Khách hàng</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </td>

                    {/* Sites Count */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-stone-800">
                        {u.sites.length} thiệp
                      </span>
                    </td>

                    {/* Login & Session Status */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {activeSessions.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-emerald-700 font-medium text-[11px]">
                              {activeSessions.length} thiết bị online
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">
                            Ngoại tuyến
                          </span>
                        )}

                        {latestSession && (
                          <div className="text-[10px] text-stone-400">
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
                            className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
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
                            className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Crown className="w-3 h-3 text-amber-300" />
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
