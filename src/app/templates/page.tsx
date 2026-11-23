'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Eye,
  Heart,
  ArrowRight,
  Search,
  Crown,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Check,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import { CATALOG_TEMPLATES, CatalogTemplate } from '@/data/templatesCatalog';
import TemplatePreviewModal from '@/components/templates/TemplatePreviewModal';
import UserDropdown from '@/components/auth/UserDropdown';
import { useAuth } from '@/context/AuthContext';

type CategoryFilter = 'all' | 'wedding' | 'birthday' | 'graduation' | 'event' | 'anniversary';
type StyleFilter = 'all' | 'envelope' | 'traditional' | 'minimalist' | 'korean_pastel' | 'editorial';
type TierFilter = 'all' | 'FREE' | 'BASIC' | 'PREMIUM';
type SortOption = 'recommended' | 'views' | 'likes' | 'newest';

const CATEGORY_TABS: { id: CategoryFilter; label: string; count?: number }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'wedding', label: 'Thiệp cưới' },
  { id: 'birthday', label: 'Thiệp sinh nhật' },
  { id: 'graduation', label: 'Thiệp tốt nghiệp' },
  { id: 'event', label: 'Sự kiện & Khai trương' },
  { id: 'anniversary', label: 'Kỷ niệm & Tình yêu' },
];

const STYLE_OPTIONS: { id: StyleFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất cả phong cách', icon: '✨' },
  { id: 'envelope', label: 'Phong bì mở nắp', icon: '💌' },
  { id: 'traditional', label: 'Cổ điển & Truyền thống', icon: '🏛️' },
  { id: 'minimalist', label: 'Tối giản hiện đại', icon: '🖤' },
  { id: 'korean_pastel', label: 'Hàn Quốc & Pastel', icon: '🌸' },
  { id: 'editorial', label: 'Tạp chí & Thời trang', icon: '📖' },
];

