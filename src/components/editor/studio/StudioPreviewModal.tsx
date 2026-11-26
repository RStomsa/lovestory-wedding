'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  Maximize2,
  Volume2,
  VolumeX,
  ExternalLink,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import { CanvasElement } from './studioTypes';
import StudioFallingOverlay from './StudioFallingOverlay';
import StudioWidgetRenderer from './StudioWidgetRenderer';
import EnvelopeOpeningEffect from '@/components/common/EnvelopeOpeningEffect';
import { resolveFontFamily } from '@/lib/studioFonts';
import { resolveStudioAssetUrl } from '@/lib/studioUtils';

interface StudioPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudioPreviewModal({ isOpen, onClose }: StudioPreviewModalProps) {
  const { canvas, elements, currentTemplateSlug } = useStudioStore();
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [viewMode, setViewMode] = useState<'phone' | 'fullscreen'>('phone');
  const [scrollMode, setScrollMode] = useState<'snap' | 'continuous'>('snap');
  const [currentSection, setCurrentSection] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [previewGuestName, setPreviewGuestName] = useState('Gia Đình Bác Hùng');
  const [copiedGuestLink, setCopiedGuestLink] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Exact Pixel Scaling:
  // Base canvas is 500px wide. Phone viewport inner screen is 360px wide.
  const INNER_SCREEN_WIDTH = 360;
  const FOLD_HEIGHT_CANVAS = 850;
  const phoneScale = INNER_SCREEN_WIDTH / (canvas.width || 500); // 0.72
  const sectionFoldHeight = FOLD_HEIGHT_CANVAS * phoneScale; // ~612px
  const totalSections = Math.max(1, Math.ceil((canvas.height || 5200) / FOLD_HEIGHT_CANVAS));

