import React, { Suspense, cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { defaultWeddingData } from '@/data/defaultWedding';
import TemplateRenderer from '@/components/TemplateRenderer';
import EnvelopeOpeningEffect from '@/components/common/EnvelopeOpeningEffect';
import StudioPublicSiteViewer from '@/components/editor/studio/StudioPublicSiteViewer';
import { getStudioTemplate } from '@/lib/harvestedTemplateConverter';
import { Heart, Clock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guest?: string; role?: string; to?: string; khach?: string; envelope?: string }>;
}

// React cache() deduplicates queries between generateMetadata and PublicWeddingPage in the same request
const getSiteBySlug = cache(async (slug: string) => {
  return await prisma.site.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, plan: true } },
      template: { select: { id: true, name: true, tier: true } },
    },
  });
});

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { guest, to, khach } = await searchParams;
  const guestName = to || guest || khach;

  let title = `Thiệp Cưới Chú Rể & Cô Dâu`;
  let description = `Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi tại ngày trọng đại!`;
  let coverImage = defaultWeddingData.coverImage;

  if (slug === 'chu-re-va-co-dau') {
    title = `Thiệp Cưới Chú Rể & Cô Dâu`;
  } else {
    const site = await getSiteBySlug(slug);

    if (site) {
      title = site.title;
      try {
        const data = JSON.parse(site.publishedSnapshot || site.draftData);
        if (data.coverImage) coverImage = data.coverImage;
      } catch {}
    }
  }

  const guestText = guestName ? ` - Kính mời ${guestName}` : '';

  return {
    title: `${title}${guestText}`,
    description,
    openGraph: {
      title: `${title}${guestText}`,
      description,
      images: [{ url: coverImage, width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function PublicWeddingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { guest, role, to, khach, envelope } = await searchParams;
  const guestName = to || guest || khach;
  const showEnvelope = envelope === '1' || envelope === 'true' || !!to;

  // 1. Fallback for demo template preview slug
  if (slug === 'chu-re-va-co-dau') {
    return (
      <>
        {showEnvelope && (
          <EnvelopeOpeningEffect
            guestName={guestName}
            groomName={defaultWeddingData.groom.shortName}
            brideName={defaultWeddingData.bride.shortName}
          />
        )}
        <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">Đang tải thiệp cưới...</div>}>
          <TemplateRenderer
            data={defaultWeddingData}
            guestName={guestName}
            guestRole={role}
          />
        </Suspense>
      </>
    );
  }

  if (slug === 'thiep-cuoi-165') {
    const data165 = {
      ...defaultWeddingData,
      templateId: 'save-the-date-cream-gold' as const,
      groom: {
        ...defaultWeddingData.groom,
        name: 'Mạn Tiểu Mạn',
        shortName: 'Tiểu Mạn',
      },
      bride: {
        ...defaultWeddingData.bride,
        name: 'Mei Tiểu Mai',
        shortName: 'Tiểu Mai',
      },
      events: [
        {
          id: 'ev-165',
          title: 'Lễ Thành Hôn & Tiệc Cưới',
          date: '2026-12-28',
          time: '12:00',
          locationName: 'Khách sạn LoveStory, Tòa nhà A, Tầng 9, Sảnh tiệc Happiness',
          address: 'Sảnh tiệc Happiness, Tòa nhà A, Tầng 9',
          mapUrl: 'https://maps.google.com',
        },
      ],
    };
    return (
      <>
        {showEnvelope && (
          <EnvelopeOpeningEffect
            guestName={guestName}
            groomName={data165.groom.shortName}
            brideName={data165.bride.shortName}
          />
        )}
        <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-[#8C7355]">Đang tải thiệp cưới...</div>}>
          <TemplateRenderer
            data={data165}
            guestName={guestName}
            guestRole={role}
          />
        </Suspense>
      </>
    );
  }

  if (slug === 'thiep-cuoi-61') {
    return (
      <>
        {showEnvelope && (
          <EnvelopeOpeningEffect
            guestName={guestName}
            groomName={defaultWeddingData.groom.shortName}
            brideName={defaultWeddingData.bride.shortName}
          />
        )}
        <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-[#8C7355]">Đang tải thiệp cưới...</div>}>
          <TemplateRenderer
            data={{ ...defaultWeddingData, templateId: 'our-love-begins' }}
            guestName={guestName}
            guestRole={role}
          />
        </Suspense>
      </>
    );
  }

  if (slug === 'thiep-cuoi-39') {
    return (
      <>
        {showEnvelope && (
          <EnvelopeOpeningEffect
            guestName={guestName}
            groomName={defaultWeddingData.groom.shortName}
            brideName={defaultWeddingData.bride.shortName}
          />
        )}
        <Suspense fallback={<div className="min-h-screen bg-[#590d22] flex items-center justify-center text-rose-200">Đang tải thiệp cưới...</div>}>
          <TemplateRenderer
            data={{ ...defaultWeddingData, templateId: 'our-love-story-rose' }}
            guestName={guestName}
            guestRole={role}
          />
        </Suspense>
      </>
    );
  }

  // 2. Query database for site (memoized via React cache)
  const site = await getSiteBySlug(slug);

  if (!site) {
    // If not found in database, check if it's a Studio template preset (e.g. minvite or harvested template)
    const templatePreset = getStudioTemplate(slug);
    if (templatePreset) {
      return (
        <StudioPublicSiteViewer
          canvas={{
            width: 500,
            height: 5000,
            background: '#ffffff',
            title: templatePreset.name,
            status: 'published',
            ...templatePreset.config,
          }}
          elements={templatePreset.elements}
          guestName={guestName}
          guestRole={role}
          showEnvelope={showEnvelope}
          siteTitle={templatePreset.name}
          slug={slug}
        />
      );
    }
    notFound();
  }

  const now = new Date();
  const isViewLimitReached = site.maxViews > 0 && site.viewCount >= site.maxViews;
  const isActiveExpired = site.activeExpiresAt ? now > site.activeExpiresAt : false;
  const isExpired = site.status === 'EXPIRED_BACKUP' || isViewLimitReached || isActiveExpired;

  // 3. If Expired (reached 300 views or 30 days for Free), show Backup Archive Screen
  if (isExpired) {
    // Ensure status is marked as EXPIRED_BACKUP in database
    if (site.status !== 'EXPIRED_BACKUP') {
      await prisma.site.update({
        where: { id: site.id },
        data: { status: 'EXPIRED_BACKUP' },
      });
    }

    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-stone-900/80 border border-stone-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-rose-500/20" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Lưu Trữ Kỷ Niệm (Backup 30 Ngày)
            </span>
            <h1 className="text-2xl font-serif font-bold text-white pt-1">
              {site.title}
            </h1>
            <p className="text-xs text-stone-400 leading-relaxed">
              Sự kiện cưới đã diễn ra viên mãn và đong đầy yêu thương. Cảm ơn tất cả người thân, bạn bè và quý khách đã gửi những lời chúc phúc ngọt ngào nhất!
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 text-left text-xs space-y-1.5 text-stone-400">
            <div className="flex items-center justify-between text-[11px]">
              <span>Lượt xem đã ghi nhận:</span>
              <span className="font-bold text-stone-200">{site.viewCount} lượt</span>
            </div>
            {site.backupExpiresAt && (
              <div className="flex items-center justify-between text-[11px]">
                <span>Hạn lưu trữ backup trong DB:</span>
                <span className="font-semibold text-amber-400">
                  {new Date(site.backupExpiresAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Dành Cho Cặp Đôi (Đăng Nhập Gia Hạn)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="w-full py-2 text-stone-500 hover:text-stone-300 text-xs transition-colors"
            >
              Về Trang Chủ LoveStory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Increment view count
  await prisma.site.update({
    where: { id: site.id },
    data: {
      viewCount: { increment: 1 },
      ...(site.maxViews > 0 && site.viewCount + 1 >= site.maxViews ? { status: 'EXPIRED_BACKUP' } : {}),
    },
  });

  // 5. Parse wedding data safely with deep fallback
  let isStudioDesign = false;
  let studioData: { canvas?: any; elements?: any[]; weddingProfile?: any } | null = null;
  let parsedData = defaultWeddingData;

  try {
    const raw = JSON.parse(site.publishedSnapshot || site.draftData || '{}');
    if (raw && (Array.isArray(raw.elements) || raw.canvas)) {
      isStudioDesign = true;
      studioData = raw;
    } else {
      parsedData = {
        ...defaultWeddingData,
        ...raw,
        groom: { ...defaultWeddingData.groom, ...(raw.groom || {}) },
        bride: { ...defaultWeddingData.bride, ...(raw.bride || {}) },
        music: { ...defaultWeddingData.music, ...(raw.music || {}) },
        events: raw.events || defaultWeddingData.events,
        gallery: raw.gallery || defaultWeddingData.gallery,
        loveStory: raw.loveStory || defaultWeddingData.loveStory,
      };
    }
  } catch (err) {
    console.error('Failed to parse wedding data for site:', site.slug, err);
  }

  // 6. If published from LoveStory Studio, render the full Studio presentation!
  if (isStudioDesign && studioData?.elements) {
    return (
      <StudioPublicSiteViewer
        canvas={studioData.canvas || { width: 500, height: 5000, background: '#ffffff', title: site.title }}
        elements={studioData.elements}
        weddingProfile={studioData.weddingProfile}
        guestName={guestName}
        guestRole={role}
        showEnvelope={showEnvelope}
        siteTitle={site.title}
        slug={site.slug}
      />
    );
  }

  return (
    <>
      {showEnvelope && (
        <EnvelopeOpeningEffect
          guestName={guestName}
          groomName={parsedData.groom.shortName || parsedData.groom.name}
          brideName={parsedData.bride.shortName || parsedData.bride.name}
        />
      )}
      <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">Đang tải thiệp cưới...</div>}>
        <TemplateRenderer
          data={parsedData}
          guestName={guestName}
          guestRole={role}
        />
      </Suspense>
    </>
  );
}
