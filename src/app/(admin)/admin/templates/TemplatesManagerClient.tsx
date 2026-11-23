'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Sparkles,
  Crown,
  Eye,
  Check,
  AlertCircle,
  Save,
  ExternalLink,
  Trash2,
  Layers,
  Settings2,
  Palette,
  X,
  CheckCircle2,
  Filter,
  Type,
  Wand2,
  Music,
  Code2,
  Globe,
} from 'lucide-react';
import { CatalogTemplate } from '@/data/templatesCatalog';
import minviteTemplates from '@/data/minvite_templates.json';

interface DbTemplateData {
  id: string;
  name: string;
  slug: string;
  description: string;
  tier: 'BASIC' | 'VIP';
  price: number;
  badge?: string | null;
  thumbnail: string;
  isActive: boolean;
  displayOrder: number;
  sites: { id: string }[];
  purchases: { id: string }[];
}

interface Props {
  initialDbTemplates: DbTemplateData[];
  initialCatalogTemplates: CatalogTemplate[];
  initialHarvestedTemplates?: any[];
}

export default function TemplatesManagerClient({
  initialDbTemplates,
  initialCatalogTemplates,
  initialHarvestedTemplates = [],
}: Props) {
  // Tabs: Catalog, 188 Harvested templates, M-Invite templates, Core Engines, Typography & Effects
  const [activeTab, setActiveTab] = useState<'catalog' | 'harvested' | 'minvite' | 'engines' | 'typography-effects'>('catalog');

  // State for Catalog Templates
  const [catalogTemplates, setCatalogTemplates] = useState<CatalogTemplate[]>(initialCatalogTemplates);
  const [searchCatalog, setSearchCatalog] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // State for Harvested Templates
  const [harvestedTemplates] = useState<any[]>(initialHarvestedTemplates);
  const [searchHarvested, setSearchHarvested] = useState('');
  const [harvestedFilter, setHarvestedFilter] = useState<'all' | 'wedding' | 'birthday' | 'event'>('all');

  // State for M-Invite Scraped Templates
  const [searchMinvite, setSearchMinvite] = useState('');
  const [minviteFilter, setMinviteFilter] = useState<string>('all');

  // State for DB Engine Templates
  const [dbTemplates, setDbTemplates] = useState<DbTemplateData[]>(initialDbTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editBadge, setEditBadge] = useState<string>('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Modal State for New Template
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Editing Existing Template
  const [editingCatalogTemplate, setEditingCatalogTemplate] = useState<CatalogTemplate | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormCategory, setEditFormCategory] = useState<'wedding' | 'birthday' | 'graduation' | 'event' | 'anniversary'>('wedding');
  const [editFormTier, setEditFormTier] = useState<'FREE' | 'BASIC' | 'PREMIUM'>('PREMIUM');
  const [editFormPrice, setEditFormPrice] = useState<number>(30000);
  const [editFormBadge, setEditFormBadge] = useState('Hot');
  const [editFormThumbnail, setEditFormThumbnail] = useState('');
  const [editFormDescription, setEditFormDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Form State for New Template
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState<'wedding' | 'birthday' | 'graduation' | 'event' | 'anniversary'>('wedding');
  const [formTier, setFormTier] = useState<'FREE' | 'BASIC' | 'PREMIUM'>('PREMIUM');
  const [formPrice, setFormPrice] = useState<number>(30000);
  const [formBadge, setFormBadge] = useState('Hot');
  const [formBaseEngine, setFormBaseEngine] = useState<'burgundy' | 'pastel' | 'floral' | 'retro'>('burgundy');
  const [formThumbnail, setFormThumbnail] = useState(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  );
  const [formDescription, setFormDescription] = useState('Mẫu thiệp scrollytelling điện ảnh sang trọng và hiện đại.');

  // Quick Preset Sample Images
  const SAMPLE_PRESETS = [
    {
      name: 'Váy Cưới Trắng & Đồi Cỏ',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Hoàng Hôn Lãng Mạn Bờ Biển',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Vintage Đèn Lồng Cổ Điển',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Hoa Hồng & Pastel Tối Giản',
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Filtering Catalog
  const filteredCatalog = useMemo(() => {
    return catalogTemplates.filter((item) => {
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchTier = tierFilter === 'all' || item.tier === tierFilter;
      const matchSearch =
        !searchCatalog.trim() ||
        item.name.toLowerCase().includes(searchCatalog.toLowerCase()) ||
        item.description.toLowerCase().includes(searchCatalog.toLowerCase()) ||
        item.id.toLowerCase().includes(searchCatalog.toLowerCase());
      return matchCat && matchTier && matchSearch;
    });
  }, [catalogTemplates, categoryFilter, tierFilter, searchCatalog]);

  // Filtering Harvested Templates (188 templates)
  const filteredHarvested = useMemo(() => {
    return harvestedTemplates.filter((item) => {
      const matchCat =
        harvestedFilter === 'all'
          ? true
          : harvestedFilter === 'wedding'
          ? item.slug.includes('cuoi')
          : harvestedFilter === 'birthday'
          ? item.slug.includes('sinh-nhat')
          : !item.slug.includes('cuoi') && !item.slug.includes('sinh-nhat');
      const matchSearch =
        !searchHarvested.trim() ||
        (item.title && item.title.toLowerCase().includes(searchHarvested.toLowerCase())) ||
        item.slug.toLowerCase().includes(searchHarvested.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [harvestedTemplates, harvestedFilter, searchHarvested]);

  // Handle Promote Harvested Template to Publish Modal
  const handlePromoteHarvested = (item: any) => {
    const cleanTitle = item.title
      ? item.title.replace(/-\s*Thiệp online LoveStory.*$/i, '').replace(/-\s*CineLove.*$/i, '').trim()
      : `Mẫu Thiệp ${item.slug}`;
    setFormName(cleanTitle);
    setFormSlug(item.slug);
    setFormCategory(
      item.slug.includes('sinh-nhat')
        ? 'birthday'
        : item.slug.includes('tot-nghiep')
        ? 'graduation'
        : item.slug.includes('tan-gia') || item.slug.includes('su-kien')
        ? 'event'
        : 'wedding'
    );
    setFormTier('PREMIUM');
    setFormPrice(30000);
    setFormBadge('VIP');
    setFormBaseEngine('burgundy');
    setFormThumbnail(
      item.coverImage ||
      item.longThumbnail ||
      item.images?.[0] ||
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
    );
    setFormDescription(
      `Mẫu thiết kế cao cấp "${cleanTitle}" gồm ${item.imagesCount || 10} hình ảnh thời trang cùng hiệu ứng tương tác trực tiếp.`
    );
    setShowCreateModal(true);
  };

  // Filtering M-Invite Templates (69 templates)
  const filteredMinvite = useMemo(() => {
    return (minviteTemplates as any[]).filter((item) => {
      const matchCat =
        minviteFilter === 'all'
          ? true
          : minviteFilter === 'wedding'
          ? item.category === 'wedding'
          : minviteFilter === 'birthday'
          ? item.category === 'birthday' || item.category === 'baby'
          : item.category === 'opening' || item.category === 'event';
      const matchSearch =
        !searchMinvite.trim() ||
        item.title.toLowerCase().includes(searchMinvite.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchMinvite.toLowerCase()) ||
        item.slug?.toLowerCase().includes(searchMinvite.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [minviteFilter, searchMinvite]);

  // Handle Promote M-Invite Template to Publish Modal
  const handlePublishMinvite = (item: any) => {
    setFormName(item.title);
    setFormSlug(item.slug);
    setFormCategory(item.category === 'wedding' ? 'wedding' : item.category === 'birthday' ? 'birthday' : 'event');
    setFormTier(item.planRequired === 1 ? 'PREMIUM' : 'FREE');
    setFormPrice(item.planRequired === 1 ? 200000 : 0);
    setFormBadge(item.planRequired === 1 ? 'VIP' : 'MIỄN PHÍ');
    setFormThumbnail(item.coverImage || item.thumbnail);
    setFormDescription(item.description || `Mẫu thiệp ${item.title} thu thập từ M-Invite.`);
    setShowCreateModal(true);
  };

  // Handle Update DB Engine Template
  const handleUpdateDbTemplate = async (id: string, updates: Partial<DbTemplateData>) => {
    setLoadingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cập nhật thất bại');
      }

      setDbTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      setEditingId(null);
      setMessage({ text: 'Cập nhật cấu hình engine thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  // Handle Delete Custom Template
  const handleDeleteCustomTemplate = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mẫu "${name}" khỏi kho mẫu công khai?`)) return;

    setMessage(null);
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể xóa mẫu này');
      }

      setCatalogTemplates((prev) => prev.filter((t) => t.id !== id));
      setMessage({ text: `Đã xóa mẫu "${name}" thành công!`, type: 'success' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  // Handle Create and Publish New Template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formThumbnail.trim()) {
      setMessage({ text: 'Vui lòng điền đầy đủ Tên mẫu và Ảnh xem trước', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          slug: formSlug.trim() || undefined,
          category: formCategory,
          tier: formTier,
          price: formTier === 'FREE' ? 0 : formPrice,
          badge: formBadge.trim() || undefined,
          longThumbnail: formThumbnail.trim(),
          baseTemplateId: formBaseEngine,
          description: formDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Phát hành mẫu thất bại');
      }

      // Prepend to catalog templates
      if (data.template) {
        setCatalogTemplates((prev) => [data.template, ...prev]);
      }

      setShowCreateModal(false);
      setMessage({
        text: `🎉 Đã phát hành mẫu thiệp "${formName}" thành công lên toàn hệ thống!`,
        type: 'success',
      });
      setTimeout(() => setMessage(null), 5000);

      // Reset Form
      setFormName('');
      setFormSlug('');
      setFormPrice(30000);
      setFormBadge('Hot');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi phát hành template';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal for a Catalog Template
  const handleOpenEditModal = (tpl: CatalogTemplate) => {
    setEditingCatalogTemplate(tpl);
    setEditFormName(tpl.name);
    setEditFormCategory(tpl.category);
    setEditFormTier(tpl.tier);
    setEditFormPrice(tpl.price !== undefined ? tpl.price : (tpl.tier === 'BASIC' ? 50000 : tpl.tier === 'PREMIUM' ? 30000 : 0));
    setEditFormBadge(tpl.badge || '');
    setEditFormThumbnail(tpl.longThumbnail);
    setEditFormDescription(tpl.description || '');
  };

  // Save changes to existing template
  const handleSaveCatalogTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatalogTemplate) return;
    setIsSavingEdit(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/templates/${encodeURIComponent(editingCatalogTemplate.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormName.trim(),
          category: editFormCategory,
          tier: editFormTier,
          price: editFormTier === 'FREE' ? 0 : editFormPrice,
          badge: editFormBadge.trim(),
          longThumbnail: editFormThumbnail.trim(),
          description: editFormDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cập nhật mẫu thiệp thất bại');
      }

      setCatalogTemplates((prev) =>
        prev.map((t) =>
          t.id === editingCatalogTemplate.id
            ? {
                ...t,
                name: editFormName.trim(),
                category: editFormCategory,
                tier: editFormTier,
                price: editFormTier === 'FREE' ? 0 : editFormPrice,
                badge: editFormBadge.trim() as any,
                longThumbnail: editFormThumbnail.trim(),
                description: editFormDescription.trim(),
              }
            : t
        )
      );

      setMessage({
        type: 'success',
        text: `✓ Đã cập nhật thành công thông tin mẫu "${editFormName.trim()}"!`,
      });
      setTimeout(() => setMessage(null), 5000);
      setEditingCatalogTemplate(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi cập nhật mẫu thiệp';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-stone-100 text-stone-700 border border-stone-200">
              Quản Trị Giao Diện &amp; Template
            </span>
            <span className="text-xs text-stone-500">
              {catalogTemplates.length} Mẫu thiệp đang mở
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Kho Mẫu Thiệp Cưới &amp; Sự Kiện Online
          </h1>
          <p className="text-xs text-stone-500 max-w-2xl">
            Quản lý danh sách mẫu thiệp trên thị trường, định giá từng mẫu hoặc gói VIP, và phát hành giao diện mới cho khách hàng sử dụng ngay trong Studio.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/studio"
            className="px-5 py-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 text-stone-700 hover:text-white border border-stone-900/30 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-stone-700" />
            <span>Soạn Mẫu Trong Studio</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Phát Hành Nhanh</span>
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}



      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200/90 gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kho Mẫu Thị Trường ({catalogTemplates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('harvested')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'harvested'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Thư Viện 188 Mẫu Thực Tế ({harvestedTemplates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('minvite')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'minvite'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-200'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Mẫu M-Invite ({minviteTemplates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('engines')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'engines'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-200'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>4 Engine Cốt Lõi (Database)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('typography-effects')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'typography-effects'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-200'
          }`}
        >
          <Type className="w-4 h-4 text-pink-400" />
          <span>Phông Chữ &amp; Hiệu Ứng Studio</span>
        </button>
      </div>

      {/* TAB 1: CATALOG TEMPLATES */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-stone-200/90">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mẫu theo tên, mã hoặc mô tả..."
                value={searchCatalog}
                onChange={(e) => setSearchCatalog(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Category & Tier Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-stone-300 focus:outline-none focus:border-stone-900"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="wedding">Thiệp cưới</option>
                <option value="birthday">Thiệp sinh nhật</option>
                <option value="graduation">Thiệp tốt nghiệp</option>
                <option value="event">Sự kiện &amp; Khai trương</option>
                <option value="anniversary">Kỷ niệm &amp; Tình yêu</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-stone-300 focus:outline-none focus:border-stone-900"
              >
                <option value="all">Tất cả phân hạng</option>
                <option value="FREE">Miễn phí (Free)</option>
                <option value="BASIC">Gói Cơ Bản (Basic)</option>
                <option value="PREMIUM">Gói VIP (Premium)</option>
              </select>

              <span className="text-[11px] text-stone-500 whitespace-nowrap pl-2">
                Hiển thị: <strong className="text-stone-300">{filteredCatalog.length}</strong> mẫu
              </span>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCatalog.map((tpl) => {
              const isCustom = tpl.id.startsWith('tpl-') && !tpl.id.startsWith('tpl-wedding-');

              return (
                <div
                  key={tpl.id}
                  className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden flex flex-col justify-between hover:border-stone-900/50 transition-all group"
                >
                  {/* Image & Header */}
                  <div>
                    <div className="relative aspect-[3/4] bg-stone-50/60 overflow-hidden border-b border-stone-200/90">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tpl.longThumbnail}
                        alt={tpl.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Badges on Thumbnail */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {tpl.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-white backdrop-blur-xs text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            {tpl.badge}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-white backdrop-blur-xs text-stone-300 text-[9px] font-medium border border-stone-200/80">
                          Engine: {tpl.baseTemplateId}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2 z-10">
                        {tpl.tier === 'PREMIUM' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                            <Crown className="w-3 h-3" /> VIP
                          </span>
                        ) : tpl.tier === 'BASIC' ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                            Basic
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                            Free
                          </span>
                        )}
                      </div>

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-stone-50/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <Link
                          href={`/admin/studio?template=${encodeURIComponent(tpl.slug || tpl.id)}`}
                          className="w-full py-2 rounded-xl bg-stone-900 hover:bg-purple-500 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-lg"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Soạn trong Admin Studio</span>
                        </Link>
                        <Link
                          href="/templates"
                          target="_blank"
                          className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs text-center flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem ngoài web</span>
                        </Link>
                      </div>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-white truncate" title={tpl.name}>
                          {tpl.name}
                        </h3>
                        {isCustom && (
                          <button
                            type="button"
                            title="Xóa mẫu tự tạo"
                            onClick={() => handleDeleteCustomTemplate(tpl.id, tpl.name)}
                            className="text-stone-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-stone-500">
                          {tpl.category === 'wedding'
                            ? 'Thiệp cưới'
                            : tpl.category === 'birthday'
                            ? 'Sinh nhật'
                            : tpl.category === 'graduation'
                            ? 'Tốt nghiệp'
                            : tpl.category === 'event'
                            ? 'Sự kiện'
                            : 'Kỷ niệm'}
                        </span>

                        <span className="font-bold text-stone-200">
                          {tpl.tier === 'PREMIUM'
                            ? `${tpl.price ? tpl.price.toLocaleString('vi-VN') : '30.000'} đ`
                            : tpl.tier === 'BASIC'
                            ? '50.000 đ'
                            : '0 đ (Free)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Card Action Buttons */}
                  <div className="px-4 py-2.5 border-t border-stone-200/90 bg-stone-50/60 flex items-center gap-2">
                    <Link
                      href={`/admin/studio?template=${encodeURIComponent(tpl.slug || tpl.id)}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-900/20 hover:bg-stone-900 text-stone-700 hover:text-white border border-stone-900/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                      <span>Soạn Studio</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(tpl)}
                      className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-stone-500" />
                      <span>Sửa</span>
                    </button>

                    <Link
                      href={`/${tpl.slug || tpl.id}`}
                      target="_blank"
                      title="Xem thử ngoài web"
                      className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-500 hover:text-stone-200 border border-stone-200/80 transition-all flex items-center justify-center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-2.5 border-t border-stone-200/80 bg-stone-50/60 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span className="truncate max-w-[120px]">{tpl.id}</span>
                    <span className="text-stone-500">
                      👁 {tpl.views.toLocaleString('vi-VN')} • ❤️ {tpl.likes.toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* TAB 2: DB CORE RENDERING ENGINES */}
      {activeTab === 'engines' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
            <strong>Lưu ý kiến trúc:</strong> Đây là 4 Engine hiển thị và hiệu ứng cốt lõi trong cơ sở dữ liệu SQLite (<code className="font-mono text-amber-200">Template</code> table). Mọi thiệp cưới của khách hàng khi tạo ra sẽ liên kết trực tiếp với một trong 4 Engine này để render hiệu ứng cuộn, nhạc nền, đĩa than và hoa bay.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dbTemplates.map((tpl) => {
              const isBusy = loadingId === tpl.id;
              const isEditing = editingId === tpl.id;

              return (
                <div
                  key={tpl.id}
                  className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    tpl.isActive
                      ? 'bg-white border-stone-200/90'
                      : 'bg-stone-50/60 border-stone-200/80 opacity-70'
                  }`}
                >
                  {/* Top Info */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-28 rounded-xl overflow-hidden border border-stone-200/80 shrink-0 bg-stone-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                        {tpl.badge && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-white backdrop-blur-xs text-amber-300 text-[9px] font-bold">
                            {tpl.badge}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-white truncate">{tpl.name}</h3>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpdateDbTemplate(tpl.id, { isActive: !tpl.isActive })}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              tpl.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-stone-800 text-stone-500 border border-stone-200/80'
                            }`}
                          >
                            {tpl.isActive ? '● ĐANG BẬT' : '○ ĐÃ TẮT'}
                          </button>
                        </div>

                        <p className="text-xs text-stone-500 mb-2 line-clamp-2">{tpl.description}</p>

                        {/* Tier Selector */}
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpdateDbTemplate(tpl.id, { tier: 'BASIC', price: 0 })}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              tpl.tier === 'BASIC'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                                : 'bg-stone-800/60 text-stone-500 border border-stone-200/80/60 hover:text-stone-300'
                            }`}
                          >
                            🎁 Cơ Bản (Miễn Phí)
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              handleUpdateDbTemplate(tpl.id, { tier: 'VIP', price: tpl.price || 30000 })
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                              tpl.tier === 'VIP'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                                : 'bg-stone-800/60 text-stone-500 border border-stone-200/80/60 hover:text-stone-300'
                            }`}
                          >
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span>👑 VIP (Mua lẻ / Gói 200k)</span>
                          </button>
                        </div>

                        {/* Edit Price & Badge Form */}
                        {isEditing ? (
                          <div className="space-y-2 mt-2 p-2 rounded-xl bg-stone-50/60 border border-stone-200/90">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-stone-500 mb-0.5 font-semibold">
                                  Giá bán lẻ (VNĐ)
                                </label>
                                <input
                                  type="number"
                                  step="5000"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="w-full px-2 py-1 rounded-lg text-xs bg-stone-900 border border-stone-200/80 text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-stone-500 mb-0.5 font-semibold">
                                  Huy hiệu (Badge)
                                </label>
                                <input
                                  type="text"
                                  value={editBadge}
                                  onChange={(e) => setEditBadge(e.target.value)}
                                  placeholder="Hot, VIP..."
                                  className="w-full px-2 py-1 rounded-lg text-xs bg-stone-900 border border-stone-200/80 text-white focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 rounded-md text-[10px] text-stone-500 hover:text-stone-200"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateDbTemplate(tpl.id, {
                                    price: editPrice,
                                    badge: editBadge.trim() || null,
                                  })
                                }
                                className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-stone-900 hover:bg-purple-500 text-white flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" />
                                <span>Lưu Thay Đổi</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                            <div>
                              {tpl.tier === 'VIP' ? (
                                <span className="text-amber-400 font-bold">
                                  Giá bán lẻ: {tpl.price.toLocaleString('vi-VN')} đ
                                </span>
                              ) : (
                                <span className="text-emerald-400">0 đ (Miễn phí)</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(tpl.id);
                                setEditPrice(tpl.price);
                                setEditBadge(tpl.badge || '');
                              }}
                              className="text-stone-700 hover:text-stone-700 font-medium underline"
                            >
                              Sửa giá &amp; badge
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="px-5 py-3 border-t border-stone-200/80 bg-stone-50/60 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span>Mã: <code className="text-stone-300 font-mono">{tpl.id}</code></span>
                      <span>•</span>
                      <span>{tpl.sites.length} thiệp đang kích hoạt</span>
                    </div>

                    <Link
                      href={`/editor/studio?template=${encodeURIComponent(tpl.slug || tpl.id)}`}
                      target="_blank"
                      className="text-stone-500 hover:text-white flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Thử trong Studio</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* TAB 3: HARVESTED TEMPLATES (188 MẪU THỰC TẾ) */}
      {activeTab === 'harvested' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-stone-200/90">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm trong 188 mẫu thực tế..."
                value={searchHarvested}
                onChange={(e) => setSearchHarvested(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `Tất cả (${harvestedTemplates.length})` },
                { id: 'wedding', label: 'Thiệp cưới' },
                { id: 'birthday', label: 'Sinh nhật' },
                { id: 'event', label: 'Sự kiện khác' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setHarvestedFilter(cat.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    harvestedFilter === cat.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-800 text-stone-500 hover:text-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredHarvested.map((item, idx) => {
              const cleanTitle = item.title
                ? item.title.replace(/-\s*Thiệp online LoveStory.*$/i, '').replace(/-\s*CineLove.*$/i, '').trim()
                : `Mẫu Thiệp ${item.slug}`;

              const thumbUrl =
                item.coverImage ||
                item.longThumbnail ||
                (item.images && item.images.length > 0 ? item.images[0] : null) ||
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={item.slug || idx}
                  className="group relative flex flex-col rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 hover:shadow-xs overflow-hidden transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[9/13] w-full bg-stone-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl}
                      alt={cleanTitle}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    {/* Image count and audio badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-medium">
                        {item.imagesCount || 10} ảnh
                      </span>
                      {item.audios && item.audios.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-medium flex items-center gap-1">
                          <Music className="w-2.5 h-2.5" /> Có nhạc
                        </span>
                      )}
                    </div>

                    {/* Slug badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-mono">
                        {item.slug}
                      </span>
                    </div>

                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3.5 z-20">
                      <Link
                        href={`/editor/studio?template=${encodeURIComponent(item.slug)}`}
                        target="_blank"
                        className="w-full py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-medium text-xs text-center flex items-center justify-center gap-1.5 shadow-md transition-colors"
                      >
                        <Palette className="w-3.5 h-3.5 text-stone-700" />
                        <span>Mở Trong Studio</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handlePromoteHarvested(item)}
                        className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs text-center flex items-center justify-center gap-1.5 shadow-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Phát Hành Vào Kho</span>
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-medium text-xs text-stone-900 line-clamp-1" title={cleanTitle}>
                        {cleanTitle}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        Mã: {item.slug}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                      <Link
                        href={`/editor/studio?template=${encodeURIComponent(item.slug)}`}
                        target="_blank"
                        className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <span>Soạn thảo</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handlePromoteHarvested(item)}
                        className="text-stone-900 hover:underline font-medium text-[11px]"
                      >
                        + Mở bán
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3B: M-INVITE SCRAPED TEMPLATES (69 MẪU TỪ M-INVITE.COM) */}
      {activeTab === 'minvite' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm trong 69 mẫu M-Invite..."
                value={searchMinvite}
                onChange={(e) => setSearchMinvite(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `Tất cả (${minviteTemplates.length})` },
                { id: 'wedding', label: 'Thiệp cưới (60)' },
                { id: 'birthday', label: 'Sinh nhật & Thôi nôi (6)' },
                { id: 'event', label: 'Sự kiện & Khai trương (3)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setMinviteFilter(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    minviteFilter === cat.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMinvite.map((item: any, idx: number) => {
              const thumbUrl = item.coverImage || item.thumbnail;
              return (
                <div
                  key={item.id || idx}
                  className="rounded-2xl border border-stone-200/90 bg-white shadow-2xs overflow-hidden flex flex-col group hover:shadow-md hover:border-blue-400 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[9/16] bg-stone-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category & Plan Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-stone-800 shadow-xs backdrop-blur-xs">
                        {item.categoryLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs">
                        {item.tier}
                      </span>
                    </div>

                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-stone-600 hover:text-stone-900 shadow-xs transition-colors"
                      title="Xem mẫu gốc tại m-invite.com"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {/* Hover Overlay Action Buttons */}
                    <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3 backdrop-blur-[2px]">
                      <Link
                        href={`/editor/studio?template=${encodeURIComponent(item.slug)}`}
                        target="_blank"
                        className="w-full py-2 px-3 rounded-xl bg-white text-stone-900 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-stone-100 transition-colors"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Mở trong Studio</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handlePublishMinvite(item)}
                        className="w-full py-2 px-3 rounded-xl bg-stone-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>+ Phát Hành Vào Kho</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between bg-white border-t border-stone-100">
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description || 'Mẫu thiết kế cào từ m-invite.com'}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-stone-400 text-[10px]">
                        ID: {item.id.slice(-6)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePublishMinvite(item)}
                        className="text-stone-900 hover:underline font-medium text-[11px]"
                      >
                        + Mở bán
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* TAB 4: PHÔNG CHỮ & HIỆU ỨNG STUDIO (TYPOGRAPHY & EFFECTS SHOWROOM) */}
      {activeTab === 'typography-effects' && (
        <div className="space-y-8">
          {/* Section 1: Typography System */}
          <div className="space-y-4 p-6 rounded-3xl bg-white border border-stone-200/90">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  Typography Engine
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-0.5">
                  1. Hệ Thống Phông Chữ Cưới (Typography Showroom)
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                  Danh sách các phông chữ được tích hợp sẵn trong trình soạn thảo Studio. Khách hàng và Admin có thể áp dụng tức thì cho bất kỳ dòng tiêu đề hoặc nội dung thiệp nào.
                </p>
              </div>
            </div>

            {/* Font Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Group 1: Calligraphy / Script */}
              <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/90 pb-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Chữ Viết Tay &amp; Thư Pháp
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">Script</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Pinyon Script</span>
                    <p style={{ fontFamily: 'Pinyon Script, cursive' }} className="text-2xl text-amber-200 mt-1">
                      Save The Date
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Dùng cho tiêu đề bìa, ngày cưới hoàng gia</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Great Vibes</span>
                    <p style={{ fontFamily: 'Great Vibes, cursive' }} className="text-2xl text-rose-300 mt-1">
                      Thanh Hằng &amp; Minh Trí
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Dùng cho tên cô dâu chú rể lãng mạn</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Paris Regular</span>
                    <p style={{ fontFamily: 'Paris Regular, cursive' }} className="text-xl text-stone-200 mt-1">
                      Our Love Story
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Phong cách thời trang tạp chí thanh lịch</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Editorial Serif */}
              <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/90 pb-2">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Chữ Có Chân Thanh Lịch
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">Serif</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Playfair Display</span>
                    <p style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-bold text-stone-100 mt-1 tracking-wider">
                      WEDDING INVITATION
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Chuẩn bìa tạp chí Vogue, sang trọng và quyền quý</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Cormorant Garamond</span>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-lg italic text-amber-200/90 mt-1">
                      &quot;Yêu là cùng nhau đi suốt cuộc đời&quot;
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Dùng cho các câu trích dẫn thơ, triết lý tình yêu</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Cinzel / Bodoni</span>
                    <p className="text-sm font-serif font-bold text-stone-300 mt-1 tracking-widest uppercase">
                      28 . 12 . 2026
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Dùng cho thời gian ngày cưới cổ điển</span>
                  </div>
                </div>
              </div>

              {/* Group 3: Clean Sans-serif */}
              <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/90 pb-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Chữ Hiện Đại Rõ Ràng
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">Sans-Serif</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Montserrat</span>
                    <p className="text-sm font-sans font-semibold text-stone-200 mt-1">
                      Trung Tâm Hội Nghị Tiệc Cưới White Palace
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Dễ đọc cho địa chỉ, bản đồ, thời gian tiệc</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Be Vietnam Pro / Inter</span>
                    <p className="text-xs font-sans text-stone-300 mt-1">
                      Số tài khoản: 1903678888 • Vietcombank
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Tối ưu hiển thị số tài khoản VietQR và biểu mẫu RSVP</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-stone-200/90">
                    <span className="text-[10px] text-stone-500 block font-mono">Tabular Nums (Chống lệch số)</span>
                    <p className="text-lg font-mono font-bold text-amber-400 mt-1 tracking-wider">
                      28 : 14 : 09 : 45
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1 block">Đồng hồ đếm ngược ngày cưới không bị giật số</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guide to Add New Font */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 text-xs text-stone-300 space-y-2">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                Hướng dẫn Admin thêm Phông Chữ Mới vào Studio:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-500 leading-relaxed">
                <li>Copy file phông chữ định dạng <code className="text-stone-700 font-mono">.woff2</code> hoặc <code className="text-stone-700 font-mono">.ttf</code> vào thư mục <code className="text-stone-700 font-mono">public/assets/fonts/</code>.</li>
                <li>Khai báo cú pháp <code className="text-stone-700 font-mono">@font-face</code> trong <code className="text-stone-700 font-mono">src/app/globals.css</code> (hoặc import từ Google Fonts).</li>
                <li>Mở file <code className="text-stone-700 font-mono">StudioRightInspector.tsx</code> và thêm thẻ <code className="text-stone-700 font-mono">&lt;option value=&quot;Tên Phông&quot;&gt;</code> vào danh sách phông. Phông mới sẽ lập tức sẵn sàng cho khách hàng sử dụng!</li>
              </ol>
            </div>
          </div>

          {/* Section 2: Effects & Animation System */}
          <div className="space-y-4 p-6 rounded-3xl bg-white border border-stone-200/90">
            <div>
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                Animation Engine
              </span>
              <h3 className="text-xl font-serif font-bold text-white mt-0.5">
                2. Hệ Thống Hiệu Ứng Rơi &amp; Chuyển Động (Effects Engine)
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Bao gồm 7 hiệu ứng hạt rơi chuẩn điện ảnh, các chuyển động liên tục cho thành phần trang trí, và các tiện ích tương tác độc quyền.
              </p>
            </div>

            {/* Falling Effects Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {[
                { icon: '❄️', title: 'Tuyết rơi', sub: 'Mùa đông & Lãng mạn' },
                { icon: '❤️', title: 'Trái tim bay', sub: 'Tình yêu nồng nàn' },
                { icon: '🌸', title: 'Cánh hoa rơi', sub: 'Đám cưới mùa xuân' },
                { icon: '⭐', title: 'Ngôi sao', sub: 'Lung linh huyền ảo' },
                { icon: '🎉', title: 'Pháo giấy', sub: 'Ăn mừng & Tiệc tùng' },
                { icon: '🦋', title: 'Bướm bay', sub: 'Khu vườn cổ tích' },
                { icon: '❤️❄️', title: 'Tim & Tuyết', sub: 'Kết hợp đặc biệt' },
              ].map((fx, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-stone-50/60 border border-stone-200/90 text-center space-y-1.5 hover:border-pink-500/50 transition-colors"
                >
                  <span className="text-3xl block">{fx.icon}</span>
                  <span className="text-xs font-bold text-white block">{fx.title}</span>
                  <span className="text-[10px] text-stone-500 block leading-tight">{fx.sub}</span>
                </div>
              ))}
            </div>

            {/* Continuous Motion & Performance Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/90 space-y-2">
                <span className="text-xs font-bold text-amber-300 block">
                  Chuyển Động Liên Tục Của Thành Phần (Continuous Motion)
                </span>
                <ul className="space-y-1.5 text-[11px] text-stone-500">
                  <li>• <strong className="text-stone-200">Bay lơ lửng (Floating 2.0s)</strong>: Chuyển động nhấp nhô nhẹ nhàng tựa sóng nước cho hoa, con dấu sáp và chữ nghệ thuật.</li>
                  <li>• <strong className="text-stone-200">Nhịp tim (Pulse)</strong>: Co giãn nhẹ theo nhịp đập 60-70 bpm cho nút bấm liên hệ và trái tim.</li>
                  <li>• <strong className="text-stone-200">Xoay tròn 360° (Rotate)</strong>: Xoay liên tục mượt mà cho đĩa than vinyl phát nhạc đám cưới.</li>
                  <li>• <strong className="text-stone-200">Lắc lư nhẹ (Wiggle)</strong>: Chuyển động chuông báo và hộp quà mừng cưới.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/90 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">
                  Quy Chuẩn Bảo Vệ Hiệu Năng &amp; Phần Cứng
                </span>
                <ul className="space-y-1.5 text-[11px] text-stone-500">
                  <li>• <strong className="text-stone-200">FPS Capped 30-35 FPS</strong>: Đảm bảo hiệu ứng mượt mà nhưng không làm nóng máy hay tốn pin thiết bị di động.</li>
                  <li>• <strong className="text-stone-200">Tự động tạm dừng (Auto-Pause)</strong>: Khi người dùng đổi tab (<code className="text-emerald-300 font-mono">document.hidden</code>), toàn bộ canvas animation sẽ ngủ đông để tiết kiệm 100% tài nguyên CPU/GPU.</li>
                  <li>• <strong className="text-stone-200">Chống tràn VRAM</strong>: Tuyệt đối không dùng <code className="text-emerald-300 font-mono">will-change: transform</code> trên các danh sách ảnh dài.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Admin Workflow to Add New Templates */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/30 via-stone-900 to-stone-900 border border-purple-800/30 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                Admin Operations
              </span>
              <h3 className="text-xl font-serif font-bold text-white mt-0.5">
                3. Quy Trình Quản Lý &amp; Thêm Mẫu Mới Cho Admin
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/90 space-y-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-stone-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-xs text-white">Phát hành từ 188 Mẫu Thực Tế</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Chuyển sang tab <strong>&quot;Thư Viện 188 Mẫu Thực Tế&quot;</strong>, chọn mẫu mong muốn và bấm nút <strong>&quot;+ Mở bán&quot;</strong>. Form sẽ tự động điền sẵn tên, hình ảnh và danh mục để phát hành chỉ với 1 click.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/90 space-y-2">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-xs text-white">Tự Thiết Kế Mẫu Bằng Studio</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Admin truy cập <strong>/editor/studio</strong>, kéo thả tự do hình ảnh, văn bản, hiệu ứng hạt và nhạc nền. Sau khi hoàn thiện, xuất dữ liệu JSON và đưa vào kho Presets để làm mẫu độc quyền.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/90 space-y-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="font-bold text-xs text-white">Nút &quot;+ Phát Hành Mẫu Mới&quot;</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Bấm nút màu tím ở góc trên bên phải trang Quản trị, nhập tên mẫu, chọn Động cơ gốc (C165 chữ vàng, Tạp chí, Hoa hồng...), phân hạng gói (Miễn phí, Basic, VIP) và tải ảnh bìa lên.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* MODAL: CREATE AND PUBLISH NEW TEMPLATE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            onClick={() => !isSubmitting && setShowCreateModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-200/90 rounded-3xl shadow-2xl p-6 z-10 overflow-hidden space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/90">
              <div>
                <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  Admin Studio Publishing
                </span>
                <h2 className="text-lg font-serif font-bold text-white">
                  Phát Hành Mẫu Thiệp Mới Lên Thị Trường
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Tên mẫu thiệp <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hoàng Gia Scrollytelling"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Mã Slug URL (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: hoang-gia-scrollytelling"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              {/* Category and Base Engine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Danh mục thiệp
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-stone-200 focus:outline-none focus:border-stone-900"
                  >
                    <option value="wedding">Thiệp cưới (Wedding)</option>
                    <option value="birthday">Thiệp sinh nhật (Birthday)</option>
                    <option value="graduation">Thiệp tốt nghiệp (Graduation)</option>
                    <option value="event">Sự kiện &amp; Khai trương (Event)</option>
                    <option value="anniversary">Kỷ niệm &amp; Tình yêu (Anniversary)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Giao diện cốt lõi (Base Engine Render)
                  </label>
                  <select
                    value={formBaseEngine}
                    onChange={(e) => setFormBaseEngine(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-stone-200 focus:outline-none focus:border-stone-900 font-mono"
                  >
                    <option value="burgundy">burgundy — Scrollytelling Điện Ảnh Sang Trọng</option>
                    <option value="floral">floral — Lãng Mạn Hoa Cỏ Tự Nhiên</option>
                    <option value="pastel">pastel — Hàn Quốc Tối Giản Tinh Tế</option>
                    <option value="retro">retro — Cổ Điển Hoài Niệm Phim Vintage</option>
                  </select>
                </div>
              </div>

              {/* Tier, Price, and Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Phân hạng gói
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => {
                      const t = e.target.value as 'FREE' | 'BASIC' | 'PREMIUM';
                      setFormTier(t);
                      if (t === 'FREE') setFormPrice(0);
                      else if (t === 'BASIC') setFormPrice(50000);
                      else setFormPrice(30000);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-stone-200 focus:outline-none focus:border-stone-900"
                  >
                    <option value="FREE">Miễn phí (Free)</option>
                    <option value="BASIC">Gói Cơ Bản (50k/năm)</option>
                    <option value="PREMIUM">Gói VIP (200k trọn đời / 30k lẻ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Giá bán lẻ (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    disabled={formTier === 'FREE'}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white focus:outline-none focus:border-stone-900 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Huy hiệu (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="Hot, Mới, VIP Luxury..."
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Long Thumbnail & Preview */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-300">
                  Ảnh bìa xem trước dọc (Long Thumbnail URL) <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500">Chọn nhanh ảnh mẫu:</span>
                  {SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormThumbnail(preset.url)}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-200/80/60"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Live Preview of Thumbnail */}
                {formThumbnail && (
                  <div className="mt-2 p-2 rounded-xl bg-stone-50/60 border border-stone-200/90 flex items-center gap-3">
                    <div className="w-12 h-16 rounded-lg overflow-hidden border border-stone-200/80 shrink-0 bg-stone-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formThumbnail}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/300x400/222/white?text=Preview+Error';
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-stone-500 flex-1 min-w-0">
                      <span className="text-stone-300 font-semibold block">Xem trước ảnh bìa hiển thị</span>
                      <span className="truncate block font-mono text-[10px] text-stone-500">{formThumbnail}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Mô tả nổi bật
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/90">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-white transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Đang phát hành...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Phát Hành Ngay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CHỈNH SỬA THÔNG TIN MẪU THIỆP                     */}
      {/* ======================================================== */}
      {editingCatalogTemplate && (
        <div className="fixed inset-0 z-50 bg-stone-50/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-200/90 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto text-stone-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200/90 pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-700 tracking-wider">
                  Chỉnh Sửa Giao Diện &amp; Bảng Giá
                </span>
                <h3 className="text-lg font-serif font-bold text-white">
                  Chỉnh Sửa: {editingCatalogTemplate.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCatalogTemplate(null)}
                className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCatalogTemplate} className="space-y-4 text-xs">
              {/* Tên mẫu */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Tên mẫu thiệp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Danh mục & Phân hạng */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Danh mục
                  </label>
                  <select
                    value={editFormCategory}
                    onChange={(e) => setEditFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white focus:outline-none focus:border-stone-900"
                  >
                    <option value="wedding">Thiệp cưới (Wedding)</option>
                    <option value="birthday">Thiệp sinh nhật (Birthday)</option>
                    <option value="graduation">Thiệp tốt nghiệp (Graduation)</option>
                    <option value="event">Sự kiện &amp; Khai trương (Event)</option>
                    <option value="anniversary">Kỷ niệm &amp; Tình yêu</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Phân hạng gói
                  </label>
                  <select
                    value={editFormTier}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setEditFormTier(t);
                      if (t === 'FREE') setEditFormPrice(0);
                      else if (t === 'BASIC') setEditFormPrice(50000);
                      else if (t === 'PREMIUM') setEditFormPrice(30000);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white focus:outline-none focus:border-stone-900"
                  >
                    <option value="FREE">Miễn phí (Free - 300 views)</option>
                    <option value="BASIC">Gói Chuẩn (Basic - 50.000 đ)</option>
                    <option value="PREMIUM">Gói VIP Mua Lẻ (30.000 đ)</option>
                  </select>
                </div>
              </div>

              {/* Giá & Huy hiệu */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Giá bán hiển thị (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={editFormPrice}
                    onChange={(e) => setEditFormPrice(Number(e.target.value))}
                    disabled={editFormTier === 'FREE'}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white focus:outline-none focus:border-stone-900 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Huy hiệu (Badge)
                  </label>
                  <input
                    type="text"
                    value={editFormBadge}
                    placeholder="Hot VIP, Bán chạy, Mới..."
                    onChange={(e) => setEditFormBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* URL Ảnh xem trước (Long thumbnail) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Ảnh xem trước (Thumbnail URL)
                </label>
                <input
                  type="text"
                  required
                  value={editFormThumbnail}
                  onChange={(e) => setEditFormThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white focus:outline-none focus:border-stone-900"
                />

                {editFormThumbnail && (
                  <div className="mt-2 p-2 rounded-xl bg-stone-50/60 border border-stone-200/90 flex items-center gap-3">
                    <div className="w-12 h-16 rounded-lg overflow-hidden border border-stone-200/80 shrink-0 bg-stone-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editFormThumbnail}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/300x400/222/white?text=Preview+Error';
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-stone-500 flex-1 min-w-0">
                      <span className="text-stone-300 font-semibold block">Ảnh bìa hiển thị</span>
                      <span className="truncate block font-mono text-[10px] text-stone-500">{editFormThumbnail}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mô tả */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Mô tả nổi bật
                </label>
                <textarea
                  rows={2}
                  value={editFormDescription}
                  onChange={(e) => setEditFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200/90 text-xs text-white focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200/90">
                <Link
                  href={`/admin/studio?template=${encodeURIComponent(editingCatalogTemplate.slug || editingCatalogTemplate.id)}`}
                  className="px-4 py-2 rounded-xl bg-stone-900/20 hover:bg-stone-900/30 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-900/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mở Soạn Trong Studio</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() => setEditingCatalogTemplate(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {isSavingEdit ? (
                      <span>Đang lưu...</span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Thay Đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
