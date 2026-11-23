'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  X,
  Heart,
  Eye,
  ArrowRight,
  Crown,
  Sparkles,
  Check,
  Palette,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  Sparkle,
} from 'lucide-react';
import { CatalogTemplate } from '@/data/templatesCatalog';
import { useAuth } from '@/context/AuthContext';

interface Props {
  template: CatalogTemplate | null;
  onClose: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
}

export default function TemplatePreviewModal({
  template,
  onClose,
  isLiked = false,
  onToggleLike,
}: Props) {
  const { canUseTemplate, openUpgradeModal } = useAuth();
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Audio setup when modal is opened
  useEffect(() => {
    if (template) {
      // Pick audio track for preview
      const sampleAudioUrl = '/assets/wedding/mp3/ee11a985-5e0e-4eb0-b6da-28fa39c9946f.mp3';
      const audio = new Audio(sampleAudioUrl);
      audio.loop = true;
      audioRef.current = audio;

      // Attempt soft autoplay
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => setIsPlayingMusic(true)).catch(() => setIsPlayingMusic(false));
      }

      return () => {
        audio.pause();
        audio.currentTime = 0;
        audioRef.current = null;
        setIsPlayingMusic(false);
      };
    }
  }, [template]);

  if (!template) return null;

  const isUnlocked = canUseTemplate(template.id, template.tier);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const handleResetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[94vh]"
        >
          {/* ======================================================== */}
          {/* 1. TOP STICKY BAR (Phỏng theo MeliPage / miuWedding) */}
          {/* ======================================================== */}
          <div className="px-4 py-3 bg-stone-950/90 border-b border-stone-800/80 flex items-center justify-between gap-3 shrink-0 z-20">
            {/* Template Info & Branding */}
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-sm">💍</span>
              <div className="truncate">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide block truncate">
                  {template.name}
                </span>
                <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                  <Music className="w-3 h-3 shrink-0" />
                  <span>Lưu ý: Bạn có thể đổi bài hát &amp; font chữ tùy thích</span>
                </span>
              </div>
            </div>

            {/* Right: CTA Button & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/editor/studio?template=${encodeURIComponent(template.slug || template.id)}`}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <span>Tạo thiệp ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Đóng xem trước"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. BODY CONTENT: PHONE MOCKUP & DETAILS */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
            {/* Left Column: Phone Frame with Long Scrollable Thumbnail & Audio */}
            <div className="flex-1 flex justify-center items-center">
              <div className="w-[280px] sm:w-[320px] h-[500px] sm:h-[580px] rounded-[42px] overflow-hidden border-[10px] border-stone-800 bg-stone-950 shadow-2xl relative ring-1 ring-white/10 flex flex-col">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-stone-900 z-30 pointer-events-none" />

                {/* Top Control Overlay inside phone */}
                <div className="absolute top-8 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
                  <button
                    onClick={handleResetScroll}
                    className="p-1.5 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-300 hover:text-white border border-stone-700/60 shadow-md text-[10px] flex items-center gap-1"
                    title="Cuộn về đầu trang"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  {/* Audio Mute/Unmute toggle */}
                  <button
                    onClick={toggleMusic}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-md border shadow-md transition-all ${
                      isPlayingMusic
                        ? 'bg-rose-500/80 text-white border-rose-400 animate-pulse'
                        : 'bg-stone-900/80 text-stone-300 border-stone-700'
                    }`}
                  >
                    {isPlayingMusic ? (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Đang phát nhạc</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3 h-3" />
                        <span>Bật nhạc</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Scrollable Long Webp Container */}
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-700 bg-stone-950 pt-6 relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.longThumbnail}
                    alt={template.name}
                    className="w-full h-auto object-cover"
                  />

                  {/* Floating Wax Seal decoration stamp at bottom-left */}
                  <div className="sticky bottom-6 left-4 ml-4 pointer-events-none z-20 w-12 h-12 rounded-full overflow-hidden filter drop-shadow(0 4px 6px rgba(0,0,0,0.5))">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><circle cx='60' cy='60' r='54' fill='%23881337'/><circle cx='60' cy='60' r='42' fill='%239f1239' stroke='%23fecdd3' stroke-width='2'/><path d='M44 80 C50 68 56 50 78 38' stroke='%23fecdd3' stroke-width='3' fill='none'/><circle cx='76' cy='40' r='5' fill='%23fecdd3'/></svg>"
                      alt="Dấu sáp"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="h-4 bg-stone-950 flex items-center justify-center shrink-0">
                  <div className="w-24 h-1 rounded-full bg-stone-700" />
                </div>
              </div>
            </div>

            {/* Right Column: Template Info, Stats & CTA Actions */}
            <div className="w-full md:w-80 flex flex-col justify-between space-y-4 text-left pt-1">
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  {template.tier === 'PREMIUM' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      <Crown className="w-3.5 h-3.5" /> Mẫu VIP
                    </span>
                  ) : template.tier === 'BASIC' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> Mẫu Basic
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> Mẫu Miễn phí
                    </span>
                  )}
                  <span className="text-xs text-stone-500 font-medium">Thiệp online LoveStory</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                    {template.name}
                  </h2>
                  <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 py-3 border-y border-stone-800 text-xs text-stone-400">
                  <button
                    type="button"
                    onClick={onToggleLike}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                    <span>{(template.likes + (isLiked ? 1 : 0)).toLocaleString('vi-VN')}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-stone-500" />
                    <span>{template.views.toLocaleString('vi-VN')} lượt xem</span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-2 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Tự động cuộn &amp; hiệu ứng scrollytelling điện ảnh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Đĩa than phát nhạc &amp; hiệu ứng cánh hoa bay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Hỗ trợ kéo thả dấu sáp hoàng gia &amp; nhãn dán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Đồng hồ đếm ngược, hộp mừng cưới &amp; RSVP</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-2.5 pt-2 border-t border-stone-800/80">
                <Link
                  href={`/editor/studio?template=${encodeURIComponent(template.slug || template.id)}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-transform active:scale-98"
                >
                  <Palette className="w-4 h-4" />
                  <span>Soạn Thiệp Bằng Studio Trực Quan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {template.tier === 'PREMIUM' && !isUnlocked && (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openUpgradeModal({
                          defaultType: 'SINGLE_TEMPLATE_VIP',
                          templateId: template.id,
                          templateName: template.name,
                          templatePrice: template.price,
                        });
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 text-purple-300 hover:text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Mua Lẻ (30k)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openUpgradeModal({
                          defaultType: 'PLAN_LIFETIME_VIP_200K',
                        });
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[11px] flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 transition-all"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Mở VIP (200k)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
