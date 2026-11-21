'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { WeddingData } from '@/types/wedding';
import { formatDateVietnamese } from '@/lib/utils';
import CountdownTimer from '@/components/common/CountdownTimer';
import VietQRGiftBox from '@/components/common/VietQRGiftBox';
import RSVPForm from '@/components/common/RSVPForm';
import GuestbookWishes from '@/components/common/GuestbookWishes';
import GalleryLightbox from '@/components/common/GalleryLightbox';
import FloatingMusicPlayer from '@/components/common/FloatingMusicPlayer';
import FallingPetals from '@/components/common/FallingPetals';
import CurtainOpeningEffect from '@/components/common/CurtainOpeningEffect';
import { MapPin, Navigation, Heart } from 'lucide-react';

interface Props {
  data: WeddingData;
  guestName?: string;
  guestRole?: string;
  isMobileView?: boolean;
}

export default function OurLoveBeginsTemplate({
  data,
  guestName,
  guestRole,
  isMobileView,
}: Props) {
  // Parse date for calendar calculation
  const weddingDate = useMemo(() => new Date(data.mainDate || '2026-05-23'), [data.mainDate]);
  const weddingDay = weddingDate.getDate();
  const weddingMonth = weddingDate.getMonth() + 1;
  const weddingYear = weddingDate.getFullYear();

  // Calendar calculations
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const firstDayIndex = (new Date(weddingYear, weddingMonth - 1, 1).getDay() + 6) % 7;
  const totalDaysInMonth = new Date(weddingYear, weddingMonth, 0).getDate();

  // Format month name for English editorial accent
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[weddingMonth - 1] || 'May';

  // Venue details
  const mainEvent = data.events[0] || {
    time: '10:30',
    title: 'Tiệc Cưới Chung Vui',
    locationName: 'Trung Tâm Tiệc Cưới LoveStory',
    address: '54 Trung Hoà, Cầu Giấy, Hà Nội',
    mapUrl: 'https://maps.google.com/?q=Trung+Tâm+Tiệc+Cưới',
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3b3232] font-sans relative overflow-x-hidden selection:bg-[#e8d29b] selection:text-stone-900">
      {/* Hiệu ứng mở màn rèm & cánh hoa bay & nhạc nền */}
      <CurtainOpeningEffect
        color="red"
        title="Wedding Invitation"
        subtitle={`${data.groom.shortName} & ${data.bride.shortName}`}
        guestName={guestName}
      />
      <FallingPetals type="petals" count={16} />
      <FloatingMusicPlayer
        audioUrl={data.music.url || '/assets/wedding/audio/wedding-melody-01.mp3'}
        songTitle={data.music.title || 'Marry You'}
        artist={data.music.artist || 'LoveStory'}
      />

      <div className={`mx-auto ${isMobileView ? 'max-w-[500px]' : 'max-w-[540px]'} shadow-2xl bg-[#FAF7F2]`}>
        {/* =========================================================================
            1. HERO SECTION: BÌA TẠP CHÍ THỜI TRANG (MAGAZINE COVER)
            ========================================================================= */}
        <section className="relative w-full min-h-[780px] flex flex-col justify-end overflow-hidden bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'}
            alt="Wedding Magazine Cover"
            className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.92]"
          />
          {/* Lớp gradient tinh tế tôn vinh typography */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/20" />

          {/* Typography Tạp chí xếp tầng độc quyền */}
          <div className="relative z-10 p-6 sm:p-8 text-[#e8d29b] select-none">
            <p className="font-serif italic text-4xl sm:text-5xl -mb-4 sm:-mb-5 text-[#fdf3dc] drop-shadow-md">
              Our
            </p>
            <h1 className="font-serif text-6xl sm:text-7xl uppercase tracking-tighter leading-[0.88] font-light text-[#e8d29b] drop-shadow-lg text-right">
              Love <br />
              <span className="font-medium tracking-normal text-[#faeed6]">Begins</span>
            </h1>

            {/* Dòng ngày tháng bìa tạp chí */}
            <div className="flex justify-between items-center mt-8 pt-3 border-t border-[#e8d29b]/40 text-xs sm:text-sm tracking-widest uppercase font-serif">
              <span className="flex items-center gap-1.5 font-semibold text-[#f8edd4]">
                <Heart className="w-3.5 h-3.5 fill-[#e8d29b] text-[#e8d29b]" /> {weddingDay} {monthName}
              </span>
              <span className="font-semibold tracking-widest text-[#f8edd4]">{weddingYear}</span>
            </div>
          </div>
        </section>

        {/* Khung thiệp gửi riêng cho khách (nếu có guestName) */}
        {guestName && (
          <div className="p-4 bg-[#F2EDE4] border-b border-[#E8DFC8]">
            <div className="p-4 rounded-xl bg-white/90 border border-[#E8DFC8] text-center shadow-xs">
              <p className="text-[11px] uppercase tracking-widest text-[#9c5a1a] font-medium">Trân trọng kính mời:</p>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#3b3232] mt-0.5">
                {guestName} {guestRole ? `(${guestRole})` : ''}
              </h3>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. INVITATION & LỜI NGỎ
            ========================================================================= */}
        <section className="py-12 px-6 text-center space-y-4">
          <span className="text-[11px] uppercase tracking-[0.3em] font-serif font-bold text-[#9c5a1a]">
            INVITATION
          </span>
          <h2 className="text-sm uppercase tracking-widest font-serif font-semibold text-[#9c5a1a]">
            TRÂN TRỌNG KÍNH MỜI
          </h2>
          <p className="text-xs sm:text-sm text-[#5c5248] leading-relaxed max-w-md mx-auto font-light">
            {data.quote ||
              'Chúng mình mong muốn được dành một khoảng thời gian ý nghĩa để cùng nhau trao gửi lời hứa thiêng liêng, sẽ luôn ghi nhớ và trân trọng tình yêu ấy suốt đời. Rất mong Bạn sẽ bớt chút thời gian đến tham dự chứng kiến và chúc phúc cho chúng mình trong ngày trọng đại này.'}
          </p>

          {/* Đường nét vẽ cong nghệ thuật (Curve Divider) */}
          <div className="py-3 flex justify-center opacity-70">
            <svg width="220" height="32" viewBox="0 0 220 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 16C50 32 80 0 110 16C140 32 170 0 218 16" stroke="#9c5a1a" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </section>

        {/* =========================================================================
            3. THÔNG TIN GIA ĐÌNH HAI BÊN
            ========================================================================= */}
        <section className="px-6 pb-10">
          <div className="grid grid-cols-2 gap-4 text-center">
            {/* Nhà Trai */}
            <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#E8DFC8]/60 space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-bold text-stone-900 block pb-1 border-b border-[#E8DFC8]">
                NHÀ TRAI
              </span>
              <p className="text-xs font-serif font-bold text-stone-900 pt-1 leading-snug">
                {data.groom.parents || 'Đại diện gia đình Nhà Trai'}
              </p>
              <p className="text-[11px] text-stone-500 font-light">
                {data.events[1]?.address ? data.events[1].address.split(',').slice(-2).join(',') : 'Hà Nội'}
              </p>
            </div>

            {/* Nhà Gái */}
            <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#E8DFC8]/60 space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-bold text-stone-900 block pb-1 border-b border-[#E8DFC8]">
                NHÀ GÁI
              </span>
              <p className="text-xs font-serif font-bold text-stone-900 pt-1 leading-snug">
                {data.bride.parents || 'Đại diện gia đình Nhà Gái'}
              </p>
              <p className="text-[11px] text-stone-500 font-light">
                {data.events[0]?.address ? data.events[0].address.split(',').slice(-2).join(',') : 'Hà Nội'}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. CHÂN DUNG CÔ DÂU & CHÚ RỂ (COUPLE CARDS)
            ========================================================================= */}
        <section className="px-6 pb-12">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Chú Rể */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-white bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.groom.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'}
                  alt={data.groom.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Cô Dâu */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-white bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.bride.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                  alt={data.bride.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Chữ ký thư pháp nghệ thuật */}
          <div className="text-center mt-5">
            <h3 className="font-serif italic text-2xl sm:text-3xl text-[#9c5a1a] flex items-center justify-center gap-3">
              <span>{data.groom.name}</span>
              <span className="text-sm font-sans not-italic text-stone-400">💐</span>
              <span>{data.bride.name}</span>
            </h3>
          </div>
        </section>

        {/* =========================================================================
            5. INTERVIEW / CÂU CHUYỆN CỦA CHÚNG MÌNH
            ========================================================================= */}
        <section className="py-10 px-6 bg-[#F4EFE6] text-center space-y-3">
          <span className="font-serif italic text-3xl sm:text-4xl text-[#9c5a1a] block">
            Interview
          </span>
          <h4 className="text-xs uppercase tracking-widest font-serif font-bold text-[#9c5a1a]">
            CÂU CHUYỆN CỦA CHÚNG MÌNH
          </h4>
          <p className="text-xs text-[#5c5248] max-w-sm mx-auto font-light leading-relaxed">
            {data.subQuote ||
              'Trước ngày về chung một nhà, chúng mình đã chuẩn bị một cuộc trò chuyện nhỏ để kể lại hành trình của hai đứa.'}
          </p>

          <div className="pt-4 max-w-sm mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-md border-4 border-white bg-stone-200 aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.gallery[0]?.url || data.coverImage}
                alt="Our Interview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. GALLERY BENTO GRID (ALBUM ẢNH CƯỚI ĐIỆN ẢNH)
            ========================================================================= */}
        <section className="py-12 px-5 space-y-4">
          <div className="text-center pb-2">
            <span className="text-sm uppercase tracking-[0.25em] font-serif font-bold text-[#9c5a1a]">
              GALLERY
            </span>
          </div>

          <GalleryLightbox photos={data.gallery} />
        </section>

        {/* =========================================================================
            7. SAVE THE DATE & LỊCH TRÁI TIM ĐỘC QUYỀN
            ========================================================================= */}
        <section className="py-12 px-6 bg-[#F5EFEB] text-center space-y-3 border-y border-[#E8DFC8]">
          <span className="font-serif italic text-3xl sm:text-4xl text-[#9c5a1a] block">
            Save The Date
          </span>

          <p className="text-xs uppercase tracking-widest font-medium text-stone-600">
            {mainEvent.time}, {formatDateVietnamese(data.mainDate)}
          </p>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#3b3232]">
            {weddingDay < 10 ? `0${weddingDay}` : weddingDay}.
            {weddingMonth < 10 ? `0${weddingMonth}` : weddingMonth}.{weddingYear}
          </h3>

          <p className="text-[11px] text-stone-500 italic">
            (Tức ngày 18 tháng 04 năm Bính Ngọ âm lịch)
          </p>

          {/* LƯỚI LỊCH THÁNG ĐÁNH DẤU TRÁI TIM */}
          <div className="mt-6 max-w-sm mx-auto p-4 bg-white/90 rounded-2xl border border-[#E8DFC8] shadow-sm">
            <div className="grid grid-cols-7 text-center text-xs font-serif font-semibold pb-2 border-b border-[#E8DFC8] text-[#9c5a1a]">
              {daysOfWeek.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 text-center gap-y-2 pt-3 font-serif text-xs sm:text-sm">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <span key={`empty-${i}`} />
              ))}

              {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                const currentDay = i + 1;
                const isTarget = currentDay === weddingDay;

                return (
                  <div key={currentDay} className="relative flex items-center justify-center h-8">
                    {isTarget ? (
                      <div className="relative flex items-center justify-center w-7 h-7">
                        <Image
                          src="/assets/wedding/plugins/calen_heart_1.png"
                          alt="Wedding Day"
                          width={34}
                          height={34}
                          className="absolute inset-0 m-auto object-contain scale-125"
                        />
                        <span className="relative z-10 text-white font-bold text-xs drop-shadow-sm">
                          {currentDay}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#5a4d41]">{currentDay}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. LOCATION & BẢN ĐỒ TIỆC CƯỚI
            ========================================================================= */}
        <section className="py-12 px-6 text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] font-serif font-bold text-[#9c5a1a] block">
            LOCATION
          </span>
          <p className="text-xs uppercase tracking-widest text-stone-600 font-medium">
            TRUNG TÂM TIỆC CƯỚI
          </p>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-[#9c5a1a]">
            {mainEvent.locationName}
          </h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
            {mainEvent.address}
          </p>

          {/* Khung bản đồ Google Maps */}
          <div className="mt-4 rounded-2xl overflow-hidden border border-[#E8DFC8] shadow-sm max-w-md mx-auto aspect-[16/9] relative bg-stone-100">
            <iframe
              title="Wedding Location Map"
              width="100%"
              height="100%"
              loading="lazy"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mainEvent.address || mainEvent.locationName)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />
          </div>

          <div className="pt-2">
            <a
              href={mainEvent.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(mainEvent.address)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9c5a1a] text-white text-xs font-medium hover:bg-[#834b15] shadow-sm transition-transform active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Chỉ Đường Trên Google Maps</span>
            </a>
          </div>
        </section>

        {/* =========================================================================
            9. ĐỒNG HỒ ĐẾM NGƯỢC (COUNTDOWN TIMER)
            ========================================================================= */}
        <section className="py-10 px-6 bg-[#F5EFEB] border-t border-[#E8DFC8]">
          <div className="max-w-md mx-auto">
            <CountdownTimer targetDate={data.mainDate} theme="pastel" />
          </div>
        </section>

        {/* =========================================================================
            10. TIỆN ÍCH TƯƠNG TÁC (RSVP, MỪNG CƯỚI, SỔ LƯU BÚT)
            ========================================================================= */}
        <section className="py-12 px-6 space-y-12 bg-white">
          <div className="max-w-md mx-auto">
            <RSVPForm
              events={data.events}
            />
          </div>

          <div className="max-w-md mx-auto">
            <VietQRGiftBox groom={data.groom} bride={data.bride} />
          </div>

          <div className="max-w-md mx-auto">
            <GuestbookWishes
              initialWishes={data.wishes}
            />
          </div>
        </section>

        {/* =========================================================================
            11. KẾT MÀN: LỜI CẢM ƠN (THANK YOU CARD)
            ========================================================================= */}
        <footer className="relative min-h-[460px] flex flex-col justify-end p-6 sm:p-8 text-white overflow-hidden bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.gallery[data.gallery.length - 1]?.url || data.coverImage}
            alt="Ending Card"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="relative z-10 text-center space-y-3 max-w-sm mx-auto">
            <p className="text-xs sm:text-sm font-light leading-relaxed italic text-stone-200">
              &ldquo;Hẹn gặp bạn trong ngày hạnh phúc của chúng mình. Rất mong được đón tiếp bạn trong ngày vui đặc biệt này, bởi sự hiện diện của bạn chính là niềm hạnh phúc trọn vẹn của chúng mình.&rdquo;
            </p>
            <div className="pt-2">
              <span className="font-serif italic text-2xl text-[#faebd7]">
                {data.groom.shortName} &amp; {data.bride.shortName}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
