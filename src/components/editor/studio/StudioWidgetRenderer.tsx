'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Bell,
  CheckCircle2,
  Copy,
  QrCode,
  Heart,
  User,
  Users,
  Image as ImageIcon,
  MessageSquare,
  Music,
  Play,
  Volume2,
  Film,
  Send,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Disc,
  Gift,
  Mail,
  Compass,
  Star,
  Radio,
} from 'lucide-react';
import { CanvasElement } from './studioTypes';

function isDarkColor(color?: string): boolean {
  if (!color || color === 'transparent') return false;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 135;
  }
  if (color.includes('rgba') || color.includes('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0], 10);
      const g = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 135;
    }
  }
  return false;
}

interface Props {
  element: CanvasElement;
  isSelected?: boolean;
  canvasBackground?: string;
}

export default function StudioWidgetRenderer({ element, canvasBackground }: Props) {
  const { widgetType, widgetConfig = {} } = element;

  // Live countdown state for countdown widget
  const [timeLeft, setTimeLeft] = useState({
    days: 28,
    hours: 14,
    minutes: 9,
    seconds: 45,
  });

  useEffect(() => {
    if (widgetType !== 'countdown') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        return { ...prev, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [widgetType]);

  // Calendar days grid
  const weddingDay = widgetConfig.selectedDay ?? 28;
  const calendarDays = [
    null, null, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 31, null, null,
  ];

  const isTransparent = !widgetConfig.backgroundColor || widgetConfig.backgroundColor === 'transparent';
  const hasCustomBg = !!widgetConfig.backgroundColor && widgetConfig.backgroundColor !== 'transparent';
  const isBorderless = !widgetConfig.borderWidth || widgetConfig.borderWidth === 0;
  const hasCustomBorder = widgetConfig.borderWidth !== undefined && widgetConfig.borderWidth > 0;
  const hasCustomText = !!widgetConfig.textColor;
  const effectiveBg = isTransparent ? canvasBackground : widgetConfig.backgroundColor;
  const isDarkBg = isDarkColor(effectiveBg);

  const customWrapperStyle: React.CSSProperties = {
    backgroundColor: isTransparent ? 'transparent' : widgetConfig.backgroundColor,
    ...(widgetConfig.textColor ? { color: widgetConfig.textColor } : {}),
    ...(widgetConfig.borderRadius !== undefined
      ? { borderRadius: `${widgetConfig.borderRadius}px` }
      : hasCustomBg || hasCustomBorder
      ? { borderRadius: '16px' }
      : {}),
    ...(hasCustomBorder
      ? {
          borderWidth: `${widgetConfig.borderWidth}px`,
          borderColor: widgetConfig.borderColor || '#e5e7eb',
          borderStyle: widgetConfig.borderStyle || 'solid',
        }
      : {
          border: 'none',
        }),
    ...(widgetConfig.fontFamily ? { fontFamily: widgetConfig.fontFamily } : {}),
    ...(isTransparent || isBorderless ? { boxShadow: 'none' } : {}),
  };

  const accentColor = widgetConfig.accentColor || widgetConfig.markerColor || '#e11d48';
  const showTitle = widgetConfig.showTitle !== false;

  // Semantic transparent & adaptive surface helpers so widgets blend seamlessly into any canvas background
  const headingTextClass = isDarkBg ? 'text-white' : 'text-stone-900 dark:text-stone-100';
  const subHeadingTextClass = isDarkBg ? 'text-amber-200' : 'text-[#8C7355] dark:text-amber-300';
  const bodyTextClass = isDarkBg ? 'text-white/85' : 'text-stone-600 dark:text-stone-300';
  const mutedTextClass = isDarkBg ? 'text-white/60' : 'text-stone-500 dark:text-stone-400';
  const dividerClass = isDarkBg ? 'border-white/15' : 'border-stone-900/10 dark:border-stone-800';
  const subCardClass = isDarkBg
    ? 'bg-white/10 border border-white/20 text-white'
    : 'bg-white/35 dark:bg-stone-800/40 border border-stone-900/12 dark:border-stone-700/60';
  const inputSurfaceClass = isDarkBg
    ? 'bg-white/10 border border-white/25 text-white placeholder:text-white/50'
    : 'bg-white/40 dark:bg-stone-800/45 border border-stone-900/15 dark:border-stone-700/60 text-stone-800 dark:text-stone-200 placeholder:text-stone-500/70';
  const neutralButtonClass = isDarkBg
    ? 'bg-white/10 border border-white/20 text-white/85 hover:bg-white/15'
    : 'bg-white/30 dark:bg-stone-800/40 border border-stone-900/12 dark:border-stone-700/60 text-stone-600 dark:text-stone-300';

  const renderContent = () => {
    // 1. COUNTDOWN TIMER WIDGET (Đa dạng kiểu hiển thị: Hộp vàng, Kính mờ, Huy hiệu tròn, Đồng hồ lật, Trái tim)
    if (widgetType === 'countdown') {
    const style = widgetConfig.layout || widgetConfig.baseLayout || widgetConfig.style || 'boxes';
    const quote = widgetConfig.quote ?? 'Cùng đếm ngược đến khoảnh khắc trọng đại của chúng mình';
    const hasQuote = showTitle && quote.trim().length > 0;

    // Style 2: KÍNH MỜ HIỆN ĐẠI (Frosted Glass)
    if (style === 'glass' || style === 'frosted-glass' || style.includes('glass')) {
      return (
        <div className="w-full h-full backdrop-blur-md bg-white/40 dark:bg-stone-900/50 rounded-2xl p-3 border border-white/60 dark:border-stone-700/60 shadow-lg flex flex-col justify-center items-center select-none">
          <div className="grid grid-cols-4 gap-2 w-full max-w-[380px]">
            {[
              { val: timeLeft.days, label: 'NGÀY' },
              { val: timeLeft.hours, label: 'GIỜ' },
              { val: timeLeft.minutes, label: 'PHÚT' },
              { val: timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds, label: 'GIÂY' },
            ].map((item, i) => (
              <div key={i} className="bg-white/70 dark:bg-stone-800/80 backdrop-blur-md rounded-xl p-2.5 shadow-xs border border-white/80 dark:border-stone-600/50 text-center">
                <span className="block text-2xl md:text-3xl font-sans font-black text-stone-900 dark:text-white tabular-nums leading-none tracking-tight">
                  {item.val}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest block mt-1" style={{ color: accentColor }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {hasQuote && (
            <p className="text-[11px] text-stone-600 dark:text-stone-300 font-sans font-medium mt-2 text-center">
              &ldquo;{quote}&rdquo;
            </p>
          )}
        </div>
      );
    }

    // Style 3: HUY HIỆU TRÒN THANH LỊCH (Circular Badges)
    if (style === 'circle' || style === 'circles' || style.includes('circle')) {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col justify-center items-center select-none">
          <div className="grid grid-cols-4 gap-2 w-full max-w-[360px]">
            {[
              { val: timeLeft.days, label: 'Ngày' },
              { val: timeLeft.hours, label: 'Giờ' },
              { val: timeLeft.minutes, label: 'Phút' },
              { val: timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds, label: 'Giây' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center ${
                    isDarkBg ? 'bg-white/10' : 'bg-amber-50/40 dark:bg-stone-800/60'
                  }`}
                  style={{ borderColor: `${accentColor}80` }}
                >
                  <span className={`text-xl md:text-2xl font-serif font-bold tabular-nums ${isDarkBg ? 'text-white' : 'text-[#42342D] dark:text-amber-200'}`}>
                    {item.val}
                  </span>
                </div>
                <span className={`text-[10px] font-serif italic mt-1 ${mutedTextClass}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {hasQuote && (
            <p className={`text-[10px] font-serif italic mt-2 text-center ${subHeadingTextClass}`}>
              &ldquo;{quote}&rdquo;
            </p>
          )}
        </div>
      );
    }

    // Style 4: ĐỒNG HỒ LẬT 3D CỔ ĐIỂN (Retro Flip Clock)
    if (style === 'flip' || style === 'flip-card' || style.includes('flip')) {
      return (
        <div className="w-full h-full bg-stone-950/95 rounded-2xl p-3 border border-stone-800 shadow-xl flex flex-col justify-center items-center select-none text-white">
          <div className="grid grid-cols-4 gap-2 w-full max-w-[380px]">
            {[
              { val: timeLeft.days, label: 'NGÀY' },
              { val: timeLeft.hours, label: 'GIỜ' },
              { val: timeLeft.minutes, label: 'PHÚT' },
              { val: timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds, label: 'GIÂY' },
            ].map((item, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700 shadow-inner p-2 text-center">
                <span className="block text-2xl md:text-3xl font-mono font-bold text-amber-300 tabular-nums leading-none">
                  {item.val}
                </span>
                <div className="h-px w-full bg-stone-950/80 my-1 shadow-xs" />
                <span className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest block">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {hasQuote && (
            <p className="text-[10px] text-amber-200/80 font-mono mt-2 text-center">
              {quote}
            </p>
          )}
        </div>
      );
    }

    // Style 5: TỐI GIẢN TINH TẾ (Minimalist Clean Numbers)
    if (style === 'minimal' || style === 'minimalist' || style.includes('minimal')) {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col justify-center items-center select-none">
          <div className="grid grid-cols-4 gap-2 w-full max-w-[380px] text-center">
            {[
              { val: timeLeft.days, label: 'NGÀY' },
              { val: timeLeft.hours, label: 'GIỜ' },
              { val: timeLeft.minutes, label: 'PHÚT' },
              { val: timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds, label: 'GIÂY' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className={`block text-3xl md:text-4xl font-sans font-light tracking-tight tabular-nums leading-none ${headingTextClass}`}>
                  {item.val}
                </span>
                <span className={`text-[9px] font-mono tracking-widest uppercase mt-1.5 ${mutedTextClass}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {hasQuote && (
            <p className={`text-[10px] font-sans tracking-wide mt-2 text-center ${mutedTextClass}`}>
              &ldquo;{quote}&rdquo;
            </p>
          )}
        </div>
      );
    }

    // Style 6: TRÁI TIM LÃNG MẠN (Romantic Hearts)
    if (style === 'romantic' || style === 'heart' || style.includes('heart')) {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col justify-center items-center select-none">
          <div className="flex items-center justify-center gap-1.5 md:gap-3 w-full max-w-[380px]">
            {[
              { val: timeLeft.days, label: 'Ngày' },
              { val: timeLeft.hours, label: 'Giờ' },
              { val: timeLeft.minutes, label: 'Phút' },
              { val: timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds, label: 'Giây' },
            ].map((item, i, arr) => (
              <React.Fragment key={i}>
                <div className={`text-center px-2 py-1.5 rounded-xl min-w-[58px] ${
                  isDarkBg ? 'bg-white/10 border border-white/20' : 'bg-white/45 dark:bg-stone-900/60 border border-rose-300/40'
                }`}>
                  <span className="block text-xl md:text-2xl font-serif font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {item.val}
                  </span>
                  <span className={`text-[9px] font-medium uppercase tracking-wider block ${mutedTextClass}`}>
                    {item.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300 animate-pulse shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
          {hasQuote && (
            <p className={`text-[11px] font-serif italic mt-2 text-center ${isDarkBg ? 'text-rose-200' : 'text-rose-700/80 dark:text-rose-300/80'}`}>
              &ldquo;{quote}&rdquo;
            </p>
          )}
        </div>
      );
    }

    // Default Style 1: HỘP VÀNG HOÀNG GIA (Classic Gold Boxes)
    const countdownBoxClass = isDarkBg
      ? 'bg-white/12 rounded-xl p-2.5 border border-white/20 text-center'
      : 'bg-[#E4D1B9]/75 dark:bg-stone-800/80 rounded-xl p-2.5 border border-[#D5BF9E]/40 text-center';
    const countdownNumClass = isDarkBg ? 'text-amber-200' : 'text-[#42342D] dark:text-amber-200';
    const countdownLblClass = isDarkBg ? 'text-white/70' : 'text-[#6B5A51] dark:text-stone-400';

    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-3 select-none">
        <div className="grid grid-cols-4 gap-2 w-full max-w-[380px]">
          <div className={countdownBoxClass}>
            <span className={`block text-2xl md:text-3xl font-serif font-bold tabular-nums leading-none ${countdownNumClass}`}>
              {timeLeft.days}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider block mt-1 ${countdownLblClass}`}>
              ngày
            </span>
          </div>

          <div className={countdownBoxClass}>
            <span className={`block text-2xl md:text-3xl font-serif font-bold tabular-nums leading-none ${countdownNumClass}`}>
              {timeLeft.hours}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider block mt-1 ${countdownLblClass}`}>
              giờ
            </span>
          </div>

          <div className={countdownBoxClass}>
            <span className={`block text-2xl md:text-3xl font-serif font-bold tabular-nums leading-none ${countdownNumClass}`}>
              {timeLeft.minutes}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider block mt-1 ${countdownLblClass}`}>
              phút
            </span>
          </div>

          <div className={countdownBoxClass}>
            <span className={`block text-2xl md:text-3xl font-serif font-bold tabular-nums leading-none ${countdownNumClass}`}>
              {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider block mt-1 ${countdownLblClass}`}>
              giây
            </span>
          </div>
        </div>
        {hasQuote && (
          <p className={`text-[11px] font-serif italic mt-2 text-center ${isDarkBg ? 'text-white/75' : 'text-[#7A6A61] dark:text-stone-400'}`}>
            &ldquo;{quote}&rdquo;
          </p>
        )}
      </div>
    );
  }

  // 2. CALENDAR WIDGET (Đa dạng kiểu hiển thị: Lưới tháng, Thanh ngang, Bưu thiếp vintage, Pha lê kính mờ)
  if (widgetType === 'calendar') {
    const style = widgetConfig.style || 'classic-grid';
    const monthYear = widgetConfig.monthYear ?? 'Tháng 12 / 2026';
    const markerColor = widgetConfig.markerColor || '#f43f5e';
    const weddingTitle = widgetConfig.weddingTitle ?? 'Ngày Trọng Đại';
    const note = widgetConfig.invitationNote ?? 'Trân trọng kính mời quý khách tới tham dự buổi tiệc thành hôn';
    const hasCalTitle = showTitle && weddingTitle.trim().length > 0;
    const hasCalNote = note.trim().length > 0;

    // Style 2: THANH NGANG TỐI GIẢN (Horizontal Week Mini Strip)
    if (style === 'mini-strip') {
      const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      const startDay = Math.max(1, weddingDay - 3);
      const weekDates = [startDay, startDay + 1, startDay + 2, startDay + 3, startDay + 4, startDay + 5, startDay + 6];

      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col justify-between select-none">
          <div className={`flex items-center justify-between border-b pb-1.5 ${dividerClass}`}>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-rose-500" />
              <span className={`text-xs font-serif font-bold ${headingTextClass}`}>{monthYear}</span>
            </div>
            {hasCalTitle && (
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isDarkBg ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
              }`}>
                {weddingTitle}
              </span>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center my-1.5">
            {weekDates.map((dayNum, i) => {
              const isW = dayNum === weddingDay;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center p-1 rounded-xl transition-transform ${
                    isW
                      ? 'bg-rose-500 text-white font-bold scale-110 shadow-sm ring-2 ring-rose-300'
                      : `${bodyTextClass} hover:bg-black/5`
                  }`}
                >
                  <span className={`text-[9px] block ${isW ? 'text-white/80' : mutedTextClass}`}>
                    {weekdays[i]}
                  </span>
                  <span className="text-xs font-bold tabular-nums block mt-0.5">
                    {dayNum}
                  </span>
                  {isW && <Heart className="w-2 h-2 fill-white text-white mt-0.5" />}
                </div>
              );
            })}
          </div>

          {hasCalNote && (
            <p className={`text-[9px] font-serif italic text-center truncate ${subHeadingTextClass}`}>
              {note}
            </p>
          )}
        </div>
      );
    }

    // Style 3: BƯU THIẾP VINTAGE / WABI-SABI (Craft Paper & Stamp)
    if (style === 'card-pin') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none relative overflow-hidden">
          {/* Decorative Stamp badge */}
          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded border border-rose-400/50 bg-rose-500/10 text-[8px] font-bold text-rose-600 dark:text-rose-300 uppercase tracking-widest rotate-6 pointer-events-none">
            SAVE THE DATE
          </div>

          <div className="text-center">
            {hasCalTitle && (
              <span className={`text-[10px] uppercase tracking-[0.25em] font-bold block ${subHeadingTextClass}`}>
                {weddingTitle}
              </span>
            )}
            <h4 className={`font-serif text-base font-bold mt-0.5 ${headingTextClass}`}>
              {monthYear}
            </h4>
          </div>

          <div className="my-1.5">
            <div className={`grid grid-cols-7 gap-1 text-[10px] font-bold pb-1 border-b text-center ${mutedTextClass} ${dividerClass}`}>
              <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs mt-1 text-center">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const isWedding = day === weddingDay;
                return (
                  <div
                    key={`day-${day}`}
                    className={`h-6 flex items-center justify-center rounded-full font-medium ${
                      isWedding
                        ? 'border-2 border-rose-500 text-rose-600 font-black scale-110 bg-rose-500/15'
                        : bodyTextClass
                    }`}
                  >
                    {isWedding ? (
                      <span className="flex items-center justify-center gap-0.5">
                        <Heart className="w-2 h-2 fill-rose-500" />
                        {day}
                      </span>
                    ) : (
                      <span>{day}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {hasCalNote && (
            <div className={`text-center pt-1 border-t ${dividerClass}`}>
              <p className={`text-[9px] font-serif italic ${subHeadingTextClass}`}>
                {note}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Style 4: PHA LÊ KÍNH MỜ (Luxury Frosted Glass)
    if (style === 'frosted-glass') {
      return (
        <div className="w-full h-full backdrop-blur-xl bg-white/25 dark:bg-stone-900/35 rounded-3xl p-4 border border-amber-300/40 dark:border-amber-600/30 flex flex-col justify-between select-none">
          <div className="text-center">
            {hasCalTitle && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100/50 dark:bg-amber-950/40 border border-amber-300/40 text-[10px] uppercase font-bold text-amber-800 dark:text-amber-200 tracking-widest mb-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{weddingTitle}</span>
              </div>
            )}
            <h4 className={`font-serif text-lg font-black ${headingTextClass}`}>
              {monthYear}
            </h4>
          </div>

          <div className="my-1.5">
            <div className={`grid grid-cols-7 gap-1 text-[11px] font-semibold pb-1 text-center ${mutedTextClass}`}>
              <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-center">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const isWedding = day === weddingDay;
                return (
                  <div
                    key={`day-${day}`}
                    className={`h-7 flex items-center justify-center rounded-xl font-medium ${
                      isWedding
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold shadow-md scale-105'
                        : `${bodyTextClass} hover:bg-white/30`
                    }`}
                  >
                    {isWedding ? (
                      <span className="flex items-center justify-center gap-0.5">
                        <Heart className="w-2.5 h-2.5 fill-white" />
                        {day}
                      </span>
                    ) : (
                      <span>{day}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {hasCalNote && (
            <p className={`text-[9px] font-serif italic text-center ${mutedTextClass}`}>
              {note}
            </p>
          )}
        </div>
      );
    }

    // Default Style 1: LƯỚI THÁNG CỔ ĐIỂN (Classic Grid)
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none">
        <div className="text-center">
          <div className={`flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold mb-1 ${subHeadingTextClass}`}>
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{monthYear}</span>
          </div>
          {hasCalTitle && (
            <h4 className={`font-serif text-lg font-bold ${headingTextClass}`}>
              {weddingTitle}
            </h4>
          )}
        </div>

        <div className="my-2">
          {/* Weekday headers */}
          <div className={`grid grid-cols-7 gap-1 text-[11px] font-semibold pb-1.5 border-b text-center ${mutedTextClass} ${dividerClass}`}>
            <span>CN</span>
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs mt-1 text-center">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const isWedding = day === weddingDay;
              return (
                <div
                  key={`day-${day}`}
                  className={`h-7 flex items-center justify-center rounded-lg relative font-medium ${
                    isWedding
                      ? 'text-white font-bold shadow-xs scale-105'
                      : bodyTextClass
                  }`}
                  style={isWedding ? { backgroundColor: markerColor } : undefined}
                >
                  {isWedding ? (
                    <span className="flex items-center justify-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 fill-white" />
                      {day}
                    </span>
                  ) : (
                    <span>{day}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {hasCalNote && (
          <div className={`text-center pt-1 border-t ${dividerClass}`}>
            <p className={`text-[10px] font-serif italic ${subHeadingTextClass}`}>
              {note}
            </p>
          </div>
        )}
      </div>
    );
  }

  // 3. RSVP FORM WIDGET (Full interactive wedding attendance card)
  if (widgetType === 'rsvp' || widgetType === 'custom_form') {
    const rsvpStyle = widgetConfig.style || 'elegant-form';
    const title = widgetConfig.title ?? 'Xác Nhận Tham Dự Tiệc Cưới';
    const subtitle = widgetConfig.subtitle ?? 'Sự hiện diện của quý khách là niềm vinh hạnh lớn của gia đình';
    const hasRsvpTitle = showTitle && title.trim().length > 0;
    const hasRsvpSubtitle = showTitle && subtitle.trim().length > 0;
    const showRsvpHeader = hasRsvpTitle || hasRsvpSubtitle;

    // Style 2: THANH NÚT BẬT NHANH (Compact Modal Bar)
    if (rsvpStyle === 'compact-modal') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <Bell className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            {showRsvpHeader && (
              <div className="min-w-0">
                {hasRsvpTitle && (
                  <h4 className={`text-xs font-bold truncate ${headingTextClass}`}>
                    {title}
                  </h4>
                )}
                {hasRsvpSubtitle && (
                  <p className={`text-[10px] truncate ${mutedTextClass}`}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            style={{ backgroundColor: accentColor }}
            className="px-3.5 py-2 rounded-xl text-white font-bold text-xs shrink-0 shadow-xs hover:brightness-110 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Xác Nhận Ngay</span>
          </button>
        </div>
      );
    }

    // Style 3: THẺ CỔ ĐIỂN VIỀN VÀNG (Classic Card)
    if (rsvpStyle === 'classic-card') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none font-serif text-center">
          {showRsvpHeader && (
            <div className={`pb-1.5 border-b ${dividerClass}`}>
              <span className={`text-[10px] uppercase tracking-[0.25em] font-bold block ${subHeadingTextClass}`}>
                — R.S.V.P —
              </span>
              {hasRsvpTitle && (
                <h4 className={`text-sm font-bold italic mt-0.5 ${headingTextClass}`}>
                  {title}
                </h4>
              )}
              {hasRsvpSubtitle && (
                <p className={`text-[10px] italic mt-0.5 ${mutedTextClass}`}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 my-2 text-xs text-left">
            <div className={`p-2 rounded-lg ${subCardClass}`}>
              <span className={`text-[10px] block ${mutedTextClass}`}>Kính mời Quý khách:</span>
              <span className={`text-xs font-serif font-bold ${headingTextClass}`}>Nguyễn Văn A & Người Thương</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="p-2 rounded-lg text-center text-xs font-serif font-semibold border"
                style={{ borderColor: accentColor, backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                ✓ Sẽ Tham Dự
              </div>
              <div className={`p-2 rounded-lg text-center text-xs font-serif ${neutralButtonClass}`}>
                Không Thể Đến
              </div>
            </div>
          </div>

          <button
            type="button"
            style={{ backgroundColor: accentColor }}
            className="w-full py-2 rounded-xl text-white font-serif font-bold text-xs shadow-xs hover:brightness-110 tracking-wider"
          >
            Phản Hồi Lời Mời
          </button>
        </div>
      );
    }

    // Style 4: KÍNH MỜ HIỆN ĐẠI (Glass Morphism)
    if (rsvpStyle === 'glass-morphism') {
      return (
        <div className="w-full h-full backdrop-blur-md bg-white/25 dark:bg-stone-900/35 rounded-2xl p-4 border border-white/40 dark:border-white/15 flex flex-col justify-between select-none">
          {showRsvpHeader && (
            <div className="text-center pb-2 border-b border-white/25 dark:border-white/10">
              <span className="text-[9px] uppercase tracking-widest opacity-70 font-mono block">
                RSVP ONLINE
              </span>
              {hasRsvpTitle && (
                <h4 className="text-sm font-bold tracking-tight mt-0.5">
                  {title}
                </h4>
              )}
              {hasRsvpSubtitle && (
                <p className="text-[10px] opacity-70 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 my-2 text-xs">
            <div className="p-2 rounded-xl bg-white/35 dark:bg-white/10 backdrop-blur-sm border border-white/35 dark:border-white/10">
              <span className="text-[9px] opacity-60 block">Họ và tên:</span>
              <span className="text-xs font-semibold">Nguyễn Văn A...</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="py-1.5 rounded-xl text-center text-[11px] font-bold text-white shadow-xs"
                style={{ backgroundColor: accentColor }}
              >
                Sẽ Tham Dự ♥
              </div>
              <div className="py-1.5 rounded-xl text-center text-[11px] bg-white/30 dark:bg-white/10 opacity-80 border border-white/30">
                Gửi Lời Chúc
              </div>
            </div>
          </div>

          <button
            type="button"
            style={{ backgroundColor: accentColor }}
            className="w-full py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:brightness-110"
          >
            {widgetConfig.buttonText || 'Gửi Xác Nhận Ngay'}
          </button>
        </div>
      );
    }

    // Default Style 1: ELEGANT FORM
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none">
        {showRsvpHeader && (
          <div className={`text-center pb-2 border-b ${dividerClass}`}>
            <span className={`text-[10px] uppercase tracking-[0.2em] font-bold block ${subHeadingTextClass}`}>
              R.S.V.P • Phản Hồi Tham Dự
            </span>
            {hasRsvpTitle && (
              <h4 className={`font-serif text-base font-bold mt-0.5 ${headingTextClass}`}>
                {title}
              </h4>
            )}
            {hasRsvpSubtitle && (
              <p className={`text-[10px] mt-0.5 ${mutedTextClass}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2.5 my-2 text-xs">
          <div>
            <label className={`text-[10px] font-semibold block mb-1 ${mutedTextClass}`}>
              Họ và tên của bạn:
            </label>
            <div className={`px-3 py-1.5 rounded-xl text-xs ${inputSurfaceClass}`}>
              Nguyễn Văn A...
            </div>
          </div>

          <div>
            <label className={`text-[10px] font-semibold block mb-1 ${mutedTextClass}`}>
              Bạn là khách mời của:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="py-1.5 rounded-xl border font-semibold text-[11px] text-center"
                style={{ borderColor: accentColor, backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                Nhà Trai (Chú rể)
              </button>
              <button
                type="button"
                className={`py-1.5 rounded-xl text-[11px] text-center ${neutralButtonClass}`}
              >
                Nhà Gái (Cô dâu)
              </button>
            </div>
          </div>

          <div>
            <label className={`text-[10px] font-semibold block mb-1 ${mutedTextClass}`}>
              Xác nhận tham dự:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-[11px] flex items-center justify-center gap-1 shadow-xs"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Sẽ tham dự ♥</span>
              </button>
              <button
                type="button"
                className={`py-1.5 rounded-xl text-[11px] ${neutralButtonClass}`}
              >
                Tiếc quá, không thể tới
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          style={{ backgroundColor: accentColor }}
          className="w-full py-2 rounded-xl text-white font-bold text-xs shadow-md text-center hover:brightness-110"
        >
          {widgetConfig.buttonText || 'Gửi Xác Nhận Tham Dự'}
        </button>
      </div>
    );
  }

  // 4. GIFT BOX / VIETQR WIDGET (Mừng cưới online qua mã QR)
  if (widgetType === 'giftbox') {
    const giftboxStyle = widgetConfig.style || 'qr-card';
    const giftTitle = widgetConfig.title ?? 'Hộp Mừng Cưới Chúc Phúc';
    const hasGiftTitle = showTitle && giftTitle.trim().length > 0;

    // Style 2: 2 MÃ QR NHÀ TRAI & NHÀ GÁI (Dual QR)
    if (giftboxStyle === 'dual-qr') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3.5 flex flex-col justify-between select-none">
          {hasGiftTitle && (
            <div className={`text-center pb-1.5 border-b ${dividerClass}`}>
              <span className={`text-[10px] uppercase tracking-wider font-bold block ${subHeadingTextClass}`}>
                Mừng Cưới Online
              </span>
              <h4 className={`font-serif text-sm font-bold ${headingTextClass}`}>
                {giftTitle}
              </h4>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 my-2">
            {/* Nhà Trai */}
            <div className={`p-2 rounded-xl flex flex-col items-center text-center ${
              isDarkBg ? 'bg-blue-500/10 border border-blue-300/20' : 'bg-blue-500/[0.06] border border-blue-500/15'
            }`}>
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-300 uppercase block mb-1">
                Nhà Trai (Chú rể)
              </span>
              <div className="w-16 h-16 bg-white qr-keep-white rounded-lg border border-stone-300 flex items-center justify-center p-1 shadow-inner">
                <QrCode className="w-12 h-12 text-stone-800" />
              </div>
              <span className={`text-[9px] font-mono font-bold mt-1 truncate w-full ${headingTextClass}`}>
                MB: 9999888866
              </span>
            </div>

            {/* Nhà Gái */}
            <div className={`p-2 rounded-xl flex flex-col items-center text-center ${
              isDarkBg ? 'bg-rose-500/10 border border-rose-300/20' : 'bg-rose-500/[0.06] border border-rose-500/15'
            }`}>
              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-300 uppercase block mb-1">
                Nhà Gái (Cô dâu)
              </span>
              <div className="w-16 h-16 bg-white qr-keep-white rounded-lg border border-stone-300 flex items-center justify-center p-1 shadow-inner">
                <QrCode className="w-12 h-12 text-stone-800" />
              </div>
              <span className={`text-[9px] font-mono font-bold mt-1 truncate w-full ${headingTextClass}`}>
                VCB: 1012345678
              </span>
            </div>
          </div>

          <p className={`text-[9px] text-center italic ${mutedTextClass}`}>
            Chạm vào mã QR để mở ứng dụng ngân hàng hoặc sao chép STK
          </p>
        </div>
      );
    }

    // Style 3: BAO LÌ XÌ MAY MẮN (Red Envelope)
    if (giftboxStyle === 'red-envelope') {
      return (
        <div className="w-full h-full bg-[#850E24] text-[#F9DF9C] rounded-2xl p-4 shadow-lg border-2 border-[#D4AF37] flex flex-col items-center justify-between select-none relative overflow-hidden">
          {hasGiftTitle && (
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#F9DF9C]/80 font-serif block">
                TRĂM NĂM HẠNH PHÚC
              </span>
              <h4 className="font-serif text-base font-bold text-[#F9DF9C] mt-0.5">
                {giftTitle}
              </h4>
            </div>
          )}

          <div className="my-2 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] bg-[#5C0A19] flex items-center justify-center shadow-md">
              <span className="font-serif text-2xl font-bold text-[#F9DF9C]">囍</span>
            </div>
            <span className="text-xs font-serif italic mt-1.5 text-[#F9DF9C]/90">
              Gửi Mừng Chúc Phúc Cho Cặp Đôi
            </span>
          </div>

          <button
            type="button"
            className="w-full py-2 rounded-xl bg-[#D4AF37] text-[#5C0A19] font-serif font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Mở Phong Bao Mừng Cưới</span>
          </button>
        </div>
      );
    }

    // Style 4: THẺ NGÂN HÀNG SANG TRỌNG (Bank Card)
    if (giftboxStyle === 'bank-card') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-black text-white rounded-2xl p-4 shadow-xl border border-amber-500/30 flex flex-col justify-between select-none relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase">
              {widgetConfig.bankName || 'MB BANK VIP'}
            </span>
            <div className="w-7 h-5 rounded bg-amber-400/30 border border-amber-400/60 flex items-center justify-center text-[8px] font-mono text-amber-200">
              CHIP
            </div>
          </div>

          <div className="my-2 space-y-1">
            <p className="font-mono text-base font-bold tracking-widest text-amber-100">
              {widgetConfig.accountNumber || '9999 8888 66'}
            </p>
            <div className="flex items-center justify-between text-[10px] text-stone-400">
              <span className="uppercase">{widgetConfig.accountName || 'NGUYEN MINH TRI'}</span>
              <span className="font-mono">12/26</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-700/80">
            <span className="text-[10px] text-stone-400">Mừng cưới 1-chạm</span>
            <span
              className="px-2.5 py-1 rounded-lg text-white font-bold text-[10px] flex items-center gap-1 shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              <QrCode className="w-3 h-3" />
              <span>Xem QR</span>
            </span>
          </div>
        </div>
      );
    }

    // Default Style 1: QR CARD
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none">
        {hasGiftTitle && (
          <div className={`text-center pb-1.5 border-b ${dividerClass}`}>
            <span className={`text-[10px] uppercase tracking-[0.2em] font-bold block ${subHeadingTextClass}`}>
              Hộp Mừng Cưới Online
            </span>
            <h4 className={`font-serif text-base font-bold mt-0.5 ${headingTextClass}`}>
              {giftTitle}
            </h4>
          </div>
        )}

        <div className={`flex items-center gap-3 my-2 p-3 rounded-2xl ${subCardClass}`}>
          <div className="w-20 h-20 bg-white qr-keep-white rounded-xl border border-stone-300/80 flex flex-col items-center justify-center shadow-inner shrink-0 p-1">
            <QrCode className="w-14 h-14 text-stone-800" />
            <span className="text-[8px] font-bold text-emerald-600 font-mono">VietQR</span>
          </div>

          <div className="flex-1 min-w-0 space-y-1 text-xs">
            <span className={`text-[10px] font-bold block uppercase ${isDarkBg ? 'text-rose-300' : 'text-rose-600 dark:text-rose-400'}`}>
              {widgetConfig.bankName || 'Ngân hàng Quân Đội (MB Bank)'}
            </span>
            <p className={`font-mono font-bold text-sm tracking-wide ${headingTextClass}`}>
              {widgetConfig.accountNumber || '9999888866'}
            </p>
            <p className={`text-[11px] font-medium ${bodyTextClass}`}>
              Chủ TK: {widgetConfig.accountName || widgetConfig.accountHolder || 'NGUYEN MINH TRI'}
            </p>
            <div className="pt-0.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold cursor-pointer hover:underline"
                style={{ color: isDarkBg ? '#fda4af' : accentColor }}
              >
                <Copy className="w-2.5 h-2.5" />
                <span>Sao chép số tài khoản</span>
              </span>
            </div>
          </div>
        </div>

        <p className={`text-[10px] text-center font-serif italic ${mutedTextClass}`}>
          Món quà tinh thần và lời chúc của bạn là niềm hạnh phúc lớn nhất của chúng mình!
        </p>
      </div>
    );
  }

  // 5. MAP / VENUE WIDGET (Địa điểm tổ chức & Bản đồ chỉ đường)
  if (widgetType === 'map') {
    // If it's a compact button or height is <= 90px (e.g. "Chỉ đường" button in dual-venue templates)
    if ((element.height && element.height <= 90) || (widgetConfig.label && !widgetConfig.title)) {
      const label = widgetConfig.label || 'Chỉ đường';
      const textColor = widgetConfig.textColor || (isDarkBg ? '#ffffff' : '#6d0208');
      const bgColor = widgetConfig.bgColor && widgetConfig.bgColor !== 'transparent' ? widgetConfig.bgColor : 'transparent';
      const borderColor = widgetConfig.borderColor && widgetConfig.borderColor !== 'rgba(0,0,0,0)' ? widgetConfig.borderColor : textColor;

      return (
        <div
          className="w-full h-full rounded-xl flex items-center justify-center gap-2 font-medium text-xs shadow-2xs select-none cursor-pointer transition-all px-3 overflow-hidden"
          style={{
            color: textColor,
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: widgetConfig.borderRadius !== undefined ? `${widgetConfig.borderRadius}px` : '12px',
          }}
        >
          <Navigation className="w-3.5 h-3.5 shrink-0" style={{ color: textColor }} />
          <span className="font-semibold tracking-wide truncate">{label}</span>
        </div>
      );
    }

    const style = widgetConfig.style || 'interactive-card';
    const venueName = widgetConfig.venueName ?? widgetConfig.title ?? 'Trung Tâm Hội Nghị White Palace';
    const address = widgetConfig.address ?? '194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh';
    const hasVenueTitle = showTitle && venueName.trim().length > 0;
    const hasAddress = address.trim().length > 0;

    // Style 2: GHIM VỊ TRÍ TỐI GIẢN (Minimal Pin)
    if (style === 'minimal-pin') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <MapPin className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div className="min-w-0">
              {hasVenueTitle && <h4 className={`text-xs font-bold truncate ${headingTextClass}`}>{venueName}</h4>}
              {hasAddress && <p className={`text-[10px] truncate ${mutedTextClass}`}>{address}</p>}
            </div>
          </div>
          <button
            type="button"
            style={{ backgroundColor: accentColor }}
            className="px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs hover:brightness-110"
          >
            <Navigation className="w-3 h-3" />
            <span>Chỉ Đường</span>
          </button>
        </div>
      );
    }

    // Style 3: CHỈ ĐƯỜNG CHI TIẾT (Directions Card)
    if (style === 'directions-card') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none">
          {hasVenueTitle && (
            <div className={`flex items-center justify-between pb-1.5 border-b ${dividerClass}`}>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" style={{ color: accentColor }} />
                <h4 className={`font-serif text-sm font-bold truncate ${headingTextClass}`}>{venueName}</h4>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${isDarkBg ? 'bg-white/10 text-white/80' : 'bg-black/[0.05] text-stone-600 dark:text-stone-300'}`}>GPS DIRECT</span>
            </div>
          )}
          {hasAddress && (
            <p className={`text-[11px] my-2 leading-relaxed ${bodyTextClass}`}>
              {address}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              style={{ backgroundColor: accentColor }}
              className="py-2 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs hover:brightness-110"
            >
              <Navigation className="w-3 h-3" />
              <span>Google Maps</span>
            </button>
            <button
              type="button"
              className={`py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 ${neutralButtonClass}`}
            >
              <Phone className="w-3 h-3" />
              <span>Gọi Đón Tiếp</span>
            </button>
          </div>
        </div>
      );
    }

    // Default Style 1: INTERACTIVE CARD
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none overflow-hidden">
        {(hasVenueTitle || hasAddress) && (
          <div className="text-center">
            {hasVenueTitle && (
              <>
                <div className={`flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.2em] font-bold ${subHeadingTextClass}`}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Địa Điểm Tổ Chức Tiệc</span>
                </div>
                <h4 className={`font-serif text-base font-bold mt-1 ${headingTextClass}`}>
                  {venueName}
                </h4>
              </>
            )}
            {hasAddress && (
              <p className={`text-[11px] mt-0.5 ${mutedTextClass}`}>
                {address}
              </p>
            )}
          </div>
        )}

        {/* Map graphic mockup */}
        <div className={`my-2 h-20 rounded-xl relative overflow-hidden flex items-center justify-center ${subCardClass}`}>
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#999_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isDarkBg ? 'bg-stone-900/80 text-rose-300 border border-white/20' : 'bg-white/85 dark:bg-stone-900 shadow-sm border border-stone-300/60 text-rose-600'
          }`}>
            <MapPin className="w-3.5 h-3.5 fill-rose-600" />
            <span>Xem trên bản đồ vệ tinh</span>
          </div>
        </div>

        <button
          type="button"
          style={{ backgroundColor: accentColor }}
          className="w-full py-2 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs hover:brightness-110"
        >
          <Navigation className="w-3 h-3" />
          <span>Chỉ đường trên Google Maps</span>
        </button>
      </div>
    );
  }

  // 6. CALL CONTACT BUTTONS WIDGET (Matching Screenshot 4: 2 Brown Pill Buttons)
  if (widgetType === 'call') {
    return (
      <div className="w-full h-full flex items-center justify-center gap-3 p-2 select-none">
        <button
          type="button"
          className="flex-1 py-2.5 px-4 rounded-full bg-[#B26B27] hover:bg-[#97581E] text-white text-xs font-medium tracking-wide shadow-md flex items-center justify-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{widgetConfig.groomLabel || 'Liên hệ Nhà Trai'}</span>
        </button>

        <button
          type="button"
          className="flex-1 py-2.5 px-4 rounded-full bg-[#B26B27] hover:bg-[#97581E] text-white text-xs font-medium tracking-wide shadow-md flex items-center justify-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{widgetConfig.brideLabel || 'Liên hệ Nhà Gái'}</span>
        </button>
      </div>
    );
  }

  // 7. REMINDER WIDGET (Thêm vào lịch Google / Apple)
  if (widgetType === 'reminder') {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 select-none">
        <button
          type="button"
          className="w-full py-2.5 px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
        >
          <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Đặt Lời Nhắc Lịch Vào Google Calendar</span>
        </button>
      </div>
    );
  }

  // 8. GUEST NAME BANNER WIDGET
  if (widgetType === 'guest_name') {
    const style = widgetConfig.style || 'gold-badge';
    const prefix = widgetConfig.prefix ?? 'Trân Trọng Kính Mời';
    const guestName = widgetConfig.defaultGuestName ?? widgetConfig.defaultName ?? '[Tên Khách Mời]';
    const hasPrefix = showTitle && prefix.trim().length > 0;

    // Style 2: THƯ PHÁP BAY BỔNG (Calligraphy)
    if (style === 'calligraphy') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col items-center justify-center text-center select-none">
          {hasPrefix && (
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs ${subHeadingTextClass}`}>❦</span>
              <span className={`text-[10px] uppercase tracking-widest font-serif italic ${subHeadingTextClass}`}>
                {prefix}
              </span>
              <span className={`text-xs ${subHeadingTextClass}`}>❦</span>
            </div>
          )}
          <h4
            className="font-serif italic text-xl font-bold mt-0.5"
            style={{ color: isDarkBg ? '#fde68a' : accentColor }}
          >
            {guestName}
          </h4>
          <p className={`text-[10px] font-serif italic mt-0.5 ${mutedTextClass}`}>
            Cùng người thương đến chung vui ngày hạnh phúc
          </p>
        </div>
      );
    }

    // Style 3: VÉ MỜI VINTAGE ĐÓNG DẤU (Ticket Seal)
    if (style === 'ticket-seal') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex items-center justify-between gap-3 select-none relative overflow-hidden">
          <div className="border-r-2 border-dashed border-[#D4AF37]/40 pr-3 text-center shrink-0">
            <span className={`text-[8px] font-mono uppercase tracking-widest block ${mutedTextClass}`}>VÉ MỜI</span>
            <span className={`text-xs font-bold font-mono ${subHeadingTextClass}`}>#VIP</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            {hasPrefix && (
              <span className={`text-[9px] uppercase tracking-wider block ${mutedTextClass}`}>
                {prefix}
              </span>
            )}
            <h4 className={`font-serif text-sm font-bold truncate ${headingTextClass}`}>
              {guestName}
            </h4>
            <span className={`text-[9px] font-serif italic block ${subHeadingTextClass}`}>
              Kính mời quý khách tới dự bữa cơm thân mật
            </span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: accentColor, color: '#ffffff' }}
          >
            <Heart className="w-4 h-4 fill-white" />
          </div>
        </div>
      );
    }

    // Default Style 1: HUY HIỆU MẠ VÀNG (Gold Badge)
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col items-center justify-center text-center select-none">
        {hasPrefix && (
          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${subHeadingTextClass}`}>
            {prefix}
          </span>
        )}
        <h4 className={`font-serif text-lg font-bold mt-0.5 ${headingTextClass}`}>
          {guestName}
        </h4>
        <p className={`text-[10px] mt-0.5 ${mutedTextClass}`}>
          Tới dự bữa cơm thân mật chung vui cùng gia đình chúng tôi
        </p>
      </div>
    );
  }

  // 9. PHOTO ALBUM / SLIDESHOW WIDGET (HỖ TRỢ 5 LOẠI BỐ CỤC: GRID-2, GRID-3, MASONRY, SLIDESHOW, SINGLE-STACK)
  if (widgetType === 'album' || widgetType === 'slideshow') {
    const title = widgetConfig.title ?? 'Album Kỷ Niệm Cưới';
    const hasAlbumTitle = showTitle && title.trim().length > 0;
    const layout = widgetConfig.layout || (widgetType === 'slideshow' ? 'slideshow' : 'grid-2');
    const rawPhotos: string[] =
      Array.isArray(widgetConfig.photos) && widgetConfig.photos.length > 0
        ? widgetConfig.photos
        : [
            '/assets/wedding/samples/sample_01.jpg',
            '/assets/wedding/samples/sample_02.jpg',
            '/assets/wedding/samples/sample_03.jpg',
            '/assets/wedding/samples/sample_04.jpg',
          ];
    const borderRadius = widgetConfig.borderRadius ?? 16;
    const gap = widgetConfig.gap ?? 8;
    const photoCountText = `${rawPhotos.length} bức ảnh`;

    return (
      <div
        className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col justify-between select-none"
        style={{ borderRadius: `${borderRadius}px` }}
      >
        {hasAlbumTitle && (
          <div className={`flex items-center justify-between pb-2 border-b ${dividerClass}`}>
            <span className={`text-xs font-serif font-bold flex items-center gap-1.5 ${headingTextClass}`}>
              <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{title}</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
              isDarkBg ? 'bg-white/10 text-white/80' : 'bg-black/[0.05] dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}>
              {photoCountText}
            </span>
          </div>
        )}

        {/* Layout Mode 1: grid-2 (2 Cột Song Song) */}
        {layout === 'grid-2' && (
          <div className="grid grid-cols-2 flex-1 my-2 overflow-hidden" style={{ gap: `${gap}px` }}>
            {rawPhotos.slice(0, 4).map((src: string, idx: number) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative group aspect-square shadow-2xs"
                style={{ borderRadius: `${Math.max(4, borderRadius - 4)}px` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Album photo ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `/assets/wedding/samples/sample_0${(idx % 4) + 1}.jpg`;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {idx === 3 && rawPhotos.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs">
                    +{rawPhotos.length - 3} ảnh
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Layout Mode 2: grid-3 (Lưới 3 Cột Bento) */}
        {layout === 'grid-3' && (
          <div className="grid grid-cols-3 flex-1 my-2 overflow-hidden" style={{ gap: `${gap}px` }}>
            {rawPhotos.slice(0, 6).map((src: string, idx: number) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative group aspect-square shadow-2xs"
                style={{ borderRadius: `${Math.max(4, borderRadius - 6)}px` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Album photo ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `/assets/wedding/samples/sample_0${(idx % 4) + 1}.jpg`;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {idx === 5 && rawPhotos.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs">
                    +{rawPhotos.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Layout Mode 3: masonry (Xếp Tầng So Le Nghệ Thuật) */}
        {layout === 'masonry' && (
          <div className="grid grid-cols-2 flex-1 my-2 overflow-hidden" style={{ gap: `${gap}px` }}>
            <div className="flex flex-col" style={{ gap: `${gap}px` }}>
              <div
                className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-[3/4] shadow-2xs relative"
                style={{ borderRadius: `${Math.max(4, borderRadius - 4)}px` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rawPhotos[0]}
                  alt="Album photo 1"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/wedding/samples/sample_01.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              {rawPhotos[2] && (
                <div
                  className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-square shadow-2xs relative"
                  style={{ borderRadius: `${Math.max(4, borderRadius - 4)}px` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rawPhotos[2]}
                    alt="Album photo 3"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/wedding/samples/sample_03.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col" style={{ gap: `${gap}px` }}>
              {rawPhotos[1] && (
                <div
                  className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-square shadow-2xs relative"
                  style={{ borderRadius: `${Math.max(4, borderRadius - 4)}px` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rawPhotos[1]}
                    alt="Album photo 2"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/wedding/samples/sample_02.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {rawPhotos[3] && (
                <div
                  className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-[3/4] shadow-2xs relative"
                  style={{ borderRadius: `${Math.max(4, borderRadius - 4)}px` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rawPhotos[3]}
                    alt="Album photo 4"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/wedding/samples/sample_04.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layout Mode 4: slideshow (Trượt Carousel Có Nút & Dots) */}
        {layout === 'slideshow' && (
          <div
            className="flex-1 my-2 relative rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex flex-col justify-between shadow-2xs"
            style={{ borderRadius: `${Math.max(4, borderRadius - 4)}px` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={rawPhotos[0]}
              alt="Slideshow"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = '/assets/wedding/samples/sample_01.jpg';
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            <div className="relative z-10 flex items-center justify-between p-2 mt-auto">
              <span className="text-[10px] text-white font-medium drop-shadow-xs">1 / {rawPhotos.length}</span>
              <div className="flex items-center gap-1">
                {rawPhotos.slice(0, 5).map((_: any, dotIdx: number) => (
                  <span
                    key={dotIdx}
                    className={`w-1.5 h-1.5 rounded-full ${dotIdx === 0 ? 'bg-white scale-125' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Layout Mode 5: single-stack (Khung Ảnh Lớn Xếp Lớp) */}
        {layout === 'single-stack' && (
          <div className="flex-1 my-2 relative flex items-center justify-center p-2">
            <div className="absolute inset-x-5 inset-y-1 bg-stone-200 dark:bg-stone-800 rounded-2xl rotate-2 shadow-xs" />
            <div
              className="relative w-full h-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-white dark:border-stone-700 shadow-md"
              style={{ borderRadius: `${borderRadius}px` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rawPhotos[0]}
                alt="Single stack preview"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = '/assets/wedding/samples/sample_01.jpg';
                }}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {photoCountText}
              </span>
            </div>
          </div>
        )}

        <div className={`pt-1.5 border-t ${dividerClass} flex items-center justify-between text-[10px] ${mutedTextClass}`}>
          <span>Chạm vào ảnh để mở Lightbox phóng to</span>
          <span className="font-semibold text-rose-500 uppercase text-[9px] tracking-wider">
            {layout === 'grid-2'
              ? '2 Cột'
              : layout === 'grid-3'
              ? '3 Cột'
              : layout === 'masonry'
              ? 'So Le'
              : layout === 'slideshow'
              ? 'Slideshow'
              : 'Khung Đơn'}
          </span>
        </div>
      </div>
    );
  }

  // 10. WISHES / SỔ LƯU BÚT & LỜI CHÚC
  if (widgetType === 'wishes') {
    const style = widgetConfig.style || 'bubble-wall';
    const wishesTitle = widgetConfig.title ?? 'Sổ Lưu Bút & Lời Chúc';
    const hasWishesTitle = showTitle && wishesTitle.trim().length > 0;
    const placeholder = widgetConfig.placeholder ?? 'Gửi lời chúc mừng đến cô dâu chú rể...';

    // Style 2: PHA LÊ KÍNH MỜ (Glass Card)
    if (style === 'glass-card') {
      return (
        <div className="w-full h-full backdrop-blur-md bg-white/25 dark:bg-stone-900/35 rounded-2xl p-4 border border-white/40 dark:border-white/15 flex flex-col justify-between select-none">
          <div>
            {hasWishesTitle && (
              <div className="flex items-center justify-between pb-2 border-b border-white/30 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/35 dark:bg-white/10 flex items-center justify-center backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <h4 className="font-serif text-sm font-bold tracking-wide">
                    {wishesTitle}
                  </h4>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-xs">
                  12 lời chúc
                </span>
              </div>
            )}

            <div className="space-y-2 mt-2.5">
              <div className="p-2.5 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/35 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Bạn Thu Trang</span>
                  <span className="text-[9px] opacity-60">Vừa xong</span>
                </div>
                <p className="text-[11px] opacity-90 leading-snug">
                  Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương như ngày đầu! ✨
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/35 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Tuấn Anh & Nhóm bạn</span>
                  <span className="text-[9px] opacity-60">10 phút trước</span>
                </div>
                <p className="text-[11px] opacity-90 leading-snug">
                  Mừng ngày hạnh phúc của hai bạn! Chúc cô dâu chú rể sớm có quý tử nha! 🎉
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/30 dark:border-white/10 flex gap-1.5 items-center">
            <input
              type="text"
              readOnly
              placeholder={placeholder}
              className="flex-1 bg-white/35 dark:bg-white/10 backdrop-blur-xs border border-white/40 dark:border-white/20 rounded-xl px-2.5 py-1.5 text-xs placeholder:opacity-60 focus:outline-none"
            />
            <button
              type="button"
              style={{ backgroundColor: accentColor }}
              className="px-3 py-1.5 rounded-xl text-white text-xs font-medium flex items-center gap-1 shrink-0 shadow-xs hover:brightness-110"
            >
              <Send className="w-3 h-3" />
              <span>Gửi</span>
            </button>
          </div>
        </div>
      );
    }

    // Style 3: THIỆP GIẤY THƯ TAY (Vintage Scroll)
    if (style === 'vintage-scroll') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none font-serif">
          <div>
            {hasWishesTitle && (
              <div className={`flex items-center justify-between pb-2 border-b ${dividerClass}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-700 dark:text-amber-400 text-sm">❦</span>
                  <h4 className={`text-sm font-bold italic ${headingTextClass}`}>
                    {wishesTitle}
                  </h4>
                </div>
                <span className={`text-[10px] font-serif italic ${subHeadingTextClass}`}>
                  — 12 tâm thư —
                </span>
              </div>
            )}

            <div className="space-y-2 mt-2.5">
              <div className={`p-2.5 rounded-lg border border-[#8C7355]/35 ${subCardClass}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-bold ${headingTextClass}`}>Bạn Thu Trang</span>
                  <span className={`text-[9px] italic ${mutedTextClass}`}>Hôm nay</span>
                </div>
                <p className={`text-[11px] italic leading-snug ${bodyTextClass}`}>
                  &ldquo;Chúc hai bạn trăm năm hạnh phúc, tình nghĩa bền chặt như keo sơn.&rdquo;
                </p>
              </div>

              <div className={`p-2.5 rounded-lg border border-[#8C7355]/35 ${subCardClass}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-bold ${headingTextClass}`}>Tuấn Anh & Nhóm bạn</span>
                  <span className={`text-[9px] italic ${mutedTextClass}`}>10 phút trước</span>
                </div>
                <p className={`text-[11px] italic leading-snug ${bodyTextClass}`}>
                  &ldquo;Mừng ngày vui trọn vẹn, chúc hai bạn hạnh phúc viên mãn tròn đầy!&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className={`pt-2 border-t ${dividerClass} flex gap-1.5 items-center`}>
            <input
              type="text"
              readOnly
              placeholder={placeholder}
              className={`flex-1 rounded-xl px-2.5 py-1.5 text-xs italic focus:outline-none ${inputSurfaceClass}`}
            />
            <button
              type="button"
              style={{ backgroundColor: accentColor }}
              className="px-3 py-1.5 rounded-xl text-white text-xs font-serif flex items-center gap-1 shrink-0 shadow-xs hover:brightness-110"
            >
              <span>Gửi thư</span>
              <Heart className="w-2.5 h-2.5 fill-white" />
            </button>
          </div>
        </div>
      );
    }

    // Style 4: DANH SÁCH TINH GỌN (Minimal List)
    if (style === 'minimal-list') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none">
          <div>
            {hasWishesTitle && (
              <div className={`flex items-center justify-between pb-2 border-b ${dividerClass}`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest ${headingTextClass}`}>
                  {wishesTitle}
                </h4>
                <span className={`text-[10px] font-mono ${mutedTextClass}`}>12 WISHES</span>
              </div>
            )}

            <div className={`divide-y ${dividerClass} mt-1`}>
              <div className="py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${headingTextClass}`}>Thu Trang</span>
                  <span className={`text-[9px] font-mono ${mutedTextClass}`}>Vừa xong</span>
                </div>
                <p className={`text-[11px] mt-0.5 leading-snug ${mutedTextClass}`}>
                  Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long! ❤️
                </p>
              </div>

              <div className="py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${headingTextClass}`}>Tuấn Anh</span>
                  <span className={`text-[9px] font-mono ${mutedTextClass}`}>10m ago</span>
                </div>
                <p className={`text-[11px] mt-0.5 leading-snug ${mutedTextClass}`}>
                  Mừng ngày hạnh phúc, chúc cô dâu chú rể mãi ngọt ngào!
                </p>
              </div>
            </div>
          </div>

          <div className={`pt-2 border-t ${dividerClass} flex gap-1.5 items-center`}>
            <input
              type="text"
              readOnly
              placeholder={placeholder}
              className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${inputSurfaceClass}`}
            />
            <button
              type="button"
              style={{ backgroundColor: accentColor }}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 shrink-0 shadow-2xs hover:brightness-110"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    // Default Style 1: BUBBLE WALL (Tường Lời Chúc Bong Bóng)
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between select-none">
        <div>
          {hasWishesTitle && (
            <div className={`flex items-center justify-between pb-2 border-b ${dividerClass}`}>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}18` }}
                >
                  <Heart className="w-3.5 h-3.5" style={{ color: accentColor, fill: `${accentColor}40` }} />
                </div>
                <h4 className={`font-serif text-sm font-bold ${headingTextClass}`}>
                  {wishesTitle}
                </h4>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${accentColor}15`, color: isDarkBg ? '#fda4af' : accentColor }}
              >
                12 lời chúc
              </span>
            </div>
          )}

          <div className="space-y-2 mt-2.5">
            <div className={`p-2 rounded-xl ${subCardClass}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${headingTextClass}`}>Bạn Thu Trang</span>
                <span className={`text-[9px] ${mutedTextClass}`}>Vừa xong</span>
              </div>
              <p className={`text-[11px] leading-snug ${bodyTextClass}`}>
                Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long và luôn ngọt ngào như ngày đầu! ❤️
              </p>
            </div>

            <div className={`p-2 rounded-xl ${subCardClass}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${headingTextClass}`}>Tuấn Anh & Nhóm bạn</span>
                <span className={`text-[9px] ${mutedTextClass}`}>10 phút trước</span>
              </div>
              <p className={`text-[11px] leading-snug ${bodyTextClass}`}>
                Mừng ngày hạnh phúc của hai bạn! Chúc cô dâu chú rể sớm có quý tử nha! 🎉
              </p>
            </div>
          </div>
        </div>

        <div className={`pt-2 border-t ${dividerClass} flex gap-1.5 items-center`}>
          <input
            type="text"
            readOnly
            placeholder={placeholder}
            className={`flex-1 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none ${inputSurfaceClass}`}
          />
          <button
            type="button"
            style={{ backgroundColor: accentColor }}
            className="px-3 py-1.5 rounded-xl text-white text-xs font-medium flex items-center gap-1 shrink-0 shadow-xs hover:brightness-110"
          >
            <Send className="w-3 h-3" />
            <span>Gửi</span>
          </button>
        </div>
      </div>
    );
  }

  // 11. MUSIC PLAYER / ĐĨA THAN ÂM NHẠC TƯƠNG TÁC
  if (widgetType === 'music_player') {
    const style = widgetConfig.style || 'vinyl-retro';
    const trackTitle = widgetConfig.audioTitle || widgetConfig.trackTitle || 'Beautiful In White';
    const artist = widgetConfig.artist || 'Shane Filan • Nhạc nền LoveStory';

    // Style 2: BĂNG CASSETTE VINTAGE (Cassette Tape)
    if (style === 'cassette') {
      return (
        <div className="w-full h-full bg-[#27272A] text-white rounded-2xl p-3 border border-stone-700 shadow-lg flex flex-col justify-between select-none relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono">
            <span>SIDE A • STEREO</span>
            <span className="bg-amber-400/20 px-1.5 py-0.5 rounded text-[8px] font-bold">TYPE I</span>
          </div>

          <div className="my-1.5 p-2 bg-stone-900 rounded-xl border border-stone-700/80 flex items-center justify-around">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-400 flex items-center justify-center animate-[spin_4s_linear_infinite]">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
            </div>
            <div className="w-20 h-4 bg-stone-800 rounded-sm border border-stone-700 flex items-center justify-center">
              <div className="w-16 h-1 bg-amber-500/40 rounded-full" />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-400 flex items-center justify-center animate-[spin_4s_linear_infinite]">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <h4 className="text-xs font-bold truncate text-white">{trackTitle}</h4>
              <p className="text-[9px] text-stone-400 truncate">{artist}</p>
            </div>
            <button
              type="button"
              style={{ backgroundColor: accentColor }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs hover:brightness-110"
            >
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </button>
          </div>
        </div>
      );
    }

    // Style 3: THANH MINI NỔI TỐI GIẢN (Compact Bar)
    if (style === 'compact-bar') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              style={{ backgroundColor: accentColor }}
              className="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </button>
            <div className="min-w-0">
              <h4 className={`text-xs font-bold truncate ${headingTextClass}`}>{trackTitle}</h4>
              <p className={`text-[10px] truncate ${mutedTextClass}`}>{artist}</p>
            </div>
          </div>
          {/* Animated sound wave bars */}
          <div className="flex items-end gap-0.5 h-5 shrink-0">
            {[40, 70, 100, 60, 90, 45, 80].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  backgroundColor: accentColor,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    // Default Style 1: VINYL RETRO
    return (
      <div className="w-full h-full bg-[#18181B] text-white rounded-2xl p-3 border border-stone-800 shadow-md flex items-center gap-3 select-none overflow-hidden relative">
        {/* Vinyl Disc with Spinning Graphic */}
        <div className="w-20 h-20 rounded-full bg-stone-900 border-2 border-stone-700 shadow-lg flex items-center justify-center shrink-0 relative animate-[spin_8s_linear_infinite]">
          <div className="w-16 h-16 rounded-full border border-stone-800 border-dashed" />
          <div className="w-12 h-12 rounded-full border border-stone-800" />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center absolute"
            style={{ backgroundColor: accentColor }}
          >
            <div className="w-2 h-2 rounded-full bg-stone-900" />
          </div>
        </div>

        {/* Tone Arm Needle */}
        <div className="absolute left-[70px] top-3 w-5 h-8 pointer-events-none opacity-80">
          <div className="w-1.5 h-6 bg-amber-400 rotate-25 origin-top rounded-full shadow-xs" />
        </div>

        {/* Info & Controls */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider uppercase font-mono" style={{ color: accentColor }}>
              Đĩa Than Nhạc Cưới
            </span>
          </div>
          <h4 className="text-xs font-bold truncate text-white">
            {trackTitle}
          </h4>
          <p className="text-[10px] text-stone-400 truncate">
            {artist}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              style={{ backgroundColor: accentColor }}
              className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-xs hover:brightness-110"
            >
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </button>
            <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="w-2/5 h-full rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            <Volume2 className="w-3.5 h-3.5 text-stone-400" />
          </div>
        </div>
      </div>
    );
  }

  // 12. STORY TIMELINE / DÒNG THỜI GIAN TÌNH YÊU
  if (widgetType === 'story_timeline') {
    const storySubtitle = widgetConfig.subtitle ?? 'Câu chuyện của chúng mình';
    const storyTitle = widgetConfig.title ?? 'Dòng Thời Gian Tình Yêu';
    const hasStoryHeader = showTitle && (storyTitle.trim().length > 0 || storySubtitle.trim().length > 0);
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 select-none flex flex-col justify-between">
        {hasStoryHeader && (
          <div className={`text-center pb-2 border-b ${dividerClass}`}>
            {storySubtitle.trim().length > 0 && (
              <span className={`text-[10px] uppercase font-bold tracking-[0.2em] ${subHeadingTextClass}`}>{storySubtitle}</span>
            )}
            {storyTitle.trim().length > 0 && (
              <h4 className={`font-serif text-sm font-bold ${headingTextClass}`}>{storyTitle}</h4>
            )}
          </div>
        )}

        <div className="relative pl-6 space-y-3.5 my-2">
          {/* Vertical dashed line */}
          <div className="absolute left-2.5 top-1 bottom-1 w-0.5 border-l-2 border-dashed border-rose-300 dark:border-rose-900" />

          {/* Node 1 */}
          <div className="relative">
            <div className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
            <span className="text-[10px] font-bold text-rose-500">20.10.2021</span>
            <p className={`text-xs font-semibold ${headingTextClass}`}>Lần đầu gặp gỡ</p>
            <p className={`text-[10px] leading-tight ${mutedTextClass}`}>Buổi chiều thu nhẹ nhàng tại quán cà phê quen thuộc</p>
          </div>

          {/* Node 2 */}
          <div className="relative">
            <div className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center">
              <Heart className="w-2 h-2 text-white fill-white" />
            </div>
            <span className="text-[10px] font-bold text-rose-500">14.02.2024</span>
            <p className={`text-xs font-semibold ${headingTextClass}`}>Lời cầu hôn ngọt ngào</p>
            <p className={`text-[10px] leading-tight ${mutedTextClass}`}>Dưới ánh hoàng hôn Đà Lạt rực rỡ, em đã nói &quot;Yes!&quot;</p>
          </div>

          {/* Node 3 */}
          <div className="relative">
            <div className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-amber-500">2026</span>
            <p className={`text-xs font-semibold ${headingTextClass}`}>Ngày chung đôi</p>
            <p className={`text-[10px] leading-tight ${mutedTextClass}`}>Cùng nhau viết tiếp những chương hạnh phúc nhất</p>
          </div>
        </div>
      </div>
    );
  }

  // 13. DRESS CODE / BẢNG MÀU TRANG PHỤC THAM DỰ
  if (widgetType === 'dresscode') {
    const dresscodeSubtitle = widgetConfig.subtitle ?? 'Gợi Ý Trang Phục';
    const dresscodeTitle = widgetConfig.title ?? 'Dress Code Tham Dự';
    const hasDresscodeHeader = showTitle && (dresscodeTitle.trim().length > 0 || dresscodeSubtitle.trim().length > 0);
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col justify-between text-center select-none">
        {hasDresscodeHeader && (
          <div>
            {dresscodeSubtitle.trim().length > 0 && (
              <span className={`text-[10px] uppercase font-bold tracking-[0.2em] ${subHeadingTextClass}`}>{dresscodeSubtitle}</span>
            )}
            {dresscodeTitle.trim().length > 0 && (
              <h4 className={`font-serif text-sm font-bold ${headingTextClass}`}>{dresscodeTitle}</h4>
            )}
            <p className={`text-[10px] mt-0.5 ${mutedTextClass}`}>
              Để có những bức ảnh kỷ niệm thật hài hòa, kính mời quý khách mặc trang phục theo gợi ý:
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 my-1">
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-stone-300 shadow-2xs" />
            <span className={`text-[9px] font-medium ${mutedTextClass}`}>Trắng</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#EADBC8] border border-stone-300 shadow-2xs" />
            <span className={`text-[9px] font-medium ${mutedTextClass}`}>Be / Kem</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#F3C5C5] border border-stone-300 shadow-2xs" />
            <span className={`text-[9px] font-medium ${mutedTextClass}`}>Pastel</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#7A1E28] border border-stone-700 shadow-2xs" />
            <span className={`text-[9px] font-medium ${mutedTextClass}`}>Đỏ Rượu</span>
          </div>
        </div>

        <span className={`text-[9px] italic ${mutedTextClass}`}>
          * Quý khách có thể tự do lựa chọn trang phục lịch sự phù hợp
        </span>
      </div>
    );
  }

  // 14. FAMILY INFO / THÔNG TIN HAI BÊN GIA ĐÌNH (4 Kiểu: 2 Cột song song, Khung vòm hoàng gia, Tối giản hiện đại, Xếp tầng đứng)
  if (widgetType === 'family_info') {
    const style = widgetConfig.style || 'two-column-card';
    const headerText = widgetConfig.headerText ?? 'HÔN PHỐI TRÂN TRỌNG KÍNH BÁO';
    const subHeader = widgetConfig.subHeader ?? 'Gia Đình Hai Bên';
    const hasHeaderText = headerText.trim().length > 0;
    const hasSubHeader = subHeader.trim().length > 0;
    const showFamilyHeader = showTitle && (hasHeaderText || hasSubHeader);

    const groomFather = widgetConfig.groomFather ?? 'Ông: Nguyễn Văn An';
    const groomMother = widgetConfig.groomMother ?? 'Bà: Trần Thị Mai';
    const groomTitle = widgetConfig.groomTitle ?? 'Trưởng Nam';
    const groomName = widgetConfig.groomName ?? 'Minh Trí';

    const brideFather = widgetConfig.brideFather ?? 'Ông: Lê Hoàng Long';
    const brideMother = widgetConfig.brideMother ?? 'Bà: Phạm Thu Cúc';
    const brideTitle = widgetConfig.brideTitle ?? 'Út Nữ';
    const brideName = widgetConfig.brideName ?? 'Ngọc Anh';

    const note = widgetConfig.invitationNote ?? 'Kính mời quý quan viên hai họ và bạn bè thân hữu tới dự';

    // Style 2: KHUNG VÒM HOÀNG GIA CHÂU ÂU (Royal Arch Symmetry / Crest Classic)
    if (style === 'royal-arch' || style === 'crest-classic') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-3xl p-4 flex flex-col justify-between text-center select-none relative">
          {showFamilyHeader && (
            <div className={`pb-1 border-b ${dividerClass}`}>
              {hasHeaderText && (
                <span className={`text-[9px] uppercase font-bold tracking-[0.3em] block ${subHeadingTextClass}`}>
                  {headerText}
                </span>
              )}
              {hasSubHeader && (
                <h4 className={`font-serif text-base font-bold mt-0.5 ${headingTextClass}`}>
                  {subHeader}
                </h4>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 my-2">
            {/* Vòm Nhà Trai */}
            <div className={`rounded-t-full rounded-b-2xl p-3 flex flex-col items-center ${subCardClass}`}>
              <span className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center mb-1">
                ♂
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${subHeadingTextClass}`}>
                Nhà Trai
              </span>
              <p className={`text-xs font-serif font-bold ${headingTextClass}`}>{groomFather}</p>
              <p className={`text-xs font-serif font-bold ${headingTextClass}`}>{groomMother}</p>
              <div className={`mt-1.5 pt-1 border-t ${dividerClass} w-full text-center`}>
                <span className={`text-[10px] font-medium ${bodyTextClass}`}>
                  {groomTitle}: <b>{groomName}</b>
                </span>
              </div>
            </div>

            {/* Vòm Nhà Gái */}
            <div className={`rounded-t-full rounded-b-2xl p-3 flex flex-col items-center ${subCardClass}`}>
              <span className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 text-[10px] font-bold flex items-center justify-center mb-1">
                ♀
              </span>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-300 uppercase tracking-widest block mb-1">
                Nhà Gái
              </span>
              <p className={`text-xs font-serif font-bold ${headingTextClass}`}>{brideFather}</p>
              <p className={`text-xs font-serif font-bold ${headingTextClass}`}>{brideMother}</p>
              <div className={`mt-1.5 pt-1 border-t ${dividerClass} w-full text-center`}>
                <span className={`text-[10px] font-medium ${bodyTextClass}`}>
                  {brideTitle}: <b>{brideName}</b>
                </span>
              </div>
            </div>
          </div>

          <span className={`text-[9px] font-serif italic block ${subHeadingTextClass}`}>
            {note}
          </span>
        </div>
      );
    }

    // Style 3: TỐI GIẢN HIỆN ĐẠI (Minimal Line Divider / Minimalist Row)
    if (style === 'minimal-divider' || style === 'minimalist-row') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-4 flex flex-col justify-between text-center select-none">
          {showFamilyHeader && (
            <div>
              {hasHeaderText && (
                <span className={`text-[9px] uppercase font-medium tracking-[0.25em] block ${mutedTextClass}`}>
                  {headerText}
                </span>
              )}
              {hasSubHeader && (
                <h4 className={`font-serif text-sm font-semibold mt-0.5 ${headingTextClass}`}>
                  {subHeader}
                </h4>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 my-2 relative">
            {/* Center vertical divider */}
            <div className={`absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-px ${isDarkBg ? 'bg-white/15' : 'bg-stone-900/10 dark:bg-stone-800'}`} />

            {/* Nhà Trai */}
            <div className="text-right pr-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${mutedTextClass}`}>
                Nhà Trai
              </span>
              <p className={`text-xs font-serif leading-snug ${headingTextClass}`}>{groomFather}</p>
              <p className={`text-xs font-serif leading-snug ${headingTextClass}`}>{groomMother}</p>
              <p className={`text-[11px] font-medium mt-1 ${bodyTextClass}`}>
                {groomTitle}: <span className={`font-bold ${headingTextClass}`}>{groomName}</span>
              </p>
            </div>

            {/* Nhà Gái */}
            <div className="text-left pl-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${mutedTextClass}`}>
                Nhà Gái
              </span>
              <p className={`text-xs font-serif leading-snug ${headingTextClass}`}>{brideFather}</p>
              <p className={`text-xs font-serif leading-snug ${headingTextClass}`}>{brideMother}</p>
              <p className={`text-[11px] font-medium mt-1 ${bodyTextClass}`}>
                {brideTitle}: <span className={`font-bold ${headingTextClass}`}>{brideName}</span>
              </p>
            </div>
          </div>

          <span className={`text-[9px] font-sans block ${mutedTextClass}`}>
            {note}
          </span>
        </div>
      );
    }

    // Style 4: XẾP TẦNG ĐỨNG (Vertical Stacked Flow)
    if (style === 'stacked-flow') {
      return (
        <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col justify-between text-center select-none">
          {showFamilyHeader && (
            <div className={`pb-1 border-b ${dividerClass}`}>
              <span className={`text-[9px] uppercase font-bold tracking-[0.25em] block ${subHeadingTextClass}`}>
                {hasHeaderText ? headerText : subHeader}
              </span>
            </div>
          )}

          <div className="space-y-2 my-1">
            {/* Nhà Trai */}
            <div className={`p-2 rounded-xl flex items-center justify-between text-left px-3 ${
              isDarkBg ? 'bg-blue-500/10 border border-blue-300/20' : 'bg-blue-500/[0.06] border border-blue-500/15'
            }`}>
              <div>
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider block">Nhà Trai</span>
                <span className={`text-xs font-serif font-bold block ${headingTextClass}`}>{groomFather} & {groomMother}</span>
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-300 font-semibold">{groomTitle}: {groomName}</span>
            </div>

            {/* Divider icon */}
            <div className="flex items-center justify-center gap-2 text-rose-400">
              <div className="h-px w-12 bg-rose-300/60" />
              <Heart className="w-3 h-3 fill-rose-400" />
              <div className="h-px w-12 bg-rose-300/60" />
            </div>

            {/* Nhà Gái */}
            <div className={`p-2 rounded-xl flex items-center justify-between text-left px-3 ${
              isDarkBg ? 'bg-rose-500/10 border border-rose-300/20' : 'bg-rose-500/[0.06] border border-rose-500/15'
            }`}>
              <div>
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-300 uppercase tracking-wider block">Nhà Gái</span>
                <span className={`text-xs font-serif font-bold block ${headingTextClass}`}>{brideFather} & {brideMother}</span>
              </div>
              <span className="text-[10px] text-rose-600 dark:text-rose-300 font-semibold">{brideTitle}: {brideName}</span>
            </div>
          </div>

          <span className={`text-[9px] block truncate ${mutedTextClass}`}>
            {note}
          </span>
        </div>
      );
    }

    // Default Style 1: 2 CỘT SONG SONG (Classic Two Column Card - Matches Screenshot)
    return (
      <div className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl p-3 flex flex-col justify-between text-center select-none">
        {showFamilyHeader && (
          <div className={`pb-1.5 border-b ${dividerClass}`}>
            {hasHeaderText && (
              <span className={`text-[9px] uppercase font-bold tracking-[0.25em] block ${subHeadingTextClass}`}>
                {headerText}
              </span>
            )}
            {hasSubHeader && (
              <h4 className={`font-serif text-sm font-bold mt-0.5 ${headingTextClass}`}>
                {subHeader}
              </h4>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 my-1">
          {/* Nhà Trai */}
          <div className={`p-2 rounded-xl ${
            isDarkBg ? 'bg-blue-500/10 border border-blue-300/20' : 'bg-blue-500/[0.06] border border-blue-500/15'
          }`}>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
              Nhà Trai
            </span>
            <p className={`text-xs font-serif font-bold ${headingTextClass}`}>
              {groomFather}
            </p>
            <p className={`text-xs font-serif font-bold ${headingTextClass}`}>
              {groomMother}
            </p>
            <span className={`text-[10px] mt-1 block ${mutedTextClass}`}>
              {groomTitle}: {groomName}
            </span>
          </div>

          {/* Nhà Gái */}
          <div className={`p-2 rounded-xl ${
            isDarkBg ? 'bg-rose-500/10 border border-rose-300/20' : 'bg-rose-500/[0.06] border border-rose-500/15'
          }`}>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
              Nhà Gái
            </span>
            <p className={`text-xs font-serif font-bold ${headingTextClass}`}>
              {brideFather}
            </p>
            <p className={`text-xs font-serif font-bold ${headingTextClass}`}>
              {brideMother}
            </p>
            <span className={`text-[10px] mt-1 block ${mutedTextClass}`}>
              {brideTitle}: {brideName}
            </span>
          </div>
        </div>

        <span className={`text-[9px] block ${mutedTextClass}`}>
          {note}
        </span>
      </div>
    );
  }

  // 15. VIDEO WIDGET / VIDEO KỶ NIỆM CƯỚI
  if (widgetType === 'video') {
    return (
      <div className="w-full h-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-md relative select-none flex flex-col justify-between p-3 text-white">
        {/* Background poster preview */}
        <div className="absolute inset-0 z-0 opacity-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/wedding/templates/c165/photo_01.webp"
            alt="Video poster"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Top badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Film className="w-3 h-3" />
            <span>Wedding Film</span>
          </span>
          <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-full font-mono">03:45</span>
        </div>

        {/* Center Play Button */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="w-12 h-12 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-rose-600 ml-0.5" />
          </div>
        </div>

        {/* Bottom title */}
        <div className="relative z-10 text-center">
          <h4 className="text-xs font-bold truncate">
            {widgetConfig.videoTitle || 'Hành Trình Tình Yêu • Wedding Trailer (4K)'}
          </h4>
          <span className="text-[10px] text-stone-300">Chạm để phát video kỷ niệm</span>
        </div>
      </div>
    );
  }

    // Fallback default
    return (
      <div className={`w-full h-full flex items-center justify-center bg-transparent border-0 shadow-none rounded-2xl text-xs font-serif p-2 ${bodyTextClass}`}>
        <span>[Tiện ích: {widgetType}]</span>
      </div>
    );
  };

  const wrapperClasses = [
    'w-full h-full transition-all studio-custom-styled-widget',
    isTransparent ? 'is-transparent-bg' : 'has-custom-bg',
    isBorderless ? 'is-borderless' : 'has-custom-border',
    isDarkBg ? 'is-dark-bg' : '',
    hasCustomText ? 'has-custom-text-color' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClasses}
      style={{
        ...customWrapperStyle,
        ...(hasCustomText ? ({ '--custom-text-color': widgetConfig.textColor } as React.CSSProperties) : {}),
      }}
    >
      {renderContent()}
    </div>
  );
}
