'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, ArrowLeft, Heart, Share2, Sparkles } from 'lucide-react';
import { CanvasConfig, CanvasElement } from '@/components/editor/studio/studioTypes';
import StudioFallingOverlay from '@/components/editor/studio/StudioFallingOverlay';
import StudioWidgetRenderer from '@/components/editor/studio/StudioWidgetRenderer';
import { resolveFontFamily } from '@/lib/studioFonts';

export default function StudioLivePreviewPage() {
  const [canvasData, setCanvasData] = useState<{
    canvas: CanvasConfig;
    elements: CanvasElement[];
  } | null>(null);

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('lovestory_preview_data');
        if (raw) {
          const parsed = jsonParseSafe(raw);
          if (parsed && parsed.canvas && parsed.elements) {
            setCanvasData(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load preview data', e);
      }
    }
  }, []);

  const jsonParseSafe = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  // Music initialization
  useEffect(() => {
    if (canvasData?.canvas?.audioUrl) {
      const audio = new Audio(canvasData.canvas.audioUrl);
      audio.loop = true;
      audioRef.current = audio;

      audio
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false));

      return () => {
        audio.pause();
        audio.currentTime = 0;
        audioRef.current = null;
      };
    }
  }, [canvasData?.canvas?.audioUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true));
    }
  };

  if (!canvasData) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-stone-300">Đang tải bản xem trước thiệp cưới LoveStory...</p>
        <Link
          href="/editor/studio"
          className="mt-4 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-xs rounded-xl flex items-center gap-2 text-stone-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Studio
        </Link>
      </div>
    );
  }

  const { canvas, elements } = canvasData;

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
                    <path id={`live-curve-${el.id}`} d={pathD} fill="none" />
                  </defs>
                  <text
                    fill={el.color || '#000'}
                    fontFamily={resolveFontFamily(el.fontFamily)}
                    fontSize={el.fontSize || 16}
                    fontWeight={el.fontWeight || 'normal'}
                    fontStyle={el.fontStyle || 'normal'}
                    letterSpacing={el.letterSpacing ? `${el.letterSpacing}px` : undefined}
                  >
                    <textPath href={`#live-curve-${el.id}`} startOffset="50%" textAnchor="middle">
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
                src={el.src}
                alt={el.alt || 'Wedding asset'}
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

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-start relative">
      {/* Top Floating Control Pill */}
      <div className="fixed top-4 z-50 flex items-center gap-2 bg-stone-900/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-stone-800 shadow-2xl text-white">
        <Link
          href="/editor/studio"
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white px-2 py-1 rounded-full hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Chỉnh sửa</span>
        </Link>
        <div className="h-3.5 w-px bg-stone-700 mx-1" />
        <span className="text-xs text-stone-400 font-medium">Bản xem trước trực tiếp</span>
      </div>

      {/* Floating Music Button */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all"
        title={isPlayingMusic ? 'Tắt nhạc' : 'Bật nhạc'}
      >
        {isPlayingMusic ? <Volume2 className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6 text-stone-400" />}
      </button>

      {/* Main Wedding Canvas Presentation */}
      <div
        className="relative w-full max-w-[500px] shadow-2xl my-0 sm:my-8 min-h-screen"
        style={{
          backgroundColor: canvas.background,
          minHeight: `${canvas.height}px`,
        }}
      >
        {/* Falling Effect Layer */}
        {canvas.fallingEffect?.enabled && (
          <StudioFallingOverlay
            enabled={canvas.fallingEffect.enabled}
            type={canvas.fallingEffect.type || 'snow'}
            width={500}
            height={canvas.height}
          />
        )}

        {/* Elements */}
        {elements.map((el) => renderElement(el))}
      </div>
    </div>
  );
}
