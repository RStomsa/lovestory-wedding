'use client';

import React from 'react';
import { LoveStoryMilestone } from '@/types/wedding';
import { Heart } from 'lucide-react';

interface Props {
  milestones: LoveStoryMilestone[];
}

export default function LoveStoryTimeline({ milestones }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mb-3">
          <Heart className="w-6 h-6 fill-rose-500" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold">Chuyện Tình Yêu</h3>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">
          Hành trình từ hai người xa lạ trở thành một nửa của cuộc đời
        </p>
      </div>

      <div className="relative border-l-2 border-rose-300 dark:border-rose-900/60 ml-4 sm:ml-1/2 sm:-translate-x-1/2 space-y-12">
        {milestones.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={item.id}
              className={`relative flex flex-col sm:flex-row items-start ${
                isEven ? 'sm:flex-row-reverse' : ''
              } gap-6 pl-8 sm:pl-0`}
            >
              {/* Dot marker */}
              <div className="absolute -left-[9px] sm:left-1/2 sm:-translate-x-1/2 top-1.5 w-4 h-4 rounded-full bg-rose-500 border-4 border-white dark:border-stone-900 shadow-md" />

              {/* Content Card */}
              <div
                className={`w-full sm:w-[calc(50%-2rem)] bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-stone-200/50 dark:border-stone-700/50 ${
                  isEven ? 'sm:text-right' : 'sm:text-left'
                }`}
              >
                <span className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs mb-2">
                  {item.year}
                </span>
                <h4 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                  {item.description}
                </p>

                {item.image && (
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-stone-100 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
