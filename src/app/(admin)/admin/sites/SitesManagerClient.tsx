'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Search,
  Eye,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  Pencil,
  Save,
} from 'lucide-react';

interface SiteData {
  id: string;
  slug: string;
  title: string;
  status: string;
  viewCount: number;
  maxViews: number;
  activeExpiresAt?: string | null;
  backupExpiresAt?: string | null;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    plan: string;
  };
  template: {
    id: string;
    name: string;
    tier: string;
  };
  rsvps: { id: string }[];
  wishes: { id: string }[];
}

export default function SitesManagerClient({ initialSites }: { initialSites: SiteData[] }) {
  const [sites, setSites] = useState<SiteData[]>(initialSites);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSweeping, setIsSweeping] = useState(false);

  // Edit Site Modal (Admin)
  const [editingSite, setEditingSite] = useState<SiteData | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editMaxViews, setEditMaxViews] = useState(300);
  const [editViewCount, setEditViewCount] = useState(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleStartEdit = (site: SiteData) => {
    setEditingSite(site);
    setEditTitle(site.title);
    setEditSlug(site.slug);
    setEditStatus(site.status);
    setEditMaxViews(site.maxViews);
    setEditViewCount(site.viewCount);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;
    setIsSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/sites/${editingSite.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          slug: editSlug.trim(),
          status: editStatus,
          maxViews: Number(editMaxViews),
          viewCount: Number(editViewCount),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Cập nhật thất bại');

      setSites((prev) =>
        prev.map((s) => (s.id === editingSite.id ? { ...s, ...data.site } : s))
      );
      setToast({ text: `Đã cập nhật thành công thiệp "/${data.site.slug}"!`, type: 'success' });
      setEditingSite(null);
      setTimeout(() => setToast(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật';
      alert(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filtered Sites
  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchPlan = planFilter === 'all' || s.owner.plan === planFilter;
      const q = search.trim().toLowerCase();
      const matchQ =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.owner.name.toLowerCase().includes(q) ||
        s.owner.email.toLowerCase().includes(q);
      return matchStatus && matchPlan && matchQ;
    });
  }, [sites, statusFilter, planFilter, search]);

  // Update Status
  const handleUpdateStatus = async (siteId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Cập nhật thất bại');

      setSites((prev) => prev.map((s) => (s.id === siteId ? { ...s, status } : s)));
      setToast({ text: `Đã chuyển trạng thái thiệp sang ${status}`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật';
      setToast({ text: msg, type: 'error' });
    }
  };

  // Unlock Unlimited Views
  const handleUnlockViews = async (siteId: string) => {
    try {
      const res = await fetch(`/api/admin/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxViews: -1, status: 'ACTIVE' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi mở khóa');

      setSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, maxViews: -1, status: 'ACTIVE' } : s))
      );
      setToast({ text: 'Đã mở khóa không giới hạn lượt xem (∞) cho thiệp này!', type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      setToast({ text: msg, type: 'error' });
    }
  };

  // Reset View Count
  const handleResetViews = async (siteId: string) => {
    if (!confirm('Bạn có muốn đặt lại số lượt xem của thiệp này về 0?')) return;

    try {
      const res = await fetch(`/api/admin/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewCount: 0 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi');

      setSites((prev) => prev.map((s) => (s.id === siteId ? { ...s, viewCount: 0 } : s)));
      setToast({ text: 'Đã đặt lại lượt xem về 0', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi';
      setToast({ text: msg, type: 'error' });
    }
  };

  // Delete Site
  const handleDeleteSite = async (siteId: string, title: string) => {
    if (!confirm(`Xác nhận xóa vĩnh viễn thiệp cưới "${title}" khỏi hệ thống?`)) return;

    try {
      const res = await fetch(`/api/admin/sites/${siteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi khi xóa');

      setSites((prev) => prev.filter((s) => s.id !== siteId));
      setToast({ text: `Đã xóa thiệp "${title}" thành công!`, type: 'success' });
      setTimeout(() => setToast(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa';
      setToast({ text: msg, type: 'error' });
    }
  };

  // Trigger Lifecycle Sweep
  const handleSweep = async () => {
    setIsSweeping(true);
    try {
      const res = await fetch('/api/admin/sites/sweep', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi quét');

      setToast({ text: data.message, type: 'success' });
      setTimeout(() => setToast(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi quét';
      setToast({ text: msg, type: 'error' });
    } finally {
      setIsSweeping(false);
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

      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              Quản lý thiệp cưới
            </span>
            <span className="text-xs text-stone-400 font-mono">Quy tắc vòng đời lưu trữ</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Quản Lý Thiệp Cưới &amp; Vòng Đời Lưu Trữ
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi trạng thái phát hành, hạn mức lượt xem (Free: 300 views), tự động chuyển Backup 1 tháng và lưu kho.
          </p>
        </div>

        <button
          type="button"
          disabled={isSweeping}
          onClick={handleSweep}
          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
          <span>Quét vòng đời lưu trữ</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên thiệp, slug, chủ sở hữu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-700 focus:bg-white focus:outline-none focus:border-stone-900"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động (Active)</option>
            <option value="EXPIRED_BACKUP">Đang Backup DB (30 ngày)</option>
            <option value="ARCHIVED">Đã lưu kho (Archived)</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-700 focus:bg-white focus:outline-none focus:border-stone-900"
          >
            <option value="all">Tất cả gói tài khoản</option>
            <option value="FREE">Gói Free (300 views)</option>
            <option value="ANNUAL_50K">Gói 1 Năm (50k)</option>
            <option value="LIFETIME_VIP_200K">Gói VIP Trọn Đời (200k)</option>
          </select>
        </div>
      </div>

      {/* Sites Table */}
      <div className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        {filteredSites.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            Không tìm thấy thiệp cưới nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/90 bg-stone-50/70 text-stone-600 font-medium text-[11px]">
                  <th className="py-3 px-4">Thiệp cưới</th>
                  <th className="py-3 px-4">Chủ sở hữu</th>
                  <th className="py-3 px-4">Template &amp; Tương tác</th>
                  <th className="py-3 px-4">Lượt xem</th>
                  <th className="py-3 px-4">Vòng đời</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSites.map((site) => {
                  const isFree = site.owner.plan === 'FREE';
                  const isReachedLimit = isFree && site.viewCount >= 300;

                  return (
                    <tr key={site.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-900">{site.title}</div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          /{site.slug}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-900">{site.owner.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{site.owner.email}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 border border-stone-200/60">
                          {site.owner.plan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-800 block">{site.template.name}</span>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          {site.wishes.length} lời chúc • {site.rsvps.length} RSVP
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Eye className="w-3.5 h-3.5 text-stone-400" />
                          <span
                            className={
                              isReachedLimit
                                ? 'text-rose-600 font-bold'
                                : 'text-stone-900 font-medium'
                            }
                          >
                            {site.viewCount}
                          </span>
                          <span className="text-stone-400">
                            / {site.maxViews === -1 ? '∞' : `${site.maxViews}`}
                          </span>
                        </div>
                        {isFree && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleUnlockViews(site.id)}
                              className="text-stone-900 hover:underline font-medium"
                            >
                              Mở ∞ views
                            </button>
                            <span className="text-stone-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleResetViews(site.id)}
                              className="text-stone-500 hover:text-stone-800"
                            >
                              Đặt lại 0
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {site.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                            Đang hoạt động
                          </span>
                        )}
                        {site.status === 'EXPIRED_BACKUP' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                            Backup (+30 ngày)
                          </span>
                        )}
                        {site.status === 'ARCHIVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-medium">
                            Đã lưu kho
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {site.status !== 'ACTIVE' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(site.id, 'ACTIVE')}
                              className="px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-medium transition-colors"
                            >
                              Mở lại
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(site.id, 'EXPIRED_BACKUP')}
                              className="px-2.5 py-1 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-[11px] font-medium transition-colors"
                            >
                              Chuyển Backup
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEdit(site)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                            title="Chỉnh sửa Tên thiệp & Đường dẫn Slug"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/${site.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                            title="Xem trang web thiệp cưới"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteSite(site.id, site.title)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Xóa thiệp cưới"
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
        )}
      </div>

      {/* Modal Chỉnh sửa Tên & Đường dẫn Slug dành cho Admin */}
      {editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-2xs">
          <div className="relative w-full max-w-lg bg-white border border-stone-200/90 rounded-2xl shadow-xl p-6 space-y-5 text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Quản trị thiệp cưới
                </span>
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2 mt-0.5">
                  <Pencil className="w-4 h-4 text-stone-600" />
                  <span>Sửa đường dẫn &amp; thông tin thiệp</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSite(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-stone-700 block">Tên thiệp cưới</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-stone-700 block">Đường dẫn công khai (Slug)</label>
                <div className="flex items-center rounded-xl bg-stone-50/60 border border-stone-200 overflow-hidden focus-within:border-stone-900 focus-within:bg-white">
                  <span className="px-3 py-2 bg-stone-100 text-stone-500 font-mono text-xs border-r border-stone-200 shrink-0">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) =>
                      setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                    }
                    className="w-full bg-transparent px-3 py-2 text-xs text-stone-900 font-mono outline-none"
                  />
                </div>
                <span className="text-[11px] text-stone-500">
                  Liên kết: /{editSlug} (Chỉ gồm chữ cái thường, số và dấu gạch nối)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-stone-700 block">Trạng thái</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="EXPIRED_BACKUP">Backup (+30 ngày)</option>
                    <option value="ARCHIVED">Lưu kho (ARCHIVED)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-stone-700 block">Giới hạn lượt xem</label>
                  <input
                    type="number"
                    value={editMaxViews}
                    onChange={(e) => setEditMaxViews(Number(e.target.value))}
                    className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                  />
                  <span className="text-[10px] text-stone-400 block">-1 = Không giới hạn (VIP)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 space-y-0.5">
                <div>Chủ sở hữu: <strong className="text-stone-900">{editingSite.owner.name} ({editingSite.owner.email})</strong></div>
                <div>Gói cước: <span className="font-medium text-stone-900">{editingSite.owner.plan}</span></div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200/80">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium text-xs transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