const TIER_OPTIONS: { id: TierFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả gói' },
  { id: 'FREE', label: '🎁 Miễn phí' },
  { id: 'BASIC', label: '⚡ Gói Basic' },
  { id: 'PREMIUM', label: '👑 Gói VIP (200k)' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recommended', label: 'Đề xuất nổi bật' },
  { id: 'views', label: 'Xem nhiều nhất' },
  { id: 'likes', label: 'Yêu thích nhất' },
  { id: 'newest', label: 'Mới cập nhật' },
];

export default function TemplatesCatalogPage() {
  const { user, openUpgradeModal } = useAuth();

  const [allTemplates, setAllTemplates] = useState<CatalogTemplate[]>(CATALOG_TEMPLATES);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [activeStyle, setActiveStyle] = useState<StyleFilter>('all');
  const [activeTier, setActiveTier] = useState<TierFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CatalogTemplate | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Fetch dynamic templates (including admin newly published templates)
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data?.templates && Array.isArray(data.templates) && data.templates.length > 0) {
          setAllTemplates(data.templates);
        }
      })
      .catch((err) => console.error('Failed to load templates from API:', err));
  }, []);

  // Load liked items from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lovestory_liked_templates');
      if (stored) {
        setLikedMap(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLike = (templateId: string) => {
    setLikedMap((prev) => {
      const updated = { ...prev, [templateId]: !prev[templateId] };
      try {
        localStorage.setItem('lovestory_liked_templates', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Filter & Sort
  const filteredTemplates = useMemo(() => {
    let result = [...allTemplates];

    // Filter Category
    if (activeCategory !== 'all') {
      result = result.filter((item) => item.category === activeCategory);
    }

    // Filter Style
    if (activeStyle !== 'all') {
      result = result.filter((item) => item.style === activeStyle);
    }

    // Filter Tier
    if (activeTier !== 'all') {
      result = result.filter((item) => item.tier === activeTier);
    }

    // Filter Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'likes':
        result.sort((a, b) => {
          const aLikes = a.likes + (likedMap[a.id] ? 1 : 0);
          const bLikes = b.likes + (likedMap[b.id] ? 1 : 0);
          return bLikes - aLikes;
        });
        break;
      case 'newest':
        result.reverse();
        break;
      case 'recommended':
      default:
        // Keep catalog order
        break;
    }

    return result;
  }, [activeCategory, activeTier, sortBy, searchQuery, likedMap]);

  const resetFilters = () => {
    setActiveCategory('all');
    setActiveStyle('all');
    setActiveTier('all');
    setSortBy('recommended');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-serif text-xl sm:text-2xl font-bold text-rose-600 flex items-center gap-2">
              <span>💍 LoveStory</span>
              <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900">
                Templates
              </span>
            </Link>

            {/* Breadcrumb Navigation */}
            <nav className="hidden md:flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <Link href="/" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <span className="text-stone-800 dark:text-stone-200 font-medium">Kho Mẫu Thiệp Online</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors"
              >
                <span>Bảng Điều Khiển</span>
              </Link>
            )}
            <UserDropdown variant="compact" />
            <Link
              href="/editor/studio"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Vào Studio Tạo Thiệp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KHO MẪU THIỆP MỜI ONLINE HIỆN ĐẠI</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
            Mẫu Thiệp Điện Ảnh Đẹp Nhất
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            Thiệp cưới, sinh nhật, thôi nôi và sự kiện chuẩn scrollytelling. Di chuột lên ảnh để xem tự động cuộn mẫu, nhấn vào để trải nghiệm mô phỏng trên điện thoại.
          </p>
        </div>

        {/* Filter Section */}
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200/70 dark:border-stone-800">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              const count =
                tab.id === 'all'
                  ? allTemplates.length
                  : allTemplates.filter((t) => t.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-stone-900 text-white dark:bg-rose-600 dark:text-white shadow-md'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Style Pills (Available for 'all' and 'wedding') */}
          {(activeCategory === 'all' || activeCategory === 'wedding') && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
              <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider pl-1 pr-1.5 shrink-0">
                Phong cách:
              </span>
              {STYLE_OPTIONS.map((style) => {
                const isStyleActive = activeStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setActiveStyle(style.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                      isStyleActive
                        ? 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold shadow-2xs'
                        : 'bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-600'
                    }`}
                  >
                    <span>{style.icon}</span>
                    <span>{style.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Secondary Controls Bar: Search, Tier, Sort */}
          <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm mẫu thiệp (hoa hồng, tối giản, hoàng gia...)"
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-stone-900 dark:text-white placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Tier & Sort Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Tier Filter */}
              <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                {TIER_OPTIONS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setActiveTier(tier.id)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                      activeTier === tier.id
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-bold shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset if filters active */}
              {(activeCategory !== 'all' || activeStyle !== 'all' || activeTier !== 'all' || searchQuery || sortBy !== 'recommended') && (
                <button
                  onClick={resetFilters}
                  title="Đặt lại bộ lọc"
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
          <span>
            Tìm thấy <strong className="text-stone-900 dark:text-white font-bold">{filteredTemplates.length}</strong> mẫu thiệp
          </span>
          <span className="hidden sm:inline-block">
            Mẹo: Rê chuột lên mẫu để xem tự động cuộn toàn bộ thiệp
          </span>
        </div>

        {/* Templates Grid - 6 Columns Responsive */}
        {filteredTemplates.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-200">
              Không tìm thấy mẫu thiệp phù hợp
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Không có mẫu nào khớp với bộ lọc hoặc từ khóa bạn vừa nhập. Hãy thử tìm từ khóa khác hoặc xóa bộ lọc.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Đặt lại toàn bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {filteredTemplates.map((tmpl) => {
              const isLiked = !!likedMap[tmpl.id];
              const likeCount = tmpl.likes + (isLiked ? 1 : 0);

              return (
                <div
                  key={tmpl.id}
                  className="group relative flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-rose-400/70 dark:hover:border-rose-500/60 shadow-xs hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Thumbnail Container with Auto-Scroll on Hover */}
                  <div
                    onClick={() => setSelectedTemplate(tmpl)}
                    className="relative aspect-[9/13] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer"
                  >
                    {/* The Long Thumbnail image with smooth gliding on hover */}
                    <div className="w-full h-full overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tmpl.longThumbnail}
                        alt={tmpl.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover object-top transition-transform duration-[8500ms] ease-linear group-hover:-translate-y-[calc(100%-250px)]"
                      />
                    </div>

                    {/* Corner Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      {tmpl.tier === 'PREMIUM' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-[10px] shadow-md tracking-wider">
                          <Crown className="w-3 h-3 fill-stone-950" />
                          <span>VIP</span>
                        </span>
                      ) : tmpl.tier === 'BASIC' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] shadow-sm">
                          Basic
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-[10px] shadow-sm">
                          Miễn phí
                        </span>
                      )}
                    </div>

                    {/* Floating Like Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(tmpl.id);
                      }}
                      title="Yêu thích mẫu này"
                      className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-90"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white'
                        }`}
                      />
                    </button>

                    {/* Dark Hover Action Overlay */}
                    <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3 pointer-events-none group-hover:pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(tmpl);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-600 hover:text-white text-stone-900 font-bold text-xs shadow-lg transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem mẫu</span>
                      </button>

                      <Link
                        href={`/editor/studio?template=${encodeURIComponent(tmpl.slug || tmpl.id)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-1.5"
                      >
                        <span>Soạn thảo Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Card Content & Metadata */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3
                        onClick={() => setSelectedTemplate(tmpl)}
                        className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate hover:text-rose-600 cursor-pointer"
                        title={tmpl.name}
                      >
                        {tmpl.name}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                        <span className="capitalize">
                          {tmpl.category === 'wedding'
                            ? 'Thiệp cưới'
                            : tmpl.category === 'birthday'
                            ? 'Sinh nhật'
                            : tmpl.category === 'graduation'
                            ? 'Tốt nghiệp'
                            : 'Sự kiện'}
                        </span>
                        {tmpl.tier === 'PREMIUM' ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">200k/trọn đời</span>
                        ) : tmpl.tier === 'BASIC' ? (
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">50k/năm</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free</span>
                        )}
                      </div>
                    </div>

                    {/* Stats Bar (Views & Likes) */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                      <div className="flex items-center gap-1">
                        <Heart className={`w-3 h-3 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
                        <span>{likeCount.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{tmpl.views >= 1000 ? `${(tmpl.views / 1000).toFixed(1)}k` : tmpl.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner Promo */}
        <section className="mt-16 rounded-3xl bg-gradient-to-br from-rose-900 via-stone-900 to-black text-white p-6 sm:p-12 relative overflow-hidden shadow-2xl border border-rose-800/40">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" /> Tạo thiệp cưới online miễn phí
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold leading-tight">
              Sở Hữu Trang Thiệp Cưới Điện Ảnh Riêng Cho Ngày Trọng Đại
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Tạo thiệp chỉ mất 3 phút. Khách mời có thể gửi lời chúc, xác nhận tham dự (RSVP) và quét mã VietQR mừng cưới ngay trên chiếc điện thoại của mình.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/editor"
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>Bắt đầu tạo thiệp ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => openUpgradeModal({ defaultType: 'PLAN_LIFETIME_VIP_200K' })}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Nâng cấp VIP trọn đời (200k)</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Mobile Simulator Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        isLiked={selectedTemplate ? !!likedMap[selectedTemplate.id] : false}
        onToggleLike={() => selectedTemplate && toggleLike(selectedTemplate.id)}
      />
    </div>
  );
}