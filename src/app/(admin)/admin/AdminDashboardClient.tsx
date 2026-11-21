'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  Crown,
  Zap,
  Gift,
  Eye,
  TrendingUp,
  Heart,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Plus,
  Search,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Settings2,
  Palette,
  X,
  Clock,
  Check,
  DollarSign,
} from 'lucide-react';

interface MetricData {
  totalUsers: number;
  freeUsers: number;
  annualUsers: number;
  lifetimeUsers: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  totalRevenue: number;
  revenue50k: number;
  revenue200k: number;
  revenueTemplates: number;
  totalSites: number;
  activeSites: number;
  backupSites: number;
  archivedSites: number;
  totalViews: number;
  totalWishes: number;
  totalRsvps: number;
  catalogTemplatesCount: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
}

interface RecentOrder {
  id: string;
  code: string;
  type: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string | null;
  user: {
    name: string;
    email: string;
  };
}

interface RecentSite {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  maxViews: number;
  activeExpiresAt?: string | null;
  backupExpiresAt?: string | null;
  updatedAt: string;
  owner: {
    name: string;
    email: string;
    plan: string;
  };
  template: {
    name: string;
    tier: string;
  };
}

interface RecentWish {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  site: {
    title: string;
    slug: string;
  };
}

interface Props {
  metrics: MetricData;
  recentUsers: RecentUser[];
  recentOrders: RecentOrder[];
  recentSites: RecentSite[];
  recentWishes: RecentWish[];
}

