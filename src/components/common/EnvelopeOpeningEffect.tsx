'use client';

import React, { useState } from 'react';
import { Mail, Sparkles, Heart } from 'lucide-react';

interface Props {
  groomName?: string;
  brideName?: string;
  guestName?: string;
  weddingDate?: string;
  onOpen?: () => void;
  primaryColor?: string; // e.g. '#8C7355' or '#590d22'
}

export default function EnvelopeOpeningEffect({
  groomName = 'Minh Trí',
  brideName = 'Thanh Hằng',
  guestName,
  weddingDate = '28 . 12 . 2026',
  onOpen,
  primaryColor = '#8C7355',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleOpenEnvelope = () => {
    if (isOpen || isAnimating) return;
    setIsAnimating(true);

    // Audio click effect if supported
    try {
      const audio = new Audio('/assets/wedding/mp3/click.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {
      // ignore
    }

    // Step 1: Seal breaks
    setTimeout(() => {
      setIsOpen(true);
      if (onOpen) onOpen();
    }, 400);

    // Step 2: Dismiss envelope overlay completely after smooth animation
    setTimeout(() => {
      setIsDismissed(true);
    }, 1400);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 select-none ${
        isOpen
          ? 'bg-black/20 backdrop-blur-none pointer-events-none opacity-0 -translate-y-12'
          : 'bg-stone-950/85 backdrop-blur-md'
      }`}
    >
      {/* Container Envelope */}
      <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center">
        {/* Envelope Body (Background Pocket) */}
        <div className="absolute inset-0 bg-[#F5EFE6] rounded-2xl shadow-2xl border border-[#EADBCE] overflow-hidden flex flex-col justify-end p-6">
          {/* Subtle Paper Texture Lines */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8C7355_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Invitation Card Peek (Slides up when opening) */}
          <div
            className={`absolute inset-x-4 bottom-4 top-8 bg-white rounded-xl p-5 shadow-lg border border-[#EADBCE] flex flex-col items-center justify-between text-center transition-all duration-700 ease-out ${
              isOpen ? '-translate-y-36 opacity-100 scale-105' : 'translate-y-2 opacity-90'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7355] font-semibold block">
                Wedding Invitation
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#3A2E2B]">
                {groomName} &amp; {brideName}
              </h2>
              <p className="text-[11px] text-[#7A6A61] font-mono tracking-wider">
                {weddingDate}
              </p>
            </div>

            {guestName && (
              <div className="py-2 px-4 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-xs font-serif text-[#594B43]">
                Kính gửi: <strong className="text-[#3A2E2B] font-bold">{guestName}</strong>
              </div>
            )}

            <div className="flex items-center gap-1 text-[10px] text-[#8C7355]">
              <Sparkles className="w-3 h-3" />
              <span>Chạm con dấu để mở thiệp</span>
            </div>
          </div>

          {/* Left Flap */}
          <div
            className="absolute left-0 bottom-0 top-0 w-1/2 bg-[#EDE3D6] origin-left border-r border-[#D5BF9E]/40"
            style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
          />

          {/* Right Flap */}
          <div
            className="absolute right-0 bottom-0 top-0 w-1/2 bg-[#EDE3D6] origin-right border-l border-[#D5BF9E]/40"
            style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
          />

          {/* Bottom Flap */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-[#E4D5C3] origin-bottom border-t border-[#D5BF9E]/60 shadow-xs"
            style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
          />

          {/* Top Flap (Opens with 3D Flip) */}
          <div
            className={`absolute inset-x-0 top-0 h-1/2 bg-[#EADBCE] origin-top shadow-md border-b border-[#D5BF9E]/60 transition-transform duration-700 ease-in-out z-20 ${
              isOpen ? '-rotate-180 opacity-0 pointer-events-none' : 'rotate-0'
            }`}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Centered Wax Seal (Button to Open) */}
          {!isOpen && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
              <button
                type="button"
                onClick={handleOpenEnvelope}
                className="group relative flex flex-col items-center justify-center focus:outline-none transition-transform active:scale-95 hover:scale-105"
              >
                {/* Glowing Aura Ring */}
                <div className="absolute w-20 h-20 rounded-full bg-amber-400/30 blur-md animate-pulse" />

                {/* Wax Seal Circle */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#A73737] via-[#852525] to-[#591414] shadow-xl border-2 border-[#D4A373]/80 flex flex-col items-center justify-center text-amber-200">
                  <Heart className="w-5 h-5 fill-amber-200/90 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-serif font-black tracking-widest mt-0.5">
                    LOVE
                  </span>

                  {/* Stamp Ring Texture */}
                  <div className="absolute inset-1.5 rounded-full border border-dashed border-amber-300/40 pointer-events-none" />
                </div>

                {/* Hint Pill */}
                <div className="mt-4 px-3.5 py-1 rounded-full bg-stone-900/90 backdrop-blur-sm text-white text-[10px] font-medium tracking-wide shadow-lg border border-stone-700 flex items-center gap-1.5 animate-bounce">
                  <Mail className="w-3 h-3 text-amber-300" />
                  <span>Chạm vào con dấu để mở thiệp</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
