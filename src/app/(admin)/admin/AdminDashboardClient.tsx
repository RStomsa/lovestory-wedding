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
  Coins,
  History,
  Compass,
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
        text: `Đã hoàn tất: ${data.message}`,
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

      setToast({ text: data.message, type: 'success' });
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
      setToast({ text: `Đã kích hoạt đơn hàng ${orderCode}!`, type: 'success' });
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
      setToast({ text: `Đã chuyển trạng thái thiệp sang ${status}`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật';
      setToast({ text: msg, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Quick Command Bar */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-stone-100 text-stone-700 border border-stone-200 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Bảng điều khiển quản trị
            </span>
            <span className="text-xs text-stone-400 font-mono">LoveStory v2.0</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Trung Tâm Vận Hành &amp; Quản Lý Toàn Diện
          </h1>
          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            Giám sát doanh thu VietQR, nâng cấp gói thành viên, quản lý vòng đời lưu trữ thiệp cưới (300 views / 1 tháng + 1 tháng backup) và kiểm soát toàn bộ templates trên thị trường.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nâng gói cho khách</span>
          </button>

          <button
            type="button"
            disabled={isSweeping}
            onClick={handleLifecycleSweep}
            title="Quét các thiệp cưới quá 300 views hoặc hết hạn 30 ngày để chuyển vào chế độ Backup"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-400 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'Đang quét...' : 'Quét vòng đời DB'}</span>
          </button>

          <Link
            href="/admin/templates"
            className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm template</span>
          </Link>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-xs font-medium">Doanh thu VietQR</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
              {metrics.totalRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>{metrics.paidOrdersCount} đơn thành công</span>
            <span className={metrics.pendingOrdersCount > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
              {metrics.pendingOrdersCount > 0 ? `${metrics.pendingOrdersCount} chờ thanh toán` : '100% hoàn tất'}
            </span>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-xs font-medium">Tổng thành viên</span>
              <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
              {metrics.totalUsers.toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500">
            <span className="font-semibold text-stone-800">{metrics.lifetimeUsers} VIP 200k</span>
            <span>•</span>
            <span className="font-medium text-stone-600">{metrics.annualUsers} Gói 50k</span>
            <span>•</span>
            <span>{metrics.freeUsers} Free</span>
          </div>
        </div>

        {/* Total Sites & Lifecycle */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-xs font-medium">Thiệp cưới hoạt động</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Heart className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
              {metrics.activeSites} <span className="text-sm font-sans font-normal text-stone-400">/ {metrics.totalSites} thiệp</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="text-amber-600 font-medium">{metrics.backupSites} đang backup</span>
            <span>{metrics.archivedSites} đã lưu kho</span>
          </div>
        </div>

        {/* Guests Engagement */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-xs font-medium">Lượt xem &amp; tương tác</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
              {metrics.totalViews.toLocaleString('vi-VN')} <span className="text-xs font-sans text-stone-400 font-normal">views</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-stone-400" />
              {metrics.totalWishes} lời chúc
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {metrics.totalRsvps} RSVP
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-stone-200 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs font-medium transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tổng quan &amp; Dòng tiền</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sites')}
          className={`pb-3 px-4 text-xs font-medium transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'sites'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Quản lý thiệp cưới &amp; Vòng đời ({recentSites.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-medium transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Đơn hàng VietQR ({recentOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 px-4 text-xs font-medium transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Bảng giá &amp; Quy tắc lưu trữ</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Breakdown & Package Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Distribution Card */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-stone-900 mb-1 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-stone-600" />
                  Cơ cấu nguồn doanh thu
                </h3>
                <p className="text-[11px] text-stone-500 mb-4">
                  Phân loại dòng tiền từ các gói dịch vụ và bán lẻ template
                </p>

                <div className="space-y-3.5">
                  {/* VIP 200k */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-stone-700 font-medium flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600" /> Gói VIP trọn đời (200k)
                      </span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {metrics.revenue200k.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-stone-900 rounded-full"
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
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-stone-700 font-medium flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-blue-600" /> Gói chuẩn 1 năm (50k)
                      </span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {metrics.revenue50k.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-stone-600 rounded-full"
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
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-stone-700 font-medium flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-rose-600" /> Mua lẻ template (30k)
                      </span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {metrics.revenueTemplates.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
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

              <div className="mt-5 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex justify-between items-center">
                <span>Cổng thanh toán: VietQR SePay</span>
                <span className="text-emerald-700 font-medium">Đối soát tự động 24/7</span>
              </div>
            </div>

            {/* Retention & Lifecycle Rules Card */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-stone-900 mb-1 flex items-center gap-2">
                  <History className="w-4 h-4 text-stone-600" />
                  Quy tắc vòng đời lưu trữ (Retention)
                </h3>
                <p className="text-[11px] text-stone-500 mb-4">
                  Chính sách hạn mức và sao lưu cơ sở dữ liệu đã kích hoạt
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60 flex items-start gap-2.5">
                    <Gift className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-900 block font-semibold">Gói miễn phí:</span>
                      <span className="text-[11px] text-stone-600 leading-relaxed block">
                        Tối đa <strong>300 lượt xem</strong>. Mở xem công khai <strong>30 ngày</strong>, sao lưu backup thêm 1 tháng trước khi lưu kho.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-900 block font-semibold">Gói 1 năm (50.000 đ):</span>
                      <span className="text-[11px] text-stone-600 leading-relaxed block">
                        Lưu trữ <strong>365 ngày</strong>. Không giới hạn lượt xem. Hỗ trợ toàn bộ mẫu cơ bản và tải thiệp.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60 flex items-start gap-2.5">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-900 block font-semibold">Gói VIP trọn đời (200.000 đ):</span>
                      <span className="text-[11px] text-stone-600 leading-relaxed block">
                        Lưu trữ <strong>vĩnh viễn</strong>. Không giới hạn lượt xem. Mở khóa toàn bộ {metrics.catalogTemplatesCount} mẫu VIP.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">Tiến trình quét tự động</span>
                <button
                  type="button"
                  onClick={handleLifecycleSweep}
                  className="text-stone-900 hover:underline text-xs font-medium"
                >
                  Chạy quét ngay
                </button>
              </div>
            </div>

            {/* Quick Control Hub Card */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-stone-900 mb-1 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-stone-600" />
                  Lối tắt quản trị hệ thống
                </h3>
                <p className="text-[11px] text-stone-500 mb-4">
                  Các trang quản lý chuyên sâu từng module
                </p>

                <div className="space-y-2">
                  <Link
                    href="/admin/users"
                    className="p-2.5 rounded-xl bg-stone-50/80 hover:bg-stone-100 border border-stone-200/60 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-stone-600 group-hover:text-stone-900" />
                      <span className="text-xs font-medium text-stone-800">Quản lý thành viên</span>
                    </div>
                    <span className="text-[11px] text-stone-500 group-hover:text-stone-900 font-medium">
                      {metrics.totalUsers} tài khoản &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/templates"
                    className="p-2.5 rounded-xl bg-stone-50/80 hover:bg-stone-100 border border-stone-200/60 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-stone-600 group-hover:text-stone-900" />
                      <span className="text-xs font-medium text-stone-800">Kho mẫu templates</span>
                    </div>
                    <span className="text-[11px] text-stone-500 group-hover:text-stone-900 font-medium">
                      {metrics.catalogTemplatesCount} mẫu mở &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/orders"
                    className="p-2.5 rounded-xl bg-stone-50/80 hover:bg-stone-100 border border-stone-200/60 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-stone-600 group-hover:text-stone-900" />
                      <span className="text-xs font-medium text-stone-800">Đơn hàng &amp; VietQR</span>
                    </div>
                    <span className="text-[11px] text-stone-500 group-hover:text-stone-900 font-medium">
                      {metrics.totalOrders} đơn &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/sites"
                    className="p-2.5 rounded-xl bg-stone-50/80 hover:bg-stone-100 border border-stone-200/60 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-stone-600 group-hover:text-stone-900" />
                      <span className="text-xs font-medium text-stone-800">Quản lý thiệp cưới</span>
                    </div>
                    <span className="text-[11px] text-stone-500 group-hover:text-stone-900 font-medium">
                      {metrics.totalSites} thiệp &rarr;
                    </span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>Cơ sở dữ liệu: Supabase</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Trực tuyến
                </span>
              </div>
            </div>
          </div>

          {/* 2 Grids: Recent Sites & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Recent Sites */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    Thiệp cưới mới tạo gần nhất
                  </h3>
                  <p className="text-xs text-stone-500">Trạng thái vòng đời &amp; lượt xem hiện tại</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('sites')}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
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
                        className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/60 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-stone-900 truncate">{site.title}</h4>
                            <span className="text-[10px] text-stone-500 font-mono">/{site.slug}</span>
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                            <span>Chủ: {site.owner.name}</span>
                            <span>•</span>
                            <span>Mẫu: {site.template.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Views */}
                          <div className="text-right">
                            <span
                              className={`text-xs font-semibold block font-mono ${
                                isReached ? 'text-rose-600' : 'text-stone-800'
                              }`}
                            >
                              {site.viewCount} / {site.maxViews === -1 ? '∞' : site.maxViews}
                            </span>
                            <span className="text-[10px] text-stone-500">
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
                            className="p-1.5 rounded-lg bg-white border border-stone-200/80 hover:bg-stone-100 text-stone-700 transition-colors shadow-2xs"
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
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    Đơn hàng VietQR mới nhất
                  </h3>
                  <p className="text-xs text-stone-500">Giao dịch kích hoạt gói &amp; mua lẻ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
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
                        className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/60 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-stone-900">
                              {order.code}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isPaid ? 'Đã thanh toán' : 'Chờ duyệt'}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5 truncate">
                            {order.user.name} ({order.user.email})
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-semibold text-stone-900 block font-mono">
                              {order.amount.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => handleApproveOrder(order.id, order.code)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shadow-2xs transition-colors"
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
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-stone-600" />
                  Lời chúc khách mời mới gửi
                </h3>
                <p className="text-xs text-stone-500">
                  Khách gửi lời chúc trực tiếp trên các website thiệp cưới
                </p>
              </div>
              <span className="text-xs text-stone-500 font-mono">Tổng cộng {metrics.totalWishes} lời chúc</span>
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
                    className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/60 flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-stone-900">{w.author}</span>
                        <span className="text-stone-500 text-[10px]">
                          {new Date(w.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 italic line-clamp-3 leading-relaxed">
                        &ldquo;{w.content}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 flex items-center justify-between">
                      <span className="truncate max-w-[180px]">{w.site.title}</span>
                      <Link
                        href={`/${w.site.slug}`}
                        target="_blank"
                        className="text-stone-700 hover:text-stone-900 font-medium"
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
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thiệp theo tên, đường dẫn hoặc chủ..."
                value={siteSearch}
                onChange={(e) => setSiteSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={siteFilterStatus}
                onChange={(e) => setSiteFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động (Active)</option>
                <option value="EXPIRED_BACKUP">Đang backup trong DB (30 ngày)</option>
                <option value="ARCHIVED">Đã lưu kho (Archived)</option>
              </select>

              <button
                type="button"
                onClick={handleLifecycleSweep}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Quét vòng đời</span>
              </button>
            </div>
          </div>

          {/* Sites Table */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600 font-semibold text-[11px]">
                    <th className="py-3 px-4">Thiệp cưới &amp; Cặp đôi</th>
                    <th className="py-3 px-4">Chủ sở hữu</th>
                    <th className="py-3 px-4">Lượt xem (Views)</th>
                    <th className="py-3 px-4">Vòng đời lưu trữ</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Xem thiệp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
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
                        <tr key={s.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-stone-900">{s.title}</div>
                            <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                              /{s.slug} • Mẫu: <span className="text-stone-700 font-medium">{s.template.name}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-stone-800">{s.owner.name}</div>
                            <div className="text-[11px] text-stone-500 font-mono">{s.owner.email}</div>
                            <span className="inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                              {s.owner.plan}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-semibold font-mono">
                              <Eye className="w-3.5 h-3.5 text-stone-400" />
                              <span
                                className={
                                  isReachedLimit
                                    ? 'text-rose-600 font-bold'
                                    : 'text-stone-900'
                                }
                              >
                                {s.viewCount}
                              </span>
                              <span className="text-stone-400 font-normal">
                                / {s.maxViews === -1 ? '∞' : `${s.maxViews}`}
                              </span>
                            </div>
                            {isReachedLimit && (
                              <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                                Đã chạm trần 300 views
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {s.status === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hoạt động công khai
                              </span>
                            )}
                            {s.status === 'EXPIRED_BACKUP' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Đang backup (+30 ngày)
                              </span>
                            )}
                            {s.status === 'ARCHIVED' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-medium">
                                Đã lưu kho
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {s.status !== 'ACTIVE' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSiteStatus(s.id, 'ACTIVE')}
                                  className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-medium transition-colors"
                                >
                                  Mở lại
                                </button>
                              )}
                              {s.status === 'ACTIVE' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSiteStatus(s.id, 'EXPIRED_BACKUP')}
                                  className="px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-medium transition-colors"
                                >
                                  Chuyển backup
                                </button>
                              )}
                              {s.status !== 'ARCHIVED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSiteStatus(s.id, 'ARCHIVED')}
                                  className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] transition-colors"
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
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-[11px] font-medium transition-colors shadow-2xs"
                            >
                              <ExternalLink className="w-3 h-3 text-stone-400" />
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
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between text-xs">
            <span className="text-stone-600">
              Tổng số đơn: <strong className="text-stone-900 font-semibold">{recentOrders.length}</strong> • Doanh thu đã thu: <strong className="text-stone-900 font-semibold font-mono">{metrics.totalRevenue.toLocaleString('vi-VN')} đ</strong>
            </span>
            <Link
              href="/admin/orders"
              className="text-stone-900 hover:underline font-medium flex items-center gap-1"
            >
              <span>Trang đối soát SePay đầy đủ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500">
                Chưa có đơn hàng nào được ghi nhận trong cơ sở dữ liệu.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600 font-semibold text-[11px]">
                      <th className="py-3 px-4">Mã đơn &amp; Gói</th>
                      <th className="py-3 px-4">Khách hàng</th>
                      <th className="py-3 px-4">Số tiền</th>
                      <th className="py-3 px-4">Phương thức</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {recentOrders.map((o) => {
                      const isPaid = o.status === 'PAID';

                      return (
                        <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-semibold text-stone-900 block">{o.code}</span>
                            <span className="text-[10px] text-stone-500 block mt-0.5">
                              {o.type === 'PLAN_LIFETIME_VIP_200K'
                                ? 'VIP Trọn Đời (200k)'
                                : o.type === 'PLAN_ANNUAL_50K'
                                ? 'Gói 1 Năm (50k)'
                                : 'Mua Lẻ Template (30k)'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-stone-800">{o.user.name}</div>
                            <div className="text-[11px] text-stone-500 font-mono">{o.user.email}</div>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-stone-900 font-mono">
                            {o.amount.toLocaleString('vi-VN')} đ
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-stone-600">
                            {o.paymentMethod}
                          </td>

                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đã thanh toán
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Chờ chuyển khoản
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {!isPaid ? (
                              <button
                                type="button"
                                onClick={() => handleApproveOrder(o.id, o.code)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs transition-colors"
                              >
                                Duyệt ngay
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
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold tracking-wide">
                  Gói Trải Nghiệm
                </span>
                <Gift className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-stone-900">0 đ</div>
                <div className="text-xs text-stone-500 mt-1">Dành cho mọi cặp đôi bắt đầu tạo thiệp</div>
              </div>

              <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>300 lượt xem</strong> cho khách mời</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lưu trữ online <strong>30 ngày</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Backup thêm 1 tháng</strong> trong Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Nhạc nền, QR mừng cưới &amp; nhận lời chúc</span>
                </div>
              </div>
            </div>

            {/* Package 2: 50k / 1 Year */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold tracking-wide border border-blue-200">
                  Gói Chuẩn 1 Năm
                </span>
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-stone-900 font-mono">50.000 đ <span className="text-xs font-sans text-stone-500 font-normal">/ 1 năm</span></div>
                <div className="text-xs text-stone-500 mt-1">Phù hợp tổ chức đám cưới trọn vẹn</div>
              </div>

              <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Không giới hạn lượt xem (∞)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lưu trữ online <strong>365 ngày (1 năm)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Toàn bộ tính năng RSVP &amp; đếm ngược</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Không hiển thị quảng cáo thương hiệu</span>
                </div>
              </div>
            </div>

            {/* Package 3: 200k Lifetime VIP */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-50 to-white border border-stone-300 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold tracking-wide border border-amber-200">
                  VIP Trọn Đời
                </span>
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-stone-900 font-mono">200.000 đ <span className="text-xs font-sans text-stone-500 font-normal">/ trọn đời</span></div>
                <div className="text-xs text-stone-500 mt-1">Gói cao cấp nhất, sở hữu mãi mãi</div>
              </div>

              <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Lưu trữ vĩnh viễn không thời hạn</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Dùng toàn bộ {metrics.catalogTemplatesCount} mẫu VIP</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Không giới hạn lượt xem &amp; lượt tải</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-2xs"
          />

          <div className="relative w-full max-w-md bg-white border border-stone-200/90 rounded-2xl shadow-xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-semibold text-stone-500 tracking-wide uppercase">
                  Thao tác quản trị viên
                </span>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Kích hoạt &amp; Nâng gói cho khách
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickUpgrade} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700">
                  Email khách hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="VD: chure@lovestory.me"
                  value={upgradeEmail}
                  onChange={(e) => setUpgradeEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700">
                  Chọn gói dịch vụ
                </label>
                <select
                  value={upgradePlan}
                  onChange={(e) => setUpgradePlan(e.target.value as 'ANNUAL_50K' | 'LIFETIME_VIP_200K' | 'FREE')}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  <option value="LIFETIME_VIP_200K">Gói VIP trọn đời (200.000 đ)</option>
                  <option value="ANNUAL_50K">Gói 1 năm không giới hạn (50.000 đ)</option>
                  <option value="FREE">Đưa về gói Free (300 views)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700">
                  Ghi chú nâng cấp
                </label>
                <input
                  type="text"
                  placeholder="VD: Khách chuyển khoản VCB, Bill Zalo..."
                  value={upgradeNote}
                  onChange={(e) => setUpgradeNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  disabled={isUpgrading}
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpgrading}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isUpgrading ? (
                    <span>Đang kích hoạt...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Xác nhận nâng gói</span>
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
