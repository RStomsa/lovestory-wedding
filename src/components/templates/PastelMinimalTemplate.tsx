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
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';

interface Props {
  data: WeddingData;
  guestName?: string;
  guestRole?: string;
  isMobileView?: boolean;
}

export default function PastelMinimalTemplate({ data, guestName, guestRole, isMobileView }: Props) {
  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#2d312e] font-sans relative overflow-x-hidden">
      <CurtainOpeningEffect
        color="blue"
        title="Wedding Invitation"
        subtitle={`${data.groom.shortName} & ${data.bride.shortName}`}
        guestName={guestName}
      />
      <FallingPetals type="petals" count={18} />
      <FloatingMusicPlayer audioUrl={data.music.url} songTitle={data.music.title} artist={data.music.artist} />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-between p-6 text-center">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.coverImage}
            alt="Wedding Cover"
            className="w-full h-full object-cover filter brightness-[0.95]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf7] via-[#fcfaf7]/50 to-transparent" />
        </div>

        <div className="relative z-10 pt-8">
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-stone-600 border-b border-stone-300 pb-1">
            Wedding Invitation
          </span>
        </div>

        <div className="relative z-10 my-auto py-10 space-y-4 max-w-xl px-2">
          <div className="flex items-center justify-center gap-2 text-stone-400">
            <span className="w-10 h-[1px] bg-stone-300" />
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="w-10 h-[1px] bg-stone-300" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-stone-800 tracking-wide leading-tight">
            <span>{data.groom.shortName}</span>{' '}
            <span className="font-serif italic text-rose-500 font-light">&amp;</span>{' '}
            <span>{data.bride.shortName}</span>
          </h1>

          <p className="text-xs sm:text-sm font-serif italic text-stone-600 max-w-md mx-auto leading-relaxed">
            &ldquo;{data.quote}&rdquo;
          </p>

          <div className="pt-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-stone-200 text-stone-700 text-xs font-medium tracking-widest">
              {formatDateVietnamese(data.mainDate)}
            </span>
          </div>
        </div>

        {guestName && (
          <div className="relative z-10 mb-4 px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200 shadow-sm max-w-xs w-full text-center">
            <p className="text-[11px] text-stone-500">Trân trọng kính mời:</p>
            <h3 className="text-sm sm:text-base font-serif font-bold text-stone-800">
              {guestName} {guestRole ? `(${guestRole})` : ''}
            </h3>
          </div>
        )}

        <div className="relative z-10 w-full max-w-xl pb-4">
          <CountdownTimer targetDate={data.mainDate} theme="pastel" />
        </div>
      </section>

      {/* COUPLE PROFILES */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
              The Happy Couple
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-800 mt-1">Đôi Uyên Ương</h2>
          </div>

          <div className={`grid gap-6 sm:gap-8 items-stretch ${isMobileView ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'}`}>
            {/* Groom Card */}
            <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-[#f7f5f0] border border-stone-200/60 shadow-sm w-full">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-lg mb-5 border-4 border-white flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.groom.avatar} alt={data.groom.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full font-bold mb-2">
                Chú Rể
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-2 leading-snug break-words">
                {data.groom.name}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">{data.groom.parents}</p>
            </div>

            {/* Bride Card */}
            <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-[#f7f5f0] border border-stone-200/60 shadow-sm w-full">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-lg mb-5 border-4 border-white flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.bride.avatar} alt={data.bride.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full font-bold mb-2">
                Cô Dâu
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-2 leading-snug break-words">
                {data.bride.name}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">{data.bride.parents}</p>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS SCHEDULE */}
      <section className="py-16 sm:py-20 px-4 bg-[#f4f1ea]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
              Save The Time
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-800 mt-1">Lịch Trình Đám Cưới</h2>
          </div>

          <div className={`grid gap-5 sm:gap-6 ${isMobileView ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'}`}>
            {data.events.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white shadow-sm border border-stone-200/70 text-center space-y-4 hover:shadow-md transition-shadow w-full"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-snug">{ev.title}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600 mt-2 font-medium flex-wrap">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{ev.time} • {formatDateVietnamese(ev.date)}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-3 border-t border-stone-100">
                  <h4 className="font-semibold text-xs sm:text-sm text-stone-900">{ev.locationName}</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{ev.address}</p>
                </div>

                {ev.mapUrl && (
                  <a
                    href={ev.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-800 text-xs font-semibold transition-colors shadow-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Xem Bản Đồ Chỉ Đường</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY & GALLERY */}
      <LoveStoryTimeline milestones={data.loveStory} />
      <GalleryLightbox photos={data.gallery} />

      {/* GIFTS & RSVP */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <VietQRGiftBox groom={data.groom} bride={data.bride} />
      </section>

      <section className="py-16 sm:py-20 px-4 bg-[#f7f5f0]">
        <RSVPForm events={data.events} />
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <GuestbookWishes initialWishes={data.wishes} />
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 text-center border-t border-stone-200 bg-[#f4f1ea] text-xs text-stone-500 space-y-1">
        <p className="font-serif text-sm text-stone-800 font-semibold">
          {data.groom.shortName} &amp; {data.bride.shortName} • Rất hân hạnh được đón tiếp
        </p>
        <p className="text-[11px] opacity-75">Nền tảng thiệp cưới điện ảnh</p>
      </footer>
    </div>
  );
}
