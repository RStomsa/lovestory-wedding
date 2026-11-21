'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { WeddingData } from '@/types/wedding';
import VietQRGiftBox from '@/components/common/VietQRGiftBox';
import RSVPForm from '@/components/common/RSVPForm';
import GuestbookWishes from '@/components/common/GuestbookWishes';
import GalleryLightbox from '@/components/common/GalleryLightbox';
import FloatingMusicPlayer from '@/components/common/FloatingMusicPlayer';
import FallingPetals from '@/components/common/FallingPetals';
import CurtainOpeningEffect from '@/components/common/CurtainOpeningEffect';
import { Phone, Calendar as CalendarIcon, Clock, Navigation } from 'lucide-react';

interface Props {
  data: WeddingData;
  guestName?: string;
  guestRole?: string;
  isMobileView?: boolean;
}

export default function SaveTheDate165Template({
  data,
  guestName,
  guestRole: _guestRole,
  isMobileView,
}: Props) {
  const weddingDate = useMemo(() => new Date(data.mainDate || '2026-12-28'), [data.mainDate]);
  const weddingDay = weddingDate.getDate();
  const weddingMonth = weddingDate.getMonth() + 1;
  const weddingYear = weddingDate.getFullYear();

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = weddingDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  // Template gallery photos
  const templatePhotos = useMemo(() => {
    const defaultLocalPhotos = [
      '/assets/wedding/templates/c165/photo_01.webp',
      '/assets/wedding/templates/c165/photo_02.jpg',
      '/assets/wedding/templates/c165/photo_03.jpg',
      '/assets/wedding/templates/c165/photo_04.png',
      '/assets/wedding/templates/c165/photo_05.jpg',
      '/assets/wedding/templates/c165/photo_06.jpg',
      '/assets/wedding/templates/c165/photo_07.png',
      '/assets/wedding/templates/c165/photo_08.jpg',
      '/assets/wedding/templates/c165/photo_09.jpg',
      '/assets/wedding/templates/c165/photo_10.jpg',
      '/assets/wedding/templates/c165/photo_02.jpg',
      '/assets/wedding/templates/c165/photo_03.jpg',
      '/assets/wedding/templates/c165/photo_05.jpg',
      '/assets/wedding/templates/c165/photo_06.jpg',
    ];

    if (data.gallery && data.gallery.length >= 10) {
      return data.gallery.map((g) => g.url);
    }
    return defaultLocalPhotos;
  }, [data.gallery]);

  const mainEvent = data.events[0] || {
    time: '12:00',
    title: 'Lễ Thành Hôn & Tiệc Cưới',
    locationName: 'Khách sạn LoveStory, Tòa nhà A, Tầng 9, Sảnh tiệc Happiness',
    address: 'Sảnh tiệc Happiness, Tầng 9, Tòa nhà A',
    mapUrl: 'https://maps.google.com',
  };

  // Days in month calculation for the calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(weddingYear, weddingMonth - 1, 1).getDay();
    const daysInMonth = new Date(weddingYear, weddingMonth, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [weddingYear, weddingMonth]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#332A27] font-sans relative overflow-x-hidden selection:bg-[#EADBCE] selection:text-[#332A27]">
      <CurtainOpeningEffect
        color="red"
        title="Save The Date"
        subtitle={`${data.groom.shortName} & ${data.bride.shortName}`}
        guestName={guestName}
      />
      <FallingPetals type="sparkles" count={16} />
      <FloatingMusicPlayer
        audioUrl={data.music.url || 'https://assets.cinelove.me/mp3/5f4c5139-a13a-4ff0-82a2-e3a61240042f.mp3'}
        songTitle={data.music.title || 'Until You'}
        artist={data.music.artist || 'LoveStory'}
      />

      <div className={`mx-auto ${isMobileView ? 'max-w-[500px]' : 'max-w-[520px]'} shadow-2xl bg-[#FAF7F2]`}>
        {/* =========================================================================
            1. HERO COVER: SAVE THE DATE (CREAM & GOLD EDITORIAL)
        ========================================================================= */}
        <header className="relative pt-12 pb-8 px-6 text-center overflow-hidden">
          {/* Header Typography with Floating Entrance */}
          <div className="relative z-10">
            <h2 className="font-serif italic text-6xl text-[#A68868] tracking-wide leading-none animate-float">
              Save
            </h2>
            <div className="text-sm font-semibold tracking-[0.35em] text-[#63554D] uppercase my-1">
              THE
            </div>
            <h2 className="font-serif italic text-6xl text-[#A68868] tracking-wide leading-none mb-3">
              Date
            </h2>
            <p className="text-xs italic text-[#807067] max-w-xs mx-auto mb-6">
              &quot;At this moment love and being loved happen at the same time&quot;
            </p>
          </div>

          {/* Personalized VIP Guest Card */}
          {guestName && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#F5EFE6] via-[#FAF7F2] to-[#F5EFE6] border-2 border-[#D5BF9E] shadow-sm max-w-sm mx-auto text-center space-y-1 animate-in fade-in slide-in-from-top-3 duration-500">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7355] font-semibold block">
                Trân Trọng Kính Mời
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3A2E2B]">
                {guestName}
              </h3>
              <p className="text-[11px] text-[#7A6A61] italic">
                Cùng người thương tới chung vui trong ngày hạnh phúc của chúng tôi
              </p>
            </div>
          )}

          {/* Cover Hero Photo */}
          <div className="relative mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-[#F2ECE4] max-w-[420px] aspect-[3/4]">
            <Image
              src={templatePhotos[0] || '/assets/wedding/templates/c165/photo_01.webp'}
              alt="Save The Date Cover"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 600px) 100vw, 420px"
            />
            {/* Elegant overlay badge */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6 text-white text-center">
              <p className="text-sm uppercase tracking-widest text-[#EADBCE]">Wedding Celebration</p>
              <h3 className="font-serif text-3xl font-normal mt-1 tracking-wider">
                {data.groom.shortName} & {data.bride.shortName}
              </h3>
              <p className="text-xs text-[#EADBCE]/90 mt-1 font-mono">
                {weddingDay} . {weddingMonth < 10 ? `0${weddingMonth}` : weddingMonth} . {weddingYear}
              </p>
            </div>
          </div>

          {/* Invitation Opening Note */}
          <div className="mt-8 px-4 text-[#594B43] text-sm leading-relaxed font-serif">
            <p className="italic">Hi! Khi bạn nhận được thiệp mời này,</p>
            <p className="mt-1">
              Trước đây tôi cứ nghĩ đám cưới chỉ là một thông báo chính thức,
              nhưng từ khi gặp được bạn, tôi nhận ra rằng ngày mai chính là khởi đầu của vĩnh cửu.
            </p>
          </div>
        </header>

        {/* =========================================================================
            2. COUNTDOWN TIMER (4 GOLDEN SQUARES AS SEEN IN SCREENSHOT)
        ========================================================================= */}
        <section className="py-8 px-6 text-center border-t border-[#EADBCE]/60">
          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
            <div className="bg-[#E4D1B9]/90 rounded-2xl p-3 shadow-sm border border-[#D5BF9E]/40">
              <span className="block text-3xl font-serif font-bold text-[#42342D]">{timeLeft.days}</span>
              <span className="text-[11px] font-medium text-[#6B5A51] uppercase tracking-wider">ngày</span>
            </div>
            <div className="bg-[#E4D1B9]/90 rounded-2xl p-3 shadow-sm border border-[#D5BF9E]/40">
              <span className="block text-3xl font-serif font-bold text-[#42342D]">{timeLeft.hours}</span>
              <span className="text-[11px] font-medium text-[#6B5A51] uppercase tracking-wider">giờ</span>
            </div>
            <div className="bg-[#E4D1B9]/90 rounded-2xl p-3 shadow-sm border border-[#D5BF9E]/40">
              <span className="block text-3xl font-serif font-bold text-[#42342D]">{timeLeft.minutes}</span>
              <span className="text-[11px] font-medium text-[#6B5A51] uppercase tracking-wider">phút</span>
            </div>
            <div className="bg-[#E4D1B9]/90 rounded-2xl p-3 shadow-sm border border-[#D5BF9E]/40">
              <span className="block text-3xl font-serif font-bold text-[#42342D]">{timeLeft.seconds}</span>
              <span className="text-[11px] font-medium text-[#6B5A51] uppercase tracking-wider">giây</span>
            </div>
          </div>

          <div className="mt-6 max-w-md mx-auto text-[#61524A] text-xs leading-relaxed px-4">
            <p>
              &ldquo;Hẹn gặp bạn trong ngày hạnh phúc của chúng mình. Rất mong được đón tiếp bạn trong ngày vui đặc biệt này. Bởi sự hiện diện của bạn chính là niềm hạnh phúc trọn vẹn của chúng mình.&rdquo;
            </p>
          </div>
        </section>

        {/* =========================================================================
            3. COUPLE INTRO & CONTACT PILL BUTTONS (AS SEEN IN SCREENSHOT 4)
        ========================================================================= */}
        <section className="py-10 px-6 bg-[#F5EFE6]/70 border-y border-[#EADBCE]/80">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8C7355] font-semibold">Groom & Bride</span>
            <h3 className="font-serif text-2xl text-[#3A2E2B] mt-1">Cặp Đôi Hạnh Phúc</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {/* Groom Card */}
            <div className="text-center bg-[#FAF7F2] p-4 rounded-2xl shadow-sm border border-[#EADBCE]">
              <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-[#C5A880] mb-3 shadow-inner">
                <Image
                  src={data.groom.avatar || templatePhotos[1] || '/assets/wedding/templates/c165/photo_02.jpg'}
                  alt="Chú rể"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs text-[#8C7355] font-serif uppercase tracking-wider block">Chú rể</span>
              <h4 className="font-serif font-bold text-lg text-[#3A2E2B] mt-0.5">{data.groom.name || 'Mạn Tiểu Mạn'}</h4>
              <p className="text-[11px] text-[#7A6A61] mt-1">{data.groom.parents || 'Con ông: Nguyễn Văn A & Bà: Trần Thị B'}</p>
            </div>

            {/* Bride Card */}
            <div className="text-center bg-[#FAF7F2] p-4 rounded-2xl shadow-sm border border-[#EADBCE]">
              <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-[#C5A880] mb-3 shadow-inner">
                <Image
                  src={data.bride.avatar || templatePhotos[2] || '/assets/wedding/templates/c165/photo_03.jpg'}
                  alt="Cô dâu"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs text-[#8C7355] font-serif uppercase tracking-wider block">Cô dâu</span>
              <h4 className="font-serif font-bold text-lg text-[#3A2E2B] mt-0.5">{data.bride.name || 'Mei Tiểu Mai'}</h4>
              <p className="text-[11px] text-[#7A6A61] mt-1">{data.bride.parents || 'Con ông: Lê Văn C & Bà: Phạm Thị D'}</p>
            </div>
          </div>

          {/* Two brown pill contact buttons matching user screenshot */}
          <div className="flex justify-center gap-4 mt-6">
            <a
              href={`tel:${data.groom.phone || '0901234567'}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#B26B27] hover:bg-[#97581E] text-white text-xs font-medium tracking-wide shadow-md transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Liên hệ Nhà Trai</span>
            </a>
            <a
              href={`tel:${data.bride.phone || '0907654321'}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#B26B27] hover:bg-[#97581E] text-white text-xs font-medium tracking-wide shadow-md transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Liên hệ Nhà Gái</span>
            </a>
          </div>

          {/* Poetic Quote Box from Screenshot 4 */}
          <div className="mt-8 px-4 text-center max-w-md mx-auto">
            <p className="text-xs leading-relaxed italic text-[#594B43] font-serif">
              &ldquo;Sẽ luôn có một khoảnh khắc trong cuộc đời mỗi người khi họ cần phải kiên định với quyết định của mình, một khoảnh khắc để nói:
              <br />
              <strong className="not-italic text-[#3A2E2B] font-semibold">&ldquo;Đây là con người tôi, đây là sự lựa chọn của tôi.&rdquo;</strong>
              <br />
              Điều này sẽ xảy ra trong tương lai gần, ngay lúc này với bạn.&rdquo;
            </p>
          </div>
        </section>

        {/* =========================================================================
            4. CALENDAR & HEART MARKER
        ========================================================================= */}
        <section className="py-10 px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#8C7355] font-semibold mb-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Tháng {weddingMonth} / {weddingYear}</span>
          </div>
          <h3 className="font-serif text-2xl text-[#3A2E2B] mb-6">Ngày Trọng Đại</h3>

          <div className="max-w-xs mx-auto bg-white/70 p-5 rounded-2xl shadow-sm border border-[#EADBCE]">
            <div className="grid grid-cols-7 gap-2 text-xs font-medium text-[#7A6A61] mb-3 pb-2 border-b border-[#EADBCE]">
              <span>CN</span>
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} />;
                }
                const isWeddingDay = day === weddingDay;
                return (
                  <div
                    key={`day-${day}`}
                    className={`h-8 flex items-center justify-center relative font-medium ${
                      isWeddingDay ? 'text-white font-bold' : 'text-[#4A3D36]'
                    }`}
                  >
                    {isWeddingDay && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src="/assets/wedding/plugins/calen_heart_1.png"
                          alt="Heart marker"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="relative z-10">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. WEDDING EVENT & VENUE DETAILS
        ========================================================================= */}
        <section className="py-10 px-6 bg-[#F5EFE6]/70 border-y border-[#EADBCE]">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8C7355] font-semibold">Wedding Schedule</span>
            <h3 className="font-serif text-2xl text-[#3A2E2B] mt-1">{mainEvent.title}</h3>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-3xl shadow-sm border border-[#EADBCE] max-w-md mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EADBCE]/60 text-xs font-medium text-[#594B43]">
              <Clock className="w-3.5 h-3.5 text-[#8C7355]" />
              <span>Vào lúc {mainEvent.time}</span>
            </div>

            <div className="text-[#3A2E2B]">
              <h4 className="font-serif font-bold text-lg">{mainEvent.locationName}</h4>
              <p className="text-xs text-[#7A6A61] mt-1">{mainEvent.address}</p>
            </div>

            <div className="pt-2">
              <a
                href={mainEvent.mapUrl || 'https://maps.google.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3A2E2B] text-[#FAF7F2] text-xs font-medium hover:bg-black transition-colors shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ đường trên Google Maps</span>
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. 14-PHOTO ALBUM GALLERY (MATCHING SCREENSHOT'S 14 THUMBNAIL QUICK BAR)
        ========================================================================= */}
        <section className="py-10 px-6">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8C7355] font-semibold">Photo Memories</span>
            <h3 className="font-serif text-2xl text-[#3A2E2B] mt-1">Khoảnh Khắc Tình Yêu</h3>
            <p className="text-xs text-[#7A6A61] mt-1">Chạm vào ảnh để phóng to xem trọn bộ album</p>
          </div>

          {/* Bento & Grid Layout of 14 photos */}
          <div className="space-y-3 max-w-md mx-auto">
            {/* Top Duo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-[#EADBCE]">
                <Image
                  src={templatePhotos[1] || '/assets/wedding/templates/c165/photo_02.jpg'}
                  alt="Gallery 1"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-[#EADBCE]">
                <Image
                  src={templatePhotos[2] || '/assets/wedding/templates/c165/photo_03.jpg'}
                  alt="Gallery 2"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Featured Wide */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-sm border border-[#EADBCE]">
              <Image
                src={templatePhotos[4] || '/assets/wedding/templates/c165/photo_05.jpg'}
                alt="Gallery 3"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Grid 3 */}
            <div className="grid grid-cols-3 gap-2">
              {[5, 6, 7].map((num) => (
                <div key={num} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-[#EADBCE]">
                  <Image
                    src={templatePhotos[num] || `/assets/wedding/templates/c165/photo_${num + 1}.jpg`}
                    alt={`Gallery ${num}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>

            {/* Quote Insert */}
            <div className="p-4 my-2 text-center bg-[#F5EFE6] rounded-2xl border border-[#EADBCE]">
              <p className="font-serif italic text-xs text-[#594B43]">
                &ldquo;Một người sẽ gặp 29,2 triệu người trong đời, nhưng xác suất hai người yêu nhau chỉ là 0,000049. Và rồi tôi gặp bạn.&rdquo;
              </p>
            </div>

            {/* Remaining Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-[#EADBCE]">
                <Image
                  src={templatePhotos[8] || '/assets/wedding/templates/c165/photo_09.jpg'}
                  alt="Gallery 8"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-[#EADBCE]">
                <Image
                  src={templatePhotos[9] || '/assets/wedding/templates/c165/photo_10.jpg'}
                  alt="Gallery 9"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <GalleryLightbox photos={templatePhotos.map((url, i) => ({ id: `p-${i}`, url, caption: '' }))} />
          </div>
        </section>

        {/* =========================================================================
            7. INTERACTIVE: RSVP, GIFT BOX, GUESTBOOK
        ========================================================================= */}
        <section className="py-10 px-6 bg-[#F5EFE6]/70 border-t border-[#EADBCE]">
          <div className="max-w-md mx-auto space-y-8">
            <RSVPForm events={data.events} initialGuestName={guestName} />
            <VietQRGiftBox groom={data.groom} bride={data.bride} />
            <GuestbookWishes initialWishes={data.wishes} />
          </div>
        </section>

        {/* =========================================================================
            8. FOOTER: CHÚC PHÚC & BRANDING LOVESTORY
        ========================================================================= */}
        <footer className="py-12 px-6 text-center border-t border-[#EADBCE] bg-[#FAF7F2]">
          <h4 className="font-serif italic text-xl text-[#3A2E2B]">Lâu rồi không gặp, hẹn gặp lại ở đám cưới!</h4>
          <p className="text-xs text-[#7A6A61] mt-2">
            Thiết kế thiệp cưới online cao cấp tại <span className="font-semibold text-[#8C7355]">LoveStory</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
