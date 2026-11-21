'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, Users, CalendarCheck } from 'lucide-react';
import { WeddingEvent } from '@/types/wedding';

interface Props {
  events: WeddingEvent[];
  initialGuestName?: string;
  onRSVPSubmit?: (data: { guestName: string; phone: string; attendeesCount: number; attendingEvent: string; notes: string }) => void;
}

export default function RSVPForm({ events, initialGuestName = '', onRSVPSubmit }: Props) {
  const [guestName, setGuestName] = useState(initialGuestName);
  const [phone, setPhone] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [attendingEvent, setAttendingEvent] = useState(events[0]?.title || 'Tiệc Cưới');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketCode] = useState(() => `LS-CHECKIN-${Math.floor(100000 + Math.random() * 900000)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    // Trigger confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }

    if (onRSVPSubmit) {
      onRSVPSubmit({
        guestName,
        phone,
        attendeesCount,
        attendingEvent,
        notes,
      });
    }

    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-stone-200/60 dark:border-stone-800 text-stone-900 dark:text-stone-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mb-3">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold">Xác Nhận Tham Dự (RSVP)</h3>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-md mx-auto">
          Sự hiện diện của quý khách là niềm vinh hạnh to lớn cho gia đình chúng tôi. Xin vui lòng phản hồi trước ngày cưới để chúng tôi chuẩn bị đón tiếp chu đáo nhất.
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
              Xác Nhận Thành Công!
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Cảm ơn <strong className="text-stone-800 dark:text-stone-200">{guestName}</strong> đã gửi phản hồi. Chúng mình rất mong chờ được đón tiếp bạn!
            </p>
          </div>

          {/* VIP Electronic Wedding Ticket */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#FAF7F2] via-[#F5EFE6] to-[#EADBCE] dark:from-stone-800 dark:via-stone-850 dark:to-stone-900 border-2 border-dashed border-[#C5A880] shadow-xl text-stone-800 dark:text-stone-100 overflow-hidden">
            {/* Corner Decorative Badges */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D5BF9E]/60 dark:border-stone-700">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C7355] dark:text-amber-300">
                Vé Mời Thành Hôn Điện Tử
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#8C7355] text-white px-2 py-0.5 rounded-full">
                {ticketCode}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-wider text-[#7A6A61] dark:text-stone-400 block">
                  Khách Mời Danh Dự
                </span>
                <h3 className="font-serif text-xl font-bold text-[#3A2E2B] dark:text-white">
                  {guestName}
                </h3>
                <p className="text-xs text-[#594B43] dark:text-stone-300">
                  Số lượng: <strong className="font-semibold">{attendeesCount} người</strong> • Sự kiện: <span className="font-semibold">{attendingEvent}</span>
                </p>
              </div>

              {/* QR Code Check-in Box */}
              <div className="w-24 h-24 p-2 bg-white rounded-xl border border-stone-300 shadow-md flex flex-col items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `LOVESTORY_CHECKIN:${ticketCode}:${guestName}:${attendeesCount}`
                  )}`}
                  alt="QR Check-in"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#D5BF9E]/60 dark:border-stone-700 text-center">
              <p className="text-[10px] text-[#7A6A61] dark:text-stone-400 italic">
                💡 Bạn vui lòng chụp lại màn hình tấm vé này để lễ tân quét mã đón tiếp vào bàn nhanh chóng tại cửa tiệc!
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              Cập nhật lại thông tin khác
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Họ và tên của bạn *
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="VD: Anh Tuấn, Chị Lan..."
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                Số người tham dự
              </label>
              <select
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              >
                <option value={1}>1 người (Chỉ mình tôi)</option>
                <option value={2}>2 người (Cùng người thương/bạn)</option>
                <option value={3}>3 người (Gia đình)</option>
                <option value={4}>4 người (Gia đình)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Sự kiện bạn sẽ tham dự
            </label>
            <select
              value={attendingEvent}
              onChange={(e) => setAttendingEvent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.title}>
                  {ev.title} ({ev.time} - {ev.date})
                </option>
              ))}
              <option value="TiecCacBen">Tham dự đầy đủ</option>
              <option value="KhongThamDu">Rất tiếc không thể tham dự (Gửi lời chúc)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Lời nhắn thêm cho Cô Dâu & Chú Rể
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Chúc hai bạn thật hạnh phúc nhé..."
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-medium text-sm shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            <span>Gửi Xác Nhận Tham Dự</span>
          </button>
        </form>
      )}
    </div>
  );
}
