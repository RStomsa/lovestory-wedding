'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Heart, Share2, Sparkles, Check, Phone, ArrowUp } from 'lucide-react';
import { CanvasConfig, CanvasElement, WeddingProfileData } from './studioTypes';
import StudioFallingOverlay from './StudioFallingOverlay';
import StudioWidgetRenderer from './StudioWidgetRenderer';
import EnvelopeOpeningEffect from '@/components/common/EnvelopeOpeningEffect';
import { resolveFontFamily } from '@/lib/studioFonts';
import { resolveStudioAssetUrl } from '@/lib/studioUtils';

interface Props {
  canvas: CanvasConfig;
  elements: CanvasElement[];
  weddingProfile?: WeddingProfileData;
  guestName?: string;
  guestRole?: string;
  showEnvelope?: boolean;
  siteTitle?: string;
  slug?: string;
}

export default function StudioPublicSiteViewer({
  canvas,
  elements = [],
  weddingProfile,
  guestName,
  guestRole,
  showEnvelope = false,
  siteTitle,
  slug,
}: Props) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [envelopeDismissed, setEnvelopeDismissed] = useState(!showEnvelope && !canvas.envelopeCover?.enabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Groom & Bride display names for envelope / SEO
  const groomName = weddingProfile?.groom?.shortName || weddingProfile?.groom?.fullName || 'Chú rể';
  const brideName = weddingProfile?.bride?.shortName || weddingProfile?.bride?.fullName || 'Cô dâu';

  // Responsive scale factor for mobile screens (< 500px)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const w = window.innerWidth;
        if (w < 500) {
          setScaleFactor(w / 500);
        } else {
          setScaleFactor(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Audio Playback
  useEffect(() => {
    if (canvas?.audioUrl) {
      const audio = new Audio(canvas.audioUrl);
      audio.loop = true;
      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlayingMusic(true))
          .catch(() => {
            // Browser autoplay policy blocked unmuted sound, wait for user click
            setIsPlayingMusic(false);
            const resumeOnInteraction = () => {
              if (audioRef.current) {
                audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
              }
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('touchstart', resumeOnInteraction);
            };
            window.addEventListener('click', resumeOnInteraction, { once: true });
            window.addEventListener('touchstart', resumeOnInteraction, { once: true });
          });
      }

      return () => {
        audio.pause();
        audio.currentTime = 0;
        audioRef.current = null;
      };
    }
  }, [canvas?.audioUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: siteTitle || `${groomName} & ${brideName} - Thiệp Cưới`,
          text: `Trân trọng kính mời quý khách tham dự lễ cưới của ${groomName} & ${brideName}!`,
          url,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  const renderElement = (el: CanvasElement) => {
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

    let animClass = '';
    if (el.continuousAnimation?.type === 'floating') animClass = 'animate-float';
    else if (el.continuousAnimation?.type === 'heartbeat') animClass = 'animate-heartbeat';
    else if (el.continuousAnimation?.type === 'wobble') animClass = 'animate-wobble';

    const flipStyle = `${el.flipX ? 'scaleX(-1)' : ''} ${el.flipY ? 'scaleY(-1)' : ''}`.trim();
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
                    <path id={`pub-curve-${el.id}`} d={pathD} fill="none" />
                  </defs>
                  <text
                    fill={el.color || '#000'}
                    fontFamily={resolveFontFamily(el.fontFamily)}
                    fontSize={el.fontSize || 16}
                    fontWeight={el.fontWeight || 'normal'}
                    fontStyle={el.fontStyle || 'normal'}
                    letterSpacing={el.letterSpacing ? `${el.letterSpacing}px` : undefined}
                  >
                    <textPath href={`#pub-curve-${el.id}`} startOffset="50%" textAnchor="middle">
                      {el.text}
                    </textPath>
                  </text>
                </svg>
              </div>
            );
          }

          return (
            <div
              className={`w-full h-full flex flex-col justify-center select-none ${animClass}`}
              style={{
                fontFamily: resolveFontFamily(el.fontFamily),
                fontSize: `${el.fontSize || 16}px`,
                fontWeight: el.fontWeight || 'normal',
                fontStyle: el.fontStyle || 'normal',
                color: el.color || '#000',
                textAlign: el.textAlign || 'center',
                letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
                lineHeight: el.lineHeight || 1.2,
                padding: el.padding ? `${el.padding}px` : undefined,
                boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                textShadow: textShadow !== 'none' ? textShadow : undefined,
                transform: flipStyle || undefined,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {el.text}
            </div>
          );

        case 'image':
        case 'graphic': {
          const resolvedSrc = resolveStudioAssetUrl(el.src);
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
                src={resolvedSrc}
                alt={el.alt || 'Ảnh thiệp cưới'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  // Graceful fallback for any CDN edge cases
                  if (target.src.includes('/stock/')) {
                    const fn = target.src.split('/stock/').pop()?.split('?')[0];
                    if (fn) {
                      target.src = `/assets/m-invite/stock/${fn}`;
                      return;
                    }
                  }
                  target.style.display = 'none';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: el.objectFit || (el.type === 'graphic' ? 'contain' : 'cover'),
                  filter: filterStyle,
                }}
                draggable={false}
              />
            </div>
          );
        }

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
                  backgroundColor: el.fillColor || el.color || '#9c5a1a',
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
          return <StudioWidgetRenderer element={el} isSelected={false} />;

        default:
          return null;
      }
    };

    return (
      <div
        key={el.id}
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

  const canvasBg = canvas?.background || '#ffffff';
  const totalHeight = Math.max(1200, canvas?.height || 5000);

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
      {/* 1. Envelope opening ceremony for guests */}
      {!envelopeDismissed && (
        <EnvelopeOpeningEffect
          guestName={guestName}
          groomName={groomName}
          brideName={brideName}
        />
      )}

      {/* 2. Floating Action Controls (Sound & Share) */}
      <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-2.5 items-end">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-11 h-11 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-xl border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:scale-110 active:scale-95 transition-all"
          title="Chia sẻ thiệp cưới"
        >
          {copiedLink ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
        </button>

        {/* Music Button */}
        {canvas?.audioUrl && (
          <button
            onClick={toggleMusic}
            className={`w-12 h-12 rounded-full shadow-2xl border flex items-center justify-center transition-all ${
              isPlayingMusic
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/40 animate-pulse'
                : 'bg-white/90 dark:bg-stone-900/90 backdrop-blur-md text-stone-500 border-stone-200 dark:border-stone-800'
            }`}
            title={isPlayingMusic ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
          >
            {isPlayingMusic ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* 3. Main Scaled Canvas Presentation */}
      <div
        className="relative shadow-2xl my-0 sm:my-8 origin-top transition-transform"
        style={{
          width: '500px',
          minHeight: `${totalHeight}px`,
          backgroundColor: canvasBg,
          transform: scaleFactor < 1 ? `scale(${scaleFactor})` : undefined,
          marginBottom: scaleFactor < 1 ? `-${Math.round((1 - scaleFactor) * totalHeight)}px` : undefined,
        }}
      >
        {/* Falling Effect Layer (Petals / Snow / Hearts / Leaves) */}
        {canvas.fallingEffect?.enabled && (
          <StudioFallingOverlay
            enabled={canvas.fallingEffect.enabled}
            type={canvas.fallingEffect.type || 'snow'}
            width={500}
            height={totalHeight}
          />
        )}

        {/* Canvas Elements */}
        {elements.map((el) => renderElement(el))}
      </div>

      {/* 4. Elegant LoveStory Footer Branding */}
      <footer className="w-full py-8 text-center text-xs text-stone-400 font-sans z-20 flex flex-col items-center gap-1.5 border-t border-stone-900 bg-stone-950">
        <div className="flex items-center gap-1.5 text-stone-300 font-serif font-bold text-sm">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>LoveStory Wedding</span>
        </div>
        <p className="text-[11px] text-stone-500">
          Trân trọng gửi trao khoảnh khắc hạnh phúc trọn đời.
        </p>
        <Link
          href="/"
          className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline pt-1 transition-colors"
        >
          Tạo thiệp cưới online miễn phí tại lovestory.vn
        </Link>
      </footer>
    </div>
  );
}
