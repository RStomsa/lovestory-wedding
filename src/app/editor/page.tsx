'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WeddingData, TemplateId } from '@/types/wedding';
import { defaultWeddingData } from '@/data/defaultWedding';
import { getStoredWeddingData, saveStoredWeddingData, resetWeddingData } from '@/lib/weddingStorage';
import { CATALOG_TEMPLATES } from '@/data/templatesCatalog';
import { useAuth } from '@/context/AuthContext';
import DevicePreviewBar from '@/components/editor/DevicePreviewBar';
import EditorSidebar from '@/components/editor/EditorSidebar';
import TemplateRenderer from '@/components/TemplateRenderer';
import QuickPhotoBar from '@/components/editor/QuickPhotoBar';

function EditorContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<WeddingData>(defaultWeddingData);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [guestName, setGuestName] = useState('Anh Tuấn');
  const [guestRole, setGuestRole] = useState('Bạn Chú Rể');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Load stored data & check URL search params for template selection
  useEffect(() => {
    const loaded = getStoredWeddingData();
    const templateParam = searchParams.get('template');

    if (templateParam) {
      let targetTemplateId: TemplateId | null = null;
      let templateName = '';

      // 1. Direct template ID match
      if (['pastel', 'floral', 'burgundy', 'retro', 'our-love-begins', 'our-love-story-rose'].includes(templateParam)) {
        targetTemplateId = templateParam as TemplateId;
        templateName =
          targetTemplateId === 'our-love-begins'
            ? 'Thiệp Cưới Tạp Chí Our Love Begins'
            : targetTemplateId === 'our-love-story-rose'
            ? 'Thiệp Cưới Hoa Hồng Đỏ Our Love Story'
            : targetTemplateId === 'pastel'
            ? 'Korean Minimalist'
            : targetTemplateId === 'floral'
            ? 'Romantic Floral'
            : targetTemplateId === 'retro'
            ? 'Vintage Retro Film'
            : 'Burgundy Cinema';
      } else {
        // 2. Catalog template match by ID or slug
        const catalogItem = CATALOG_TEMPLATES.find(
          (t) => t.id === templateParam || t.slug === templateParam
        );
        if (catalogItem) {
          targetTemplateId = catalogItem.baseTemplateId as TemplateId;
          templateName = catalogItem.name;
        } else {
          // Check dynamic templates API for custom admin published templates
          fetch('/api/templates')
            .then((r) => r.json())
            .then((res) => {
              if (res?.templates && Array.isArray(res.templates)) {
                const found = res.templates.find(
                  (t: { id?: string; slug?: string; baseTemplateId: TemplateId; name: string }) =>
                    t.id === templateParam || t.slug === templateParam
                );
                if (found) {
                  const updated: WeddingData = {
                    ...loaded,
                    templateId: found.baseTemplateId,
                  };
                  setData(updated);
                  saveStoredWeddingData(updated);
                  setSaveStatus(`✓ Đã áp dụng mẫu: ${found.name}!`);
                  setTimeout(() => setSaveStatus(null), 3500);
                }
              }
            })
            .catch(() => {});
        }
      }

      if (targetTemplateId) {
        const updated: WeddingData = {
          ...loaded,
          templateId: targetTemplateId,
        };
        setData(updated);
        saveStoredWeddingData(updated);
        setSaveStatus(`✓ Đã áp dụng mẫu: ${templateName}!`);
        setTimeout(() => setSaveStatus(null), 3500);
        return;
      }
    }

    setData(loaded);
  }, [searchParams]);

  const handleDataChange = (newData: WeddingData) => {
    setData(newData);
    saveStoredWeddingData(newData);
  };

  const handleSave = async () => {
    saveStoredWeddingData(data);
    if (isAuthenticated && user) {
      try {
        await fetch('/api/sites/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: data.slug,
            title: `Lễ Thành Hôn ${data.groom.shortName} & ${data.bride.shortName}`,
            templateId: data.templateId,
            data,
          }),
        });
        setSaveStatus(`Đã lưu thiệp cưới vào Database đám mây của ${user.name}!`);
      } catch {
        setSaveStatus(`Đã lưu trên máy. Lỗi kết nối đám mây.`);
      }
    } else {
      setSaveStatus('Đã lưu trên trình duyệt! Đăng nhập để đồng bộ lên máy chủ.');
    }
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại tất cả dữ liệu về mặc định không?')) {
      const reset = resetWeddingData();
      setData(reset);
      setSaveStatus('Đã khôi phục dữ liệu gốc!');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col font-sans">
      <DevicePreviewBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSave={handleSave}
        onReset={handleReset}
        slug={data.slug}
      />

      {saveStatus && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor Controls Sidebar */}
        <EditorSidebar
          data={data}
          onChange={handleDataChange}
          guestName={guestName}
          setGuestName={setGuestName}
          guestRole={guestRole}
          setGuestRole={setGuestRole}
        />

        {/* Live Preview Stage */}
        <main className="flex-1 overflow-y-auto bg-stone-200/70 dark:bg-stone-900/40 p-2 sm:p-6 pb-32 flex items-start justify-center">
          {viewMode === 'mobile' ? (
            /* Smartphone Frame */
            <div className="w-full max-w-[420px] my-4 rounded-[44px] overflow-hidden shadow-2xl border-[10px] border-stone-800 bg-black relative ring-1 ring-black/10">
              {/* iPhone Notch/Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full bg-stone-900 z-50 pointer-events-none" />
              <div className="max-h-[820px] overflow-y-auto scrollbar-thin">
                <TemplateRenderer data={data} guestName={guestName} guestRole={guestRole} isMobileView={true} />
              </div>
            </div>
          ) : (
            /* Desktop Fullscreen Frame */
            <div className="w-full max-w-5xl my-4 rounded-2xl overflow-hidden shadow-2xl border border-stone-300 dark:border-stone-800 bg-white">
              <TemplateRenderer data={data} guestName={guestName} guestRole={guestRole} isMobileView={false} />
            </div>
          )}
        </main>
      </div>

      {/* LoveStory-style Quick Image Replace Strip */}
      <QuickPhotoBar data={data} onChange={handleDataChange} />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">Đang tải Studio...</div>}>
      <EditorContent />
    </Suspense>
  );
}
