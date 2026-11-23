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
  coverId?: string; // 'default' | 'pink_clouds' | 'green_envelope' | 'white_envelope' | 'rose_garden' | 'red_garden' | 'pastel_garden' | 'blue_garden'
  autoOpen?: boolean;
}

const ENVELOPE_THEMES: Record<string, {
  name: string;
  pocketBg: string;
  leftRightFlap: string;
  bottomFlap: string;
  topFlap: string;
  sealGradient: string;
  sealBorder: string;
  sealText: string;
  sealIconColor: string;
  decor?: string;
}> = {
  default: {
    name: 'Mặc định',
    pocketBg: '#8B1E2F',
    leftRightFlap: '#7A1928',
    bottomFlap: '#6B1522',
    topFlap: '#7A1928',
    sealGradient: 'from-[#E5BA5A] via-[#C5A059] to-[#997732]',
    sealBorder: '#FFE29A',
    sealText: 'LOVE',
    sealIconColor: '#4A3510',
  },
  pink_clouds: {
    name: 'Mây hồng',
    pocketBg: 'linear-gradient(135deg, #FFCAD4 0%, #FAD2E1 50%, #FDE2E4 100%)',
    leftRightFlap: '#F7CAD0',
    bottomFlap: '#F5BAC2',
    topFlap: '#F7CAD0',
    sealGradient: 'from-[#F28482] via-[#E07A5F] to-[#C8644A]',
    sealBorder: '#FFD6BA',
    sealText: 'SWEET',
    sealIconColor: '#FFFFFF',
    decor: '🌸',
  },
  green_envelope: {
    name: 'Phong bì xanh',
    pocketBg: '#2D4A3E',
    leftRightFlap: '#243D33',
    bottomFlap: '#1D322A',
    topFlap: '#243D33',
    sealGradient: 'from-[#D4AF37] via-[#AA8A2E] to-[#7A631E]',
    sealBorder: '#F3E5AB',
    sealText: 'FOREVER',
    sealIconColor: '#2D4A3E',
    decor: '🌿',
  },
  white_envelope: {
    name: 'Phong bì trắng',
    pocketBg: '#F8F9FA',
    leftRightFlap: '#E9ECEF',
    bottomFlap: '#DEE2E6',
    topFlap: '#E9ECEF',
    sealGradient: 'from-[#A89078] via-[#8C7355] to-[#6A533C]',
    sealBorder: '#E0D0C0',
    sealText: 'INVITE',
    sealIconColor: '#FFFFFF',
    decor: '✨',
  },
  rose_garden: {
    name: 'Vườn hoa hồng',
    pocketBg: '#590D22',
    leftRightFlap: '#480A1B',
    bottomFlap: '#370714',
    topFlap: '#480A1B',
    sealGradient: 'from-[#FFC93C] via-[#FFB703] to-[#C98B00]',
    sealBorder: '#FFF0BA',
    sealText: 'WEDDING',
    sealIconColor: '#590D22',
    decor: '🌹',
  },
  red_garden: {
    name: 'Vườn hoa đỏ',
    pocketBg: '#9B1D20',
    leftRightFlap: '#80171A',
    bottomFlap: '#661214',
    topFlap: '#80171A',
    sealGradient: 'from-[#FF5E62] via-[#E63946] to-[#BA2633]',
    sealBorder: '#FFA8AE',
    sealText: 'HAPPY',
    sealIconColor: '#FFFFFF',
    decor: '🌺',
  },
  pastel_garden: {
    name: 'Vườn hoa pastel',
    pocketBg: '#FDE2E4',
    leftRightFlap: '#F7CAD0',
    bottomFlap: '#F0B7C0',
    topFlap: '#F7CAD0',
    sealGradient: 'from-[#DDA15E] via-[#BC6C25] to-[#8C4F18]',
    sealBorder: '#FFE2B8',
    sealText: 'ROMANCE',
    sealIconColor: '#FFFFFF',
    decor: '🌼',
  },
  blue_garden: {
    name: 'Vườn hoa lam',
    pocketBg: '#1D3557',
    leftRightFlap: '#162942',
    bottomFlap: '#0F1D30',
    topFlap: '#162942',
    sealGradient: 'from-[#4EA8DE] via-[#457B9D] to-[#2B546F]',
    sealBorder: '#BEE1E6',
    sealText: 'ETERNAL',
    sealIconColor: '#FFFFFF',
    decor: '💠',
  },
};

