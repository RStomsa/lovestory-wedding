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
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Props {
  data: WeddingData;
  guestName?: string;
  guestRole?: string;
  isMobileView?: boolean;
}

export default function RetroFilmTemplate({ data, guestName, guestRole, isMobileView }: Props) {
  return (
    <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] font-serif relative overflow-x-hidden selection:bg-amber-800 selection:text-white">
      <CurtainOpeningEffect
        color="red"
        title="Lễ Thành Hôn"
        subtitle={`${data.groom.shortName} & ${data.bride.shortName}`}
        guestName={guestName}
      />
      <FallingPetals type="sparkles" count={20} />
      <FloatingMusicPlayer audioUrl={data.music.url} songTitle={data.music.title} artist={data.music.artist} />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-between p-6 text-center">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.coverImage}
            alt="Wedding Cover"
            className="w-full h-full object-cover filter sepia-[0.3] contrast-[1.1] brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-[#1c1917]/40 to-black/60" />
        </div>

        <div className="relative z-10 pt-8">
          <span className="text-[11px] tracking-[0.4em] uppercase text-amber-400 font-mono border-b border-amber-400/40 pb-1">
            CINEMATIC FILM • 35MM
          </span>
        </div>

        <div className="relative z-10 my-auto py-10 space-y-4 max-w-xl px-2">
          <h1 className="text-3xl sm:text-6xl text-amber-100 tracking-wider font-bold leading-tight">
            <span>{data.groom.shortName}</span> <span className="text-amber-500 font-light">&amp;</span> <span>{data.bride.shortName}</span>
          </h1>

          <p className="text-xs sm:text-sm italic text-stone-300 max-w-md mx-auto leading-relaxed">
            &ldquo;{data.quote}&rdquo;
          </p>

          <div className="pt-2">
            <span className="inline-block px-5 py-2 border border-amber-400/60 bg-black/60 backdrop-blur-md text-amber-300 text-xs tracking-widest font-mono">
              {formatDateVietnamese(data.mainDate)}
            </span>
          </div>
        </div>

        {guestName && (
          <div className="relative z-10 mb-4 px-5 py-3 bg-stone-900/90 border border-amber-500/40 shadow-xl max-w-xs w-full text-center">
            <p className="text-[11px] text-amber-400">Trân trọng kính mời:</p>
            <h3 className="text-sm sm:text-base font-bold text-amber-100">
              {guestName} {guestRole ? `(${guestRole})` : ''}
            </h3>
          </div>
        )}

        <div className="relative z-10 w-full max-w-xl pb-4">
          <CountdownTimer targetDate={data.mainDate} theme="dark" />
        </div>
      </section>

      {/* PROFILES */}
      <section className="py-16 sm:py-20 px-4 bg-[#292524]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl text-amber-100 mb-12">Đôi Uyên Ương</h2>
          <div className={`grid gap-6 sm:gap-8 items-stretch ${isMobileView ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'}`}>
            {/* Groom Polaroid */}
            <div className="p-5 sm:p-6 bg-[#fafaf9] text-stone-900 rounded-sm shadow-2xl flex flex-col items-center transform -rotate-1 hover:rotate-0 transition-transform w-full">
              <div className="w-full aspect-[4/5] max-w-[240px] overflow-hidden bg-stone-200 mb-4 filter sepia-[0.2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.groom.avatar} alt={data.groom.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-stone-500 font-mono">Chú Rể</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-2 leading-snug break-words">{data.groom.name}</h3>
              <p className="text-xs text-stone-600 max-w-xs leading-relaxed">{data.groom.parents}</p>
            </div>

            {/* Bride Polaroid */}
            <div className="p-5 sm:p-6 bg-[#fafaf9] text-stone-900 rounded-sm shadow-2xl flex flex-col items-center transform rotate-1 hover:rotate-0 transition-transform w-full">
              <div className="w-full aspect-[4/5] max-w-[240px] overflow-hidden bg-stone-200 mb-4 filter sepia-[0.2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.bride.avatar} alt={data.bride.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-stone-500 font-mono">Cô Dâu</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-2 leading-snug break-words">{data.bride.name}</h3>
              <p className="text-xs text-stone-600 max-w-xs leading-relaxed">{data.bride.parents}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="py-16 sm:py-20 px-4 bg-[#1c1917]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl text-amber-100 mb-12">Lịch Trình Hôn Lễ</h2>
          <div className={`grid gap-5 sm:gap-6 ${isMobileView ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'}`}>
            {data.events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 sm:p-6 bg-[#292524] border border-stone-700 flex flex-col justify-between space-y-4 w-full"
              >
                <div>
                  <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-base sm:text-xl font-bold text-amber-100 leading-snug">{ev.title}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 mt-2 font-mono flex-wrap">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{ev.time} • {formatDateVietnamese(ev.date)}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-stone-700 text-xs text-center space-y-1">
                  <h4 className="font-bold text-stone-200">{ev.locationName}</h4>
                  <p className="text-stone-400 leading-relaxed">{ev.address}</p>
                </div>
                {ev.mapUrl && (
                  <a
                    href={ev.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 border border-amber-400/40 hover:bg-amber-400/10 text-amber-200 text-xs tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Chỉ Đường</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <LoveStoryTimeline milestones={data.loveStory} />
      <GalleryLightbox photos={data.gallery} />

      <section className="py-16 sm:py-20 px-4 bg-[#292524]">
        <VietQRGiftBox groom={data.groom} bride={data.bride} />
      </section>

      <section className="py-16 sm:py-20 px-4 bg-[#1c1917]">
        <RSVPForm events={data.events} />
      </section>

      <section className="py-16 sm:py-20 bg-[#292524]">
        <GuestbookWishes initialWishes={data.wishes} />
      </section>

      <footer className="py-12 px-4 text-center border-t border-stone-800 bg-black text-xs text-stone-400 space-y-1 font-mono">
        <p className="text-amber-200">
          {data.groom.shortName} &amp; {data.bride.shortName} • FOREVER &amp; ALWAYS
        </p>
        <p className="text-[11px] opacity-70">VINTAGE FILM WEDDING INVITATION</p>
      </footer>
    </div>
  );
}
