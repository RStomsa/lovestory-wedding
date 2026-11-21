'use client';

import React, { useEffect, useState } from 'react';
import { getTimeRemaining } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface Props {
  targetDate: string;
  theme?: 'dark' | 'light' | 'burgundy' | 'pastel';
}

const initialTime = { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false };

export default function CountdownTimer({ targetDate, theme = 'burgundy' }: Props) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeRemaining(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) return null;

  const items = [
    { label: 'NGÀY', value: timeLeft.days },
    { label: 'GIỜ', value: timeLeft.hours },
    { label: 'PHÚT', value: timeLeft.minutes },
    { label: 'GIÂY', value: timeLeft.seconds },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
        <span className="text-xs uppercase tracking-[0.25em] font-medium opacity-80">
          Đếm ngược đến ngày chung đôi
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transition-transform hover:scale-105"
          >
            <span className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs tracking-wider opacity-75 mt-1 font-sans uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
