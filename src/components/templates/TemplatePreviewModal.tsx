'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Heart, Eye, ArrowRight, Crown, Sparkles, Check, Palette } from 'lucide-react';
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

  if (!template) return null;

  const isUnlocked = canUseTemplate(template.id, template.tier);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-4 sm:p-8 z-10 overflow-hidden flex flex-col md:flex-row gap-6 max-h-[92vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Phone Frame with Long Scrollable Thumbnail */}
          <div className="flex-1 flex justify-center items-center overflow-hidden">
            <div className="w-[280px] sm:w-[320px] h-[520px] sm:h-[600px] rounded-[44px] overflow-hidden border-[10px] border-stone-800 bg-stone-950 shadow-2xl relative ring-1 ring-white/10 flex flex-col">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-stone-900 z-30 pointer-events-none" />

              {/* Scrollable Long Webp Container */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-700 bg-stone-950 pt-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={template.longThumbnail}
                  alt={template.name}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Bottom Home Indicator */}
              <div className="h-4 bg-stone-950 flex items-center justify-center shrink-0">
                <div className="w-24 h-1 rounded-full bg-stone-700" />
              </div>
            </div>
          </div>

          {/* Right Column: Template Info, Stats & CTA Actions */}
          <div className="w-full md:w-80 flex flex-col justify-between space-y-5 text-left pt-2 md:pt-4">
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
                <span className="text-xs text-stone-500 font-medium">Thiệp online</span>
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
                  <span>Tự động cuộn &amp; hiệu ứng scrollytelling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Đĩa than phát nhạc &amp; cánh hoa bay</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Đồng hồ đếm ngược &amp; mã QR mừng cưới</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tích hợp bản đồ &amp; gửi lời chúc online</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: ALWAYS ALLOW USING IN STUDIO */}
            <div className="space-y-2.5 pt-4">
              <Link
                href={`/editor/studio?template=${encodeURIComponent(template.slug || template.id)}`}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <Palette className="w-4 h-4" />
                <span>Mở Bằng Studio Visual Editor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={`/editor?template=${encodeURIComponent(template.id)}`}
                className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Chỉnh sửa dạng form cơ bản</span>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
