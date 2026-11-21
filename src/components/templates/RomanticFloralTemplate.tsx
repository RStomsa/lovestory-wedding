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

export default function RomanticFloralTemplate({ data, guestName, guestRole, isMobileView }: Props) {
  return (
    <div className="min-h-screen bg-[#fff5f5] text-[#4a2828] font-sans relative overflow-x-hidden">
      <CurtainOpeningEffect
        color="pink"
        title="Lễ Thành Hôn"
        subtitle={`${data.groom.shortName} & ${data.bride.shortName}`}
        guestName={guestName}
      />
      <FallingPetals type="hearts" count={20} />
      <FloatingMusicPlayer audioUrl={data.music.url} songTitle={data.music.title} artist={data.music.artist} />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-between p-6 text-center">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.coverImage}
            alt="Wedding Cover"
            className="w-full h-full object-cover filter brightness-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fff5f5] via-[#fff5f5]/60 to-black/20" />
        </div>

        <div className="relative z-10 pt-8">
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-rose-800 border-b border-rose-300 pb-1">
            Save The Date
          </span>
        </div>

        <div className="relative z-10 my-auto py-10 space-y-4 max-w-xl px-2">
          <h1 className="text-3xl sm:text-5xl font-serif text-rose-950 tracking-wide leading-tight">
            <span>{data.groom.shortName}</span>{' '}
            <span className="font-serif italic text-rose-400 font-light">&amp;</span>{' '}
            <span>{data.bride.shortName}</span>
          </h1>

          <p className="text-xs sm:text-sm font-serif italic text-stone-700 max-w-md mx-auto leading-relaxed">
            &ldquo;{data.quote}&rdquo;
          </p>

          <div className="pt-2">
            <span className="inline-block px-5 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-rose-200 text-rose-800 text-xs font-semibold tracking-widest">
              {formatDateVietnamese(data.mainDate)}
            </span>
          </div>
        </div>

        {guestName && (
          <div className="relative z-10 mb-4 px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200 shadow-md max-w-xs w-full text-center">
            <p className="text-[11px] text-rose-600">Trân trọng kính mời:</p>
            <h3 className="text-sm sm:text-base font-serif font-bold text-rose-950">
              {guestName} {guestRole ? `(${guestRole})` : ''}
            </h3>
          </div>
        )}

        <div className="relative z-10 w-full max-w-xl pb-4">
          <CountdownTimer targetDate={data.mainDate} theme="pastel" />
        </div>
      </section>

      {/* PROFILES */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-serif text-rose-950 mb-12">Cô Dâu &amp; Chú Rể</h2>
          <div className={`grid gap-6 sm:gap-8 items-stretch ${isMobileView ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'}`}>
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/70 border border-rose-200/60 shadow-sm flex flex-col items-center w-full">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-md mb-5 border-4 border-white flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.groom.avatar} alt={data.groom.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-rose-600 font-bold px-3 py-0.5 bg-rose-100 rounded-full mb-2">
                Chú Rể
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-rose-950 mb-2 leading-snug break-words">
                {data.groom.name}
              </h3>
              <p className="text-xs text-stone-600 max-w-xs leading-relaxed">{data.groom.parents}</p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/70 border border-rose-200/60 shadow-sm flex flex-col items-center w-full">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-md mb-5 border-4 border-white flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.bride.avatar} alt={data.bride.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-rose-600 font-bold px-3 py-0.5 bg-rose-100 rounded-full mb-2">
                Cô Dâu
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-rose-950 mb-2 leading-snug break-words">
                {data.bride.name}
              </h3>
              <p className="text-xs text-stone-600 max-w-xs leading-relaxed">{data.bride.parents}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="py-16 sm:py-20 px-4 bg-[#fff0f0]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-serif text-rose-950 mb-12">Lịch Trình Hôn Lễ</h2>
          <div className={`grid gap-5 sm:gap-6 ${isMobileView ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'}`}>
            {data.events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 sm:p-6 rounded-2xl bg-white shadow-sm border border-rose-100 flex flex-col justify-between space-y-4 w-full"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-rose-950 leading-snug">{ev.title}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 mt-2 font-medium flex-wrap">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{ev.time} • {formatDateVietnamese(ev.date)}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-rose-100 text-center">
                  <h4 className="font-semibold text-xs sm:text-sm text-stone-900">{ev.locationName}</h4>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{ev.address}</p>
                </div>
                {ev.mapUrl && (
                  <a
                    href={ev.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
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

      <section className="py-16 sm:py-20 px-4 bg-white">
        <VietQRGiftBox groom={data.groom} bride={data.bride} />
      </section>

      <section className="py-16 sm:py-20 px-4 bg-[#fff0f0]">
        <RSVPForm events={data.events} />
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <GuestbookWishes initialWishes={data.wishes} />
      </section>

      <footer className="py-12 px-4 text-center border-t border-rose-200 bg-[#ffebee] text-xs text-rose-800 space-y-1">
        <p className="font-serif text-sm font-semibold">
          {data.groom.shortName} &amp; {data.bride.shortName} • Hân hoan chào đón
        </p>
        <p className="text-[11px] opacity-75">Nền tảng thiệp cưới điện ảnh</p>
      </footer>
    </div>
  );
}