export default function AdminDashboardClient({
  metrics,
  recentUsers: _recentUsers,
  recentOrders: initialRecentOrders,
  recentSites: initialRecentSites,
  recentWishes,
}: Props) {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'orders' | 'pricing'>('overview');

  // Interactive Lists
  const [recentSites, setRecentSites] = useState<RecentSite[]>(initialRecentSites);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(initialRecentOrders);

  // Notifications
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSweeping, setIsSweeping] = useState(false);

  // Quick Upgrade Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [upgradePlan, setUpgradePlan] = useState<'ANNUAL_50K' | 'LIFETIME_VIP_200K' | 'FREE'>('LIFETIME_VIP_200K');
  const [upgradeNote, setUpgradeNote] = useState('Chuyển khoản trực tiếp');
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Search in Sites tab
  const [siteSearch, setSiteSearch] = useState('');
  const [siteFilterStatus, setSiteFilterStatus] = useState<string>('all');

  // Trigger Lifecycle Sweep
  const handleLifecycleSweep = async () => {
    setIsSweeping(true);
    setToast(null);
    try {
      const res = await fetch('/api/admin/sites/sweep', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Quét thất bại');
      }

      setToast({
        text: `✓ ${data.message}`,
        type: 'success',
      });
      setTimeout(() => setToast(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi quét';
      setToast({ text: msg, type: 'error' });
    } finally {
      setIsSweeping(false);
    }
  };

  // Quick Manual Upgrade Action
  const handleQuickUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradeEmail.trim()) {
      setToast({ text: 'Vui lòng nhập email khách hàng', type: 'error' });
      return;
    }

    setIsUpgrading(true);
    try {
      const res = await fetch('/api/admin/quick-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: upgradeEmail.trim(),
          plan: upgradePlan,
          note: upgradeNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nâng cấp thất bại');
      }

      setToast({ text: `🎉 ${data.message}`, type: 'success' });
      setShowUpgradeModal(false);
      setUpgradeEmail('');
      setTimeout(() => setToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi nâng cấp';
      setToast({ text: msg, type: 'error' });
    } finally {
      setIsUpgrading(false);
    }
  };

  // Quick Approve Order
  const handleApproveOrder = async (orderId: string, orderCode: string) => {
    if (!confirm(`Xác nhận duyệt thanh toán thành công cho đơn hàng ${orderCode}?`)) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi duyệt đơn');

      setRecentOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'PAID', paidAt: new Date().toISOString() } : o))
      );
      setToast({ text: `✓ Đã kích hoạt đơn hàng ${orderCode}!`, type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi duyệt';
      setToast({ text: msg, type: 'error' });
    }
  };

  // Quick Change Site Status
  const handleUpdateSiteStatus = async (siteId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi cập nhật');

      setRecentSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, status } : s))
      );
      setToast({ text: `✓ Đã chuyển trạng thái thiệp sang ${status}`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật';
      setToast({ text: msg, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span className="font-semibold">{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Quick Command Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-purple-950/40 border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Bảng Điều Khiển Quản Trị Hệ Thống
            </span>
            <span className="text-xs text-stone-400">LoveStory Console v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Trung Tâm Vận Hành &amp; Quản Lý Toàn Diện
          </h1>
          <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
            Giám sát doanh thu VietQR, nâng cấp gói thành viên, quản lý vòng đời lưu trữ thiệp cưới (300 views / 1 tháng + 1 tháng backup) và kiểm soát toàn bộ templates trên thị trường.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nâng Gói Cho Khách</span>
          </button>

          <button
            type="button"
            disabled={isSweeping}
            onClick={handleLifecycleSweep}
            title="Quét các thiệp cưới quá 300 views hoặc hết hạn 30 ngày để chuyển vào chế độ Backup"
            className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'Đang quét...' : 'Quét Vòng Đời DB'}</span>
          </button>

          <Link
            href="/admin/templates"
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Template</span>
          </Link>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Doanh Thu VietQR</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-400">
              {metrics.totalRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <span>{metrics.paidOrdersCount} đơn thành công</span>
            <span className="text-amber-400 font-medium">
              {metrics.pendingOrdersCount > 0 ? `${metrics.pendingOrdersCount} chờ thanh toán` : '✓ 100% Hoàn tất'}
            </span>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Thành Viên</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold font-serif text-white">
              {metrics.totalUsers.toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center gap-2 text-[11px] text-stone-400">
            <span className="text-amber-400 font-semibold">{metrics.lifetimeUsers} VIP 200k</span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">{metrics.annualUsers} Gói 50k</span>
            <span>•</span>
            <span>{metrics.freeUsers} Free</span>
          </div>
        </div>

        {/* Total Sites & Lifecycle */}
        <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Thiệp Cưới Hoạt Động</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
            <div className="text-2xl font-bold font-serif text-rose-400">
              {metrics.activeSites} <span className="text-sm font-sans font-normal text-stone-400">/ {metrics.totalSites} thiệp</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <span className="text-amber-400 font-semibold">{metrics.backupSites} Đang Backup</span>
            <span className="text-stone-500">{metrics.archivedSites} Đã Lưu Trữ</span>
          </div>
        </div>

        {/* Guests Engagement */}
        <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Lượt Xem &amp; Tương Tác</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold font-serif text-blue-400">
              {metrics.totalViews.toLocaleString('vi-VN')} <span className="text-xs font-sans text-stone-400">views</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-pink-400" />
              {metrics.totalWishes} Lời chúc
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {metrics.totalRsvps} RSVP
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-stone-800 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tổng Quan &amp; Dòng Tiền</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sites')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'sites'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Quản Lý Thiệp Cưới &amp; Vòng Đời ({recentSites.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Đơn Hàng VietQR ({recentOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Bảng Giá &amp; Quy Tắc Lưu Trữ</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Breakdown & Package Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Distribution Card */}
            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Cơ Cấu Nguồn Doanh Thu
                </h3>
                <p className="text-[11px] text-stone-500 mb-4">
                  Phân loại dòng tiền từ các gói dịch vụ và bán lẻ template
                </p>

                <div className="space-y-3">
                  {/* VIP 200k */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" /> Gói VIP Trọn Đời (200k)
                      </span>
                      <span className="font-bold text-white">
                        {metrics.revenue200k.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                        style={{
                          width: `${
                            metrics.totalRevenue > 0
                              ? Math.round((metrics.revenue200k / metrics.totalRevenue) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 1 Year 50k */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-300 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-400" /> Gói 1 Năm (50k)
                      </span>
                      <span className="font-bold text-white">
                        {metrics.revenue50k.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        style={{
                          width: `${
                            metrics.totalRevenue > 0
                              ? Math.round((metrics.revenue50k / metrics.totalRevenue) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Templates Retail 30k */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-purple-300 font-semibold flex items-center gap-1">
                        <Palette className="w-3 h-3 text-purple-400" /> Mua Lẻ Template (30k)
                      </span>
                      <span className="font-bold text-white">
                        {metrics.revenueTemplates.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                        style={{
                          width: `${
                            metrics.totalRevenue > 0
                              ? Math.round((metrics.revenueTemplates / metrics.totalRevenue) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex justify-between">
                <span>Cổng thanh toán: VietQR SePay</span>
                <span className="text-emerald-400 font-bold">Đối soát tự động 24/7</span>
              </div>
            </div>

            {/* Retention & Lifecycle Rules Card */}
            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Quy Tắc Vòng Đời Lưu Trữ (Retention)
                </h3>
                <p className="text-[11px] text-stone-500 mb-4">
                  Chính sách hạn mức và sao lưu cơ sở dữ liệu đã kích hoạt
                </p>

                <div className="space-y-2.5 text-xs text-stone-300">
                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start gap-2.5">
                    <Gift className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">Gói Miễn Phí (Free):</strong>
                      <span className="text-[11px] text-stone-400 leading-relaxed block">
                        Tối đa <strong>300 lượt xem</strong>. Mở xem công khai <strong>1 tháng (30 ngày)</strong>. Sau đó lưu trữ <strong>Backup thêm 1 tháng trong database</strong> cho khách hàng trước khi Archive.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">Gói 1 Năm (50.000 đ):</strong>
                      <span className="text-[11px] text-stone-400 leading-relaxed block">
                        Lưu trữ <strong>365 ngày</strong>. <strong>Không giới hạn</strong> lượt xem. Hỗ trợ tất cả mẫu Cơ bản &amp; tải thiệp.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start gap-2.5">
                    <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">Gói VIP Trọn Đời (200.000 đ):</strong>
                      <span className="text-[11px] text-stone-400 leading-relaxed block">
                        Lưu trữ <strong>vĩnh viễn</strong>. Không giới hạn lượt xem. Sử dụng <strong>toàn bộ {metrics.catalogTemplatesCount} mẫu VIP</strong> trọn đời.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Tiến trình quét tự động</span>
                <button
                  type="button"
                  onClick={handleLifecycleSweep}
                  className="text-purple-400 hover:text-purple-300 text-xs font-semibold underline"
                >
                  Chạy quét ngay
                </button>
              </div>
            </div>

            {/* Quick Control Hub Card */}
            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Lối Tắt Quản Trị Hệ Thống
                </h3>
                <p className="text-[11px] text-stone-500 mb-4">
                  Các trang quản lý chuyên sâu từng module
                </p>

                <div className="space-y-2">
                  <Link
                    href="/admin/users"
                    className="p-3 rounded-xl bg-stone-950/60 hover:bg-stone-800/60 border border-stone-800 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-stone-200">Quản Lý Thành Viên</span>
                    </div>
                    <span className="text-[11px] text-stone-400 group-hover:text-purple-300 font-semibold">
                      {metrics.totalUsers} tài khoản &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/templates"
                    className="p-3 rounded-xl bg-stone-950/60 hover:bg-stone-800/60 border border-stone-800 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-medium text-stone-200">Kho Mẫu Templates</span>
                    </div>
                    <span className="text-[11px] text-stone-400 group-hover:text-pink-300 font-semibold">
                      {metrics.catalogTemplatesCount} mẫu mở &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/orders"
                    className="p-3 rounded-xl bg-stone-950/60 hover:bg-stone-800/60 border border-stone-800 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-medium text-stone-200">Đơn Hàng &amp; VietQR</span>
                    </div>
                    <span className="text-[11px] text-stone-400 group-hover:text-emerald-300 font-semibold">
                      {metrics.totalOrders} đơn &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/sites"
                    className="p-3 rounded-xl bg-stone-950/60 hover:bg-stone-800/60 border border-stone-800 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-medium text-stone-200">Quản Lý Thiệp Cưới</span>
                    </div>
                    <span className="text-[11px] text-stone-400 group-hover:text-rose-300 font-semibold">
                      {metrics.totalSites} thiệp &rarr;
                    </span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                <span>Database: SQLite Prisma</span>
                <span className="text-emerald-400 font-semibold">● Trực tuyến</span>
              </div>
            </div>
          </div>

          {/* 2 Grids: Recent Sites & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Recent Sites */}
            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Thiệp Cưới Mới Tạo Gần Nhất
                  </h3>
                  <p className="text-xs text-stone-400">Trạng thái vòng đời &amp; lượt xem hiện tại</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('sites')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <span>Xem tất cả</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {recentSites.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    Chưa có thiệp cưới nào trong cơ sở dữ liệu.
                  </div>
                ) : (
                  recentSites.slice(0, 5).map((site) => {
                    const isFree = site.owner.plan === 'FREE';
                    const isReached = isFree && site.viewCount >= 300;

                    return (
                      <div
                        key={site.id}
                        className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-stone-200 truncate">{site.title}</h4>
                            <span className="text-[10px] text-stone-500 font-mono">/{site.slug}</span>
                          </div>
                          <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                            <span>Chủ: {site.owner.name}</span>
                            <span>•</span>
                            <span>Engine: {site.template.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Views */}
                          <div className="text-right">
                            <span
                              className={`text-xs font-bold block ${
                                isReached ? 'text-rose-400' : 'text-stone-300'
                              }`}
                            >
                              👁 {site.viewCount} / {site.maxViews === -1 ? '∞' : site.maxViews}
                            </span>
                            <span className="text-[9px] text-stone-500 uppercase">
                              {site.status === 'ACTIVE'
                                ? 'Hoạt động'
                                : site.status === 'EXPIRED_BACKUP'
                                ? 'Đang Backup'
                                : 'Lưu kho'}
                            </span>
                          </div>

                          <Link
                            href={`/${site.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                            title="Xem thiệp cưới online"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Recent Orders */}
            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Đơn Hàng VietQR Mới Nhất
                  </h3>
                  <p className="text-xs text-stone-400">Giao dịch kích hoạt gói &amp; mua lẻ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <span>Xem tất cả</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    Chưa có đơn hàng nào trong cơ sở dữ liệu.
                  </div>
                ) : (
                  recentOrders.slice(0, 5).map((order) => {
                    const isPaid = order.status === 'PAID';

                    return (
                      <div
                        key={order.id}
                        className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-400">
                              {order.code}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {isPaid ? 'ĐÃ THANH TOÁN' : 'CHỜ DUYỆT'}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {order.user.name} ({order.user.email})
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-bold text-white block">
                              {order.amount.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-[9px] text-stone-500">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => handleApproveOrder(order.id, order.code)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-xs"
                            >
                              Duyệt
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Guest Wishes & Guestbook Stream */}
          <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  Lời Chúc Khách Mời Mới Gửi (Guestbook)
                </h3>
                <p className="text-xs text-stone-400">
                  Khách gửi lời chúc trực tiếp trên các website thiệp cưới
                </p>
              </div>
              <span className="text-xs text-stone-400">Tổng cộng {metrics.totalWishes} lời chúc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentWishes.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-stone-500">
                  Chưa có lời chúc nào được gửi từ khách mời.
                </div>
              ) : (
                recentWishes.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-stone-200">{w.author}</span>
                        <span className="text-stone-500 text-[10px]">
                          {new Date(w.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 italic line-clamp-3 leading-relaxed">
                        &ldquo;{w.content}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-500 flex items-center justify-between">
                      <span className="truncate max-w-[180px]">{w.site.title}</span>
                      <Link
                        href={`/${w.site.slug}`}
                        target="_blank"
                        className="text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Xem thiệp &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SITES & LIFECYCLE MANAGEMENT */}
      {activeTab === 'sites' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thiệp theo tên, đường dẫn slug hoặc chủ sở hữu..."
                value={siteSearch}
                onChange={(e) => setSiteSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={siteFilterStatus}
                onChange={(e) => setSiteFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang Hoạt Động (Active)</option>
                <option value="EXPIRED_BACKUP">Đang Backup DB (30 ngày)</option>
                <option value="ARCHIVED">Lưu Kho Lưu Trữ (Archived)</option>
              </select>

              <button
                type="button"
                onClick={handleLifecycleSweep}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Chạy Quét Vòng Đời</span>
              </button>
            </div>
          </div>

          {/* Sites Table */}
          <div className="rounded-2xl bg-stone-900/60 border border-stone-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-stone-950/50 text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Thiệp Cưới &amp; Cặp Đôi</th>
                    <th className="py-3 px-4">Chủ Sở Hữu</th>
                    <th className="py-3 px-4">Lượt Xem (Views)</th>
                    <th className="py-3 px-4">Vòng Đời Lưu Trữ</th>
                    <th className="py-3 px-4">Thao Tác Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Xem Thiệp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                  {recentSites
                    .filter((s) => {
                      const matchStatus = siteFilterStatus === 'all' || s.status === siteFilterStatus;
                      const matchQ =
                        !siteSearch.trim() ||
                        s.title.toLowerCase().includes(siteSearch.toLowerCase()) ||
                        s.slug.toLowerCase().includes(siteSearch.toLowerCase()) ||
                        s.owner.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
                        s.owner.email.toLowerCase().includes(siteSearch.toLowerCase());
                      return matchStatus && matchQ;
                    })
                    .map((s) => {
                      const isFree = s.owner.plan === 'FREE';
                      const isReachedLimit = isFree && s.viewCount >= 300;

                      return (
                        <tr key={s.id} className="hover:bg-stone-800/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{s.title}</div>
                            <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                              /{s.slug} • Mẫu: <span className="text-purple-300">{s.template.name}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-stone-200">{s.owner.name}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{s.owner.email}</div>
                            <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-stone-800 text-stone-300">
                              {s.owner.plan}
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
                                {s.viewCount}
                              </span>
                              <span className="text-stone-500 font-normal">
                                / {s.maxViews === -1 ? '∞ Không giới hạn' : `${s.maxViews} lượt`}
                              </span>
                            </div>
                            {isReachedLimit && (
                              <span className="text-[10px] text-rose-400 font-semibold block mt-0.5">
                                Đã chạm trần 300 views
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {s.status === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                ● Hoạt động công khai
                              </span>
                            )}
                            {s.status === 'EXPIRED_BACKUP' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                                ⏳ Backup trong DB (+30 ngày)
                              </span>
                            )}
                            {s.status === 'ARCHIVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-medium">
                                📦 Đã Lưu Kho (Archive)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {s.status !== 'ACTIVE' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSiteStatus(s.id, 'ACTIVE')}
                                  className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[10px] font-semibold transition-all"
                                >
                                  Mở Lại
                                </button>
                              )}
                              {s.status === 'ACTIVE' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSiteStatus(s.id, 'EXPIRED_BACKUP')}
                                  className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-[10px] font-semibold transition-all"
                                >
                                  Chuyển Backup
                                </button>
                              )}
                              {s.status !== 'ARCHIVED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSiteStatus(s.id, 'ARCHIVED')}
                                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-[10px] transition-all"
                                >
                                  Archive
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/${s.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-medium transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Mở</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & VIETQR */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-300">
              Tổng số đơn: <strong>{recentOrders.length}</strong> • Doanh thu đã thu: <strong>{metrics.totalRevenue.toLocaleString('vi-VN')} đ</strong>
            </span>
            <Link
              href="/admin/orders"
              className="text-purple-400 hover:text-purple-300 font-semibold underline flex items-center gap-1"
            >
              <span>Trang đối soát SePay đầy đủ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-stone-900/60 border border-stone-800 overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500">
                Chưa có đơn hàng nào được ghi nhận trong cơ sở dữ liệu.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 bg-stone-950/50 text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Mã Đơn &amp; Gói</th>
                      <th className="py-3 px-4">Khách Hàng</th>
                      <th className="py-3 px-4">Số Tiền (VNĐ)</th>
                      <th className="py-3 px-4">Phương Thức</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/50">
                    {recentOrders.map((o) => {
                      const isPaid = o.status === 'PAID';

                      return (
                        <tr key={o.id} className="hover:bg-stone-800/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-purple-400 block">{o.code}</span>
                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              {o.type === 'PLAN_LIFETIME_VIP_200K'
                                ? '👑 VIP Trọn Đời (200k)'
                                : o.type === 'PLAN_ANNUAL_50K'
                                ? '⚡ Gói 1 Năm (50k)'
                                : '🎨 Mua Lẻ Template (30k)'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-stone-200">{o.user.name}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{o.user.email}</div>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-white">
                            {o.amount.toLocaleString('vi-VN')} đ
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-stone-400">
                            {o.paymentMethod}
                          </td>

                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                ✓ Đã Thanh Toán
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                ⏳ Đang Chờ Chuyển Khoản
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {!isPaid ? (
                              <button
                                type="button"
                                onClick={() => handleApproveOrder(o.id, o.code)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                              >
                                Duyệt Ngay
                              </button>
                            ) : (
                              <span className="text-[11px] text-stone-500 font-mono">
                                {o.paidAt ? new Date(o.paidAt).toLocaleDateString('vi-VN') : 'Đã duyệt'}
                              </span>
                            )}
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
      )}

      {/* TAB 4: PRICING & SYSTEM RULES */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Package 1: Free */}
            <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-bold uppercase tracking-wider">
                  Trải Nghiệm Miễn Phí
                </span>
                <Gift className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-white">0 đ</div>
                <div className="text-xs text-stone-400 mt-1">Dành cho mọi cặp đôi bắt đầu tạo thiệp</div>
              </div>

              <div className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>300 lượt xem</strong> cho khách mời</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lưu trữ online <strong>1 tháng (30 ngày)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Backup thêm 1 tháng</strong> trong Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Nhạc nền, QR mừng cưới &amp; nhận lời chúc</span>
                </div>
              </div>
            </div>

            {/* Package 2: 50k / 1 Year */}
            <div className="p-6 rounded-3xl bg-blue-950/20 border border-blue-500/30 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                  Gói Chuẩn 1 Năm
                </span>
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-blue-400">50.000 đ <span className="text-xs font-sans text-stone-400">/ 1 năm</span></div>
                <div className="text-xs text-stone-400 mt-1">Phù hợp tổ chức đám cưới trọn vẹn</div>
              </div>

              <div className="space-y-2 text-xs text-stone-300 pt-2 border-t border-blue-900/50">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>Không giới hạn lượt xem (∞)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Lưu trữ online <strong>365 ngày (1 năm)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Toàn bộ tính năng RSVP &amp; đếm ngược</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Không hiển thị quảng cáo thương hiệu</span>
                </div>
              </div>
            </div>

            {/* Package 3: 200k Lifetime VIP */}
            <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/40 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/40">
                  VIP Trọn Đời
                </span>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-amber-400">200.000 đ <span className="text-xs font-sans text-stone-400">/ trọn đời</span></div>
                <div className="text-xs text-stone-400 mt-1">Gói cao cấp nhất, sở hữu mãi mãi</div>
              </div>

              <div className="space-y-2 text-xs text-stone-300 pt-2 border-t border-amber-900/50">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Lưu trữ vĩnh viễn không thời hạn</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Dùng toàn bộ {metrics.catalogTemplatesCount} mẫu VIP</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Không giới hạn lượt xem &amp; lượt tải</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Bảo đảm kỷ niệm tình yêu vĩnh hằng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUICK UPGRADE FOR CLIENT */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => !isUpgrading && setShowUpgradeModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Admin Manual Action
                </span>
                <h3 className="text-base font-serif font-bold text-white">
                  Kích Hoạt &amp; Nâng Gói Cho Khách
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickUpgrade} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Email Khách Hàng <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="VD: chure@lovestory.me"
                  value={upgradeEmail}
                  onChange={(e) => setUpgradeEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Chọn Gói Dịch Vụ
                </label>
                <select
                  value={upgradePlan}
                  onChange={(e) => setUpgradePlan(e.target.value as 'ANNUAL_50K' | 'LIFETIME_VIP_200K' | 'FREE')}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="LIFETIME_VIP_200K">👑 Gói VIP Trọn Đời (200.000 đ)</option>
                  <option value="ANNUAL_50K">⚡ Gói 1 Năm Không Giới Hạn (50.000 đ)</option>
                  <option value="FREE">🎁 Đưa Về Gói Free (300 views)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Ghi Chú Nâng Cấp (Audit Log)
                </label>
                <input
                  type="text"
                  placeholder="VD: Khách chuyển khoản VCB, Bill Zalo..."
                  value={upgradeNote}
                  onChange={(e) => setUpgradeNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  disabled={isUpgrading}
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpgrading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isUpgrading ? (
                    <span>Đang kích hoạt...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Xác Nhận Nâng Gói</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
