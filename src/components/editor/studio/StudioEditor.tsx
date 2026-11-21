'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StudioTopBar from './StudioTopBar';
import StudioLeftRail from './StudioLeftRail';
import StudioCanvas from './StudioCanvas';
import StudioRightInspector from './StudioRightInspector';
import StudioQuickPhotoBar from './StudioQuickPhotoBar';
import StudioMobileBottomBar from './StudioMobileBottomBar';
import StudioMobileBottomSheet from './StudioMobileBottomSheet';
import WeddingProfileModal from './WeddingProfileModal';
import { useStudioStore } from './studioStore';
import { CheckCircle2, Loader2, ChevronLeft } from 'lucide-react';

interface StudioEditorProps {
  mode?: 'admin' | 'user';
}

function StudioEditorInner({ mode = 'user' }: StudioEditorProps) {
  const searchParams = useSearchParams();
  const templateSlug = searchParams.get('template') || searchParams.get('preset');
  const loadTemplateData = useStudioStore((state) => state.loadTemplateData);
  const isInspectorOpen = useStudioStore((state) => state.isInspectorOpen);
  const toggleInspector = useStudioStore((state) => state.toggleInspector);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [loadedNotification, setLoadedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!templateSlug) return;

    let isCancelled = false;
    queueMicrotask(() => {
      if (!isCancelled) setLoadingTemplate(true);
    });

    fetch(`/api/templates/studio?slug=${encodeURIComponent(templateSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.success && data.preset) {
          loadTemplateData(data.preset.elements, data.preset.config);
          setLoadedNotification(`Đã nạp mẫu: ${data.preset.name}`);
          setTimeout(() => setLoadedNotification(null), 4000);
        } else {
          console.warn('Could not load requested template:', templateSlug);
        }
      })
      .catch((err) => console.error('Failed to load template:', err))
      .finally(() => {
        if (!isCancelled) setLoadingTemplate(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [templateSlug, loadTemplateData]);

  return (
    <div className="h-full w-full flex flex-col bg-stone-100 dark:bg-stone-950 font-sans overflow-hidden relative">
      {/* Ensure Google Fonts are hoisted and active */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Dancing+Script:wght@500;700&family=Great+Vibes&family=MonteCarlo&family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
      />

      {/* Toast Notification when a template is successfully loaded */}
      {loadedNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-stone-700 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">{loadedNotification}</span>
        </div>
      )}

      {/* Loading Overlay when fetching template */}
      {loadingTemplate && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-200 dark:border-stone-800">
            <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Đang nạp dữ liệu mẫu vào Studio...
            </span>
          </div>
        </div>
      )}

      {/* 1. Header Navigation Bar with mode */}
      <StudioTopBar mode={mode} />

      {/* 2. Main Studio Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbox Rail & Drawer (Desktop only) */}
        <div className="hidden md:flex flex-shrink-0 h-full">
          <StudioLeftRail />
        </div>

        {/* Center Scalable Drag-and-Drop Canvas with Responsive Bottom Quick Photo Strip */}
        <div className="flex-1 min-w-0 flex flex-col relative h-full overflow-hidden w-full">
          <StudioCanvas />
          <div className="hidden md:block">
            <StudioQuickPhotoBar />
          </div>
        </div>

        {/* Right Property Inspector Panel (Desktop only) */}
        {isInspectorOpen ? (
          <div className="hidden md:flex flex-shrink-0 h-full relative">
            <StudioRightInspector />
          </div>
        ) : (
          <button
            onClick={toggleInspector}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-l-full shadow-md items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer"
            title="Mở rộng thanh thuộc tính công cụ"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. Mobile First Bottom Navigation & Contextual Touch Action Strip (Mobile only) */}
      <StudioMobileBottomBar />

      {/* 4. Mobile First Slide-up Bottom Sheet Modal (Mobile only) */}
      <StudioMobileBottomSheet />

      {/* 5. Fast Wedding Profile Creation & Linking Modal */}
      <WeddingProfileModal />
    </div>
  );
}

export default function StudioEditor({ mode = 'user' }: StudioEditorProps) {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-stone-100 dark:bg-stone-950">
          <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
        </div>
      }
    >
      <StudioEditorInner mode={mode} />
    </Suspense>
  );
}