  // Handle scroll section tracking
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const activeIdx = Math.min(
      totalSections - 1,
      Math.max(0, Math.round(scrollTop / (viewMode === 'phone' ? sectionFoldHeight : FOLD_HEIGHT_CANVAS)))
    );
    if (activeIdx !== currentSection) {
      setCurrentSection(activeIdx);
    }
  };

  const scrollToSection = (idx: number) => {
    const targetIdx = Math.max(0, Math.min(totalSections - 1, idx));
    if (scrollContainerRef.current) {
      const stepH = viewMode === 'phone' ? sectionFoldHeight : FOLD_HEIGHT_CANVAS;
      scrollContainerRef.current.scrollTo({
        top: targetIdx * stepH,
        behavior: 'smooth',
      });
    }
    setCurrentSection(targetIdx);
  };

  // Sync state to localStorage for new tab preview
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'lovestory_preview_data',
          JSON.stringify({ canvas, elements, savedAt: Date.now() })
        );
      } catch (e) {
        console.error('Failed to sync preview to localStorage', e);
      }
    }
  }, [isOpen, canvas, elements]);

  // Audio autoplay handling
  useEffect(() => {
    if (isOpen) {
      const audio = new Audio(canvas.audioUrl || '/assets/wedding/audio/wedding-melody-01.mp3');
      audio.loop = true;
      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlayingMusic(true))
          .catch(() => {
            // Autoplay blocked by browser policy
            setIsPlayingMusic(false);
          });
      }

      return () => {
        audio.pause();
        audio.currentTime = 0;
        audioRef.current = null;
      };
    }
  }, [isOpen, canvas.audioUrl, replayKey]);

  if (!isOpen) return null;

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true));
    }
  };

  const handleOpenNewTab = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'lovestory_preview_data',
          JSON.stringify({ canvas, elements, savedAt: Date.now() })
        );
      } catch {}
      window.open('/editor/studio/preview', '_blank');
    }
  };

  const handleReplayAnimations = () => {
    setReplayKey((k) => k + 1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render element in live guest view
  const renderPreviewElement = (el: CanvasElement) => {
    // Entrance animation class
    let entranceClass = '';
    const entranceType = el.animation?.type;
    if (entranceType && entranceType !== 'none') {
      if (entranceType === 'slide-up') entranceClass = 'anim-slide-up';
      else if (entranceType === 'slide-down') entranceClass = 'anim-slide-down';
      else if (entranceType === 'slide-left') entranceClass = 'anim-slide-left';
      else if (entranceType === 'slide-right') entranceClass = 'anim-slide-right';
      else if (entranceType === 'zoom-in') entranceClass = 'anim-zoom-in';
      else if (entranceType === 'zoom-out') entranceClass = 'anim-zoom-out';
      else if (entranceType === 'fade-in') entranceClass = 'animate-fade-in';
      else if (entranceType === 'rotate-in') entranceClass = 'anim-rotate-in';
      else if (entranceType === 'bounce-in') entranceClass = 'anim-bounce-in';
    }

    // Continuous animation class
    let animClass = '';
    if (el.continuousAnimation?.type === 'floating') {
      animClass = 'animate-float';
    } else if (el.continuousAnimation?.type === 'heartbeat') {
      animClass = 'animate-heartbeat';
    } else if (el.continuousAnimation?.type === 'wobble') {
      animClass = 'animate-wobble';
    }

    // Flip style
    const flipStyle = `${el.flipX ? 'scaleX(-1)' : ''} ${el.flipY ? 'scaleY(-1)' : ''}`.trim();

    // Box shadow & text shadow
    const boxShadow = el.shadow?.enabled
      ? `${el.shadow.x ?? 0}px ${el.shadow.y ?? 4}px ${el.shadow.blur ?? 12}px ${el.shadow.color ?? 'rgba(0,0,0,0.25)'}`
      : 'none';
    const textShadow = el.shadow?.textShadowEnabled
      ? `${el.shadow.x ?? 0}px ${el.shadow.y ?? 2}px ${el.shadow.blur ?? 4}px ${el.shadow.color ?? 'rgba(0,0,0,0.35)'}`
      : 'none';

    const filterStyle = el.filter
      ? `brightness(${el.filter.brightness ?? 100}%) contrast(${el.filter.contrast ?? 100}%) saturate(${el.filter.saturate ?? 100}%) sepia(${el.filter.sepia ?? 0}%)`
      : undefined;

    const entranceStyle: React.CSSProperties = entranceClass
      ? {
          animationDuration: `${el.animation?.duration ?? 1.0}s`,
          animationDelay: `${el.animation?.delay ?? 0}s`,
          animationFillMode: 'both',
        }
      : {};

    const renderInner = () => {
      switch (el.type) {
        case 'text':
          if (el.isCurved) {
            const w = el.width;
            const h = el.height;
            const curv = el.curvature ?? 40;
            const pathD = `M 10 ${h / 2 + curv} Q ${w / 2} ${h / 2 - curv} ${w - 10} ${h / 2 + curv}`;
            return (
              <div
                className={`w-full h-full flex items-center justify-center ${animClass}`}
                style={{
                  transform: flipStyle || undefined,
                  boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                }}
              >
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible w-full h-full">
                  <defs>
                    <path id={`preview-curve-${el.id}`} d={pathD} fill="none" />
                  </defs>
                  <text
                    fill={el.color || '#000'}
                    fontFamily={resolveFontFamily(el.fontFamily)}
                    fontSize={el.fontSize || 16}
                    fontWeight={el.fontWeight || 'normal'}
                    fontStyle={el.fontStyle || 'normal'}
                    letterSpacing={el.letterSpacing ? `${el.letterSpacing}px` : undefined}
                  >
                    <textPath href={`#preview-curve-${el.id}`} startOffset="50%" textAnchor="middle">
                      {el.text}
                    </textPath>
                  </text>
                </svg>
              </div>
            );
          }

          const isFoilGold = el.foilEffect === 'gold';
          const isFoilRoseGold = el.foilEffect === 'rosegold';
          const isFoilSilver = el.foilEffect === 'silver';
          const foilClass = isFoilGold
            ? 'foil-text-gold'
            : isFoilRoseGold
            ? 'foil-text-rosegold'
            : isFoilSilver
            ? 'foil-text-silver'
            : '';

          let renderedText = el.text || '';
          if (previewGuestName) {
            renderedText = renderedText.replace(/\{\{?\s*(guestName|guest|tenKhach|khach)\s*\}?\}/gi, previewGuestName);
          }

          return (
            <div
              className={`w-full h-full flex flex-col justify-center items-center select-none ${animClass}`}
              style={{
                fontFamily: resolveFontFamily(el.fontFamily),
                fontSize: `${el.fontSize || 16}px`,
                fontWeight: el.fontWeight || 'normal',
                fontStyle: el.fontStyle || 'normal',
                color: foilClass ? undefined : el.color || '#000',
                textAlign: el.textAlign || 'center',
                letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
                lineHeight: el.lineHeight || 1.35,
                padding: el.padding !== undefined ? `${el.padding}px` : '4px 6px',
                boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                textShadow: textShadow !== 'none' ? textShadow : undefined,
                transform: flipStyle || undefined,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {foilClass ? (
                <span className={foilClass}>
                  {renderedText}
                </span>
              ) : (
                renderedText
              )}
            </div>
          );

        case 'image':
        case 'graphic':
          return (
            <div
              className={`w-full h-full ${animClass}`}
              style={{
                transform: flipStyle || undefined,
                boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                borderRadius: el.borderRadius ? `${el.borderRadius}px` : '0px',
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveStudioAssetUrl(el.src)}
                alt={el.alt || 'Ảnh cưới LoveStory'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/wedding/samples/sample_01.jpg';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: el.objectFit || 'cover',
                  filter: filterStyle,
                }}
                draggable={false}
              />
            </div>
          );

        case 'shape':
          if (el.shapeType === 'circle') {
            return (
              <div
                className={`w-full h-full rounded-full ${animClass}`}
                style={{
                  backgroundColor: el.fillColor || '#e8d29b',
                  border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`,
                  boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                  transform: flipStyle || undefined,
                }}
              />
            );
          }
          if (el.shapeType === 'triangle') {
            return (
              <div
                className={`w-full h-full ${animClass}`}
                style={{
                  backgroundColor: el.fillColor || '#e8d29b',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`,
                  boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                  transform: flipStyle || undefined,
                }}
              />
            );
          }
          if (el.shapeType === 'line') {
            return (
              <div
                className={`w-full ${animClass}`}
                style={{
                  height: `${el.borderWidth || 2}px`,
                  backgroundColor: el.fillColor || '#9c5a1a',
                  transform: flipStyle || undefined,
                }}
              />
            );
          }
          return (
            <div
              className={`w-full h-full ${animClass}`}
              style={{
                backgroundColor: el.fillColor || '#FAF7F2',
                borderRadius: el.borderRadius ? `${el.borderRadius}px` : el.shapeType === 'square' ? '8px' : '0px',
                border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`,
                boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                transform: flipStyle || undefined,
              }}
            />
          );

        case 'widget':
          return <StudioWidgetRenderer element={el} isSelected={false} canvasBackground={canvas.background} />;

        default:
          return null;
      }
    };

    return (
      <div
        key={`${el.id}-${replayKey}`}
        className="absolute pointer-events-auto"
        style={{
          left: `${el.x}px`,
          top: `${el.y}px`,
          width: `${el.width}px`,
          height: `${el.height}px`,
          transform: `rotate(${el.rotation}deg)`,
          zIndex: el.zIndex,
          opacity: el.opacity,
        }}
      >
        <div className={`w-full h-full ${entranceClass}`} style={entranceStyle}>
          {renderInner()}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Top Header Controls Bar */}
      <div className="w-full max-w-4xl bg-stone-900/95 text-white rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border border-stone-800 shadow-xl backdrop-blur-md mb-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="truncate">
            <span className="text-xs sm:text-sm font-bold tracking-tight block truncate">
              Xem trước trải nghiệm khách mời (Live Guest View)
            </span>
            <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1.5">
              <span>Đang ở: <strong className="text-rose-400">Màn {currentSection + 1} / {totalSections}</strong></span>
              <span>•</span>
              <span className="text-stone-400">Tự động canh chuẩn tỷ lệ điện thoại 1:1</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Mode Toggle: Vuốt từng trang (Snap) vs Cuộn mượt */}
          <div className="flex bg-stone-800 rounded-xl p-0.5 border border-stone-700">
            <button
              onClick={() => setScrollMode('snap')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                scrollMode === 'snap' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
              title="Vuốt ngón tay là tự động trượt sang trang/mục tiếp theo mượt mà"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Vuốt từng trang (Snap)</span>
            </button>
            <button
              onClick={() => setScrollMode('continuous')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                scrollMode === 'continuous' ? 'bg-stone-700 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
              title="Cuộn mượt mà liên tục từ trên xuống dưới"
            >
              <span>Cuộn mượt</span>
            </button>
          </div>

          {/* Section Stepper (Next/Prev buttons) */}
          <div className="flex items-center bg-stone-800 rounded-xl p-0.5 border border-stone-700">
            <button
              onClick={() => scrollToSection(currentSection - 1)}
              disabled={currentSection <= 0}
              className="p-1.5 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Màn trước"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-stone-300 font-semibold">
              {currentSection + 1}/{totalSections}
            </span>
            <button
              onClick={() => scrollToSection(currentSection + 1)}
              disabled={currentSection >= totalSections - 1}
              className="p-1.5 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Màn tiếp theo"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Replay Entrance Animations */}
          <button
            onClick={handleReplayAnimations}
            className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Phát lại toàn bộ hiệu ứng xuất hiện"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phát lại</span>
          </button>

          {/* Device Toggle */}
          <div className="hidden sm:flex bg-stone-800 rounded-xl p-0.5 border border-stone-700">
            <button
              onClick={() => setViewMode('phone')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'phone' ? 'bg-rose-500 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Điện thoại</span>
            </button>
            <button
              onClick={() => setViewMode('fullscreen')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'fullscreen' ? 'bg-rose-500 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Toàn màn hình</span>
            </button>
          </div>

          {/* Open In New Tab */}
          <button
            onClick={handleOpenNewTab}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            title="Mở trong tab mới toàn màn hình"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mở tab mới</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Guest Personalization Toolbar */}
      <div className="w-full max-w-4xl bg-stone-900/90 text-white rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 border border-stone-800 shadow-md backdrop-blur-md mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="text-xs text-rose-400 font-bold whitespace-nowrap flex items-center gap-1.5">
            <span>💌 Thử nghiệm tên khách mời:</span>
          </span>
          <input
            type="text"
            value={previewGuestName}
            onChange={(e) => setPreviewGuestName(e.target.value)}
            placeholder="vd: Anh Hoàng, Bác Hùng, Cô Lan..."
            className="bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-stone-500 outline-none focus:border-rose-500 flex-1 max-w-xs"
          />
        </div>

        <button
          onClick={() => {
            const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            const targetSlug = currentTemplateSlug || 'thiep-cuoi-165';
            const guestParam = encodeURIComponent(previewGuestName.trim() || 'Ban');
            const link = `${origin}/${targetSlug}?to=${guestParam}&envelope=1`;
            navigator.clipboard.writeText(link);
            setCopiedGuestLink(true);
            setTimeout(() => setCopiedGuestLink(false), 2500);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          title="Sao chép đường link gửi riêng cho khách mời này kèm phong bì mở thiệp"
        >
          {copiedGuestLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedGuestLink ? 'Đã sao chép link mời!' : 'Sao Chép Link Mời Đích Danh'}</span>
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative">
        {viewMode === 'phone' ? (
          /* Realistic iPhone 15 Pro Titanium Mockup Frame (Standard 360px inner screen) */
          <div className="relative w-[384px] h-[780px] max-h-[86vh] bg-stone-900 rounded-[50px] p-3 shadow-2xl border-[5px] border-stone-700 ring-1 ring-white/10 flex flex-col items-center">
            {/* Dynamic Island Notch */}
            <div className="absolute top-4 z-40 w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-800/80" />
              <div className="w-2 h-2 rounded-full bg-blue-950/60" />
            </div>

            {/* Inner Phone Screen */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className={`relative w-[360px] h-full rounded-[40px] overflow-y-auto overflow-x-hidden no-scrollbar shadow-inner ${
                scrollMode === 'snap' ? 'snap-y snap-mandatory scroll-smooth' : 'scroll-smooth'
              }`}
              style={{
                backgroundColor: canvas.background,
                scrollBehavior: 'smooth',
              }}
            >
              {/* Envelope Opening Cover Overlay inside phone */}
              {canvas.envelopeCover?.enabled !== false && (
                <EnvelopeOpeningEffect
                  key={`env-${replayKey}-${previewGuestName}`}
                  coverId={canvas.envelopeCover?.coverId || 'default'}
                  autoOpen={canvas.envelopeCover?.autoOpen ?? false}
                  guestName={previewGuestName}
                  groomName={canvas.weddingProfile?.groom?.shortName || canvas.weddingProfile?.groom?.fullName || 'Chú Rể'}
                  brideName={canvas.weddingProfile?.bride?.shortName || canvas.weddingProfile?.bride?.fullName || 'Cô Dâu'}
                  weddingDate={canvas.weddingProfile?.ceremonies?.find((c) => c.isMain)?.date || '2026-11-28'}
                  onOpen={() => {
                    if (!isPlayingMusic && audioRef.current) {
                      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
                    }
                  }}
                />
              )}

              {/* Floating Music Button inside phone */}
              <button
                onClick={toggleMusic}
                className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center text-rose-500 hover:scale-105 active:scale-95 transition-all"
                title={isPlayingMusic ? 'Tắt nhạc' : 'Bật nhạc'}
              >
                {isPlayingMusic ? (
                  <Volume2 className="w-5 h-5 animate-pulse" />
                ) : (
                  <VolumeX className="w-5 h-5 text-stone-400" />
                )}
              </button>

              {/* Floating Section Page Dots Indicator (Right edge of phone) */}
              <div className="fixed top-1/2 -translate-y-1/2 right-4 z-40 flex flex-col items-center gap-1.5 p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg pointer-events-auto">
                {Array.from({ length: totalSections }).map((_, idx) => (
                  <button
                    key={`dot-${idx}`}
                    onClick={() => scrollToSection(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      currentSection === idx
                        ? 'w-2 h-5 bg-rose-500 shadow-xs'
                        : 'w-2 h-2 bg-white/50 hover:bg-white/90'
                    }`}
                    title={`Chuyển tới Màn ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Bouncing Swipe Up Hint on Screen 1 */}
              {currentSection === 0 && (
                <div
                  onClick={() => scrollToSection(1)}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer animate-bounce shadow-lg border border-white/20"
                >
                  <span>Vuốt lên để xem tiếp</span>
                  <ChevronDown className="w-3.5 h-3.5 text-rose-300" />
                </div>
              )}

              {/* Falling Petals/Snow Overlay inside phone */}
              {canvas.fallingEffect?.enabled && (
                <div className="pointer-events-none sticky top-0 w-full h-0 z-30 overflow-visible">
                  <StudioFallingOverlay
                    enabled={canvas.fallingEffect.enabled}
                    type={canvas.fallingEffect.type || 'snow'}
                    width={360}
                    height={780}
                  />
                </div>
              )}

              {/* Scaled Invitation Canvas - Exact Layout Dimension */}
              <div
                style={{
                  width: `${INNER_SCREEN_WIDTH}px`,
                  height: `${canvas.height * phoneScale}px`,
                  position: 'relative',
                }}
              >
                {/* Section Snap Targets for smooth page-by-page swiping */}
                {scrollMode === 'snap' && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {Array.from({ length: totalSections }).map((_, idx) => (
                      <div
                        key={`snap-${idx}`}
                        className="snap-start snap-always w-full"
                        style={{ height: `${sectionFoldHeight}px` }}
                      />
                    ))}
                  </div>
                )}

                <div
                  style={{
                    width: `${canvas.width}px`,
                    height: `${canvas.height}px`,
                    transform: `scale(${phoneScale})`,
                    transformOrigin: 'top left',
                    backgroundColor: canvas.background,
                  }}
                  className="relative"
                >
                  {elements.map((el) => renderPreviewElement(el))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Fullscreen Scrollable Canvas View */
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`w-full max-w-lg h-full max-h-[88vh] rounded-3xl overflow-y-auto overflow-x-hidden shadow-2xl relative border border-stone-800 ${
              scrollMode === 'snap' ? 'snap-y snap-mandatory scroll-smooth' : 'scroll-smooth'
            }`}
            style={{ backgroundColor: canvas.background, scrollBehavior: 'smooth' }}
          >
            {/* Floating Music Button */}
            <button
              onClick={toggleMusic}
              className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-center text-rose-500 hover:scale-105 active:scale-95 transition-all"
              title={isPlayingMusic ? 'Tắt nhạc' : 'Bật nhạc'}
            >
              {isPlayingMusic ? (
                <Volume2 className="w-6 h-6 animate-pulse" />
              ) : (
                <VolumeX className="w-6 h-6 text-stone-400" />
              )}
            </button>

            {/* Falling effect overlay */}
            {canvas.fallingEffect?.enabled && (
              <div className="pointer-events-none sticky top-0 w-full h-0 z-30 overflow-visible">
                <StudioFallingOverlay
                  enabled={canvas.fallingEffect.enabled}
                  type={canvas.fallingEffect.type || 'snow'}
                  width={canvas.width}
                  height={canvas.height}
                />
              </div>
            )}

            {/* Snap Targets for Fullscreen */}
            {scrollMode === 'snap' && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {Array.from({ length: totalSections }).map((_, idx) => (
                  <div
                    key={`snap-full-${idx}`}
                    className="snap-start snap-always w-full"
                    style={{ height: `${FOLD_HEIGHT_CANVAS}px` }}
                  />
                ))}
              </div>
            )}

            <div
              style={{
                width: `${canvas.width}px`,
                height: `${canvas.height}px`,
                backgroundColor: canvas.background,
              }}
              className="relative mx-auto"
            >
              {elements.map((el) => renderPreviewElement(el))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="mt-2 text-stone-400 text-[11px] text-center font-medium">
        ✨ Giao diện mô phỏng 100% cách khách mời xem thiệp cưới trên điện thoại di động với âm nhạc, hiệu ứng rơi và tương tác RSVP thật.
      </div>
    </div>
  );
}
