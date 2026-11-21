'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Eye,
  Users,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  Trash2,
  QrCode,
  Crown,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  RefreshCw,
  Zap,
  Share2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SiteItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  viewCount: number;
  maxViews: number;
  activeExpiresAt: Date | string | null;
  backupExpiresAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  templateId: string;
  template?: {
    id: string;
    name: string;
    slug: string;
    tier: string;
    thumbnail: string;
  };
  rsvps: Array<{
    id: string;
    guestName: string;
    phone: string | null;
    attending: boolean;
    partySize: number;
    eventTarget: string | null;
    createdAt: Date | string;
  }>;
  wishes: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: Date | string;
  }>;
}

interface OrderItem {
  id: string;
  amount: number;
  status: string;
  type?: string;
  code?: string;
  planRequested?: string | null;
  createdAt: Date | string;
}

interface Props {
  initialUser: any;
  initialSites: SiteItem[];
  initialOrders: OrderItem[];
}

type TabType = 'sites' | 'rsvps' | 'wishes' | 'plan';

export default function DashboardClient({ initialUser, initialSites, initialOrders }: Props) {
  const { openUpgradeModal } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('sites');
  const [sites, setSites] = useState<SiteItem[]>(initialSites);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [qrModalSlug, setQrModalSlug] = useState<{ slug: string; title: string } | null>(null);
  const [deletingSite, setDeletingSite] = useState<SiteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Computed Metrics
  const totalSites = sites.length;
  const totalViews = sites.reduce((sum, s) => sum + s.viewCount, 0);
  const totalRsvps = sites.reduce((sum, s) => sum + s.rsvps.length, 0);
  const totalAttending = sites.reduce(
    (sum, s) => sum + s.rsvps.filter((r) => r.attending).reduce((pSum, r) => pSum + (r.partySize || 1), 0),
    0
  );
  const totalWishes = sites.reduce((sum, s) => sum + s.wishes.length, 0);

  // Copy link helper
  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const fullUrl = `${origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  // Delete site handler
  const handleDeleteSite = async () => {
    if (!deletingSite) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/sites/${deletingSite.slug}/delete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSites((prev) => prev.filter((s) => s.id !== deletingSite.id));
        setDeletingSite(null);
      } else {
        alert(data.error || 'Không thể xóa thiệp cưới');
      }
    } catch {
      alert('Có lỗi xảy ra khi xóa thiệp cưới');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete wish handler
  const handleDeleteWish = async (siteSlug: string, wishId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lời chúc này?')) return;
    try {
      const res = await fetch(`/api/sites/${siteSlug}/wishes/${wishId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSites((prev) =>
          prev.map((site) => {
            if (site.slug !== siteSlug) return site;
            return {
              ...site,
              wishes: site.wishes.filter((w) => w.id !== wishId),
            };
          })
        );
      }
    } catch {
      alert('Không thể xóa lời chúc');
    }
  };

  // Render plan badge
  const renderUserPlanBadge = () => {
    if (initialUser?.role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" /> Quản Trị Viên (Admin)
        </span>
      );
    }
    if (initialUser?.plan === 'LIFETIME_VIP_200K') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
          <Crown className="w-3.5 h-3.5" /> Gói VIP Trọn Đời (Không giới hạn)
        </span>
      );
    }
    if (initialUser?.plan === 'ANNUAL_50K') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
          <Zap className="w-3.5 h-3.5" /> Gói Chuẩn 1 Năm (Không giới hạn views)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold">
        <span>🎁 Gói Miễn Phí (Tối đa 300 views)</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Hero Welcome */}
      <div className="bg-gradient-to-r from-rose-900/40 via-stone-900/60 to-amber-950/30 border border-rose-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-rose-400 font-bold">
                Bảng Điều Khiển Cặp Đôi
              </span>
              <span className="text-stone-500">•</span>
              {renderUserPlanBadge()}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Chào mừng, {initialUser?.name || 'Cặp đôi LoveStory'}!
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Theo dõi lượt xem thiệp cưới thực tế, quản lý khách mời xác nhận dự tiệc (RSVP) và lưu giữ những lời chúc ngọt ngào nhất.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/templates"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Thiệp Cưới Mới</span>
            </Link>

            {initialUser?.plan !== 'LIFETIME_VIP_200K' && initialUser?.role !== 'ADMIN' && (
              <button
                type="button"
                onClick={() => openUpgradeModal({ defaultType: 'PLAN_LIFETIME_VIP_200K' })}
                className="px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Nâng Cấp VIP</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sites */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Thiệp cưới đã tạo</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
            {totalSites}
          </p>
          <span className="text-[11px] text-stone-400 block">
            {sites.filter((s) => s.status === 'ACTIVE').length} thiệp đang công khai
          </span>
        </div>

        {/* Total Views */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Tổng lượt xem thật</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
            {totalViews.toLocaleString('vi-VN')}
          </p>
          <span className="text-[11px] text-stone-400 block">
            Dữ liệu truy vấn trực tiếp từ database
          </span>
        </div>

        {/* Total RSVPs */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Khách xác nhận đi</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
            {totalAttending}
          </p>
          <span className="text-[11px] text-stone-400 block">
            Từ {totalRsvps} lượt phản hồi
          </span>
        </div>

        {/* Total Wishes */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Lời chúc nhận được</span>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
            {totalWishes}
          </p>
          <span className="text-[11px] text-stone-400 block">
            Lời chúc từ người thân, bạn bè
          </span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('sites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sites'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Thiệp Cưới Của Tôi ({totalSites})</span>
        </button>

        <button
          onClick={() => setActiveTab('rsvps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'rsvps'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Khách Mời &amp; RSVP ({totalRsvps})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'wishes'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Sổ Lời Chúc ({totalWishes})</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'plan'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Gói Cước &amp; Nâng Cấp</span>
        </button>
      </div>

      {/* 4. Tab 1: My Sites */}
      {activeTab === 'sites' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Danh Sách Thiệp Cưới Của Bạn
            </h2>
            <Link
              href="/templates"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>+ Tạo thêm thiệp khác</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sites.length === 0 ? (
            /* Honest Empty State */
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                  Bạn chưa có thiệp cưới nào
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Hãy khám phá kho 26 mẫu thiệp cưới thị trường hoặc tự sáng tạo thiệp cưới điện ảnh độc bản cho ngày trọng đại.
                </p>
              </div>
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Khám Phá Kho Mẫu Thiệp Ngay</span>
              </Link>
            </div>
          ) : (
            /* Grid of Wedding Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => {
                const isCopied = copiedSlug === site.slug;
                const statusBadge =
                  site.status === 'ACTIVE' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      Đang hoạt động
                    </span>
                  ) : site.status === 'DRAFT' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                      Bản nháp
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-500/20 text-stone-400 border border-stone-500/30 text-[10px] font-bold">
                      Lưu trữ backup
                    </span>
                  );

                const viewLimitText =
                  site.maxViews === -1
                    ? 'Không giới hạn lượt xem'
                    : `${site.viewCount} / ${site.maxViews} lượt xem`;

                return (
                  <div
                    key={site.id}
                    className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top banner / thumbnail */}
                      <div className="h-44 bg-stone-800 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={site.template?.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                          alt={site.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/30" />
                        <div className="absolute top-3 left-3">{statusBadge}</div>
                        <div className="absolute top-3 right-3">
                          <button
                            type="button"
                            onClick={() => setQrModalSlug({ slug: site.slug, title: site.title })}
                            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                            title="Mở mã QR quét điện thoại"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-serif font-bold text-lg leading-tight truncate">
                            {site.title}
                          </h3>
                          <p className="text-[11px] text-stone-300 font-mono truncate mt-0.5">
                            /{site.slug}
                          </p>
                        </div>
                      </div>

                      {/* Info & Metrics */}
                      <div className="p-5 space-y-3">
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-100 dark:border-stone-800/80 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-stone-400 block">Lượt xem</span>
                            <span className="font-bold text-stone-800 dark:text-stone-200">
                              {site.viewCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block">Khách RSVP</span>
                            <span className="font-bold text-emerald-500">
                              {site.rsvps.filter((r) => r.attending).length}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block">Lời chúc</span>
                            <span className="font-bold text-amber-500">
                              {site.wishes.length}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-stone-500">
                          <div className="flex items-center justify-between text-[11px]">
                            <span>Chính sách xem:</span>
                            <span className="font-semibold text-stone-700 dark:text-stone-300">
                              {viewLimitText}
                            </span>
                          </div>
                          {site.activeExpiresAt && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span>Hạn xem công khai:</span>
                              <span className="font-semibold text-amber-500">
                                {new Date(site.activeExpiresAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/30 flex items-center gap-2">
                      <Link
                        href={`/editor/studio?slug=${encodeURIComponent(site.slug)}&template=${encodeURIComponent(site.templateId)}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sửa Studio</span>
                      </Link>

                      <a
                        href={`/${site.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                        title="Xem thiệp cưới thực tế"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Xem</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(site.slug)}
                        className={`p-2 rounded-xl border text-xs transition-colors ${
                          isCopied
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                        title={isCopied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết chia sẻ'}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingSite(site)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Xóa thiệp cưới"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: RSVPs */}
      {activeTab === 'rsvps' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Khách Mời Xác Nhận Tham Dự (RSVP)
              </h2>
              <p className="text-xs text-stone-500">
                Tổng hợp phản hồi khách mời từ tất cả thiệp cưới của bạn.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              {totalAttending} người tham gia
            </span>
          </div>

          {sites.every((s) => s.rsvps.length === 0) ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Chưa có khách mời gửi phản hồi
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Khi bạn chia sẻ link thiệp cưới cho người thân và bạn bè, danh sách khách xác nhận đi sẽ tự động xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/70 dark:bg-stone-800/60 text-stone-500 font-semibold border-b border-stone-200/80 dark:border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4">Tên khách mời</th>
                      <th className="py-3.5 px-4">Số điện thoại</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Số lượng</th>
                      <th className="py-3.5 px-4">Tiệc cưới</th>
                      <th className="py-3.5 px-4">Thiệp cưới</th>
                      <th className="py-3.5 px-4">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                    {sites.flatMap((site) =>
                      site.rsvps.map((rsvp) => (
                        <tr key={rsvp.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                            {rsvp.guestName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stone-500">
                            {rsvp.phone || 'Chưa cung cấp'}
                          </td>
                          <td className="py-3.5 px-4">
                            {rsvp.attending ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold text-[10px]">
                                ✓ Sẽ tham gia
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-semibold text-[10px]">
                                ✕ Rất tiếc không thể đến
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            {rsvp.attending ? `${rsvp.partySize || 1} người` : '0'}
                          </td>
                          <td className="py-3.5 px-4 text-stone-500">
                            {rsvp.eventTarget || 'Chung vui'}
                          </td>
                          <td className="py-3.5 px-4 text-stone-500 truncate max-w-[150px]">
                            {site.title}
                          </td>
                          <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                            {new Date(rsvp.createdAt).toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Wishes */}
      {activeTab === 'wishes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Sổ Lưu Bút &amp; Lời Chúc Mừng
              </h2>
              <p className="text-xs text-stone-500">
                Những lời chúc phúc ngọt ngào từ bạn bè và người thân gửi tặng hai bạn.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold">
              {totalWishes} lời chúc
            </span>
          </div>

          {sites.every((s) => s.wishes.length === 0) ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Chưa có lời chúc nào
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Người thân và bạn bè có thể gửi lời chúc trực tiếp ngay trên trang thiệp cưới của bạn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.flatMap((site) =>
                site.wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-2xl shadow-xs space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-xs">
                          {wish.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900 dark:text-white">
                            {wish.author}
                          </h4>
                          <span className="text-[10px] text-stone-400">
                            {new Date(wish.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteWish(site.slug, wish.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-500 transition-opacity"
                        title="Xóa lời chúc"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed bg-stone-50 dark:bg-stone-950/50 p-3 rounded-xl border border-stone-100 dark:border-stone-800/80">
                      &ldquo;{wish.content}&rdquo;
                    </p>

                    <div className="text-[10px] text-stone-400 flex items-center justify-between">
                      <span>Gửi tới: {site.title}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. Tab 4: Pricing Plan & Orders */}
      {activeTab === 'plan' && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Chính Sách Bảng Giá &amp; Gói Dịch Vụ LoveStory
            </h2>
            <p className="text-xs text-stone-500">
              Chính sách bảng giá minh bạch, mở khóa toàn bộ tính năng và không giới hạn lượt xem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 space-y-4">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Gói Trải Nghiệm
              </span>
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                  Miễn Phí
                </h3>
                <span className="text-xs text-stone-400">0 VNĐ trọn đời</span>
              </div>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-center gap-2">✓ Tối đa 300 lượt xem công khai</li>
                <li className="flex items-center gap-2">✓ Lưu trữ mở công khai 1 tháng (30 ngày)</li>
                <li className="flex items-center gap-2">✓ Lưu kho backup trong DB thêm 30 ngày</li>
                <li className="flex items-center gap-2">✓ Toàn bộ mẫu Basic &amp; Hiệu ứng rơi</li>
              </ul>
              {initialUser?.plan === 'FREE' && initialUser?.role !== 'ADMIN' && (
                <div className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs font-bold text-center">
                  Gói hiện tại của bạn
                </div>
              )}
            </div>

            {/* 50k */}
            <div className="bg-white dark:bg-stone-900 border-2 border-blue-500/40 rounded-3xl p-6 space-y-4 relative shadow-lg">
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                PHỔ BIẾN
              </span>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Gói Chuẩn 1 Năm
              </span>
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                  50.000 đ
                </h3>
                <span className="text-xs text-stone-400">Thời hạn 365 ngày</span>
              </div>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-center gap-2 font-semibold text-blue-400">
                  ✓ KHÔNG GIỚI HẠN lượt xem
                </li>
                <li className="flex items-center gap-2">✓ Thời hạn mở công khai 365 ngày</li>
                <li className="flex items-center gap-2">✓ Tải file danh sách RSVP Excel/CSV</li>
                <li className="flex items-center gap-2">✓ Đổi tên miền riêng &amp; mã QR cao cấp</li>
              </ul>
              <button
                type="button"
                onClick={() => openUpgradeModal({ defaultType: 'PLAN_ANNUAL_50K' })}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                {initialUser?.plan === 'ANNUAL_50K' ? 'Gia hạn gói 1 năm' : 'Nâng cấp gói 50.000 đ'}
              </button>
            </div>

            {/* 200k VIP */}
            <div className="bg-gradient-to-b from-stone-900 to-amber-950/40 border-2 border-amber-500/60 rounded-3xl p-6 space-y-4 relative shadow-xl text-white">
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                VIP TRỌN ĐỜI
              </span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Gói VIP Độc Quyền
              </span>
              <div>
                <h3 className="text-2xl font-serif font-bold text-white">
                  200.000 đ
                </h3>
                <span className="text-xs text-amber-300/80">Lưu trữ vĩnh viễn trọn đời</span>
              </div>
              <ul className="space-y-2 text-xs text-stone-200">
                <li className="flex items-center gap-2 font-bold text-amber-300">
                  ✓ KHÔNG GIỚI HẠN lượt xem trọn đời
                </li>
                <li className="flex items-center gap-2 font-bold text-amber-300">
                  ✓ Sử dụng TOÀN BỘ kho Template VIP
                </li>
                <li className="flex items-center gap-2">✓ Lưu trữ vĩnh viễn không bao giờ hết hạn</li>
                <li className="flex items-center gap-2">✓ Hỗ trợ gắn nhạc nền tùy chỉnh riêng</li>
              </ul>
              <button
                type="button"
                onClick={() => openUpgradeModal({ defaultType: 'PLAN_LIFETIME_VIP_200K' })}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                {initialUser?.plan === 'LIFETIME_VIP_200K' ? 'Đã kích hoạt VIP trọn đời' : 'Sở hữu VIP Trọn Đời (200k)'}
              </button>
            </div>
          </div>

          {/* Orders History */}
          {initialOrders.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-stone-200 dark:border-stone-800">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Lịch Sử Đơn Hàng Của Bạn
              </h3>
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-500">
                    <tr>
                      <th className="py-2.5 px-4">Mã đơn</th>
                      <th className="py-2.5 px-4">Gói dịch vụ</th>
                      <th className="py-2.5 px-4">Số tiền</th>
                      <th className="py-2.5 px-4">Trạng thái</th>
                      <th className="py-2.5 px-4">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {initialOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="py-2.5 px-4 font-mono">{ord.id}</td>
                        <td className="py-2.5 px-4 font-semibold">{ord.planRequested || 'Nâng cấp'}</td>
                        <td className="py-2.5 px-4 font-bold">{ord.amount.toLocaleString('vi-VN')} đ</td>
                        <td className="py-2.5 px-4">
                          {ord.status === 'PAID' ? (
                            <span className="text-emerald-500 font-bold">✓ Đã thanh toán</span>
                          ) : (
                            <span className="text-amber-500 font-medium">Chờ thanh toán</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-stone-400 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalSlug && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-200 text-white relative">
            <button
              onClick={() => setQrModalSlug(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif font-bold text-lg">{qrModalSlug.title}</h3>
            <p className="text-xs text-stone-400">
              Quét mã QR bằng Camera điện thoại hoặc Zalo để mở xem thiệp cưới ngay lập tức:
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${qrModalSlug.slug}`
                )}`}
                alt="QR Code Thiệp Cưới"
                className="w-48 h-48"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-stone-950 font-mono text-xs text-rose-300 break-all border border-stone-800">
              {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/{qrModalSlug.slug}
            </div>

            <button
              onClick={() => handleCopyLink(qrModalSlug.slug)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedSlug === qrModalSlug.slug ? '✓ Đã sao chép link!' : 'Sao chép liên kết'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSite && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 text-white">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base">Xác nhận xóa thiệp cưới</h3>
              <p className="text-xs text-stone-400">
                Bạn có chắc chắn muốn xóa thiệp <strong className="text-white">&ldquo;{deletingSite.title}&rdquo;</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSite(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteSite}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
