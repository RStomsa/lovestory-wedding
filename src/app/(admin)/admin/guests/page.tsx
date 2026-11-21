import React from 'react';
import prisma from '@/lib/prisma';
import GuestsManagerClient from './GuestsManagerClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cá Nhân Hóa Khách Mời & Zalo — LoveStory Admin',
};

export default async function AdminGuestsPage() {
  const sites = await prisma.site.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      owner: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <GuestsManagerClient initialSites={sites} />
    </div>
  );
}
