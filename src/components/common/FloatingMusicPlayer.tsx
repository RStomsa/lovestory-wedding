'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Disc3 } from 'lucide-react';

interface Props {
  audioUrl: string;
  songTitle?: string;
  artist?: string;
}

export default function FloatingMusicPlayer({ audioUrl, songTitle = 'Until I Found You', artist = 'Stephen Sanchez' }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt auto play on first user interaction
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // User policy prevented playback
        });
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('scroll', handleFirstInteraction, { once: true });

    // Hide tooltip after 5 seconds
    const timer = setTimeout(() => setShowTooltip(false), 6000);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      clearTimeout(timer);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setShowTooltip(false);
      }).catch((err) => {
        console.error('Audio playback error:', err);
      });
    }
  };

  return (
    <>
      <audio ref={audioRef} src={audioUrl} loop preload="metadata" />
      
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {showTooltip && (
          <div className="hidden sm:flex items-center gap-2 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs shadow-xl animate-bounce">
            <span>🎵 Nhạc cưới đang phát</span>
          </div>
        )}

        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
          className="relative group p-2.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-amber-300/40 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 text-stone-800 dark:text-stone-100"
        >
          {/* Rotating Vinyl icon */}
          <div className={`relative flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
            <Disc3 className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-stone-900 border border-white" />
          </div>

          {/* Sound wave / Status badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
            {isPlaying ? (
              <Volume2 className="w-3 h-3" />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
          </div>
        </button>
      </div>
    </>
  );
}
