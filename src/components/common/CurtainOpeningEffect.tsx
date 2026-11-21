'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CurtainOpeningEffectProps {
  color?: 'red' | 'blue' | 'pink';
  title?: string;
  subtitle?: string;
  guestName?: string;
  onOpen?: () => void;
}

export default function CurtainOpeningEffect({
  color = 'red',
  title = 'Lễ Thành Hôn',
  subtitle = 'Chú Rể & Cô Dâu',
  guestName,
  onOpen,
}: CurtainOpeningEffectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const leftCurtain = `/assets/wedding/opening-effects/curtain-${color}-left.webp`;
  const rightCurtain = `/assets/wedding/opening-effects/curtain-${color}-right.webp`;

  const handleOpen = () => {
    setIsOpen(true);
    if (onOpen) onOpen();
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="fixed inset-0 z-50 overflow-hidden pointer-events-auto flex items-center justify-center select-none"
        >
          {/* Left Curtain */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="absolute top-0 left-0 w-1/2 h-full z-10 bg-cover bg-right shadow-2xl"
            style={{
              backgroundImage: `url(${leftCurtain})`,
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
            }}
          />

          {/* Right Curtain */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="absolute top-0 right-0 w-1/2 h-full z-10 bg-cover bg-left shadow-2xl"
            style={{
              backgroundImage: `url(${rightCurtain})`,
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
            }}
          />

          {/* Center Seal / Invitation Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-20 flex flex-col items-center justify-center text-center p-6 max-w-xs"
          >
            {/* Wax Seal with pulsating glow */}
            <div
              onClick={handleOpen}
              className="cursor-pointer group flex flex-col items-center gap-3 transition-transform active:scale-95 hover:scale-105"
            >
              <div className="relative w-24 h-24 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/wedding/plugins/wax-seal.webp"
                  alt="Wax Seal"
                  className="w-full h-full object-contain filter drop-shadow-md animate-pulse"
                />
              </div>

              <div className="bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-amber-300/40 shadow-xl text-center">
                <span className="text-amber-200 text-xs font-serif tracking-widest uppercase block font-semibold">
                  Chạm để mở thiệp
                </span>
              </div>
            </div>

            {/* Couple names & guest mention */}
            <div className="mt-4 space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-amber-100/80 font-medium">
                {title}
              </span>
              <h2 className="font-serif text-2xl text-white font-bold drop-shadow-md">
                {subtitle}
              </h2>
              {guestName && (
                <p className="text-xs text-amber-200/90 font-serif italic mt-1 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  Trân trọng kính mời: <strong className="font-sans font-bold">{guestName}</strong>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
