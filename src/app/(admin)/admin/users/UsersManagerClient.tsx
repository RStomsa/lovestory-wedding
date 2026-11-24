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
  Trash2,
  UserPlus,
  Eye,
  X,
  ExternalLink,
  Lock,
  RefreshCw,
  Phone,
  Mail,
  User as UserIcon,
} from 'lucide-react';

interface SiteItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'ANNUAL_50K' | 'LIFETIME_VIP_200K';
  createdAt: string;
  sites: SiteItem[];
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

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER' as 'USER' | 'ADMIN',
    plan: 'FREE' as 'FREE' | 'ANNUAL_50K' | 'LIFETIME_VIP_200K',
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Reset Password Modal
  const [resetPasswordUser, setResetPasswordUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Delete User Modal
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // View User Sites Modal
  const [viewingSitesUser, setViewingSitesUser] = useState<UserData | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  const now = new Date();

  // Helper notification
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Update User Plan or Role
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
      showToast('Cập nhật tài khoản thành công!', 'success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      showToast(errorMsg, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  // Revoke user sessions
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
      showToast(`Đã thu hồi tất cả phiên đăng nhập của ${userName}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      showToast(msg, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  // Create New User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.email.trim() || !newUserData.password.trim()) {
      showToast('Vui lòng điền họ tên, email và mật khẩu', 'error');
      return;
    }

    setIsCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi tạo tài khoản');
      }

      setUsers((prev) => [data.user, ...prev]);
      setShowCreateModal(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'USER',
        plan: 'FREE',
      });
      showToast(data.message || 'Đã tạo tài khoản mới thành công!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      showToast(msg, 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Reset User Password
  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPassword.trim()) {
      showToast('Vui lòng nhập mật khẩu mới', 'error');
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${resetPasswordUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi đặt lại mật khẩu');
      }

      setResetPasswordUser(null);
      setNewPassword('');
      showToast(`Đã đổi mật khẩu thành công cho ${resetPasswordUser.name}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      showToast(msg, 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Generate random password helper
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'LS@';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  // Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi xóa tài khoản');
      }

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      showToast(data.message || 'Đã xóa tài khoản vĩnh viễn', 'success');
      setUserToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      showToast(msg, 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            Quản lý vai trò (Admin / User), nâng cấp gói thành viên, đặt lại mật khẩu, xóa tài khoản và kiểm soát phiên đăng nhập.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm thành viên mới</span>
          </button>

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
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-150 ${
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
      <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/90 bg-stone-50/70 text-stone-600 font-medium text-[11px]">
                <th className="py-3.5 px-4">Thành viên</th>
                <th className="py-3.5 px-4">Gói dịch vụ</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Thiệp đã tạo</th>
                <th className="py-3.5 px-4">Trạng thái đăng nhập</th>
                <th className="py-3.5 px-4 text-right">Tác vụ quản lý</th>
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
                          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'ADMIN' && (
                              <span className="px-1.5 py-0.2 rounded bg-stone-900 text-white text-[9px] font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
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
                        className={`py-1 px-2.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none cursor-pointer ${
                          u.plan === 'LIFETIME_VIP_200K'
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                            : u.plan === 'ANNUAL_50K'
                            ? 'bg-sky-50 border-sky-300 text-sky-900 font-medium'
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
                        className={`py-1 px-2.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none cursor-pointer ${
                          u.role === 'ADMIN'
                            ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        <option value="USER">Khách hàng</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </td>

                    {/* Sites Count with Clickable Inspection */}
                    <td className="py-3.5 px-4">
                      {u.sites.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setViewingSitesUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Xem danh sách thiệp đã tạo"
                        >
                          <Eye className="w-3 h-3 text-stone-600" />
                          <span>{u.sites.length} thiệp cưới</span>
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px]">0 thiệp</span>
                      )}
                    </td>

                    {/* Login & Session Status */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {activeSessions.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-700 font-semibold text-[11px]">
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
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setResetPasswordUser(u);
                            setNewPassword('');
                          }}
                          title="Đổi mật khẩu tài khoản"
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Revoke Sessions */}
                        {activeSessions.length > 0 && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleRevokeUserSessions(u.id, u.name)}
                            title="Đăng xuất khỏi tất cả thiết bị"
                            className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Đăng xuất ({activeSessions.length})</span>
                          </button>
                        )}

                        {/* Upgrade VIP */}
                        {u.plan === 'FREE' && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleUpdate(u.id, { plan: 'LIFETIME_VIP_200K' })}
                            className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-2xs"
                            title="Nâng cấp tài khoản lên VIP trọn đời"
                          >
                            <Crown className="w-3 h-3 text-amber-300" />
                            <span>Nâng VIP</span>
                          </button>
                        )}

                        {/* Delete User Button */}
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          title="Xóa tài khoản này"
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE NEW USER */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Quản trị tài khoản
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                  Thêm Thành Viên Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="Nguyễn Văn An"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="an.nguyen@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Số điện thoại (tùy chọn)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Gói dịch vụ</label>
                  <select
                    value={newUserData.plan}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        plan: e.target.value as 'FREE' | 'ANNUAL_50K' | 'LIFETIME_VIP_200K',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                  >
                    <option value="FREE">Miễn phí (300 views)</option>
                    <option value="ANNUAL_50K">Gói 1 Năm (50.000 đ)</option>
                    <option value="LIFETIME_VIP_200K">VIP Trọn Đời (200.000 đ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Vai trò</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, role: e.target.value as 'USER' | 'ADMIN' })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                  >
                    <option value="USER">Khách hàng</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreatingUser ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>Xác nhận tạo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RESET PASSWORD */}
      {/* ======================================================== */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Bảo mật tài khoản
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                  Đổi Mật Khẩu Thành Viên
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-1">
              <div className="text-stone-500">Tài khoản:</div>
              <div className="font-bold text-stone-900">{resetPasswordUser.name}</div>
              <div className="font-mono text-stone-600">{resetPasswordUser.email}</div>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-700 block">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    ⚡ Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isResettingPassword ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5" />
                  )}
                  <span>Lưu mật khẩu mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE USER CONFIRMATION */}
      {/* ======================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-stone-900">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Xác Nhận Xóa Tài Khoản
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của{' '}
                <strong className="text-stone-900 font-bold">{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cảnh báo dữ liệu:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-800/90 space-y-0.5">
                <li>Tài khoản đang sở hữu <strong>{userToDelete.sites.length} thiệp cưới</strong>.</li>
                <li>Toàn bộ phiên đăng nhập ({userToDelete.sessions.length} phiên) sẽ bị hủy ngay lập tức.</li>
                <li>Toàn bộ thiệp cưới công khai và đơn hàng của tài khoản này sẽ bị xóa khỏi cơ sở dữ liệu.</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeletingUser ? 'Đang xóa...' : 'Xóa vĩnh viễn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: VIEW USER SITES */}
      {/* ======================================================== */}
      {viewingSitesUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-stone-900 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Thiệp cưới của khách hàng
                </span>
                <h3 className="text-base font-serif font-bold text-stone-900 mt-0.5">
                  {viewingSitesUser.name} ({viewingSitesUser.sites.length} thiệp)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingSitesUser(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {viewingSitesUser.sites.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  Khách hàng chưa tạo thiệp cưới nào.
                </div>
              ) : (
                viewingSitesUser.sites.map((site) => (
                  <div
                    key={site.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-stone-900">{site.title}</div>
                      <div className="text-[11px] font-mono text-rose-600 mt-0.5">
                        /{site.slug}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-2">
                        <span>Trạng thái: <strong>{site.status}</strong></span>
                        <span>•</span>
                        <span>Lượt xem: <strong>{site.viewCount}</strong></span>
                      </div>
                    </div>

                    <a
                      href={`/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                    >
                      <span>Xem thiệp</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 text-right shrink-0">
              <button
                type="button"
                onClick={() => setViewingSitesUser(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
