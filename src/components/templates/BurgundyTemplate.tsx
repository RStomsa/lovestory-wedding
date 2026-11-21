'use client';

import React from 'react';
import { WeddingData } from '@/types/wedding';
import { formatDateVietnamese } from '@/lib/utils';
import CountdownTimer from '@/components/common/CountdownTimer';
import VietQRGiftBox from '@/components/common/VietQRGiftBox';
import RSVPForm from '@/components/common/RSVPForm';
import GuestbookWishes from '@/components/common/GuestbookWishes';
import GalleryLightbox from '@/components/common/GalleryLightbox';
import LoveStoryTimeline from '@/components/common/LoveStoryTimeline';
import FloatingMusicPlayer from '@/components/common/FloatingMusicPlayer';
import FallingPetals from '@/components/common/FallingPetals';
import CurtainOpeningEffect from '@/components/common/CurtainOpeningEffect';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

interface Props {
  data: WeddingData;
  guestName?: string;
  guestRole?: string;
  isMobileView?: boolean;
}

export default function BurgundyTemplate({ data, guestName, guestRole, isMobileView }: Props) {
  return (
    <div className="min-h-screen bg-[#2c080e] text-[#fcf6ee] selection:bg-[#800f2f] selection:text-white font-sans relative overflow-x-hidden">
      <CurtainOpeningEffect
        color="red"
        title="Lễ Thành Hôn"
        subtitle={`${data.groom.shortName} & ${data.bride.shortName}`}
        guestName={guestName}
      />
      {/* Floating Elements */}
      <FallingPetals type="petals" count={25} />
      <FloatingMusicPlayer audioUrl={data.music.url} songTitle={data.music.title} artist={data.music.artist} />

      {/* 1. HERO SECTION (Cinematic Cover) */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-between p-6 text-center overflow-hidden">
        {/* Background Image with Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.coverImage}
            alt="Wedding Cover"
            className="w-full h-full object-cover scale-105 animate-pulse"
            style={{ animationDuration: '10s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c080e] via-[#2c080e]/60 to-black/70 backdrop-blur-[1px]" />
        </div>

        {/* Top Tagline */}
        <div className="relative z-10 pt-8 animate-fade-in">
          <span className="text-[11px] sm:text-xs tracking-[0.35em] uppercase text-amber-200/90 font-medium border-b border-amber-200/30 pb-1">
            Save The Date • Lễ Thành Hôn
          </span>
        </div>

        {/* Center Couple Names */}
        <div className="relative z-10 my-auto py-10 max-w-xl space-y-4 px-2">
          <div className="flex items-center justify-center gap-3 text-amber-300">
            <span className="w-8 h-[1px] bg-amber-300/60" />
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="w-8 h-[1px] bg-amber-300/60" />
          </div>

          <h1 className="text-3xl sm:text-6xl font-serif font-normal tracking-wide text-amber-100 drop-shadow-lg leading-tight">
            <span>{data.groom.shortName}</span>{' '}
            <span className="text-rose-400 font-light italic">&amp;</span>{' '}
            <span>{data.bride.shortName}</span>
          </h1>

          <p className="text-xs sm:text-base font-serif italic text-stone-200/90 max-w-lg mx-auto leading-relaxed px-2">
            &ldquo;{data.quote}&rdquo;
          </p>

          <div className="pt-2">
            <div className="inline-block px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-medium tracking-widest">
              {formatDateVietnamese(data.mainDate)}
            </div>
          </div>
        </div>

        {/* Guest Personalized Greeting Card */}
        {guestName && (
          <div className="relative z-10 mb-4 px-5 py-3 rounded-2xl bg-[#590d22]/80 backdrop-blur-md border border-amber-400/40 shadow-xl max-w-xs w-full text-center">
            <p className="text-xs text-amber-200">Trân trọng kính mời:</p>
            <h3 className="text-base sm:text-lg font-serif font-bold text-white">
              {guestName} {guestRole ? `(${guestRole})` : ''}
            </h3>
            <p className="text-[11px] text-stone-300">Đến tham dự ngày vui của chúng tôi</p>
          </div>
        )}

        {/* Bottom Countdown */}
        <div className="relative z-10 w-full max-w-xl pb-6">
          <CountdownTimer targetDate={data.mainDate} theme="burgundy" />
        </div>
      </section>

      {/* 2. BRIDE & GROOM PROFILE SECTION */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-[#2c080e] to-[#3f0c15]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs tracking-[0.25em] uppercase text-amber-300 font-semibold">
              Đôi Uyên Ương
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif text-amber-100 mt-2">
              Cô Dâu &amp; Chú Rể
            </h2>
          </div>

          <div className={`grid gap-8 items-stretch ${isMobileView ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'}`}>
            {/* Groom */}
            <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-amber-400/20 shadow-xl w-full">
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-amber-400/40 shadow-2xl mb-5 group flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.groom.avatar}
                  alt={data.groom.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3 py-0.5 rounded-full mb-2">
                Chú Rể
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 mb-2 leading-snug break-words">
                {data.groom.name}
              </h3>
              <p className="text-xs text-stone-300 max-w-xs leading-relaxed">
                {data.groom.parents}
              </p>
            </div>

            {/* Bride */}
            <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-amber-400/20 shadow-xl w-full">
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-amber-400/40 shadow-2xl mb-5 group flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.bride.avatar}
                  alt={data.bride.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3 py-0.5 rounded-full mb-2">
                Cô Dâu
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 mb-2 leading-snug break-words">
                {data.bride.name}
              </h3>
              <p className="text-xs text-stone-300 max-w-xs leading-relaxed">
                {data.bride.parents}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WEDDING EVENTS SCHEDULE */}
      <section className="py-16 sm:py-20 px-4 bg-[#23060b]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs tracking-[0.25em] uppercase text-amber-300 font-semibold">
              Thời Gian &amp; Địa Điểm
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif text-amber-100 mt-2">
              Lịch Trình Hôn Lễ
            </h2>
          </div>

          <div className={`grid gap-5 sm:gap-6 ${isMobileView ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'}`}>
            {data.events.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-[#3f0c15]/60 backdrop-blur-md border border-amber-400/30 shadow-xl text-center space-y-4 hover:border-amber-400 transition-all w-full"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-xl font-serif font-bold text-amber-100 leading-snug">{ev.title}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200 mt-2 font-medium flex-wrap">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{ev.time} • {formatDateVietnamese(ev.date)}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-4 border-t border-amber-400/20">
                  <h4 className="font-semibold text-xs sm:text-sm text-stone-100">{ev.locationName}</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">{ev.address}</p>
                </div>

                {ev.mapUrl && (
                  <a
                    href={ev.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-semibold transition-colors shadow-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Xem Chỉ Đường</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LOVE STORY TIMELINE */}
      <LoveStoryTimeline milestones={data.loveStory} />

      {/* 5. WEDDING PHOTO GALLERY (LIGHTBOX) */}
      <GalleryLightbox photos={data.gallery} />

      {/* 6. SMART VIETQR GIFT BOX */}
      <section className="py-16 sm:py-20 px-4 bg-[#2c080e]">
        <VietQRGiftBox groom={data.groom} bride={data.bride} />
      </section>

      {/* 7. RSVP FORM */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-[#2c080e] to-[#20050a]">
        <RSVPForm events={data.events} />
      </section>

      {/* 8. GUESTBOOK / WISHES */}
      <section className="py-16 sm:py-20 bg-[#20050a]">
        <GuestbookWishes initialWishes={data.wishes} />
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 text-center border-t border-amber-400/20 bg-black/40 text-xs text-stone-400 space-y-2">
        <p className="font-serif text-sm text-amber-200 font-semibold">
          {data.groom.shortName} &amp; {data.bride.shortName} • Trân trọng từng khoảnh khắc
        </p>
        <p className="text-[11px] opacity-75">Nền tảng thiệp cưới điện ảnh</p>
      </footer>
    </div>
  );
}
