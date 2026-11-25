'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Palette,
  FileText,
  X,
  Check,
  Loader2,
  Copy,
  Plus,
  Crown,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import { AI_COLOR_PALETTES, AiDesignResult } from '@/lib/ai/aiStudioService';
import { STUDIO_TEMPLATE_PRESETS } from '@/data/studioTemplatePresets';

interface StudioAiDesignerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
}

const QUICK_PROMPT_PRESETS = [
  {
    title: 'Hàn Quốc Tinh Khôi',
    desc: 'Tone be kem pastel, hoa bay lãng mạn, bố cục thanh lịch',
    prompt: 'Thiệp cưới phong cách Hàn Quốc nhẹ nhàng tone be pastel, hoa rơi tinh tế, font chữ viết tay bay bổng',
    style: 'korean_pastel',
  },
  {
    title: 'Đỏ Rượu Hoàng Gia',
    desc: 'Đỏ burgundy & vàng gold sang trọng, dạ tiệc hoàng gia',
    prompt: 'Thiệp cưới hoàng gia phong cách dạ tiệc hoàng hôn, sắc đỏ rượu vang burgundy quý phái kết hợp ánh kim sang trọng',
    style: 'royal_burgundy',
  },
  {
    title: 'Vintage Botanical',
    desc: 'Xanh rêu mộc mạc, hoa cỏ thiên nhiên, hơi thở châu Âu',
    prompt: 'Thiệp cưới phong cách sân vườn rustic botanical, xanh rêu olive mộc mạc tự nhiên, khung ảnh polaroid ấm áp',
    style: 'sage_botanical',
  },
  {
    title: 'Tạp Chí Parisian',
    desc: 'Đen trắng tối giản hiện đại, typography đậm chất thời trang',
    prompt: 'Thiệp cưới tối giản phong cách bìa tạp chí thời trang Paris, tương phản cao, bố cục hiện đại sạch sẽ',
    style: 'minimal_parisian',
  },
  {
    title: 'Cam Đất Hoàng Hôn',
    desc: 'Terracotta hoàng hôn ấm áp, phong cách Địa Trung Hải',
    prompt: 'Thiệp cưới phong cách hoàng hôn cam đất terracotta ấm áp, lãng mạn bên bờ biển',
    style: 'terracotta_sunset',
  },
  {
    title: 'Dạ Khúc Ngân Hà',
    desc: 'Xanh navy huyền bí, ánh sao lấp lánh sang trọng',
    prompt: 'Thiệp cưới tiệc tối ngoài trời lãng mạn dưới bầu trời sao đêm xanh navy lấp lánh',
    style: 'midnight_navy',
  },
];

