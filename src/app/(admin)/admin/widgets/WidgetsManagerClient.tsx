'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Settings,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  Search,
  Check,
  AlertCircle,
  X,
  Palette,
  Sliders,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Music,
  Share2,
  Plus,
  Pencil,
  Trash2,
  Play,
  RotateCcw,
  Smartphone,
  Sun,
  Moon,
} from 'lucide-react';
import { SystemWidgetDefinition, WidgetStylePreset } from '@/lib/widgetsService';
import StudioWidgetRenderer from '@/components/editor/studio/StudioWidgetRenderer';
import { CanvasElement } from '@/components/editor/studio/studioTypes';
import {
  CalendarWidgetIcon,
  CountdownWidgetIcon,
  MapWidgetIcon,
  ReminderWidgetIcon,
  CallWidgetIcon,
  RsvpWidgetIcon,
  GuestNameWidgetIcon,
  GiftboxWidgetIcon,
  WishesWidgetIcon,
  MusicPlayerWidgetIcon,
  StoryTimelineWidgetIcon,
  DressCodeWidgetIcon,
  FamilyInfoWidgetIcon,
  VideoWidgetIcon,
} from '@/components/editor/studio/StudioWidgetIcons';

interface Props {
  initialWidgets: SystemWidgetDefinition[];
}

