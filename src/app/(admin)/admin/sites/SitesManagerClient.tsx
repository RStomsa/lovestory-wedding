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
  Filter,
  X,
  Clock,
  Sparkles,
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
      setToast({ text: `✓ Đã chuyển trạng thái thiệp sang ${status}`, type: 'success' });
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
      setToast({ text: '✓ Đã mở khóa không giới hạn lượt xem (∞) cho thiệp này!', type: 'success' });
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
      setToast({ text: '✓ Đã reset lượt xem về 0', type: 'success' });
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
      setToast({ text: `✓ Đã xóa thiệp "${title}" thành công!`, type: 'success' });
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

      setToast({ text: `✓ ${data.message}`, type: 'success' });
      setTimeout(() => setToast(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi quét';
      setToast({ text: msg, type: 'error' });
    } finally {
      setIsSweeping(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
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
            <span>{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên thiệp, slug, chủ sở hữu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">● Đang Hoạt Động (Active)</option>
            <option value="EXPIRED_BACKUP">⏳ Đang Backup DB (30 ngày)</option>
            <option value="ARCHIVED">📦 Đã Lưu Kho (Archived)</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả gói tài khoản</option>
            <option value="FREE">Gói Free (300 views)</option>
            <option value="ANNUAL_50K">Gói 1 Năm (50k)</option>
            <option value="LIFETIME_VIP_200K">Gói VIP Trọn Đời (200k)</option>
          </select>

          <button
            type="button"
            disabled={isSweeping}
            onClick={handleSweep}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>Quét Vòng Đời Tự Động</span>
          </button>
        </div>
      </div>

      {/* Sites Table */}
      <div className="rounded-2xl bg-stone-900/60 border border-stone-800 overflow-hidden shadow-xs">
        {filteredSites.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            Không tìm thấy thiệp cưới nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/50 text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Thiệp Cưới &amp; Cặp Đôi</th>
                  <th className="py-3 px-4">Chủ Sở Hữu</th>
                  <th className="py-3 px-4">Template &amp; Tương Tác</th>
                  <th className="py-3 px-4">Lượt Xem (Views)</th>
                  <th className="py-3 px-4">Vòng Đời Lưu Trữ</th>
                  <th className="py-3 px-4 text-right">Thao Tác Quản Trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50">
                {filteredSites.map((site) => {
                  const isFree = site.owner.plan === 'FREE';
                  const isReachedLimit = isFree && site.viewCount >= 300;

                  return (
                    <tr key={site.id} className="hover:bg-stone-800/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{site.title}</div>
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                          /{site.slug}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-200">{site.owner.name}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{site.owner.email}</div>
                        <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-stone-800 text-stone-300">
                          {site.owner.plan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-stone-300 block">{site.template.name}</span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">
                          {site.wishes.length} lời chúc • {site.rsvps.length} RSVP
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Eye className="w-3.5 h-3.5 text-stone-500" />
                          <span
                            className={
                              isReachedLimit
                                ? 'text-rose-400 font-black'
                                : 'text-stone-200'
                            }
                          >
                            {site.viewCount}
                          </span>
                          <span className="text-stone-500 font-normal">
                            / {site.maxViews === -1 ? '∞' : `${site.maxViews}`}
                          </span>
                        </div>
                        {isFree && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => handleUnlockViews(site.id)}
                              className="text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold"
                            >
                              Mở ∞ views
                            </button>
                            <span className="text-stone-600">•</span>
                            <button
                              type="button"
                              onClick={() => handleResetViews(site.id)}
                              className="text-[10px] text-stone-400 hover:text-stone-300 underline"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {site.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            ● Hoạt động công khai
                          </span>
                        )}
                        {site.status === 'EXPIRED_BACKUP' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                            ⏳ Backup trong DB (+30 ngày)
                          </span>
                        )}
                        {site.status === 'ARCHIVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-medium">
                            📦 Đã Lưu Kho (Archive)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {site.status !== 'ACTIVE' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(site.id, 'ACTIVE')}
                              className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[10px] font-semibold transition-all"
                            >
                              Mở lại
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(site.id, 'EXPIRED_BACKUP')}
                              className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-[10px] font-semibold transition-all"
                            >
                              Backup
                            </button>
                          )}

                          <Link
                            href={`/${site.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                            title="Xem trang web thiệp cưới"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteSite(site.id, site.title)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-600/20 text-stone-400 hover:text-rose-400 transition-colors"
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
    </div>
  );
}
