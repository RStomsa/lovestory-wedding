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
import { Clock, Navigation, Heart } from 'lucide-react';

interface Props {
  data: WeddingData;
  guestName?: string;
  guestRole?: string;
  isMobileView?: boolean;
}

export default function OurLoveStoryRoseTemplate({
  data,
  guestName,
  guestRole,
  isMobileView,
}: Props) {
  const weddingDate = useMemo(() => new Date(data.mainDate || '2026-12-15'), [data.mainDate]);
  const weddingDay = weddingDate.getDate();
  const weddingMonth = weddingDate.getMonth() + 1;
  const weddingYear = weddingDate.getFullYear();

  const mainEvent = data.events[0] || {
    time: '10:30',
    title: 'Tiệc Cưới Hoa Hồng Đỏ',
    locationName: 'Khách sạn Mường Thanh Luxury',
    address: 'Bãi Cháy, Hạ Long, Quảng Ninh',
    mapUrl: 'https://maps.google.com',
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2c2222] font-sans relative overflow-x-hidden selection:bg-rose-200 selection:text-rose-900">
      <CurtainOpeningEffect
        color="red"
        title="Our Love Story"
        subtitle={`${data.groom.shortName} & ${data.bride.shortName}`}
        guestName={guestName}
      />
      <FallingPetals type="petals" count={18} />
      <FloatingMusicPlayer
        audioUrl={data.music.url || 'https://assets.cinelove.me/mp3/5f4c5139-a13a-4ff0-82a2-e3a61240042f.mp3'}
        songTitle={data.music.title || 'Until You'}
        artist={data.music.artist || 'LoveStory'}
      />

      <div className={`mx-auto ${isMobileView ? 'max-w-[500px]' : 'max-w-[540px]'} shadow-2xl bg-[#FFFDF9]`}>
        {/* =========================================================================
            1. HERO COVER: HOA HỒNG ĐỎ & SAVE THE DATE
            ========================================================================= */}
        <section className="relative w-full min-h-[760px] flex flex-col justify-between overflow-hidden bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.coverImage || 'https://assets.cinelove.me/templates/assets/a2f11727-8717-46db-ada4-ff29271ce53b/0b6a64d0-658b-4bb9-916b-9fa6a26c68bc.jpeg'}
            alt="Wedding Cover Rose"
            className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.93]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />

          {/* Top Script Header */}
          <div className="relative z-10 pt-10 px-6 text-center">
            <span className="font-serif italic text-4xl sm:text-5xl text-white drop-shadow-md">
              Save The Date
            </span>
          </div>

          {/* Bottom Couple Name */}
          <div className="relative z-10 p-6 sm:p-8 text-white text-center space-y-2 select-none">
            <h1 className="font-serif italic text-4xl sm:text-5xl text-rose-100 drop-shadow-lg leading-tight">
              <span>{data.groom.name}</span>
              <span className="block text-2xl font-light my-1 text-rose-300">&amp;</span>
              <span>{data.bride.name}</span>
            </h1>

            <div className="flex justify-between items-center pt-4 border-t border-white/30 text-xs sm:text-sm uppercase tracking-widest font-serif text-stone-200">
              <span>Our wedding day</span>
              <span className="text-rose-200 font-semibold">Tháng {weddingMonth} / {weddingYear}</span>
            </div>
          </div>
        </section>

        {/* Khách mời */}
        {guestName && (
          <div className="p-4 bg-rose-50/70 border-b border-rose-100">
            <div className="p-4 rounded-xl bg-white border border-rose-200 text-center shadow-xs">
              <p className="text-[11px] uppercase tracking-widest text-rose-700 font-semibold">Trân trọng kính mời:</p>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mt-0.5">
                {guestName} {guestRole ? `(${guestRole})` : ''}
              </h3>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. CÔ DÂU & CHÚ RỂ PROFILE CARDS
            ========================================================================= */}
        <section className="py-12 px-6 space-y-8">
          {/* Cô dâu */}
          <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-[#FFF6F6] border border-rose-100 shadow-xs">
            <div className="w-36 h-36 rounded-full overflow-hidden shadow-lg mb-4 border-4 border-white flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.bride.avatar}
                alt={data.bride.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif italic text-sm text-rose-600">Cô dâu</span>
            <h3 className="text-xl font-serif font-bold tracking-wider uppercase text-stone-900 mt-1">
              {data.bride.name}
            </h3>
            <p className="text-xs text-stone-500 font-serif italic mt-0.5">20.08.2001</p>
            <p className="text-xs text-stone-600 mt-2 max-w-xs">{data.bride.parents}</p>
          </div>

          {/* Chú rể */}
          <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-[#FFF6F6] border border-rose-100 shadow-xs">
            <div className="w-36 h-36 rounded-full overflow-hidden shadow-lg mb-4 border-4 border-white flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.groom.avatar}
                alt={data.groom.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif italic text-sm text-rose-600">Chú rể</span>
            <h3 className="text-xl font-serif font-bold tracking-wider uppercase text-stone-900 mt-1">
              {data.groom.name}
            </h3>
            <p className="text-xs text-stone-500 font-serif italic mt-0.5">06.05.1998</p>
            <p className="text-xs text-stone-600 mt-2 max-w-xs">{data.groom.parents}</p>
          </div>
        </section>

        {/* =========================================================================
            3. OUR LOVE STORY (MEMO NOTE STYLE)
            ========================================================================= */}
        <section className="py-10 px-6 bg-[#FAF5EE]">
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#FFFDF9] border border-[#EBE3D5] shadow-sm relative space-y-3">
            <div className="w-12 h-1 bg-rose-500 rounded-full mx-auto mb-2" />
            <h3 className="text-center font-serif text-sm tracking-[0.2em] uppercase font-bold text-stone-800">
              OUR LOVE STORY
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light text-center italic">
              &ldquo;Giữa muôn vàn gặp gỡ, chúng mình may mắn tìm thấy nhau. Từ những ngày đầu bỡ ngỡ, qua bao vui buồn và thử thách, tình yêu vẫn lớn dần, hóa thành sự thấu hiểu và đồng hành. Hóa ra hạnh phúc chẳng phải điều xa xôi, mà là có một người để cùng sẻ chia, cùng nắm tay đi hết chặng đường dài phía trước.&rdquo;
            </p>
          </div>
        </section>

        {/* =========================================================================
            4. THỜI GIAN & ĐỊA ĐIỂM TIỆC MỪNG
            ========================================================================= */}
        <section className="py-12 px-6 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-serif text-rose-600 font-bold block">
            TIỆC MỪNG LỄ THÀNH HÔN
          </span>
          <p className="text-xs font-serif text-stone-600">Vào lúc {mainEvent.time}</p>

          <div className="flex items-center justify-center gap-4 my-2">
            <span className="text-xs font-serif uppercase tracking-widest text-stone-500">Tháng {weddingMonth}</span>
            <span className="font-serif text-6xl font-bold text-rose-900">{weddingDay}</span>
            <span className="text-xs font-serif uppercase tracking-widest text-stone-500">Năm {weddingYear}</span>
          </div>

          <p className="text-xs text-stone-500 italic">(Tức ngày 17 tháng 11 năm Bính Ngọ âm lịch)</p>

          <div className="pt-4 space-y-1">
            <h4 className="font-serif text-lg font-bold text-stone-900 uppercase">
              TẠI {mainEvent.locationName}
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">{mainEvent.address}</p>
          </div>

          {/* Bản đồ */}
          <div className="mt-4 rounded-2xl overflow-hidden border border-rose-100 shadow-sm max-w-md mx-auto aspect-[16/9] relative bg-stone-100">
            <iframe
              title="Rose Wedding Map"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-700 text-white text-xs font-medium hover:bg-rose-800 shadow-sm transition-transform active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Chỉ Đường Trên Google Maps</span>
            </a>
          </div>
        </section>

        {/* =========================================================================
            5. TIMELINE LỊCH TRÌNH TIỆC CƯỚI
            ========================================================================= */}
        <section className="py-12 px-6 bg-[#FFF8F8] border-t border-rose-100">
          <div className="text-center mb-8">
            <h3 className="font-serif italic text-3xl text-rose-800">Timeline</h3>
            <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">Lịch trình hôn lễ</p>
          </div>

          <div className="max-w-xs mx-auto space-y-6">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-rose-100 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold font-serif text-rose-800">10:30</span>
                <p className="text-xs text-stone-700 font-medium">Đón tiếp khách mời</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-rose-100 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                <Heart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold font-serif text-rose-800">10:45</span>
                <p className="text-xs text-stone-700 font-medium">Lễ thành hôn trang trọng</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-rose-100 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                <span className="text-base">🥂</span>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold font-serif text-rose-800">11:00</span>
                <p className="text-xs text-stone-700 font-medium">Khai tiệc mừng chung vui</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. GALLERY LIGHTBOX
            ========================================================================= */}
        <section className="py-12 px-5 space-y-4">
          <div className="text-center pb-2">
            <span className="text-sm uppercase tracking-[0.25em] font-serif font-bold text-rose-800">
              ALBUM HÌNH CƯỚI
            </span>
          </div>
          <GalleryLightbox photos={data.gallery} />
        </section>

        {/* =========================================================================
            7. COUNTDOWN & LỜI CẢM ƠN
            ========================================================================= */}
        <section className="py-10 px-6 bg-[#FAF5EE] border-t border-[#EBE3D5]">
          <div className="text-center mb-6">
            <h3 className="font-serif italic text-3xl text-rose-900">Countdown</h3>
            <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">Đếm ngược ngày chung đôi</p>
          </div>
          <div className="max-w-md mx-auto">
            <CountdownTimer targetDate={data.mainDate} theme="burgundy" />
          </div>
        </section>

        {/* =========================================================================
            8. TƯƠNG TÁC (RSVP, MỪNG CƯỚI, SỔ LƯU BÚT)
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

        {/* Ending Note */}
        <footer className="p-8 text-center bg-rose-950 text-rose-100 space-y-3">
          <p className="text-xs sm:text-sm font-light italic leading-relaxed max-w-sm mx-auto">
            &ldquo;Cảm ơn bạn đã dành tình cảm cho chúng mình! Sự hiện diện của bạn chính là món quà ý nghĩa nhất, và chúng mình vô cùng trân quý khi được cùng bạn chia sẻ niềm hạnh phúc trong ngày trọng đại này.&rdquo;
          </p>
          <div className="pt-2">
            <span className="font-serif italic text-2xl text-rose-200">
              {data.groom.shortName} &amp; {data.bride.shortName}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