export default function EnvelopeOpeningEffect({
  groomName = 'Minh Trí',
  brideName = 'Thanh Hằng',
  guestName,
  weddingDate = '28 . 12 . 2026',
  onOpen,
  primaryColor = '#8C7355',
  coverId = 'default',
  autoOpen = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const theme = ENVELOPE_THEMES[coverId] || ENVELOPE_THEMES.default;

  // Auto-open timer if enabled
  React.useEffect(() => {
    if (autoOpen && !isOpen && !isAnimating) {
      const timer = setTimeout(() => {
        handleOpenEnvelope();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, isOpen, isAnimating]);

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
        <div
          className="absolute inset-0 rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col justify-end p-6"
          style={{ background: theme.pocketBg }}
        >
          {/* Subtle Paper Texture Lines */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Invitation Card Peek (Slides up when opening) */}
          <div
            className={`absolute inset-x-4 bottom-4 top-8 bg-white dark:bg-stone-900 rounded-xl p-5 shadow-lg border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-between text-center transition-all duration-700 ease-out ${
              isOpen ? '-translate-y-36 opacity-100 scale-105' : 'translate-y-2 opacity-90'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7355] font-semibold block">
                Wedding Invitation
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                {groomName} &amp; {brideName}
              </h2>
              <p className="text-[11px] text-[#7A6A61] dark:text-stone-400 font-mono tracking-wider">
                {weddingDate}
              </p>
            </div>

            {guestName && (
              <div className="py-2 px-4 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-serif text-stone-800 dark:text-stone-200">
                Kính gửi: <strong className="font-bold">{guestName}</strong>
              </div>
            )}

            <div className="flex items-center gap-1 text-[10px] text-[#8C7355] dark:text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span>Chạm con dấu để mở thiệp</span>
            </div>
          </div>

          {/* Left Flap */}
          <div
            className="absolute left-0 bottom-0 top-0 w-1/2 origin-left border-r border-black/10"
            style={{ backgroundColor: theme.leftRightFlap, clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
          />

          {/* Right Flap */}
          <div
            className="absolute right-0 bottom-0 top-0 w-1/2 origin-right border-l border-black/10"
            style={{ backgroundColor: theme.leftRightFlap, clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
          />

          {/* Bottom Flap */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom border-t border-black/10 shadow-xs"
            style={{ backgroundColor: theme.bottomFlap, clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
          />

          {/* Top Flap (Opens with 3D Flip) */}
          <div
            className={`absolute inset-x-0 top-0 h-1/2 origin-top shadow-md border-b border-black/15 transition-transform duration-700 ease-in-out z-20 ${
              isOpen ? '-rotate-180 opacity-0 pointer-events-none' : 'rotate-0'
            }`}
            style={{
              backgroundColor: theme.topFlap,
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
                className="group relative flex flex-col items-center justify-center focus:outline-none transition-transform active:scale-95 hover:scale-105 cursor-pointer"
              >
                {/* Glowing Aura Ring */}
                <div className="absolute w-20 h-20 rounded-full bg-amber-400/30 blur-md animate-pulse" />

                {/* Wax Seal Circle */}
                <div
                  className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${theme.sealGradient} shadow-xl border-2 flex flex-col items-center justify-center text-white`}
                  style={{ borderColor: theme.sealBorder }}
                >
                  <Heart className="w-5 h-5 fill-white/90 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-serif font-black tracking-widest mt-0.5">
                    {theme.sealText}
                  </span>

                  {/* Stamp Ring Texture */}
                  <div className="absolute inset-1.5 rounded-full border border-dashed border-white/40 pointer-events-none" />
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
