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
    return (
      <div className="w-full h-full bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 shadow-sm border border-[#EADBCE] dark:border-stone-800 flex flex-col justify-between select-none">
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

  // Fallback default
  return (
    <div className="w-full h-full flex items-center justify-center bg-white/90 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xs text-xs font-serif text-stone-700 dark:text-stone-200 p-2">
      <span>[Tiện ích: {widgetType}]</span>
    </div>
  );
}