export default function WidgetsManagerClient({ initialWidgets }: Props) {
  const [widgets, setWidgets] = useState<SystemWidgetDefinition[]>(initialWidgets);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'event_info' | 'guest_interaction' | 'media'>('all');
  const [selectedWidget, setSelectedWidget] = useState<SystemWidgetDefinition | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal Sub-tabs: 'design' | 'styles' | 'motion' | 'data'
  const [activeModalTab, setActiveModalTab] = useState<'design' | 'styles' | 'motion' | 'data'>('design');

  // Modal editing form state (Content & Design props)
  const [configForm, setConfigForm] = useState<Record<string, any>>({});
  const [selectedStyleId, setSelectedStyleId] = useState<string>('');

  // Animation states
  const [entranceAnim, setEntranceAnim] = useState<string>('slide-up');
  const [continuousAnim, setContinuousAnim] = useState<string>('none');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [previewDarkBg, setPreviewDarkBg] = useState<boolean>(false);

  // Style add & edit states inside modal
  const [isAddingStyle, setIsAddingStyle] = useState(false);
  const [newStyleForm, setNewStyleForm] = useState<{ id: string; name: string; desc: string; baseLayout?: string }>({
    id: '',
    name: '',
    desc: '',
    baseLayout: '',
  });
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [editStyleForm, setEditStyleForm] = useState({ name: '', desc: '' });

  // Custom widget creation state
  const [isNewWidgetModalOpen, setIsNewWidgetModalOpen] = useState(false);
  const [newWidgetForm, setNewWidgetForm] = useState({
    name: '',
    type: '',
    category: 'event_info' as 'event_info' | 'guest_interaction' | 'media',
    description: '',
    iconType: 'calendar',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeCount = widgets.filter((w) => w.status === 'ACTIVE').length;
  const totalUsages = widgets.reduce((acc, w) => acc + (w.usageCount || 0), 0);

  const filteredWidgets = widgets.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'all' || w.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const getWidgetIcon = (iconType: string) => {
    switch (iconType) {
      case 'calendar':
        return <CalendarWidgetIcon />;
      case 'countdown':
        return <CountdownWidgetIcon />;
      case 'map':
        return <MapWidgetIcon />;
      case 'reminder':
        return <ReminderWidgetIcon />;
      case 'call':
        return <CallWidgetIcon />;
      case 'rsvp':
        return <RsvpWidgetIcon />;
      case 'guest_name':
        return <GuestNameWidgetIcon />;
      case 'giftbox':
        return <GiftboxWidgetIcon />;
      case 'wishes':
        return <WishesWidgetIcon />;
      case 'music_player':
        return <MusicPlayerWidgetIcon />;
      case 'timeline':
        return <StoryTimelineWidgetIcon />;
      case 'dresscode':
        return <DressCodeWidgetIcon />;
      case 'family':
        return <FamilyInfoWidgetIcon />;
      case 'video':
        return <VideoWidgetIcon />;
      default:
        return <CalendarWidgetIcon />;
    }
  };

  const handleToggleStatus = async (widget: SystemWidgetDefinition) => {
    const nextStatus = widget.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/widgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: widget.id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');

      setWidgets((prev) =>
        prev.map((w) => (w.id === widget.id ? { ...w, status: nextStatus } : w))
      );
      showToast(`Đã ${nextStatus === 'ACTIVE' ? 'bật' : 'tạm khóa'} tiện ích "${widget.name}"`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleOpenConfigModal = (widget: SystemWidgetDefinition) => {
    setSelectedWidget(widget);
    const initialConfig = {
      backgroundColor: 'transparent',
      borderRadius: 16,
      borderWidth: 0,
      borderColor: '#e5e7eb',
      borderStyle: 'solid',
      ...widget.defaultConfig,
    };
    setConfigForm(initialConfig);
    setSelectedStyleId(widget.defaultConfig?.style || widget.availableStyles[0]?.id || '');
    setEntranceAnim(widget.defaultConfig?.entranceAnimation || 'slide-up');
    setContinuousAnim(widget.defaultConfig?.continuousAnimation || 'none');
    setActiveModalTab('design');
    setIsAddingStyle(false);
    setEditingStyleId(null);
    setIsConfigModalOpen(true);
  };

  // Lưu cấu hình & thiết kế cho toàn bộ tiện ích
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedWidget) return;
    setIsSaving(true);
    try {
      const updatedConfig = {
        ...configForm,
        style: selectedStyleId,
        entranceAnimation: entranceAnim,
        continuousAnimation: continuousAnim,
      };

      const res = await fetch('/api/admin/widgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedWidget.id,
          defaultConfig: updatedConfig,
          availableStyles: selectedWidget.availableStyles,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lưu cấu hình thất bại');

      setWidgets((prev) =>
        prev.map((w) =>
          w.id === selectedWidget.id ? { ...w, defaultConfig: updatedConfig, availableStyles: selectedWidget.availableStyles } : w
        )
      );
      showToast(`Đã lưu thiết kế và cấu hình tiện ích "${selectedWidget.name}" thành công!`);
      setIsConfigModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu cấu hình tiện ích', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Lưu riêng thiết kế này vào Kiểu Mẫu (Style Preset) đang chọn
  const handleSaveDesignToCurrentStyle = async () => {
    if (!selectedWidget || !selectedStyleId) return;
    setIsSaving(true);
    try {
      const currentStyle = selectedWidget.availableStyles.find((s) => s.id === selectedStyleId);
      if (!currentStyle) return;

      const updatedStyle: WidgetStylePreset = {
        ...currentStyle,
        defaultConfig: {
          ...(currentStyle.defaultConfig || {}),
          ...configForm,
          style: selectedStyleId,
          entranceAnimation: entranceAnim,
          continuousAnimation: continuousAnim,
        },
      };

      const res = await fetch('/api/admin/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_style',
          widgetId: selectedWidget.id,
          style: updatedStyle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lưu thiết kế vào mẫu thất bại');

      const updatedWidget = data.widget;
      setSelectedWidget(updatedWidget);
      setWidgets((prev) => prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)));
      showToast(`Đã lưu toàn bộ thiết kế vào kiểu mẫu "${currentStyle.name}"!`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu thiết kế vào mẫu', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Tạo mới kiểu hiển thị / mẫu cho tiện ích
  const handleCreateNewStyle = async () => {
    if (!selectedWidget || !newStyleForm.name.trim()) {
      showToast('Vui lòng nhập tên kiểu hiển thị', 'error');
      return;
    }
    const slug = newStyleForm.id.trim()
      ? newStyleForm.id.trim().toLowerCase().replace(/\s+/g, '-')
      : newStyleForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const baseLayout = newStyleForm.baseLayout || selectedStyleId || 'boxes';

    try {
      const res = await fetch('/api/admin/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_style',
          widgetId: selectedWidget.id,
          style: {
            id: slug,
            name: newStyleForm.name.trim(),
            desc: newStyleForm.desc.trim() || 'Kiểu hiển thị thiết kế tuỳ chỉnh mới',
            defaultConfig: {
              ...configForm,
              style: slug,
              layout: baseLayout,
              baseLayout: baseLayout,
              entranceAnimation: entranceAnim,
              continuousAnimation: continuousAnim,
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thêm mẫu thất bại');

      const updatedWidget = data.widget;
      setSelectedWidget(updatedWidget);
      setSelectedStyleId(slug);
      setWidgets((prev) => prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)));
      setIsAddingStyle(false);
      setNewStyleForm({ id: '', name: '', desc: '', baseLayout: '' });
      showToast(`Đã thêm kiểu mẫu "${newStyleForm.name}" thành công!`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi thêm mẫu', 'error');
    }
  };

  // Chỉnh sửa thông tin kiểu hiển thị / mẫu đã có
  const handleUpdateStyle = async (styleId: string) => {
    if (!selectedWidget || !editStyleForm.name.trim()) {
      showToast('Vui lòng nhập tên kiểu hiển thị', 'error');
      return;
    }
    try {
      const currentStyle = selectedWidget.availableStyles.find((s) => s.id === styleId);
      const res = await fetch('/api/admin/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_style',
          widgetId: selectedWidget.id,
          style: {
            id: styleId,
            name: editStyleForm.name.trim(),
            desc: editStyleForm.desc.trim(),
            defaultConfig: {
              ...(currentStyle?.defaultConfig || {}),
              ...configForm,
              entranceAnimation: entranceAnim,
              continuousAnimation: continuousAnim,
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật mẫu thất bại');

      const updatedWidget = data.widget;
      setSelectedWidget(updatedWidget);
      setWidgets((prev) => prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)));
      setEditingStyleId(null);
      showToast(`Đã cập nhật kiểu mẫu "${editStyleForm.name}" thành công!`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật mẫu', 'error');
    }
  };

  // Xoá kiểu hiển thị / mẫu
  const handleDeleteStyle = async (styleId: string, styleName: string) => {
    if (!selectedWidget) return;
    if (selectedWidget.availableStyles.length <= 1) {
      showToast('Không thể xóa kiểu hiển thị duy nhất còn lại của tiện ích', 'error');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa kiểu mẫu "${styleName}" khỏi tiện ích này không?`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_style',
          widgetId: selectedWidget.id,
          styleId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa mẫu thất bại');

      const updatedWidget = data.widget;
      setSelectedWidget(updatedWidget);
      if (selectedStyleId === styleId) {
        setSelectedStyleId(updatedWidget.availableStyles[0]?.id || '');
      }
      setWidgets((prev) => prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)));
      showToast(`Đã xóa kiểu mẫu "${styleName}" thành công!`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa mẫu', 'error');
    }
  };

  // Tạo tiện ích tuỳ chỉnh mới
  const handleCreateNewWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetForm.name.trim() || !newWidgetForm.type.trim()) {
      showToast('Vui lòng nhập tên và mã loại tiện ích', 'error');
      return;
    }
    const catLabel =
      newWidgetForm.category === 'event_info'
        ? 'Thông tin sự kiện'
        : newWidgetForm.category === 'guest_interaction'
        ? 'Khách mời & Tương tác'
        : 'Âm thanh & Media';

    try {
      const res = await fetch('/api/admin/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_widget',
          widget: {
            name: newWidgetForm.name.trim(),
            type: newWidgetForm.type.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
            category: newWidgetForm.category,
            categoryLabel: catLabel,
            description: newWidgetForm.description.trim() || 'Tiện ích tương tác tuỳ biến mới',
            iconType: newWidgetForm.iconType,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tạo tiện ích thất bại');

      setWidgets((prev) => [data.widget, ...prev]);
      setIsNewWidgetModalOpen(false);
      setNewWidgetForm({
        name: '',
        type: '',
        category: 'event_info',
        description: '',
        iconType: 'calendar',
      });
      showToast(`Đã tạo tiện ích "${data.widget.name}" thành công!`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo tiện ích', 'error');
    }
  };

  // Element object to feed StudioWidgetRenderer live preview
  const previewElement: CanvasElement = {
    id: 'preview_widget_node',
    type: 'widget',
    widgetType: (selectedWidget?.type || 'calendar') as any,
    x: 0,
    y: 0,
    width: selectedWidget?.defaultWidth || 420,
    height: selectedWidget?.defaultHeight || 300,
    zIndex: 1,
    rotation: 0,
    opacity: 1,
    widgetConfig: {
      ...configForm,
      style: selectedStyleId,
      markerColor: configForm.markerColor || configForm.accentColor || '#e11d48',
      accentColor: configForm.accentColor || configForm.markerColor || '#d97706',
    },
    animation: entranceAnim !== 'none' ? { type: entranceAnim as any, duration: 0.8, delay: 0 } : undefined,
    continuousAnimation: continuousAnim !== 'none' ? { type: continuousAnim as any, duration: 2.0, delay: 0 } : undefined,
  };

  // Continuous animation CSS class for the preview container
  let previewAnimClass = '';
  if (continuousAnim === 'floating') previewAnimClass = 'animate-float';
  else if (continuousAnim === 'heartbeat') previewAnimClass = 'animate-heartbeat';
  else if (continuousAnim === 'glow') previewAnimClass = 'animate-glow';
  else if (continuousAnim === 'pulse') previewAnimClass = 'animate-pulse-subtle';
  else if (continuousAnim === 'wobble') previewAnimClass = 'animate-wobble';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-stone-900 text-white border border-stone-800'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Overview */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold tracking-wider uppercase">
              STUDIO WIDGETS HUB
            </span>
            <span className="text-[11px] text-stone-600 font-medium">Bảo chứng Zero-Mock 100%</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Quản Lý &amp; Thiết Kế Tiện Ích Thiệp Cưới
          </h1>
          <p className="text-xs text-stone-600 max-w-2xl mt-1 leading-relaxed">
            Xem trước thiết kế trực quan, tự thêm kiểu mẫu mới, chỉnh sửa màu sắc, phông chữ, bo góc viền và hiệu ứng hoạt họa theo thời gian thực cho mọi tiện ích.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsNewWidgetModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tiện Ích Mới</span>
          </button>
          <Link
            href="/admin/studio"
            className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Mở Admin Studio Soạn Mẫu</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards (Real DB data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
              Tổng số tiện ích
            </span>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-0.5">
              {widgets.length} <span className="text-xs font-normal text-stone-600">tiện ích</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
              Đang kích hoạt
            </span>
            <div className="text-2xl font-bold font-serif text-emerald-600 mt-0.5">
              {activeCount} <span className="text-xs font-normal text-stone-600">/ {widgets.length} khả dụng</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
              Lượt nhúng trên thiệp thật
            </span>
            <div className="text-2xl font-bold font-serif text-blue-600 mt-0.5">
              {totalUsages.toLocaleString()} <span className="text-xs font-normal text-stone-600">lần nhúng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: `Tất cả tiện ích (${widgets.length})` },
            { id: 'event_info', label: `Thông tin sự kiện (${widgets.filter((w) => w.category === 'event_info').length})` },
            { id: 'guest_interaction', label: `Khách mời & Tương tác (${widgets.filter((w) => w.category === 'guest_interaction').length})` },
            { id: 'media', label: `Âm thanh & Video (${widgets.filter((w) => w.category === 'media').length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên tiện ích, tính năng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 transition-colors"
          />
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWidgets.map((widget) => {
          const isActive = widget.status === 'ACTIVE';
          return (
            <div
              key={widget.id}
              className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                isActive ? 'border-stone-200/90' : 'border-stone-200 bg-stone-50/50 opacity-75'
              }`}
            >
              <div>
                {/* Header: Icon + Category + Status Toggle */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-center p-2 shadow-2xs group-hover:scale-105 transition-transform">
                    {getWidgetIcon(widget.iconType)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      {isActive ? 'ĐANG BẬT' : 'TẠM KHÓA'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(widget)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? 'bg-emerald-500' : 'bg-stone-300'
                      }`}
                      title={isActive ? 'Bấm để tắt tiện ích' : 'Bấm để kích hoạt tiện ích'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Name & Description */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif font-bold text-base text-stone-900">{widget.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
                      {widget.type}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                    {widget.description}
                  </p>
                </div>

                {/* Styles / Presets Pills */}
                {widget.availableStyles && widget.availableStyles.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                        Hỗ trợ {widget.availableStyles.length} kiểu hiển thị:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {widget.availableStyles.map((style) => (
                        <span
                          key={style.id}
                          className="px-2 py-0.5 bg-stone-50 text-stone-600 border border-stone-200/80 rounded-md text-[10px] font-medium"
                          title={style.desc}
                        >
                          {style.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-stone-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{widget.usageCount} thiệp đang dùng</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenConfigModal(widget)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sửa Thiết Kế &amp; Mẫu</span>
                  </button>
                  <Link
                    href={`/admin/studio?widget=${widget.type}`}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                    title="Mở Studio để kiểm tra và thiết kế"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          MODAL: CẤU HÌNH & TRỰC TIẾP SỬA THIẾT KẾ TIỆN ÍCH (DUAL-PANE LIVE EDITOR)
      ========================================================================= */}
      {isConfigModalOpen && selectedWidget && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-5">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-5xl p-5 md:p-6 relative shadow-2xl text-stone-900 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center p-1.5">
                  {getWidgetIcon(selectedWidget.iconType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                      CHỈNH SỬA THIẾT KẾ &amp; MẪU TIỆN ÍCH
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                      {selectedWidget.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    {selectedWidget.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/studio?widget=${selectedWidget.type}&style=${selectedStyleId}`}
                  className="hidden sm:flex px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold items-center gap-1.5"
                  title="Mở Studio thiết kế nâng cao"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Mở Studio</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Main Body (2 Columns: Controls on Left, Live Preview on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 py-4 overflow-y-auto flex-1 scrollbar-thin">
              {/* CỘT TRÁI: BẢNG ĐIỀU KHIỂN THIẾT KẾ & TÙY CHỈNH (Col 7) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 4 Navigation Tabs */}
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl text-xs font-semibold">
                  {[
                    { id: 'design', label: '🎨 Thiết Kế & Màu', icon: Palette },
                    { id: 'styles', label: `🎭 Kiểu Mẫu (${selectedWidget.availableStyles.length})`, icon: Layers },
                    { id: 'motion', label: '✨ Hoạt Họa', icon: Sparkles },
                    { id: 'data', label: '📝 Dữ Liệu', icon: Sliders },
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isTabActive = activeModalTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveModalTab(tab.id as any)}
                        className={`flex-1 py-2 px-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isTabActive
                            ? 'bg-white text-stone-900 shadow-2xs font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <TabIcon className={`w-3.5 h-3.5 ${isTabActive ? 'text-rose-500' : 'text-stone-400'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: THIẾT KẾ GIAO DIỆN & MÀU SẮC */}
                {activeModalTab === 'design' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Background Color Presets */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                          Màu Nền Tiện Ích (Background)
                        </label>
                        <span className="text-[10px] font-mono text-stone-500">
                          {configForm.backgroundColor || 'transparent'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { val: 'transparent', label: 'Trong suốt', border: true },
                          { val: '#ffffff', label: 'Trắng tinh', border: true },
                          { val: 'rgba(255, 255, 255, 0.75)', label: 'Kính mờ', border: true },
                          { val: '#faf6f0', label: 'Giấy Kraft', border: true },
                          { val: '#fdf8f0', label: 'Kem ấm', border: true },
                          { val: '#fff1f2', label: 'Hồng phấn', border: false },
                          { val: '#4c0519', label: 'Đỏ rượu', border: false },
                          { val: '#0f172a', label: 'Xanh Navy', border: false },
                          { val: '#1c1917', label: 'Đen Hoàng Gia', border: false },
                        ].map((c) => (
                          <button
                            key={c.val}
                            type="button"
                            onClick={() => setConfigForm({ ...configForm, backgroundColor: c.val })}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
                              configForm.backgroundColor === c.val
                                ? 'bg-rose-500 text-white border-rose-500 shadow-2xs font-bold'
                                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${c.border ? 'border border-stone-300' : ''}`}
                              style={{ backgroundColor: c.val === 'transparent' ? 'transparent' : c.val }}
                            />
                            <span>{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color & Text Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Accent Color */}
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                        <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                          Màu Điểm Nhấn (Accent Color)
                        </label>
                        <div className="flex items-center gap-2">
                          {['#e11d48', '#d97706', '#be185d', '#059669', '#2563eb', '#7c3aed'].map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => setConfigForm({ ...configForm, accentColor: col, markerColor: col })}
                              className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                                (configForm.accentColor === col || configForm.markerColor === col)
                                  ? 'scale-115 border-stone-900 shadow-sm'
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: col }}
                            />
                          ))}
                          <input
                            type="color"
                            value={configForm.accentColor || configForm.markerColor || '#e11d48'}
                            onChange={(e) => setConfigForm({ ...configForm, accentColor: e.target.value, markerColor: e.target.value })}
                            className="w-7 h-7 rounded-full cursor-pointer border border-stone-300"
                            title="Chọn màu tự do"
                          />
                        </div>
                      </div>

                      {/* Text Color */}
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                        <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                          Màu Chữ Chính (Text Color)
                        </label>
                        <div className="flex items-center gap-2">
                          {[
                            { col: '#1c1917', name: 'Đen' },
                            { col: '#4a3d36', name: 'Nâu đất' },
                            { col: '#d4af37', name: 'Vàng kim' },
                            { col: '#ffffff', name: 'Trắng' },
                            { col: '#be185d', name: 'Hồng đậm' },
                          ].map((item) => (
                            <button
                              key={item.col}
                              type="button"
                              onClick={() => setConfigForm({ ...configForm, textColor: item.col })}
                              className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                                configForm.textColor === item.col
                                  ? 'scale-115 border-stone-900 shadow-sm'
                                  : 'border-stone-200'
                              }`}
                              style={{ backgroundColor: item.col }}
                              title={item.name}
                            />
                          ))}
                          <input
                            type="color"
                            value={configForm.textColor || '#1c1917'}
                            onChange={(e) => setConfigForm({ ...configForm, textColor: e.target.value })}
                            className="w-7 h-7 rounded-full cursor-pointer border border-stone-300"
                            title="Chọn màu chữ tự do"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Border Radius & Border Outline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Border Radius */}
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                        <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                          Độ Bo Góc: {configForm.borderRadius ?? 16}px
                        </label>
                        <div className="grid grid-cols-5 gap-1.5 text-center">
                          {[
                            { r: 0, label: '0px' },
                            { r: 8, label: '8px' },
                            { r: 16, label: '16px' },
                            { r: 24, label: '24px' },
                            { r: 36, label: '36px' },
                          ].map((item) => (
                            <button
                              key={item.r}
                              type="button"
                              onClick={() => setConfigForm({ ...configForm, borderRadius: item.r })}
                              className={`py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                (configForm.borderRadius ?? 16) === item.r
                                  ? 'bg-stone-900 text-white border-stone-900'
                                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Border Width & Style */}
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                        <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                          Đường Viền (Border)
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { w: 0, s: 'solid', label: 'Không viền' },
                            { w: 1, s: 'solid', label: '1px liền' },
                            { w: 2, s: 'dashed', label: '2px đứt nét' },
                          ].map((b, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setConfigForm({ ...configForm, borderWidth: b.w, borderStyle: b.s })}
                              className={`py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                (configForm.borderWidth ?? 0) === b.w && (configForm.borderStyle ?? 'solid') === b.s
                                  ? 'bg-stone-900 text-white border-stone-900'
                                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Font Family Selection */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                      <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                        Phông Chữ Tiện Ích (Font Family)
                      </label>
                      <select
                        value={configForm.fontFamily || "var(--font-serif), 'Playfair Display', serif"}
                        onChange={(e) => setConfigForm({ ...configForm, fontFamily: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-medium outline-none focus:border-stone-900"
                      >
                        <option value="var(--font-serif), 'Playfair Display', serif">Playfair Display (Serif Cổ Điển Hoàng Gia)</option>
                        <option value="'Great Vibes', cursive">Great Vibes (Thư Pháp Lãng Mạn)</option>
                        <option value="'Cormorant Garamond', serif">Cormorant Garamond (Serif Quý Tộc)</option>
                        <option value="var(--font-sans), 'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Sans Hiện Đại)</option>
                        <option value="'Montserrat', sans-serif">Montserrat (Sans Tinh Gọn)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TAB 2: KIỂU MẪU & BỐ CỤC (STYLES & PRESETS) */}
                {activeModalTab === 'styles' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-stone-700 font-bold uppercase tracking-wider">
                        Danh Sách Kiểu Mẫu ({selectedStyleId.toUpperCase()})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingStyle(!isAddingStyle);
                          setEditingStyleId(null);
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Kiểu Mẫu Mới</span>
                      </button>
                    </div>

                    {/* Form Tự Thêm Kiểu Hiển Thị Mới */}
                    {isAddingStyle && (
                      <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-rose-600" />
                            Tự Thêm Kiểu Hiển Thị Mới
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingStyle(false)}
                            className="text-stone-400 hover:text-stone-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-stone-600 font-semibold block mb-0.5">Tên kiểu mẫu (*)</label>
                            <input
                              type="text"
                              placeholder="Ví dụ: Hoàng Gia Ánh Vàng"
                              value={newStyleForm.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewStyleForm({
                                  ...newStyleForm,
                                  name: val,
                                  id: newStyleForm.id ? newStyleForm.id : val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-600 font-semibold block mb-0.5">Bố cục cơ sở kế thừa (*)</label>
                            <select
                              value={newStyleForm.baseLayout || selectedStyleId}
                              onChange={(e) => setNewStyleForm({ ...newStyleForm, baseLayout: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                            >
                              {selectedWidget.availableStyles.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.name} (#{st.id})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-stone-600 font-semibold block mb-0.5">Mã kiểu dáng (Slug/ID)</label>
                            <input
                              type="text"
                              placeholder="royal-gold"
                              value={newStyleForm.id}
                              onChange={(e) => setNewStyleForm({ ...newStyleForm, id: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs text-stone-900 font-mono outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-600 font-semibold block mb-0.5">Mô tả đặc điểm thiết kế</label>
                            <input
                              type="text"
                              placeholder="Ví dụ: Khung viền mạ vàng phong cách hoàng gia Châu Âu cổ điển"
                              value={newStyleForm.desc}
                              onChange={(e) => setNewStyleForm({ ...newStyleForm, desc: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingStyle(false)}
                            className="px-3 py-1 rounded-xl text-xs text-stone-600 hover:bg-stone-100"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateNewStyle}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Lưu Kiểu Mẫu Này</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Form Chỉnh Sửa Kiểu Hiển Thị */}
                    {editingStyleId && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Pencil className="w-3.5 h-3.5 text-amber-600" />
                            Chỉnh Sửa Kiểu Hiển Thị ({editingStyleId})
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingStyleId(null)}
                            className="text-stone-400 hover:text-stone-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-stone-600 font-semibold block mb-0.5">Tên kiểu mẫu (*)</label>
                            <input
                              type="text"
                              value={editStyleForm.name}
                              onChange={(e) => setEditStyleForm({ ...editStyleForm, name: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-600 font-semibold block mb-0.5">Mô tả đặc điểm thiết kế</label>
                            <input
                              type="text"
                              value={editStyleForm.desc}
                              onChange={(e) => setEditStyleForm({ ...editStyleForm, desc: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingStyleId(null)}
                            className="px-3 py-1 rounded-xl text-xs text-stone-600 hover:bg-stone-100"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStyle(editingStyleId)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Cập Nhật Mẫu</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Grid danh sách các kiểu mẫu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedWidget.availableStyles.map((style) => {
                        const isCur = selectedStyleId === style.id;
                        return (
                          <div
                            key={style.id}
                            className={`p-3 rounded-2xl border transition-all relative flex flex-col justify-between ${
                              isCur
                                ? 'bg-rose-50/70 border-rose-500 text-rose-950 ring-1 ring-rose-500/20 shadow-xs'
                                : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-700'
                            }`}
                          >
                            <div
                              onClick={() => {
                                setSelectedStyleId(style.id);
                                if (style.defaultConfig) {
                                  setConfigForm((prev) => ({ ...prev, ...style.defaultConfig }));
                                  if (style.defaultConfig.entranceAnimation) setEntranceAnim(style.defaultConfig.entranceAnimation);
                                  if (style.defaultConfig.continuousAnimation) setContinuousAnim(style.defaultConfig.continuousAnimation);
                                }
                              }}
                              className="cursor-pointer flex-1"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold ${isCur ? 'text-rose-700' : 'text-stone-900'}`}>
                                  {style.name}
                                </span>
                                {isCur && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                              </div>
                              <p className="text-[11px] text-stone-500 leading-snug line-clamp-2">{style.desc}</p>
                            </div>

                            {/* Actions on style item */}
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-200/60 text-[10px]">
                              <span className="font-mono text-[9px] text-stone-400">#{style.id}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingStyleId(style.id);
                                    setEditStyleForm({ name: style.name, desc: style.desc });
                                    setIsAddingStyle(false);
                                  }}
                                  className="px-2 py-0.5 rounded-md hover:bg-stone-200/80 text-stone-600 flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Sửa tên & mô tả kiểu mẫu này"
                                >
                                  <Pencil className="w-3 h-3 text-stone-500" />
                                  <span>Sửa</span>
                                </button>
                                {selectedWidget.availableStyles.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteStyle(style.id, style.name);
                                    }}
                                    className="px-1.5 py-0.5 rounded-md hover:bg-rose-100 text-stone-400 hover:text-rose-600 cursor-pointer transition-colors"
                                    title="Xoá kiểu mẫu này"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: HIỆU ỨNG HOẠT HỌA (ANIMATIONS & MOTION) */}
                {activeModalTab === 'motion' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Entrance Animation */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                      <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                        Hiệu Ứng Xuất Hiện Khi Khách Cuộn Tới (Entrance)
                      </label>
                      <select
                        value={entranceAnim}
                        onChange={(e) => {
                          setEntranceAnim(e.target.value);
                          setPreviewKey((k) => k + 1);
                        }}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-semibold outline-none"
                      >
                        <option value="none">Tĩnh (Không hiệu ứng)</option>
                        <option value="slide-up">Trượt từ dưới lên (Slide Up)</option>
                        <option value="zoom-in">Phóng to êm dịu (Zoom In)</option>
                        <option value="flip">Lật thẻ 3D (3D Flip)</option>
                        <option value="fade-in">Hiện mờ dần (Fade In)</option>
                        <option value="bounce-in">Nảy nhẹ (Bounce In)</option>
                        <option value="slide-left">Trượt từ trái sang</option>
                        <option value="slide-right">Trượt từ phải sang</option>
                      </select>
                    </div>

                    {/* Continuous Motion */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                      <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                        Chuyển Động Chạy Liên Tục (Continuous Motion)
                      </label>
                      <select
                        value={continuousAnim}
                        onChange={(e) => setContinuousAnim(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-semibold outline-none"
                      >
                        <option value="none">Tĩnh (Không chuyển động)</option>
                        <option value="floating">Bồng bềnh lơ lửng (Floating)</option>
                        <option value="heartbeat">Nhịp đập trái tim (Heartbeat)</option>
                        <option value="pulse">Nhịp thở nhẹ nhàng (Pulse)</option>
                        <option value="glow">Hào quang phát sáng (Glow)</option>
                        <option value="wobble">Lắc lư nhịp nhàng (Wobble)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewKey((k) => k + 1)}
                      className="w-full py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span>Xem Lại Hoạt Họa Trên Màn Hình Xem Trước</span>
                    </button>
                  </div>
                )}

                {/* TAB 4: NỘI DUNG & DỮ LIỆU MẪU (DATA PROPS) */}
                {activeModalTab === 'data' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    {selectedWidget.type === 'calendar' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Tháng / Năm</label>
                            <input
                              type="text"
                              value={configForm.monthTitle || 'THÁNG 12 / 2026'}
                              onChange={(e) => setConfigForm({ ...configForm, monthTitle: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Ngày Cưới (1 - 31)</label>
                            <input
                              type="number"
                              min={1}
                              max={31}
                              value={configForm.selectedDay || 28}
                              onChange={(e) => setConfigForm({ ...configForm, selectedDay: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Tiêu Đề / Subtitle</label>
                          <input
                            type="text"
                            value={configForm.subtitle || 'SAVE THE DATE'}
                            onChange={(e) => setConfigForm({ ...configForm, subtitle: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                          />
                        </div>
                      </div>
                    )}

                    {selectedWidget.type === 'countdown' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Thông Điệp Đếm Ngược</label>
                          <input
                            type="text"
                            value={configForm.quote || ''}
                            onChange={(e) => setConfigForm({ ...configForm, quote: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Thời Điểm Cưới (Target Date)</label>
                          <input
                            type="datetime-local"
                            value={configForm.targetDate || '2026-12-28T18:00'}
                            onChange={(e) => setConfigForm({ ...configForm, targetDate: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                          />
                        </div>
                      </div>
                    )}

                    {selectedWidget.type === 'map' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Tên Trung Tâm Tiệc Cưới</label>
                          <input
                            type="text"
                            value={configForm.venueName || ''}
                            onChange={(e) => setConfigForm({ ...configForm, venueName: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Địa Chỉ Chi Tiết</label>
                          <input
                            type="text"
                            value={configForm.address || ''}
                            onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Hotline Đón Tiếp</label>
                          <input
                            type="text"
                            value={configForm.hotline || ''}
                            onChange={(e) => setConfigForm({ ...configForm, hotline: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* Generic fallback props */}
                    {!['calendar', 'countdown', 'map'].includes(selectedWidget.type) && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Tiêu Đề Tiện Ích</label>
                          <input
                            type="text"
                            value={configForm.title || configForm.header || selectedWidget.name}
                            onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-600 block mb-1 font-semibold">Mô Tả / Phụ Đề</label>
                          <input
                            type="text"
                            value={configForm.subtitle || configForm.subheader || ''}
                            onChange={(e) => setConfigForm({ ...configForm, subtitle: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CỘT PHẢI: MÀN HÌNH XEM TRƯỚC THIẾT KẾ THỰC TẾ (Col 5) */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-stone-100/70 p-4 rounded-3xl border border-stone-200/90">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                      <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                      <span>Xem Trước Live</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewDarkBg(!previewDarkBg)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                          previewDarkBg
                            ? 'bg-stone-900 text-white border-stone-800'
                            : 'bg-white text-stone-700 border-stone-200'
                        }`}
                        title="Đổi màu nền thiệp thử nghiệm"
                      >
                        {previewDarkBg ? <Moon className="w-3 h-3 text-amber-300" /> : <Sun className="w-3 h-3 text-amber-500" />}
                        <span className="text-[10px]">{previewDarkBg ? 'Thiệp Tối' : 'Thiệp Sáng'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewKey((k) => k + 1)}
                        className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700"
                        title="Replay hoạt họa"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Phone Mockup Canvas Area */}
                  <div
                    className={`rounded-2xl border transition-all p-3 min-h-[310px] flex items-center justify-center relative overflow-hidden shadow-sm ${
                      previewDarkBg
                        ? 'bg-[#18181b] border-stone-700'
                        : 'bg-[#faf8f5] border-stone-300/80'
                    }`}
                  >
                    <div
                      key={previewKey}
                      className={`w-full max-w-[390px] ${
                        entranceAnim === 'slide-up' ? 'anim-slide-up' :
                        entranceAnim === 'zoom-in' ? 'anim-zoom-in' :
                        entranceAnim === 'flip' ? 'anim-flip-in' :
                        entranceAnim === 'fade-in' ? 'anim-fade-in' :
                        entranceAnim === 'bounce-in' ? 'anim-bounce-in' : ''
                      }`}
                    >
                      <div className={`w-full ${previewAnimClass}`}>
                        <StudioWidgetRenderer element={previewElement} />
                      </div>
                    </div>
                  </div>

                  {/* Design Info Tag */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 px-1">
                    <span>Mẫu: <strong className="text-stone-800 font-mono">{selectedStyleId}</strong></span>
                    <span>Hiệu ứng: <strong className="text-rose-600">{entranceAnim}</strong></span>
                  </div>
                </div>

                {/* Action Buttons Under Preview */}
                <div className="space-y-2 mt-4 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={handleSaveDesignToCurrentStyle}
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Lưu Thiết Kế Vào Kiểu Mẫu Này</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const curStyle = selectedWidget.availableStyles.find((s) => s.id === selectedStyleId);
                      setNewStyleForm({
                        name: `${curStyle?.name || 'Mẫu'} (Tuỳ Chỉnh Mới)`,
                        id: `${selectedStyleId}-custom-${Date.now().toString().slice(-4)}`,
                        desc: `Thiết kế tuỳ chỉnh mới dựa trên bố cục ${curStyle?.name || selectedStyleId}`,
                        baseLayout: curStyle?.defaultConfig?.baseLayout || curStyle?.defaultConfig?.layout || selectedStyleId,
                      });
                      setIsAddingStyle(true);
                      setActiveModalTab('styles');
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-600" />
                    <span>Lưu Thành Kiểu Mẫu Mới (Nhân bản)</span>
                  </button>

                  <Link
                    href={`/admin/studio?widget=${selectedWidget.type}&style=${selectedStyleId}`}
                    className="w-full py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Mở Soạn Thảo Tự Do Trong Studio</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 shrink-0">
              <span className="text-xs text-stone-500">
                Toàn bộ màu sắc, phông chữ và hoạt họa sẽ áp dụng cho mẫu thiệp thực tế
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveConfig()}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu Tất Cả Cấu Hình'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM MẪU TIỆN ÍCH MỚI HOÀN TOÀN
      ========================================================================= */}
      {isNewWidgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    Tạo Tiện Ích Mới Cho Hệ Thống
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Thêm một tiện ích tuỳ chỉnh hiển thị trong kho tiện ích Studio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewWidgetModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewWidget} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Tên Tiện Ích (*)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thư Viện Ảnh Cưới 3D"
                  value={newWidgetForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewWidgetForm({
                      ...newWidgetForm,
                      name: val,
                      type: newWidgetForm.type ? newWidgetForm.type : val.toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
                    });
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Mã Loại Tiện Ích (Type) (*)</label>
                  <input
                    type="text"
                    placeholder="gallery_3d"
                    value={newWidgetForm.type}
                    onChange={(e) => setNewWidgetForm({ ...newWidgetForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Nhóm Danh Mục</label>
                  <select
                    value={newWidgetForm.category}
                    onChange={(e) => setNewWidgetForm({ ...newWidgetForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="event_info">Thông tin sự kiện</option>
                    <option value="guest_interaction">Khách mời &amp; Tương tác</option>
                    <option value="media">Âm thanh &amp; Media</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Biểu tượng hiển thị</label>
                <select
                  value={newWidgetForm.iconType}
                  onChange={(e) => setNewWidgetForm({ ...newWidgetForm, iconType: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
                >
                  <option value="calendar">Lịch ngày (Calendar)</option>
                  <option value="countdown">Đồng hồ đếm ngược (Countdown)</option>
                  <option value="map">Bản đồ (Map)</option>
                  <option value="timeline">Dòng thời gian (Timeline)</option>
                  <option value="dresscode">Bảng màu (Dresscode)</option>
                  <option value="family">Gia đình hai bên (Family)</option>
                  <option value="rsvp">Xác nhận tham dự (RSVP)</option>
                  <option value="wishes">Sổ lưu bút &amp; Lời chúc</option>
                  <option value="giftbox">Hộp mừng quà cưới</option>
                  <option value="music_player">Phát nhạc cưới</option>
                  <option value="video">Video cưới</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Mô Tả Tiện Ích</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả công dụng và vị trí khuyên dùng trên thiệp..."
                  value={newWidgetForm.description}
                  onChange={(e) => setNewWidgetForm({ ...newWidgetForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewWidgetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Tạo Tiện Ích Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