export default function StudioAiDesignerModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  isAdmin = false,
}: StudioAiDesignerModalProps) {
  const {
    isAiDesignerModalOpen,
    setAiDesignerModalOpen,
    elements,
    canvas,
    weddingProfile,
    loadTemplateData,
    updateElementsBatch,
    setCanvasBackground,
    addElementWithPush,
  } = useStudioStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAiDesignerModalOpen;
  const handleClose = propOnClose || (() => setAiDesignerModalOpen(false));

  const [activeTab, setActiveTab] = useState<'create' | 'restyle' | 'wording' | 'curated'>('create');

  // Tab 1: AI Generate Form
  const mainCeremony = weddingProfile?.ceremonies?.find((c) => c.isMain) || weddingProfile?.ceremonies?.[0];
  const [prompt, setPrompt] = useState(QUICK_PROMPT_PRESETS[0].prompt);
  const [selectedStyle, setSelectedStyle] = useState(QUICK_PROMPT_PRESETS[0].style);
  const [groomName, setGroomName] = useState(
    weddingProfile?.groom?.fullName || weddingProfile?.groom?.shortName || 'Minh Thành'
  );
  const [brideName, setBrideName] = useState(
    weddingProfile?.bride?.fullName || weddingProfile?.bride?.shortName || 'Bảo Ngọc'
  );
  const [weddingDate, setWeddingDate] = useState(
    mainCeremony?.date || '2026-11-28'
  );
  const [venue, setVenue] = useState(
    mainCeremony?.venue || 'Trung Tâm Tiệc Cưới Trống Đồng Palace'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<AiDesignResult | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Tab 2: Restyle
  const [isRestyling, setIsRestyling] = useState(false);
  const [restyleSuccess, setRestyleSuccess] = useState<string | null>(null);

  // Tab 3: Wording
  const [wordingTone, setWordingTone] = useState<'romantic' | 'formal' | 'modern' | 'minimal'>('romantic');
  const [isGeneratingWording, setIsGeneratingWording] = useState(false);
  const [wordingResult, setWordingResult] = useState<string | null>(null);
  const [copiedWording, setCopiedWording] = useState(false);

  // State for saving directly to warehouse
  const [isSavingToWarehouse, setIsSavingToWarehouse] = useState(false);
  const [warehouseSavedMsg, setWarehouseSavedMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Generate Template
  const handleGenerateTemplate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/ai/studio-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate_template',
          prompt,
          stylePreset: selectedStyle,
          groomName,
          brideName,
          weddingDate,
          venue,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi tạo thiết kế bằng AI');
      }

      setGeneratedResult(data);
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : 'Lỗi kết nối AI Studio');
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply to Canvas
  const handleApplyToCanvas = () => {
    if (!generatedResult || !generatedResult.elements) return;

    loadTemplateData(
      generatedResult.elements,
      generatedResult.config,
      generatedResult.name,
      `ai-${Date.now().toString(36)}`
    );

    handleClose();
  };

  // Admin Save Directly to Warehouse
  const handleSaveToWarehouseDirectly = async () => {
    if (!generatedResult || !generatedResult.elements) return;
    setIsSavingToWarehouse(true);
    setWarehouseSavedMsg(null);

    try {
      const slug = `ai-${(generatedResult.name || 'thiep-cuoi')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')}-${Date.now().toString(36).slice(-4)}`;

      const res = await fetch('/api/admin/templates/save-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedResult.name || 'Mẫu Thiệp Cưới AI Sáng Tạo',
          slug,
          category: 'wedding',
          tier: 'PREMIUM',
          price: 30000,
          badge: 'AI Pro',
          description: generatedResult.description || 'Mẫu thiệp scrollytelling điện ảnh do AI Studio sáng tạo.',
          thumbnail: '/assets/wedding/samples/sample_01.jpg',
          elements: generatedResult.elements,
          config: generatedResult.config,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi lưu vào kho mẫu');
      }

      setWarehouseSavedMsg(`Đã lưu mẫu "${generatedResult.name}" vào Kho Mẫu thành công!`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi lưu kho');
    } finally {
      setIsSavingToWarehouse(false);
    }
  };

  // Handle Palette Restyle
  const handleRestylePalette = async (paletteKey: string) => {
    setIsRestyling(true);
    setRestyleSuccess(null);

    try {
      const res = await fetch('/api/ai/studio-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'restyle_palette',
          targetPalette: paletteKey,
          currentElements: elements,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi đổi màu');
      }

      if (data.elements && data.config?.background) {
        // Update batch elements and background in store
        const updates = data.elements.map((el: any) => ({
          id: el.id,
          updates: { color: el.color },
        }));
        updateElementsBatch(updates);
        setCanvasBackground(data.config.background);
        setRestyleSuccess(`Đã chuyển toàn bộ thiệp sang tone "${data.paletteName}"!`);
        setTimeout(() => setRestyleSuccess(null), 3500);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi đổi bảng màu');
    } finally {
      setIsRestyling(false);
    }
  };

  // Handle Wording Generation
  const handleGenerateWording = async () => {
    setIsGeneratingWording(true);
    setWordingResult(null);

    try {
      const res = await fetch('/api/ai/studio-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'rewrite_wording',
          wordingTone,
          groomName,
          brideName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi tạo lời mời');
      }

      setWordingResult(data.generatedText);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi viết lời mời');
    } finally {
      setIsGeneratingWording(false);
    }
  };

  const handleInsertWordingToCanvas = () => {
    if (!wordingResult) return;
    addElementWithPush({
      type: 'text',
      x: 35,
      y: 1200,
      width: 430,
      height: 90,
      rotation: 0,
      opacity: 1,
      text: wordingResult,
      fontSize: 14,
      fontFamily: 'font-montserrat',
      color: '#4A3E3D',
      textAlign: 'center',
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 sm:px-6 sm:py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-white">
                  LoveStory AI Designer
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xs">
                  Pro Engine
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tự động sáng tạo mẫu thiệp cưới scrollytelling 6 màn hình chuẩn tỷ lệ toạ độ
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-5 pt-3 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2 bg-stone-50/50 dark:bg-stone-900/50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Tạo Mẫu Mới</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('restyle')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'restyle'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>AI Phối Bảng Màu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wording')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'wording'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AI Soạn Lời Mời</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curated')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'curated'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>👑 Mẫu VIP Tuyển Chọn ({STUDIO_TEMPLATE_PRESETS.length})</span>
          </button>
        </div>

        {/* Modal Body with Custom Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ======================================================== */}
          {/* TAB 1: AI GENERATE FULL TEMPLATE */}
          {/* ======================================================== */}
          {activeTab === 'create' && (
            <div className="space-y-5">
              {/* Preset Style Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Chọn phong cách gợi ý nhanh:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_PROMPT_PRESETS.map((p) => {
                    const isSelected = selectedStyle === p.style;
                    return (
                      <button
                        key={p.style}
                        type="button"
                        onClick={() => {
                          setSelectedStyle(p.style);
                          setPrompt(p.prompt);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 shadow-xs ring-1 ring-purple-600'
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-stone-800 dark:text-stone-200'
                            }`}
                          >
                            {p.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                          {p.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Câu lệnh mô tả chi tiết cho AI (Prompt):
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Nhập mô tả phong cách, màu sắc, cảm xúc thiệp cưới bạn mong muốn..."
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:bg-white dark:focus:bg-stone-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-all resize-none"
                />
              </div>

              {/* Metadata Fields (Couple & Date) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Tên Chú Rể
                  </label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white outline-none focus:border-purple-600"
                    placeholder="Minh Thành"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Tên Cô Dâu
                  </label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white outline-none focus:border-purple-600"
                    placeholder="Bảo Ngọc"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Ngày Cưới
                  </label>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Địa Điểm Tổ Chức
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white outline-none focus:border-purple-600"
                    placeholder="Trống Đồng Palace, Hà Nội"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-500">
                  ⚡ Khởi tạo cấu trúc 6 màn hình chuẩn scrollytelling với đầy đủ widget
                </span>

                <button
                  type="button"
                  onClick={() => handleGenerateTemplate()}
                  disabled={isGenerating}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>AI Đang Thiết Kế...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Bắt Đầu Thiết Kế Mẫu Bằng AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Errors */}
              {generateError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                  {generateError}
                </div>
              )}

              {/* Generated Result Preview Box */}
              {generatedResult && (
                <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-white dark:to-stone-800 border-2 border-purple-500/30 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          {generatedResult.aiEngineUsed === 'gemini' ? 'Gemini AI Powered' : 'Studio Engine Pro'}
                        </span>
                        <span className="text-xs font-bold text-stone-900 dark:text-white">
                          {generatedResult.name}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        {generatedResult.description}
                      </p>
                    </div>
                  </div>

                  {/* Template Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-purple-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-500 block">Số khối phần tử</span>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {generatedResult.elements?.length || 25} khối
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-purple-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-500 block">Chiều cao Canvas</span>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {generatedResult.config?.height || 5200}px (6 Màn)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-purple-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-500 block">Bảng màu áp dụng</span>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300 truncate block">
                        {generatedResult.paletteName || 'Pastel'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-purple-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-500 block">Hiệu ứng rơi</span>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {generatedResult.config?.fallingEffect?.type || 'petals'}
                      </span>
                    </div>
                  </div>

                  {warehouseSavedMsg && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{warehouseSavedMsg}</span>
                    </div>
                  )}

                  {/* Actions to apply or save */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-purple-200/60 dark:border-stone-700">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={handleSaveToWarehouseDirectly}
                        disabled={isSavingToWarehouse}
                        className="px-4 py-2.5 rounded-xl border border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-semibold text-xs transition-colors disabled:opacity-50"
                      >
                        {isSavingToWarehouse ? 'Đang lưu vào kho...' : 'Lưu Vào Kho Mẫu'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleApplyToCanvas}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Áp Dụng Lên Canvas Ngay</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: AI RESTYLE CANVAS PALETTE */}
          {/* ======================================================== */}
          {activeTab === 'restyle' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Đổi tông màu toàn bộ thiệp cưới chỉ với 1 click
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  AI tự động phân tích và thay đổi toàn bộ mã màu văn bản, màu nhấn, màu nền Canvas theo chuẩn phối màu thiết kế cao cấp.
                </p>
              </div>

              {restyleSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{restyleSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {Object.entries(AI_COLOR_PALETTES).map(([key, pal]) => {
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 dark:text-white">
                            {pal.name}
                          </span>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">
                            {pal.fallingType}
                          </span>
                        </div>

                        {/* Swatches preview */}
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-8 h-8 rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center text-[9px] font-bold shadow-2xs"
                            style={{ backgroundColor: pal.bg, color: pal.primaryText }}
                            title="Màu nền Canvas"
                          >
                            Nền
                          </div>
                          <div
                            className="w-8 h-8 rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center text-[9px] font-bold shadow-2xs"
                            style={{ backgroundColor: pal.cardBg, color: pal.primaryText }}
                            title="Màu thẻ card"
                          >
                            Thẻ
                          </div>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: pal.primaryText }}
                            title="Màu chữ chính"
                          >
                            Chữ
                          </div>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: pal.accent }}
                            title="Màu điểm nhấn"
                          >
                            Nhấn
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRestylePalette(key)}
                        disabled={isRestyling}
                        className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-purple-600 hover:text-white text-stone-700 dark:bg-stone-700 dark:text-stone-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Áp dụng tone này</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: AI WORDING WRITER */}
          {/* ======================================================== */}
          {activeTab === 'wording' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Soạn thảo lời mời cưới tinh tế theo 4 tông giọng
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  AI Gemini và Studio Engine gợi ý lời ngỏ, lời cảm ơn sâu lắng và chuẩn văn hóa cưới hỏi Việt Nam.
                </p>
              </div>

              {/* Tone selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'romantic', label: 'Lãng Mạn & Ngọt Ngào' },
                  { id: 'formal', label: 'Trang Trọng & Tôn Nghiêm' },
                  { id: 'modern', label: 'Hiện Đại & Gần Gũi' },
                  { id: 'minimal', label: 'Tối Giản & Tinh Tế' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setWordingTone(t.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      wordingTone === t.id
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-600'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Generate wording button */}
              <button
                type="button"
                onClick={handleGenerateWording}
                disabled={isGeneratingWording}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isGeneratingWording ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>AI Đang Viết Lời Mời...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Soạn Lời Mời Cưới Bằng AI</span>
                  </>
                )}
              </button>

              {/* Wording Result Box */}
              {wordingResult && (
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 space-y-3 animate-in fade-in duration-200">
                  <div className="text-xs italic text-stone-800 dark:text-stone-200 leading-relaxed font-serif">
                    “{wordingResult}”
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-200/60 dark:border-purple-800">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(wordingResult);
                        setCopiedWording(true);
                        setTimeout(() => setCopiedWording(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedWording ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedWording ? 'Đã sao chép!' : 'Sao chép'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertWordingToCanvas}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chèn Ngay Vào Canvas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CURATED VIP MASTER PRESETS (DESIGNER CRAFTED) */}
          {/* ======================================================== */}
          {activeTab === 'curated' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Kho Mẫu Tuyển Chọn Nghệ Thuật (Khung Vàng Hoàn Hảo)</span>
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Từng mẫu thiệp dưới đây đều được Designer căn chỉnh thủ công chuẩn từng pixel theo tỷ lệ vàng. Bạn có thể nạp mẫu lên Canvas, sau đó dùng Tab &quot;AI Phối Bảng Màu&quot; để đổi tone màu theo sở thích!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {STUDIO_TEMPLATE_PRESETS.map((preset, idx) => (
                  <div
                    key={preset.id}
                    className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 overflow-hidden shadow-xs hover:shadow-md hover:border-purple-500 transition-all flex flex-col justify-between group"
                  >
                    <div className="relative aspect-[16/10] bg-stone-100 dark:bg-stone-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.thumbnail || '/assets/wedding/samples/sample_01.jpg'}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-serif font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-900/90 text-white shadow-xs">
                          Mẫu 0{idx + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow-xs">
                          {preset.tier}
                        </span>
                      </div>
                      <span className="absolute bottom-2.5 right-2.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs font-semibold">
                        {preset.imagesCount} ảnh cưới
                      </span>
                    </div>

                    <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-stone-900 dark:text-white line-clamp-1">
                          {preset.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                          {preset.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          loadTemplateData(preset.elements, preset.config, preset.name, preset.slug);
                          handleClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Nạp Mẫu Lên Canvas Ngay</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
