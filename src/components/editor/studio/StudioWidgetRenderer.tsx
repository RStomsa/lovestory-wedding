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
} from 'lucide-react';
import { CanvasElement } from './studioTypes';

interface Props {
  element: CanvasElement;
  isSelected?: boolean;
}

export default function StudioWidgetRenderer({ element }: Props) {
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

  // 1. COUNTDOWN TIMER WIDGET (Screenshot 1: 4 Golden Boxes)
  if (widgetType === 'countdown') {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-3 select-none">
        <div className="grid grid-cols-4 gap-2 w-full max-w-[380px]">
          <div className="bg-[#E4D1B9]/90 dark:bg-stone-800 rounded-xl p-2.5 shadow-sm border border-[#D5BF9E]/50 text-center">
            <span className="block text-2xl md:text-3xl font-serif font-bold text-[#42342D] dark:text-amber-200 tabular-nums leading-none">
              {timeLeft.days}
            </span>
            <span className="text-[10px] font-semibold text-[#6B5A51] dark:text-stone-400 uppercase tracking-wider block mt-1">
              ngày
            </span>
          </div>

          <div className="bg-[#E4D1B9]/90 dark:bg-stone-800 rounded-xl p-2.5 shadow-sm border border-[#D5BF9E]/50 text-center">
            <span className="block text-2xl md:text-3xl font-serif font-bold text-[#42342D] dark:text-amber-200 tabular-nums leading-none">
              {timeLeft.hours}
            </span>
            <span className="text-[10px] font-semibold text-[#6B5A51] dark:text-stone-400 uppercase tracking-wider block mt-1">
              giờ
            </span>
          </div>

          <div className="bg-[#E4D1B9]/90 dark:bg-stone-800 rounded-xl p-2.5 shadow-sm border border-[#D5BF9E]/50 text-center">
            <span className="block text-2xl md:text-3xl font-serif font-bold text-[#42342D] dark:text-amber-200 tabular-nums leading-none">
              {timeLeft.minutes}
            </span>
            <span className="text-[10px] font-semibold text-[#6B5A51] dark:text-stone-400 uppercase tracking-wider block mt-1">
              phút
            </span>
          </div>

          <div className="bg-[#E4D1B9]/90 dark:bg-stone-800 rounded-xl p-2.5 shadow-sm border border-[#D5BF9E]/50 text-center">
            <span className="block text-2xl md:text-3xl font-serif font-bold text-[#42342D] dark:text-amber-200 tabular-nums leading-none">
              {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
            </span>
            <span className="text-[10px] font-semibold text-[#6B5A51] dark:text-stone-400 uppercase tracking-wider block mt-1">
              giây
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[#7A6A61] dark:text-stone-400 font-serif italic mt-2 text-center">
          &ldquo;{widgetConfig.quote || 'Cùng đếm ngược đến khoảnh khắc trọng đại của chúng mình'}&rdquo;
        </p>
      </div>
    );
  }

  // 2. CALENDAR WIDGET (Interactive Month Calendar with Heart Marker)
  if (widgetType === 'calendar') {
    return (
      <div className="w-full h-full bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 shadow-sm border border-[#EADBCE] dark:border-stone-800 flex flex-col justify-between select-none">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#8C7355] dark:text-amber-300 font-semibold mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{widgetConfig.monthYear || 'Tháng 12 / 2026'}</span>
          </div>
          <h4 className="font-serif text-lg font-bold text-[#3A2E2B] dark:text-stone-100">
            Ngày Trọng Đại
          </h4>
        </div>

        <div className="my-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-[#7A6A61] dark:text-stone-400 pb-1.5 border-b border-[#EADBCE]/70 text-center">
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
                      ? 'bg-rose-500 text-white font-bold shadow-xs scale-105'
                      : 'text-[#4A3D36] dark:text-stone-300'
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

        <div className="text-center pt-1 border-t border-[#EADBCE]/50">
          <p className="text-[10px] text-[#8C7355] dark:text-stone-400 font-serif italic">
            Trân trọng kính mời quý khách tới tham dự buổi tiệc thành hôn
          </p>
        </div>
      </div>
    );
  }

  // 3. RSVP FORM WIDGET (Full interactive wedding attendance card)
  if (widgetType === 'rsvp' || widgetType === 'custom_form') {
    return (
      <div className="w-full h-full bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 shadow-md border border-[#EADBCE] dark:border-stone-800 flex flex-col justify-between select-none">
        <div className="text-center pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C7355] dark:text-amber-300 font-bold block">
            R.S.V.P • Phản Hồi Tham Dự
          </span>
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-white mt-0.5">
            {widgetConfig.title || 'Xác Nhận Tham Dự Tiệc Cưới'}
          </h4>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {widgetConfig.subtitle || 'Để gia đình chuẩn bị đón tiếp quý khách chu đáo nhất'}
          </p>
        </div>

        <div className="space-y-2.5 my-2 text-xs">
          {/* Guest Name Input */}
          <div>
            <label className="text-[10px] text-stone-500 font-semibold block mb-1">
              Họ và tên của bạn:
            </label>
            <div className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs">
              Nguyễn Văn A...
            </div>
          </div>

          {/* Party Selection (Nhà Trai / Nhà Gái) */}
          <div>
            <label className="text-[10px] text-stone-500 font-semibold block mb-1">
              Bạn là khách mời của:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="py-1.5 rounded-xl border border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-[11px] text-center"
              >
                Nhà Trai (Chú rể)
              </button>
              <button
                type="button"
                className="py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[11px] text-center"
              >
                Nhà Gái (Cô dâu)
              </button>
            </div>
          </div>

          {/* Confirmation Choice */}
          <div>
            <label className="text-[10px] text-stone-500 font-semibold block mb-1">
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
                className="py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-500 text-[11px]"
              >
                Tiếc quá, không thể tới
              </button>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="button"
          className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 text-center"
        >
          {widgetConfig.buttonText || 'Gửi Xác Nhận Tham Dự'}
        </button>
      </div>
    );
  }

  // 4. GIFT BOX / VIETQR WIDGET (Mừng cưới online qua mã QR)
  if (widgetType === 'giftbox') {
    return (
      <div className="w-full h-full bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 shadow-md border border-[#EADBCE] dark:border-stone-800 flex flex-col justify-between select-none">
        <div className="text-center pb-1.5 border-b border-stone-200 dark:border-stone-800">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C7355] dark:text-amber-300 font-bold block">
            Hộp Mừng Cưới Online
          </span>
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-white mt-0.5">
            Gửi Quà Mừng &amp; Lời Chúc
          </h4>
        </div>

        <div className="flex items-center gap-3 my-2 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
          {/* VietQR code placeholder box */}
          <div className="w-20 h-20 bg-white rounded-xl border border-stone-300 flex flex-col items-center justify-center shadow-inner shrink-0 p-1">
            <QrCode className="w-14 h-14 text-stone-800" />
            <span className="text-[8px] font-bold text-emerald-600 font-mono">VietQR</span>
          </div>

          <div className="flex-1 min-w-0 space-y-1 text-xs">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">
              {widgetConfig.bankName || 'Ngân hàng Quân Đội (MB Bank)'}
            </span>
            <p className="font-mono font-bold text-stone-900 dark:text-white text-sm tracking-wide">
              {widgetConfig.accountNumber || '1903678888'}
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
              Chủ TK: {widgetConfig.accountHolder || 'NGUYEN VAN A'}
            </p>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold cursor-pointer hover:underline">
                <Copy className="w-2.5 h-2.5" />
                <span>Sao chép số tài khoản</span>
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-stone-400 text-center font-serif italic">
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
      const textColor = widgetConfig.textColor || '#6d0208';
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

    return (
      <div className="w-full h-full bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 shadow-sm border border-[#EADBCE] dark:border-stone-800 flex flex-col justify-between select-none overflow-hidden">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#8C7355] dark:text-amber-300 font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Địa Điểm Tổ Chức Tiệc</span>
          </div>
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-white mt-1">
            {widgetConfig.title || 'Trung Tâm Hội Nghị White Palace'}
          </h4>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {widgetConfig.address || '194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh'}
          </p>
        </div>

        {/* Map graphic mockup */}
        <div className="my-2 h-20 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#999_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-stone-900 shadow-sm border border-stone-200 dark:border-stone-700 text-xs font-semibold text-rose-600">
            <MapPin className="w-3.5 h-3.5 fill-rose-600" />
            <span>Xem trên bản đồ vệ tinh</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
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
    return (
      <div className="w-full h-full bg-[#F5EFE6] dark:bg-stone-800/90 rounded-2xl p-3 border border-[#EADBCE] dark:border-stone-700 flex flex-col items-center justify-center text-center select-none shadow-xs">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C7355] dark:text-amber-300 font-bold">
          {widgetConfig.prefix || 'Trân Trọng Kính Mời'}
        </span>
        <h4 className="font-serif text-lg font-bold text-[#3A2E2B] dark:text-stone-100 mt-0.5">
          Quý Khách: {widgetConfig.defaultGuestName || '[Tên Khách Mời]'}
        </h4>
        <p className="text-[10px] text-stone-500 mt-0.5">
          Tới dự bữa cơm thân mật chung vui cùng gia đình chúng tôi
        </p>
      </div>
    );
  }

  // 9. PHOTO ALBUM / SLIDESHOW WIDGET
  if (widgetType === 'album' || widgetType === 'slideshow') {
    return (
      <div className="w-full h-full bg-white/90 dark:bg-stone-900/90 rounded-2xl p-3 border border-stone-200 dark:border-stone-800 flex flex-col justify-between select-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 dark:border-stone-800">
          <span className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>Album Kỷ Niệm Cưới</span>
          </span>
          <span className="text-[10px] text-stone-400 font-mono">14 bức ảnh</span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-1.5 flex-1">
          <div className="rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/wedding/templates/c165/photo_02.jpg"
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/wedding/templates/c165/photo_03.jpg"
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <span className="text-[10px] text-stone-400 text-center block">
          Chạm vào ảnh để xem trọn bộ sưu tập
        </span>
      </div>
    );
  }

  // 10. WISHES / SỔ LƯU BÚT & LỜI CHÚC
  if (widgetType === 'wishes') {
    return (
      <div className="w-full h-full bg-[#FCFBF7] dark:bg-stone-900/90 rounded-2xl p-4 border border-[#EADBCE] dark:border-stone-800 shadow-sm flex flex-col justify-between select-none">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE]/80 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/40" />
              </div>
              <h4 className="font-serif text-sm font-bold text-[#3A2E2B] dark:text-stone-100">
                {widgetConfig.title || 'Sổ Lưu Bút & Lời Chúc'}
              </h4>
            </div>
            <span className="text-[10px] text-[#8C7355] font-semibold bg-[#F5EFE6] px-2 py-0.5 rounded-full">
              12 lời chúc
            </span>
          </div>

          <div className="space-y-2 mt-2.5">
            <div className="p-2 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Bạn Thu Trang</span>
                <span className="text-[9px] text-stone-400">Vừa xong</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long và luôn ngọt ngào như ngày đầu! ❤️
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Tuấn Anh & Nhóm bạn</span>
                <span className="text-[9px] text-stone-400">10 phút trước</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                Mừng ngày hạnh phúc của hai bạn! Chúc cô dâu chú rể sớm có quý tử nha! 🎉
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#EADBCE]/60 flex gap-1.5 items-center">
          <input
            type="text"
            readOnly
            placeholder="Gửi lời chúc mừng đến cô dâu chú rể..."
            className="flex-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none"
          />
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl bg-[#8C7355] hover:bg-[#735D43] text-white text-xs font-medium flex items-center gap-1 shrink-0 shadow-xs"
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
    return (
      <div className="w-full h-full bg-[#18181B] text-white rounded-2xl p-3 border border-stone-800 shadow-md flex items-center gap-3 select-none overflow-hidden relative">
        {/* Vinyl Disc with Spinning Graphic */}
        <div className="w-20 h-20 rounded-full bg-stone-900 border-2 border-stone-700 shadow-lg flex items-center justify-center shrink-0 relative animate-[spin_8s_linear_infinite]">
          {/* Vinyl Grooves */}
          <div className="w-16 h-16 rounded-full border border-stone-800 border-dashed" />
          <div className="w-12 h-12 rounded-full border border-stone-800" />
          {/* Disc Center Label */}
          <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center absolute">
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
            <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase font-mono">
              Đĩa Than Nhạc Cưới
            </span>
          </div>
          <h4 className="text-xs font-bold truncate text-white">
            {widgetConfig.audioTitle || 'Beautiful In White'}
          </h4>
          <p className="text-[10px] text-stone-400 truncate">
            {widgetConfig.artist || 'Shane Filan • Nhạc nền LoveStory'}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </button>
            <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div className="w-2/5 h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full" />
            </div>
            <Volume2 className="w-3.5 h-3.5 text-stone-400" />
          </div>
        </div>
      </div>
    );
  }

  // 12. STORY TIMELINE / DÒNG THỜI GIAN TÌNH YÊU
  if (widgetType === 'story_timeline') {
    return (
      <div className="w-full h-full bg-[#FAF7F2] dark:bg-stone-900/90 rounded-2xl p-4 border border-[#EADBCE] dark:border-stone-800 shadow-sm select-none flex flex-col justify-between">
        <div className="text-center pb-2 border-b border-[#EADBCE]/80 dark:border-stone-800">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C7355]">Câu chuyện của chúng mình</span>
          <h4 className="font-serif text-sm font-bold text-[#3A2E2B] dark:text-stone-100">Dòng Thời Gian Tình Yêu</h4>
        </div>

        <div className="relative pl-6 space-y-3.5 my-2">
          {/* Vertical dashed line */}
          <div className="absolute left-2.5 top-1 bottom-1 w-0.5 border-l-2 border-dashed border-rose-300 dark:border-rose-900" />

          {/* Node 1 */}
          <div className="relative">
            <div className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
            <span className="text-[10px] font-bold text-rose-600">20.10.2021</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Lần đầu gặp gỡ</p>
            <p className="text-[10px] text-stone-500 leading-tight">Buổi chiều thu nhẹ nhàng tại quán cà phê quen thuộc</p>
          </div>

          {/* Node 2 */}
          <div className="relative">
            <div className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center">
              <Heart className="w-2 h-2 text-white fill-white" />
            </div>
            <span className="text-[10px] font-bold text-rose-600">14.02.2024</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Lời cầu hôn ngọt ngào</p>
            <p className="text-[10px] text-stone-500 leading-tight">Dưới ánh hoàng hôn Đà Lạt rực rỡ, em đã nói &quot;Yes!&quot;</p>
          </div>

          {/* Node 3 */}
          <div className="relative">
            <div className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-amber-600">2026</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Ngày chung đôi</p>
            <p className="text-[10px] text-stone-500 leading-tight">Cùng nhau viết tiếp những chương hạnh phúc nhất</p>
          </div>
        </div>
      </div>
    );
  }

  // 13. DRESS CODE / BẢNG MÀU TRANG PHỤC THAM DỰ
  if (widgetType === 'dresscode') {
    return (
      <div className="w-full h-full bg-[#FAF7F2] dark:bg-stone-900/90 rounded-2xl p-3 border border-[#EADBCE] dark:border-stone-800 shadow-sm flex flex-col justify-between text-center select-none">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C7355]">Gợi Ý Trang Phục</span>
          <h4 className="font-serif text-sm font-bold text-[#3A2E2B] dark:text-stone-100">Dress Code Tham Dự</h4>
          <p className="text-[10px] text-stone-500 mt-0.5">
            Để có những bức ảnh kỷ niệm thật hài hòa, kính mời quý khách mặc trang phục theo gợi ý:
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 my-1">
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-stone-300 shadow-2xs" />
            <span className="text-[9px] text-stone-600 dark:text-stone-400 font-medium">Trắng</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#EADBC8] border border-stone-300 shadow-2xs" />
            <span className="text-[9px] text-stone-600 dark:text-stone-400 font-medium">Be / Kem</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#F3C5C5] border border-stone-300 shadow-2xs" />
            <span className="text-[9px] text-stone-600 dark:text-stone-400 font-medium">Pastel</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#7A1E28] border border-stone-700 shadow-2xs" />
            <span className="text-[9px] text-stone-600 dark:text-stone-400 font-medium">Đỏ Rượu</span>
          </div>
        </div>

        <span className="text-[9px] text-stone-400 italic">
          * Quý khách có thể tự do lựa chọn trang phục lịch sự phù hợp
        </span>
      </div>
    );
  }

  // 14. FAMILY INFO / THÔNG TIN HAI BÊN GIA ĐÌNH
  if (widgetType === 'family_info') {
    return (
      <div className="w-full h-full bg-[#FCFBF7] dark:bg-stone-900/90 rounded-2xl p-3 border border-[#EADBCE] dark:border-stone-800 shadow-sm flex flex-col justify-between text-center select-none">
        <div className="pb-1.5 border-b border-[#EADBCE]/80 dark:border-stone-800">
          <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-[#8C7355]">Hôn Phối Trân Trọng Kính Báo</span>
          <h4 className="font-serif text-sm font-bold text-[#3A2E2B] dark:text-stone-100">Gia Đình Hai Bên</h4>
        </div>

        <div className="grid grid-cols-2 gap-3 my-1">
          {/* Nhà Trai */}
          <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-stone-800/60 border border-blue-100 dark:border-stone-700/60">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block mb-1">
              Nhà Trai
            </span>
            <p className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
              {widgetConfig.groomFather || 'Ông: Nguyễn Văn An'}
            </p>
            <p className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
              {widgetConfig.groomMother || 'Bà: Trần Thị Mai'}
            </p>
            <span className="text-[10px] text-stone-500 mt-1 block">
              Trưởng Nam: {widgetConfig.groomName || 'Minh Trí'}
            </span>
          </div>

          {/* Nhà Gái */}
          <div className="p-2 rounded-xl bg-rose-50/50 dark:bg-stone-800/60 border border-rose-100 dark:border-stone-700/60">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">
              Nhà Gái
            </span>
            <p className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
              {widgetConfig.brideFather || 'Ông: Lê Hoàng Long'}
            </p>
            <p className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
              {widgetConfig.brideMother || 'Bà: Phạm Thu Cúc'}
            </p>
            <span className="text-[10px] text-stone-500 mt-1 block">
              Út Nữ: {widgetConfig.brideName || 'Ngọc Anh'}
            </span>
          </div>
        </div>

        <span className="text-[9px] text-stone-400">
          Kính mời quý quan viên hai họ và bạn bè thân hữu tới dự
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
    <div className="w-full h-full flex items-center justify-center bg-white/90 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xs text-xs font-serif text-stone-700 dark:text-stone-200 p-2">
      <span>[Tiện ích: {widgetType}]</span>
    </div>
  );
}
