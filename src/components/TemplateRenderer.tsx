'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { WeddingData } from '@/types/wedding';

interface Props {
  data: WeddingData;
  guestName?: string;
  guestRole?: string;
  isMobileView?: boolean;
}

// Lightweight skeleton while streaming the specific template
const TemplateSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#8C7355] font-serif">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-2 border-[#8C7355]/30 border-t-[#8C7355] rounded-full animate-spin" />
      <span className="text-xs italic tracking-wider">Đang tải thiệp cưới...</span>
    </div>
  </div>
);

// Dynamic code splitting: Mobile visitors only download the active template chunk!
const BurgundyTemplate = dynamic(() => import('@/components/templates/BurgundyTemplate'), {
  loading: TemplateSkeleton,
});
const PastelMinimalTemplate = dynamic(() => import('@/components/templates/PastelMinimalTemplate'), {
  loading: TemplateSkeleton,
});
const RomanticFloralTemplate = dynamic(() => import('@/components/templates/RomanticFloralTemplate'), {
  loading: TemplateSkeleton,
});
const RetroFilmTemplate = dynamic(() => import('@/components/templates/RetroFilmTemplate'), {
  loading: TemplateSkeleton,
});
const OurLoveBeginsTemplate = dynamic(() => import('@/components/templates/OurLoveBeginsTemplate'), {
  loading: TemplateSkeleton,
});
const OurLoveStoryRoseTemplate = dynamic(() => import('@/components/templates/OurLoveStoryRoseTemplate'), {
  loading: TemplateSkeleton,
});
const SaveTheDate165Template = dynamic(() => import('@/components/templates/SaveTheDate165Template'), {
  loading: TemplateSkeleton,
});

export default function TemplateRenderer({ data, guestName, guestRole, isMobileView }: Props) {
  switch (data.templateId) {
    case 'save-the-date-cream-gold':
      return <SaveTheDate165Template data={data} guestName={guestName} guestRole={guestRole} isMobileView={isMobileView} />;
    case 'our-love-begins':
      return <OurLoveBeginsTemplate data={data} guestName={guestName} guestRole={guestRole} isMobileView={isMobileView} />;
    case 'our-love-story-rose':
      return <OurLoveStoryRoseTemplate data={data} guestName={guestName} guestRole={guestRole} isMobileView={isMobileView} />;
    case 'pastel':
      return <PastelMinimalTemplate data={data} guestName={guestName} guestRole={guestRole} isMobileView={isMobileView} />;
    case 'floral':
      return <RomanticFloralTemplate data={data} guestName={guestName} guestRole={guestRole} isMobileView={isMobileView} />;
    case 'retro':
      return <RetroFilmTemplate data={data} guestName={guestName} guestRole={guestRole} isMobileView={isMobileView} />;
    case 'burgundy':
    default:
      return <BurgundyTemplate data={data} guestName={guestName} guestRole={guestRole} isMobileView={isMobileView} />;
  }
}
